import { F32 } from './globals';

const REV = 'reverse', MAP = 'map', FLAT = 'flat';

const vertexFaceSet = (xPos: 0|1|2, yPos: 0|1|2, zPos: 0|1|2, xyVal: number, zVal: number): number[][] => {
    const verts = [
        [0,         0],
        [xyVal,     0],
        [xyVal, xyVal],
        [0,     xyVal],
    ];
    return [[], [], [], []][MAP]((a, i) => {
        a[xPos] = verts[i][0];
        a[yPos] = verts[i][1];
        a[zPos] = zVal;
        return a;
    });
};
const indexFaceSet = (offset: number) => [0, 1, 2, 0, 2, 3][MAP](v => v + offset);

/** vertex data contains vertices(0) and indices(1) */
type MeshData = [Float32Array, number[]];

// plane {{{

export const Plane = (s: number): MeshData => {
    const arr: number[] = [];
    const vertices = vertexFaceSet(0, 1, 2, s, 0);
    // embed normal position (0, 0, 1) for each vertex set
    for (let i = 0; i < 4; arr.push(...vertices[i++], 0, 0, 1));
    return [F32(arr), indexFaceSet(0)];
};

export const planeTexCoords = F32([...vertexFaceSet(0, 1, 2, 1, 0)][FLAT]());

// }}}

// cube {{{

export const Cube = (s: number): MeshData => {
    const arr: number[] = [];
    const vertices = [
        // front face
        vertexFaceSet(0, 1, 2, s, s),
        // right face
        vertexFaceSet(1, 2, 0, s, s),
        // top face
        vertexFaceSet(0, 2, 1, s, 0),
        // left face
        vertexFaceSet(1, 2, 0, s, 0)[REV](),
        // back face
        vertexFaceSet(0, 1, 2, s, 0)[REV](),
        // bottom face
        vertexFaceSet(0, 2, 1, s, s)[REV](),
    ];
    // embed normal positions for each vertex set
    [
        [ 0,  0,  1],
        [ 1,  0,  0],
        [ 0, -1,  0],
        [-1,  0,  0],
        [ 0,  0, -1],
        [ 0,  1,  0],
    ][MAP]((norms, i) => {
        for (let x = 0; x < 4; arr.push(...vertices[i][x++],  ...norms));
    });
    // vertices
    return [
        F32(arr),
        // indices
        [
            ...indexFaceSet(0 * 4),
            ...indexFaceSet(1 * 4),
            ...indexFaceSet(2 * 4),
            ...indexFaceSet(3 * 4),
            ...indexFaceSet(4 * 4),
            ...indexFaceSet(5 * 4),
        ],
    ];
};

export const cubeTexCoords = F32([
    // front face
    ...vertexFaceSet(0, 1, 2, 1, 0),
    // right face
    ...vertexFaceSet(0, 1, 2, 1, 0),
    // left face
    ...vertexFaceSet(0, 1, 2, 1, 0),
    // back face
    ...vertexFaceSet(0, 1, 2, 1, 0),
    // bottom face
    ...vertexFaceSet(0, 1, 2, 1, 0),
    // top face
    ...vertexFaceSet(0, 1, 2, 1, 0),
][FLAT]());

// }}}

// vim: fdm=marker:fdl=0
