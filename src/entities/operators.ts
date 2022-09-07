import { Keys } from '../engine/input';
import { CursorGridPos } from '../globals';
import { createRectTex, Direction, nextDir } from '../rect';
import { SceneState } from '../scene';
import { makeTextTex } from '../text';

// Types {{{

export const enum OperatorType {
    Belt,
    Block,
    Piston,
    Spawner,
}

type Operator = {
    x: number;
    y: number;
    type: OperatorType;
    dir: Direction;
}

// }}}

const BeltOperators: Operator[] = [];
const State = {
    selectedOperator: OperatorType.Belt,
    showHoverOpShadow: false,
    showCellEditBtns: false,
};

// Utils {{{

export const isObstaclePresent = (x: number, y: number) => {
    return BeltOperators.find(o => o.x === x && o.y === y && o.type === OperatorType.Block);
};

export const getOperatorIntent = (x: number, y: number): Direction => {
    const op = BeltOperators.find(o => o.x === x && o.y === y);
    if (op) {
        return op.dir;
    }
    return Direction.Non;
};

// }}}

// Update {{{

const spawnOperator = (x: number, y: number, type: OperatorType, dir: Direction) => {
    const opr = { x, y, type, dir };
    switch (type) {
        case OperatorType.Belt:
            BeltOperators.push(opr);
            break;
    }
}

export const checkGridUpdates = () => {
    if (CursorGridPos.isInRange) {
        State.showHoverOpShadow = true;
        State.showCellEditBtns = true;
        BeltOperators.find((o, i) => {
            if (o.x === CursorGridPos.x && o.y === CursorGridPos.y) {
                if (Keys.justClicked_) {
                    if (CursorGridPos.leftHalf) {
                        o.dir = nextDir(o.dir);
                    } else {
                        BeltOperators.splice(i, 1);
                    }
                }
                State.showHoverOpShadow = false;
                return State.showCellEditBtns = true;
            }
        });
        if (Keys.justClicked_ && State.showHoverOpShadow) {
            spawnOperator(
                CursorGridPos.x,
                CursorGridPos.y,
                State.selectedOperator,
                Direction.Top
            );
        }
    } else {
        State.showHoverOpShadow = false;
    }
};

spawnOperator(0, 0, OperatorType.Belt, Direction.Top);
spawnOperator(0, 1, OperatorType.Belt, Direction.Rgt);

// }}}

// Render {{{

const beltCtx = createRectTex(makeTextTex('⏫', 100));
const blockCtx = createRectTex(makeTextTex('⬛', 100));
const rotateCtx = createRectTex(makeTextTex('↻', 170));
const crossCtx = createRectTex(makeTextTex('×', 170));

export const operatorTypeCtx = (t: OperatorType) => {
    switch (t) {
        case OperatorType.Belt:
            return beltCtx;
        case OperatorType.Block:
            return blockCtx;
    }
};

const drawBeltOperator = (o: Operator) => {
    beltCtx.draw_(o.x, o.y, -0.02, 1, 1, o.dir);
    if (State.showCellEditBtns) {
        if (o.x === CursorGridPos.x && o.y === CursorGridPos.y) {
            rotateCtx.use_().draw_(o.x - 0.2, o.y - 0.1, -0.01);
            crossCtx.use_().draw_(o.x + 0.2, o.y - 0.2, -0.01);
            // reset ctx so it can be used in next iters
            beltCtx.use_();
        }
    }
};

// }}}

export const update = (dt: number) => {
};

export const render = (state: SceneState) => {
    beltCtx.use_();
    BeltOperators.map(drawBeltOperator);

    if (state === SceneState.Editing && State.showHoverOpShadow) {
        const ctx = operatorTypeCtx(State.selectedOperator);
        ctx.use_().draw_(CursorGridPos.x, CursorGridPos.y, -0.02, 1, .7);
    }
};

// vim: fdm=marker:fdl=0:
