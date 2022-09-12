import { OperatorType, Operator } from './entities/operators';
import { Direction } from './rect';
/*
*      LEVEL FORMAT:
*
*      [num]xn               (   [char]            [char]       [num]x2 [num]x2   ...)
*
*      objects spawned          operator(oprMap)   dir(dirMap)   X        Y      loop
*/

export const Levels: string[] = [
    '05az0202bv0404',
];

const dirMap = {
    v: Direction.Non,
    w: Direction.Top,
    x: Direction.Lft,
    y: Direction.Btm,
    z: Direction.Rgt,
};

const dirRevMap = {
    [Direction.Non]: 'v',
    [Direction.Top]: 'w',
    [Direction.Lft]: 'x',
    [Direction.Btm]: 'y',
    [Direction.Rgt]: 'z',
};

const oprMap = {
    a: OperatorType.Spawner,
    b: OperatorType.End,
    c: OperatorType.Block,
};

const oprRevMap = {
    [OperatorType.Spawner]: 'a',
    [OperatorType.End]: 'b',
    [OperatorType.Block]: 'c',
};

type Level = {
    spawnCount: number;
    operators: Operator[];
}

export const parseLevel = (lvl: string): Level => {
    const operators = [];
    let ptr = 0;

    let spawnCount = parseInt(lvl[ptr]);
    let digit = 0;
    while (digit = parseInt(lvl[++ptr]))
        spawnCount = 10 * spawnCount + digit;

    while (ptr < lvl.length) {
        const type = oprMap[lvl[ptr]];
        const dir = dirMap[lvl[++ptr]];

        const x = parseInt(lvl.slice(++ptr, ptr + 2));
        ptr += 2;
        const y = parseInt(lvl.slice(ptr, ptr + 2));
        ptr += 2;
        operators.push({ x, y, type, dir })
    }

    return { spawnCount, operators };
};

const numToStr = (n: number) => (n < 10 ? '0' : '') + n;

export const encodeLevel = (lvl: Level) => {
    let str = numToStr(lvl.spawnCount);
    for (let o of lvl.operators) {
        str += oprRevMap[o.type] + dirRevMap[o.dir] + numToStr(o.x) + numToStr(o.y);
    }
    return str;
};
