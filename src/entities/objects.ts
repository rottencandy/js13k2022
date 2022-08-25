import { createStateMachine } from '../engine/state';
import { createTween, ticker } from '../engine/interpolation';
import { createRectTex } from '../rect';
import { makeTextTex } from '../text';

// Types {{{

const enum Direction {
    Top,
    Rgt,
    Btm,
    Lft,
    Non,
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

const updatePos = (o: ObjGroup) => {
    switch (o.next) {
        case Direction.Non:
            break;
        case Direction.Top:
            o.y ++;
            break;
        case Direction.Rgt:
            o.x ++;
            break;
        case Direction.Btm:
            o.y --;
            break;
        case Direction.Lft:
            o.x --;
    }
};

const setupTypeCtx = (t: Type) => {
    switch(t) {
        case Type.Face:
            objCtx.use_()
            break;
    }
}

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
    setupTypeCtx(grp.type);
    grp.grid.map(
        (row, i) => row.map(
            (t, j) => t && objCtx.draw_(baseX + j + 1, baseY + i + 1, 0)
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

// assuming groups are safely touching, not overlapping,  and share same type
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
        next: Direction.Non,
    };
};

const spawnObjectGroup = (x: number, y: number, next = Direction.Non, type = Type.Face): ObjGroup =>
    ({ x, y, grid: [[Opt.Some]], next, type });

const isGroupNotEmpty = (g: ObjGroup) => g.grid.length > 0 && g.grid[0].length > 0;

// assuming x,y is inside group, does nothing if element at pos is empty
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
            x: x+1,
            y: group.y,
            next: group.next,
            type: group.type,
            grid: group.grid.map(row => row.slice(relX+1)),
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
            y: y+1,
            next: group.next,
            type: group.type,
            grid: group.grid.slice(relY+1),
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
}

const sm = createStateMachine({
    [State.Idle]: (dt) => {
        if (waitTicker(dt)) {
            return State.Moving
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

ObjGroups.push(spawnObjectGroup(0, 0, Direction.Top));
ObjGroups.push(spawnObjectGroup(1, 1, Direction.Rgt));
console.log(mergeGroups([spawnObjectGroup(0, 0), spawnObjectGroup(0, 1)]));
console.log(splitGroup(
    {
        grid: [
            [1,1,1],
            [1,1,1],
            [1,1,1],
        ],
        x: 1, y: 1, type: Type.Face, next: Direction.Non,
    },
    2, 2));
console.log(splitGroup(
    {
        grid: [
            [1,1,1],
            [1,0,1],
            [1,0,1],
        ],
        x: 1, y: 1, type: Type.Face, next: Direction.Non,
    },
    2, 1));
console.log(splitGroup(
    {
        grid: [
            [1,1,1],
            [1,0,0],
            [1,1,1],
        ],
        x: 1, y: 1, type: Type.Face, next: Direction.Non,
    },
    1, 2));
console.log(splitGroup(
    {
        grid: [
            [1,1,1],
            [0,1,1],
            [0,1,1],
        ],
        x: 1, y: 1, type: Type.Face, next: Direction.Non,
    },
    1, 1));

// }}}

export const update = (dt: number) => {
    sm.run(dt);
};

export const render = () => {
    ObjGroups.map(drawLerpedGroup);
};

// vim: fdm=marker:fdl=0:
