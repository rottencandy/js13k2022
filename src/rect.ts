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

export const enum Angle {
    a0 = 0,
    a90 = 1.57079,
    a180 = 3.14159,
    a270 = 4.71238,
}

export const createRectTex = (tex: any) => {
    const sh = CTX.shader_(texVert, texFrag);
    sh.use_();
    const uni = sh.uniform_;
    uni`uMat`.m4fv_(CAM.matrix_);

    const thisObj = {
        use_() {
            tex.bind_();
            mesh.vao_.bind_();
            sh.use_();
            return thisObj;
        },
        draw_(x: number, y: number, z: number, size = 1, opacity = 1, angle = Angle.a0) {
            uni`uPos`.u3f_(x,y,z);
            uni`uZoom`.u1f_(size);
            uni`uOpacity`.u1f_(opacity);
            uni`uAng`.u1f_(angle);
            mesh.draw_();
            return thisObj;
        },
    };
    return thisObj;
};

export const createShadedRect = (frag: string, width = 1, height = width) => {
    const sh = CTX.shader_(rectVert, frag);
    sh.use_();
    const uni = sh.uniform_;
    uni`uMat`.m4fv_(CAM.matrix_);
    uni`uSize`.u2f_(width, height);

    const thisObj = {
        use_() {
            mesh.vao_.bind_();
            sh.use_();
            return thisObj;
        },
        draw_(x: number, y: number, z: number) {
            uni`uPos`.u3f_(x,y,z);
            mesh.draw_();
            return thisObj;
        },
    };
    return thisObj;
};
