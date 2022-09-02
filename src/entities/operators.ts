import { createStateMachine } from '../engine/state';
import { createTween, ticker } from '../engine/interpolation';
import { createRectTex } from '../rect';
import { makeTextTex } from '../text';
import { Direction } from './objects';

const enum Type {
    Belt,
    Block,
    Piston,
    Spawner,
}

type Operator = {
    x: number;
    y: number;
    type: Type;
    dir: Direction;
}

const Operators: Operator[] = [];

const objCtx = createRectTex(makeTextTex('⏫', 120));

const typeCtx = (t: Type) => {
    switch (t) {
        case Type.Belt:
            objCtx.use_();
            return objCtx;
    }
};

const drawOperator = (o: Operator) => {
    const ctx = typeCtx(o.type);
    ctx.draw_(o.x, o.y, -0.01);
};

const spawnOperator = (x: number, y: number, type: Type, dir: Direction) =>
    Operators.push({ x, y, type, dir });

spawnOperator(0, 0, Type.Belt, Direction.Top);
spawnOperator(0, 1, Type.Belt, Direction.Rgt);

export const isObstaclePresent = (x: number, y: number) => {
    return Operators.find(o => o.x === x && o.y === y && o.type === Type.Block);
};

export const getOperatorIntent = (x: number, y: number): Direction => {
    const op = Operators.find(o => o.x === x && o.y === y);
    if (op) {
        return op.dir;
    }
    return Direction.Non;
};

export const update = (dt: number) => {
};

export const render = () => {
    Operators.map(drawOperator);
};
