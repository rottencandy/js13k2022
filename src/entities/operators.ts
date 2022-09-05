import { Keys } from '../engine/input';
import { createRectTex } from '../rect';
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
let selectedOperator = OperatorType.Belt;

// used for drawing shadow operator pos
const ptrXPos = 0.228;
const ptrYPos = 0.985;
const ptrWidth = 0.068;
const ptrHeight = 0.122;

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

const spawnOperator = (x: number, y: number, type: OperatorType, dir: Direction) =>
    BeltOperators.push({ x, y, type, dir });

export const setSelectedOpr = (o: OperatorType) => {
    selectedOperator = o;
};

spawnOperator(0, 0, OperatorType.Belt, Direction.Top);
spawnOperator(0, 1, OperatorType.Belt, Direction.Rgt);

// }}}

// Render {{{

const beltCtx = createRectTex(makeTextTex('⏫', 120));
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

export const drawSelectedOprShadow = () => {
    if (Keys.ptrX_ < ptrXPos && Keys.ptrY_ > ptrYPos) return;
    const xPos = Math.floor((Keys.ptrX_ - ptrXPos) / ptrWidth);
    const yPos = Math.floor(((1 - Keys.ptrY_) - (1 - ptrYPos)) / ptrHeight);
    const ctx = operatorTypeCtx(selectedOperator);
    ctx.use_().draw_(xPos, yPos, -0.01);
};

// }}}

export const update = (dt: number) => {
};

export const render = () => {
    BeltOperators.map(drawOperator);
};

// vim: fdm=marker:fdl=0:
