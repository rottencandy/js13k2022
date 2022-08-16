import { CAM, CTX, F32 } from './globals';
import vert from './shaders/tex.vert';
import frag from './shaders/tex.frag';

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

export const createRectTex = (tex: any) => {
    const mesh = CTX.createMesh_(data, [[0, 2]]);
    const sh = CTX.shader_(vert, frag);
    const uni = sh.uniform_;

    return {
        use_() {
            tex.bind_();
            mesh.vao_.bind_();
            sh.use_();
            uni`uMat`.m4fv_(CAM.recalculate_().matrix_);
        },
        draw_(x: number, y: number, z: number) {
            uni`uPos`.u3f_(x,y,z);
            mesh.draw_();
        },
    };
};
