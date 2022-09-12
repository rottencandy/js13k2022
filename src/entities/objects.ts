import { createRectTex, Direction } from '../rect';
import { makeTextTex } from '../text';
import { getEndOprs, getOperatorIntent, getThawOprs, isFreezeOprPresent, isObstaclePresent } from './operators';
import { GRID_HEIGHT, GRID_WIDTH } from '../globals';

// Types {{{

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

let ObjGroups: ObjGroup[] = [];

// Render {{{

let objCtx = null;
let frzObjCtx = null;
setTimeout(() => {
    objCtx = createRectTex(makeTextTex('😴', 120));
    frzObjCtx = createRectTex(makeTextTex('🥶', 120));
}, 100);

const setupTypeCtx = (t: Type) => {
    switch (t) {
        case Type.Face:
            objCtx.use_();
            return objCtx;
        case Type.FrozenFace:
            frzObjCtx.use_();
            return frzObjCtx;
    }
};

const drawLerpedGroup = (grp: ObjGroup, tweenAmt: number) => {
    let baseX = grp.x, baseY = grp.y;
    switch (grp.next) {
        case Direction.Non:
            break;
        case Direction.Top:
            // this works out when moveTween isn't active
            // because tweens are reset to 0 when done
            baseY += tweenAmt;
            break;
        case Direction.Rgt:
            baseX += tweenAmt;
            break;
        case Direction.Btm:
            baseY -= tweenAmt;
            break;
        case Direction.Lft:
            baseX -= tweenAmt;
    }
    const ctx = setupTypeCtx(grp.type);
    grp.grid.map(
        (row, i) => row.map(
            (t, j) => t && ctx.draw_(baseX + j, baseY + i, 0)
        )
    );
};

// }}}

// Update {{{

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

export const spawnThawedObject = (x: number, y: number, dir: Direction) => {
    ObjGroups.push(spawnObjectGroup(x, y, dir));
};

export const isCellEmpty = (x: number, y: number) => {
    return !ObjGroups.find(g => g.x === x && g.y === y);
};

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

const setOperatorIntents = (g: ObjGroup) => {
    for (let h = 0; h < g.grid.length; h++)
        for (let w = 0; w < g.grid[h].length; w++) {
            const e = g.grid[h][w];
            if (e === Opt.Some) {
                const i = getOperatorIntent(g.x + w, g.y + h);
                if (i !== Direction.Non) {
                    g.intent = i;
                    return;
                }
            }
        }
    g.intent = Direction.Non;
};

