import { createRectTex } from '../rect';
import { makeTextTex } from '../text';
import { Direction } from './objects';

// Types {{{

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

// }}}

const BeltOperators: Operator[] = [];

// Utils {{{

export const isObstaclePresent = (x: number, y: number) => {
    return BeltOperators.find(o => o.x === x && o.y === y && o.type === Type.Block);
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

const typeCtx = (t: Type) => {
    switch (t) {
        case Type.Belt:
            beltCtx.use_();
            return beltCtx;
        case Type.Block:
            blockCtx.use_();
            return blockCtx;
    }
};

const spawnOperator = (x: number, y: number, type: Type, dir: Direction) =>
    BeltOperators.push({ x, y, type, dir });

spawnOperator(0, 0, Type.Belt, Direction.Top);
spawnOperator(0, 1, Type.Belt, Direction.Rgt);

// }}}

// Render {{{

const beltCtx = createRectTex(makeTextTex('⏫', 100));
const blockCtx = createRectTex(makeTextTex('⬛', 100));

const drawOperator = (o: Operator) => {
    // todo: avoid using typeCtx here (optimize for use_)
    const ctx = typeCtx(o.type);
    ctx.draw_(o.x, o.y, -0.01);
};

// }}}

export const update = (dt: number) => {
};

export const render = () => {
    BeltOperators.map(drawOperator);
};

// vim: fdm=marker:fdl=0:
