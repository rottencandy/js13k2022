const M = Math;

export const DOC = document;

/** Alias for `document.getElementById()` */
export const getById = (id: string) => DOC.getElementById(id) as HTMLCanvasElement;

export const
    deviceScaleRatio = (width: number, height: number) => MIN(innerWidth / width, innerHeight / height),

    // Math aliases
    MIN = M.min,
    MAX = M.max,
    FLOOR = (x: number) => ~~x,
    ABS = M.abs,
    SQRT = M.sqrt,
    PI = M.PI,
    SIN = M.sin,
    COS = M.cos,
    TAN = M.tan,
    HYPOT = M.hypot,
    isOdd = (x: number) => x % 2,
    radians = (a: number) => a * PI / 180,
    F32 = (x: Iterable<number>) => new Float32Array(x);
