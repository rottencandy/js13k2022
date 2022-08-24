import { createStateMachine } from '../engine/state';
import { createTween, ticker } from '../engine/interpolation';
import { createRectTex } from '../rect';
import { makeTextTex } from '../text';

const enum Direction {
    Top,
    Rgt,
    Btm,
    Lft,
    Non,
};

const enum Type {
    Face1,
    Face2,
};

type ObjGroup = {
    x: number;
    y: number;
    grid: number[][];
    next: Direction;
    type: Type;
};

//const WIDTH = 8;
//const HEIGHT = 8;

const ObjGroups: ObjGroup[] = [];

const objCtx = createRectTex(makeTextTex('🥳', 120));
const waitTicker = ticker(900);
const moveTween = createTween(0, 1, 900);

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

const spawnObjectGroup = (x: number, y: number) =>
    ObjGroups.push({ x, y, grid: [[0]], next: Direction.Top, type: Type.Face1 });

const setupTypeCtx = (t: Type) => {
    switch(t) {
        case Type.Face1:
        case Type.Face2:
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
            (_, j) => objCtx.draw_(baseX + j + 1, baseY + i + 1, 0)
        )
    );
};

const enum State {
    Idle,
    Moving,
};

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

spawnObjectGroup(0, 0);

export const update = (dt: number) => {
    sm.run(dt);
};

export const render = () => {
    ObjGroups.map(drawLerpedGroup);
};
