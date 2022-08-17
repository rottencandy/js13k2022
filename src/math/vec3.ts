import { F32 } from '../globals';

// source: https://github.com/toji/gl-matrix

export type Vector = Iterable<number>;

export const V3create = (x = 0, y = 0, z = 0) => {
    const v = F32(3 as any);
    return V3set(v, x, y, z);
};

export const V3set = (v: Vector, x: number, y: number, z: number) => {
    v[0] = x;
    v[1] = y;
    v[2] = z;
    return v;
};

export const V3length = (v: Vector) => {
    return Math.hypot(v[0], v[1], v[2]);
}

export const V3add = (out: Vector, a: Vector, b: Vector) => {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
}

export const V3subtract = (out: Vector, a: Vector, b: Vector) => {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
}

export const V3multiply = (out: Vector, a: Vector, b: Vector) => {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
}

export const V3multiplySc = (out: Vector, a: Vector, x: number) => {
    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    return out;
}

export const V3divide = (out: Vector, a: Vector, b: Vector) => {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    return out;
}

export const V3scale = (out: Vector, vec: Vector, x: number) => {
    out[0] = vec[0] * x;
    out[1] = vec[1] * x;
    out[2] = vec[2] * x;
    return out;
}

export const V3dot = (a: Vector, b: Vector) =>
    a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export const V3cross = (out: Vector, a: Vector, b: Vector) => {
    out[0] = a[1] * b[2] - a[2] * b[1];
    out[1] = a[2] * b[0] - a[0] * b[2];
    out[2] = a[0] * b[1] - a[1] * b[0];
    return out;
};

export const V3normalize = (out: Vector, v: Vector) => {
    const length = Math.sqrt(V3dot(v, v));
    // make sure we don't divide by 0.
    if (length > 0.00001) {
        out[0] = v[0] / length;
        out[1] = v[1] / length;
        out[2] = v[2] / length;
    } else {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
    }
    return out;
};

export const V3distance = (a: Vector, b: Vector) => {
    const x = b[0] - a[0];
    const y = b[1] - a[1];
    const z = b[2] - a[2];
    return Math.hypot(x, y, z);
}