const checkObstacles = (g: ObjGroup, dir: Direction) => {
    switch (dir) {
        case Direction.Top:
            return g.grid[0].some((e, i) => e === Opt.Some && isObstaclePresent(g.x + i, g.y + 1))
        case Direction.Btm:
            return g.grid[g.grid.length - 1].some((e, i) => e === Opt.Some && isObstaclePresent(g.x + i, g.y - g.grid.length))
        case Direction.Rgt:
            return g.grid.some((e, i) => e[g.grid[0].length - 1] === Opt.Some && isObstaclePresent(g.x + g.grid[0].length, g.y + i))
        case Direction.Lft:
            return g.grid.some((e, i) => e[0] === Opt.Some && isObstaclePresent(g.x - 1, g.y + i))
    }
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

export const groupItemCount = (g: ObjGroup) => {
    return g.grid.reduce((acc, row) => acc + row.filter(o => o === Opt.Some).length, 0);
};

// https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
const AABB = (x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number) => {
    return (
        x1 < x2 + w2 &&
        x1 + w1 > x2 &&
        y1 < y2 + h2 &&
        y1 + h1 > y2
    );
};

const isInRange = (g: ObjGroup, dir: Direction, g2: ObjGroup) => {
    switch (dir) {
        case Direction.Top:
            return AABB(g.x - 1, g.y + 1, gWidth(g) + 2, gHeight(g), g2.x, g2.y, gWidth(g2), gHeight(g2));
        case Direction.Btm:
            return AABB(g.x - 1, g.y - 1, gWidth(g) + 2, gHeight(g), g2.x, g2.y, gWidth(g2), gHeight(g2));
        case Direction.Lft:
            return AABB(g.x - 1, g.y - 1, gWidth(g), gHeight(g) + 2, g2.x, g2.y, gWidth(g2), gHeight(g2));
        case Direction.Rgt:
            return AABB(g.x + 1, g.y - 1, gWidth(g), gHeight(g) + 2, g2.x, g2.y, gWidth(g2), gHeight(g2));
    }
}

const isInExactRange = (g: ObjGroup, dir: Direction, g2: ObjGroup) => {
    switch (dir) {
        case Direction.Top:
            return AABB(g.x, g.y + 1, gWidth(g), gHeight(g), g2.x, g2.y, gWidth(g2), gHeight(g2));
        case Direction.Btm:
            return AABB(g.x, g.y - 1, gWidth(g), gHeight(g), g2.x, g2.y, gWidth(g2), gHeight(g2));
        case Direction.Lft:
            return AABB(g.x - 1, g.y, gWidth(g), gHeight(g), g2.x, g2.y, gWidth(g2), gHeight(g2));
        case Direction.Rgt:
            return AABB(g.x + 1, g.y, gWidth(g), gHeight(g), g2.x, g2.y, gWidth(g2), gHeight(g2));
    }
}

const checkMvt = (g: ObjGroup, dir: Direction, omitIds: number[]) => {
    if (dir === Direction.Non) return true;
    if (g.next === dir) return true;
    const gnp = getNextGroupPos(g, dir);
    if (gnp.x > GRID_WIDTH || gnp.x < 0 || gnp.y > GRID_HEIGHT || gnp.y < 0) return false;
    if (checkObstacles(g, dir)) return false;
    const blockingGroups = ObjGroups
        .filter((pg, id) => {
            if (g.x === pg.x && g.y === pg.y) return false;
            if (omitIds.includes(id)) {
                return willCollide(g, dir, pg, pg.intent);
            }
            if (!isInRange(g, dir, pg)) return false;
            if (pg.intent === dir || pg.intent === Direction.Non) {
                if (!willCollide(g, dir, pg)) return false;
                const canMove = checkMvt(pg, dir, [...omitIds, id]);
                if (canMove) {
                    pg.next = pg.intent = dir;
                    return false;
                } else {
                    pg.next = pg.intent = Direction.Non;
                    return true;
                }
            } else {
                const canMove = checkMvt(pg, pg.intent, [...omitIds, id]);
                if (canMove) {
                    pg.next = pg.intent;
                    return willCollide(g, dir, pg, pg.intent);
                } else {
                    if (!willCollide(g, dir, pg)) return false;
                    const canPush = checkMvt(pg, dir, [...omitIds, id]);
                    if (canPush) {
                        pg.next = pg.intent = dir;
                        return false;
                    } else {
                        pg.next = pg.intent = Direction.Non;
                        return willCollide(g, dir, pg);
                    }
                }
            }
        });
    return blockingGroups.length === 0;
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

const updateFreezeStatus = (g: ObjGroup, id: number) => {
    const ids: number[] = [];
    const frozenNeighbours = ObjGroups.filter((pg, id) => {
        return pg.type === Type.FrozenFace && (
            isInExactRange(g, Direction.Top, pg) ||
            isInExactRange(g, Direction.Rgt, pg) ||
            isInExactRange(g, Direction.Btm, pg) ||
            isInExactRange(g, Direction.Lft, pg)
        ) && ids.push(id);
    });
    const mg = mergeGroups([...frozenNeighbours, g]);
    mg.type = Type.FrozenFace;
    return { mg, ids: [...ids, id] };
};

export const prepareNextStep = () => {
    ObjGroups.map(setOperatorIntents);
    ObjGroups.map((g, id) => {
        const canMove = checkMvt(g, g.intent, [id]);
        if (canMove) {
            g.next = g.intent;
        } else {
            g.next = Direction.Non;
        }
    });
};

const calcFreeze = () => {
    let mergedIds: number[] = [];
    let mergedGrp: ObjGroup[] = [];
    ObjGroups.map((g, id) => {
        if (g.type !== Type.Face) return;
        if (mergedIds.includes(id)) return;
        if (!isFreezeOprPresent(g.x, g.y)) return;
        const { mg, ids } = updateFreezeStatus(g, id);
        mergedIds.push(...ids);
        mergedGrp.push(mg);
    });
    ObjGroups = ObjGroups.filter((_, id) => !mergedIds.includes(id))
    ObjGroups.push(...mergedGrp);
};

const posInGroup = (x: number, y: number, g: ObjGroup) => {
    return x >= g.x && x < g.x + gWidth(g) &&
        y >= g.y && y < g.y + gHeight(g) &&
        g.grid[y - g.y][x - g.x] === Opt.Some;
};

const calcThaw = () => {
    let splitIds: number[] = [];
    let splitGrp: ObjGroup[] = [];
    getThawOprs().map(o => {
        ObjGroups.map((g, id) => {
            if (posInGroup(o.x, o.y, g)) {
                splitIds.push(id);
                splitGrp.push(...splitGroup(g, o.x, o.y));
            }
        })
    });
    ObjGroups = ObjGroups.filter((_, id) => !splitIds.includes(id))
    ObjGroups.push(...splitGrp);
};

const removeCompleted = () => {
    const ends = getEndOprs();
    const isEndPresent = (x: number, y: number) => ends.some(o => o.x === x && o.y === y);
    let count = 0;

    ends.map(e => {
        ObjGroups.map((g, idx) => {
            if (g.type !== Type.FrozenFace || !AABB(g.x, g.y, gWidth(g), gHeight(g), e.x, e.y, 1, 1))
                return false;

            if (g.grid.every((row, j) => row.every((o, i) => (o === Opt.None ? true : isEndPresent(g.x + i, g.y + j))))) {
                if (groupItemCount(g) === getEndOprs().length) {
                    ObjGroups.splice(idx, 1);
                    count++;
                }
            }
        })
    });

    return count;
}

export const endCurrentStep = () => {
    ObjGroups.map(updatePos);
    calcFreeze();
    calcThaw();
    return removeCompleted();
};

export const clearGroups = () => {
    ObjGroups = [];
}

// }}}

//// so called "tests" {{{
//
//console.log(mergeGroups([spawnObjectGroup(0, 0), spawnObjectGroup(0, 1)]));
//console.log(splitGroup(
//    {
//        grid: [
//            [1, 1, 1],
//            [1, 1, 1],
//            [1, 1, 1],
//        ],
//        x: 1, y: 1, type: Type.Face, intent: Direction.Non, next: Direction.Non,
//    },
//    2, 2));
//console.log(splitGroup(
//    {
//        grid: [
//            [1, 1, 1],
//            [1, 0, 1],
//            [1, 0, 1],
//        ],
//        x: 1, y: 1, type: Type.Face, intent: Direction.Non, next: Direction.Non,
//    },
//    2, 1));
//console.log(splitGroup(
//    {
//        grid: [
//            [1, 1, 1],
//            [1, 0, 0],
//            [1, 1, 1],
//        ],
//        x: 1, y: 1, type: Type.Face, intent: Direction.Non, next: Direction.Non,
//    },
//    1, 2));
//console.log(splitGroup(
//    {
//        grid: [
//            [1, 1, 1],
//            [0, 1, 1],
//            [0, 1, 1],
//        ],
//        x: 1, y: 1, type: Type.Face, intent: Direction.Non, next: Direction.Non,
//    },
//    1, 1));
//
//console.log(willCollide(
//    {
//        grid: [
//            [1, 1],
//            [1, 0],
//        ],
//        x: 0, y: 0, type: Type.Face, intent: Direction.Non, next: Direction.Non,
//    },
//    Direction.Rgt,
//    {
//        grid: [
//            [0, 1],
//            [1, 1],
//        ],
//        x: 2, y: 0, type: Type.Face, intent: Direction.Non, next: Direction.Non,
//    }) === false);
//console.log(willCollide(
//    {
//        grid: [
//            [1, 1],
//            [1, 0],
//        ],
//        x: 2, y: 1, type: Type.Face, intent: Direction.Non, next: Direction.Non,
//    },
//    Direction.Lft,
//    {
//        grid: [
//            [0, 1],
//            [1, 0],
//            [1, 0],
//        ],
//        x: 0, y: 0, type: Type.Face, intent: Direction.Non, next: Direction.Non,
//    }) === false);
//console.log(willCollide(
//    {
//        grid: [
//            [0, 1, 0],
//            [1, 1, 1],
//        ],
//        x: 1, y: 2, type: Type.Face, intent: Direction.Non, next: Direction.Non,
//    },
//    Direction.Top,
//    {
//        grid: [
//            [0, 1],
//            [1, 0],
//        ],
//        x: 1, y: 0, type: Type.Face, intent: Direction.Non, next: Direction.Non,
//    }) === false);
//console.log(willCollide(
//    {
//        grid: [
//            [1, 1],
//            [1, 0],
//        ],
//        x: 0, y: 0, type: Type.Face, intent: Direction.Non, next: Direction.Non,
//    },
//    Direction.Btm,
//    {
//        grid: [
//            [0, 1],
//            [1, 1],
//        ],
//        x: 0, y: 1, type: Type.Face, intent: Direction.Non, next: Direction.Non,
//    }) === false);
//console.log(willCollide(
//    {
//        grid: [[1]],
//        x: 0, y: 0, type: Type.Face, intent: Direction.Non, next: Direction.Non,
//    },
//    Direction.Btm,
//    {
//        grid: [[0]],
//        x: 5, y: 5, type: Type.Face, intent: Direction.Non, next: Direction.Non,
//    }) === false);
//console.log(
//    willCollide(
//        spawnObjectGroup(0, 0),
//        Direction.Top,
//        spawnObjectGroup(0, 1),
//        Direction.Rgt
//    ) === false);
//
//// }}}

export const render = (tweenAmt: number) => {
    ObjGroups.map((o) => drawLerpedGroup(o, tweenAmt));
};

// vim: fdm=marker:fdl=0:
