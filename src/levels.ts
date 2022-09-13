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
    '03dz0304dz0504dz0604az0204bw0704bw0804bw0904fw0404',
    '04az0204bw0604bw0704bw0804bw0904',
    '03az0303bw0505bw0605bw0705',
    '03aw0303bw0504bw0503bw0505',
    '02cw0503az0303bw0704bw0703',
    '01az0303bw0505',
    '04aw0403bw0604bw0603',
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
    d: OperatorType.Belt,
    e: OperatorType.Piston,
    f: OperatorType.Freezer,
    g: OperatorType.Thawer,
};

const oprRevMap = {
    [OperatorType.Spawner]: 'a',
    [OperatorType.End]: 'b',
    [OperatorType.Block]: 'c',
    [OperatorType.Belt]: 'd',
    [OperatorType.Piston]: 'e',
    [OperatorType.Freezer]: 'f',
    [OperatorType.Thawer]: 'g',
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
