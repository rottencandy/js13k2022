import { createStateMachine } from '../engine/state';
import { createTween, ticker } from '../engine/interpolation';
import { createRectTex } from '../rect';
import { makeTextTex } from '../text';
import { getOperatorIntent, isObstaclePresent } from './operators';

// Types {{{

export const enum Direction {
    Top = 0,
    Rgt = 1,
    Btm = 2,
    Lft = 3,
    Non = 4,
};

const enum Type {
    FrozenFace,
    Face,
};

const enum Opt {
    None,
    Some,
}

type ObjGroup = {
    x: number;
    y: number;
    grid: Opt[][];
    // set by operators
    intent: Direction;
    // set after collision resolution
    next: Direction;
    type: Type;
};

// }}}

//const WIDTH = 8;
//const HEIGHT = 8;

const ObjGroups: ObjGroup[] = [];
const moveTween = createTween(0, 1, 900);

// Render {{{

const objCtx = createRectTex(makeTextTex('🥳', 120));

const setupTypeCtx = (t: Type) => {
    switch (t) {
        case Type.Face:
            objCtx.use_();
            return objCtx;
    }
};

const drawLerpedGroup = (grp: ObjGroup) => {
    let baseX = grp.x, baseY = grp.y;
    switch (grp.next) {
        case Direction.Non:
            break;
        case Direction.Top:
            // this works out when moveTween isn't active
            // because tweens are reset to 0 when done
            baseY += moveTween.val;
            break;
        case Direction.Rgt:
            baseX += moveTween.val;
            break;
        case Direction.Btm:
            baseY -= moveTween.val;
            break;
        case Direction.Lft:
            baseX -= moveTween.val;
    }
    const ctx = setupTypeCtx(grp.type);
    grp.grid.map(
        (row, i) => row.map(
            (t, j) => t && ctx.draw_(baseX + j + 1, baseY + i + 1, 0)
        )
    );
};

// }}}

// Update {{{

const waitTicker = ticker(900);

const enum State {
    Idle,
    Moving,
};

/* assuming groups are safely touching, not overlapping,  and share same type */
const mergeGroups = (groups: ObjGroup[]): ObjGroup => {
    // leftmost group
    const finalX = groups.sort((g1, g2) => g1.x - g2.x)[0].x;
    // topmost group
    const finalY = groups.sort((g1, g2) => g1.y - g2.y)[0].y;
    const finalGrid = [];
    groups.map(g => {
        const xOff = g.x - finalX;
        const yOff = g.y - finalY;
        g.grid.map((row, i) => row.map((o, j) => {
            const xPos = xOff + j;
            const yPos = yOff + i;
            (finalGrid[yPos] = finalGrid[yPos] || [])[xPos] = o;
        }))
    });
    return {
        x: finalX,
        y: finalY,
        grid: finalGrid,
        type: groups[0].type,
        intent: Direction.Non,
        next: Direction.Non,
    };
};

const spawnObjectGroup = (x: number, y: number, intent = Direction.Non, type = Type.Face): ObjGroup =>
    ({ x, y, grid: [[Opt.Some]], intent, next: Direction.Non, type });

const gWidth = (o: ObjGroup) => o.grid[0].length;
const gHeight = (o: ObjGroup) => o.grid.length;

const isGroupNotEmpty = (g: ObjGroup) => gHeight(g) > 0 && gWidth(g) > 0;

/* assuming x,y is inside group, does nothing if element at pos is empty */
const splitGroup = (group: ObjGroup, x: number, y: number, newType = Type.Face) => {
    const relX = x - group.x;
    const relY = y - group.y;
    if (!group.grid[relY][relX]) {
        return [group];
    }
    group.grid[relY][relX] = Opt.None;
    const newGrp = spawnObjectGroup(x, y, Direction.Non, newType);
    const newGroups = [newGrp];
    // empty col, needs to be split along Y axis
    if (group.grid.every(row => !row[relX])) {
        const extraGroup = {
            x: x + 1,
            y: group.y,
            intent: group.intent,
            next: group.next,
            type: group.type,
            grid: group.grid.map(row => row.slice(relX + 1)),
        };
        if (isGroupNotEmpty(extraGroup)) {
            newGroups.push(extraGroup);
        }
        group.grid.map(row => row.length = relX);
    }
    // empty row, needs to be split along X axis
    if (group.grid[relY].every(o => !o)) {
        const extraGroup = {
            x: group.x,
            y: y + 1,
            intent: group.intent,
            next: group.next,
            type: group.type,
            grid: group.grid.slice(relY + 1),
        };
        if (isGroupNotEmpty(extraGroup)) {
            newGroups.push(extraGroup);
        }
        group.grid.length = relY;
    }
    if (isGroupNotEmpty(group)) {
        newGroups.push(group);
    }
    return newGroups;
};

const getNextGroupPos = (o: ObjGroup, dir: Direction) => {
    let x = o.x, y = o.y;
    switch (dir) {
        case Direction.Top:
            y++;
            break;
        case Direction.Btm:
            y--;
            break;
        case Direction.Rgt:
            x++;
            break;
        case Direction.Lft:
            x--;
    }
    return { x, y };
};

/* g1 is expected to move in dir, and g2 is stationary */
const willCollide = (g1: ObjGroup, dir1: Direction, g2: ObjGroup, dir2 = Direction.Non) => {
    const g1n = getNextGroupPos(g1, dir1);
    const g2n = getNextGroupPos(g2, dir2);
    // preliminary bound checks to make sure we're always overlapping
    if (g1n.x - g2n.x > gWidth(g2) ||
        g2n.x - g1n.x > gWidth(g1) ||
        g1n.y - g2n.y > gHeight(g2) ||
        g2n.y - g1n.y > gHeight(g1))
        return false;

    const g1OverlapX = Math.max(g2n.x - g1n.x, 0);
    const g1OverlapY = Math.max(g2n.y - g1n.y, 0);
    const g1OverlapW = Math.min(gWidth(g2), gWidth(g1) - g1OverlapX);
    const g1OverlapH = Math.min(gHeight(g2), gHeight(g1) - g1OverlapY);

    const g2OverlapX = Math.max(g1n.x - g2n.x, 0);
    const g2OverlapY = Math.max(g1n.y - g2n.y, 0);
    const g2OverlapW = Math.min(gWidth(g1), gWidth(g2) - g2OverlapX);
    const g2OverlapH = Math.min(gHeight(g1), gHeight(g2) - g2OverlapY);

    for (let h = 0; h < Math.min(g1OverlapH, g2OverlapH); h++)
        for (let w = 0; w < Math.min(g1OverlapW, g2OverlapW); w++)
            if (g1.grid[g1OverlapY + h][g1OverlapX + w] !== Opt.None &&
                g2.grid[g2OverlapY + h][g2OverlapX + w] !== Opt.None)
                return true;
    return false;
};

/* Sets the next for each group, and returns if it can end up moving */
const calcNextMove = (g: ObjGroup, dir: Direction, gs: ObjGroup[], id: number) => {
    if (g.next !== Direction.Non) return true;
    const gnp = getNextGroupPos(g, dir);
    if (isObstaclePresent(gnp.x, gnp.y)) return false;

    const blockingGroups = gs
        .filter((pg, i) => {
            if (i === id) return false;

            if (!willCollide(g, dir, pg, pg.intent)) return false;

            if (pg.intent === Direction.Non) {
                // todo: consider pusher?(Is pusher already considered through filter?)
                if (pg.next !== Direction.Non) return willCollide(g, dir, pg, pg.next);

                const canBePushed = calcNextMove(pg, dir, gs, id);
                if (canBePushed) {
                    pg.next = dir;
                    return false;
                } else return true;

            } else {
                if (pg.next === pg.intent) return true;

                const isMoving = calcNextMove(pg, pg.intent, gs, id);
                if (isMoving) {
                    return false;
                } else {
                    if (calcNextMove(pg, dir, gs, id)) {
                        pg.intent = dir;
                        return false;
                    }
                }
            }
        });
    const canMove = blockingGroups.length === 0;
    if (canMove) {
        g.next = dir;
    }
    return canMove;
};

/* Also resets next dirs */
const updatePos = (o: ObjGroup) => {
    switch (o.next) {
        case Direction.Non:
            break;
        case Direction.Top:
            o.y++;
            break;
        case Direction.Rgt:
            o.x++;
            break;
        case Direction.Btm:
            o.y--;
            break;
        case Direction.Lft:
            o.x--;
    }
    o.next = Direction.Non;
};

const sm = createStateMachine({
    [State.Idle]: (dt) => {
        if (waitTicker(dt)) {
            ObjGroups.map((g, id) => {
                g.intent = getOperatorIntent(g.x, g.y);
                calcNextMove(g, g.intent, ObjGroups, id);
            });
            return State.Moving;
        };
    },
    [State.Moving]: (dt) => {
        moveTween.step(dt);
        if (moveTween.done) {
            moveTween.reset();
            ObjGroups.map(updatePos);
            return State.Idle;
        };
    },
}, State.Idle);

// }}}

// so called "tests" {{{

ObjGroups.push(spawnObjectGroup(0, 0, Direction.Non));
ObjGroups.push(spawnObjectGroup(0, 1, Direction.Non));
console.log(mergeGroups([spawnObjectGroup(0, 0), spawnObjectGroup(0, 1)]));
console.log(splitGroup(
    {
        grid: [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1],
        ],
        x: 1, y: 1, type: Type.Face, intent: Direction.Non, next: Direction.Non,
    },
    2, 2));
console.log(splitGroup(
    {
        grid: [
            [1, 1, 1],
            [1, 0, 1],
            [1, 0, 1],
        ],
        x: 1, y: 1, type: Type.Face, intent: Direction.Non, next: Direction.Non,
    },
    2, 1));
console.log(splitGroup(
    {
        grid: [
            [1, 1, 1],
            [1, 0, 0],
            [1, 1, 1],
        ],
        x: 1, y: 1, type: Type.Face, intent: Direction.Non, next: Direction.Non,
    },
    1, 2));
console.log(splitGroup(
    {
        grid: [
            [1, 1, 1],
            [0, 1, 1],
            [0, 1, 1],
        ],
        x: 1, y: 1, type: Type.Face, intent: Direction.Non, next: Direction.Non,
    },
    1, 1));

console.log(willCollide(
    {
        grid: [
            [1, 1],
            [1, 0],
        ],
        x: 0, y: 0, type: Type.Face, intent: Direction.Non, next: Direction.Non,
    },
    Direction.Rgt,
    {
        grid: [
            [0, 1],
            [1, 1],
        ],
        x: 2, y: 0, type: Type.Face, intent: Direction.Non, next: Direction.Non,
    }) === false);
console.log(willCollide(
    {
        grid: [
            [1, 1],
            [1, 0],
        ],
        x: 2, y: 1, type: Type.Face, intent: Direction.Non, next: Direction.Non,
    },
    Direction.Lft,
    {
        grid: [
            [0, 1],
            [1, 0],
            [1, 0],
        ],
        x: 0, y: 0, type: Type.Face, intent: Direction.Non, next: Direction.Non,
    }) === false);
console.log(willCollide(
    {
        grid: [
            [0, 1, 0],
            [1, 1, 1],
        ],
        x: 1, y: 2, type: Type.Face, intent: Direction.Non, next: Direction.Non,
    },
    Direction.Top,
    {
        grid: [
            [0, 1],
            [1, 0],
        ],
        x: 1, y: 0, type: Type.Face, intent: Direction.Non, next: Direction.Non,
    }) === false);
console.log(willCollide(
    {
        grid: [
            [1, 1],
            [1, 0],
        ],
        x: 0, y: 0, type: Type.Face, intent: Direction.Non, next: Direction.Non,
    },
    Direction.Btm,
    {
        grid: [
            [0, 1],
            [1, 1],
        ],
        x: 0, y: 1, type: Type.Face, intent: Direction.Non, next: Direction.Non,
    }) === false);
console.log(willCollide(
    {
        grid: [[1]],
        x: 0, y: 0, type: Type.Face, intent: Direction.Non, next: Direction.Non,
    },
    Direction.Btm,
    {
        grid: [[0]],
        x: 5, y: 5, type: Type.Face, intent: Direction.Non, next: Direction.Non,
    }) === false);

// }}}

export const update = (dt: number) => {
    sm.run(dt);
};

export const render = () => {
    ObjGroups.map(drawLerpedGroup);
};

// vim: fdm=marker:fdl=0:
