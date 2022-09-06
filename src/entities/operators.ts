import { Keys } from '../engine/input';
import { CursorGridPos } from '../globals';
import { createRectTex } from '../rect';
import { SceneState } from '../scene';
import { makeTextTex } from '../text';
import { Direction } from './objects';

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
        BeltOperators.find((o) => {
            if (o.x === CursorGridPos.x && o.y === CursorGridPos.y) {
                return State.showHoverOpShadow = false;
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

export const operatorTypeCtx = (t: OperatorType) => {
    switch (t) {
        case OperatorType.Belt:
            return beltCtx;
        case OperatorType.Block:
            return blockCtx;
    }
};

const drawOperator = (o: Operator) => {
    // todo: avoid using typeCtx here (optimize for use_)
    const ctx = operatorTypeCtx(o.type);
    ctx.use_().draw_(o.x, o.y, -0.01);
};

// }}}

export const update = (dt: number) => {
};

export const render = (state: SceneState) => {
    BeltOperators.map(drawOperator);
    if (state === SceneState.Editing && State.showHoverOpShadow) {
        const ctx = operatorTypeCtx(State.selectedOperator);
        ctx.use_().draw_(CursorGridPos.x, CursorGridPos.y, -0.01);
    }
};

// vim: fdm=marker:fdl=0:
