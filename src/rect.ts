import { CAM, CTX, F32 } from './globals';
import texVert from './shaders/tex.vert';
import texFrag from './shaders/tex.frag';
import rectVert from './shaders/rect.vert';

/*
*  1 ___ 2
*   |   |
*   |   |
*   |___|
*  0     3
*/
const data = [F32([
    0, 0,
    0, 1,
    1, 1,
    1, 0,
]),
[0, 3, 2, 0, 2, 1]] as any;
const mesh = CTX.createMesh_(data, [[0, 2]]);

export const createRectTex = (tex: any) => {
    const sh = CTX.shader_(texVert, texFrag);
    sh.use_();
    const uni = sh.uniform_;
    uni`uMat`.m4fv_(CAM.matrix_);

    return {
        use_() {
            tex.bind_();
            mesh.vao_.bind_();
            sh.use_();
        },
        draw_(x: number, y: number, z: number) {
            uni`uPos`.u3f_(x,y,z);
            mesh.draw_();
        },
    };
};

export const createShadedRect = (frag: string, size = 1) => {
    const sh = CTX.shader_(rectVert, frag);
    sh.use_();
    const uni = sh.uniform_;
    uni`uMat`.m4fv_(CAM.matrix_);
    uni`uSize`.u1f_(size);

    return {
        use_() {
            mesh.vao_.bind_();
            sh.use_();
        },
        draw_(x: number, y: number, z: number) {
            uni`uPos`.u3f_(x,y,z);
            mesh.draw_();
        },
    };
};
