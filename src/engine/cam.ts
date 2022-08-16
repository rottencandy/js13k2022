import { COS, PI, SIN } from '../globals';
import {
    Matrix,
    M4lookAt,
    M4create,
    M4multiply,
    M4perspective,
    M4clone,
} from '../math/mat4';
import { Vector, V3create, V3normalize, V3cross, V3add, V3multiplySc, V3set, V3scale } from '../math/vec3';

type CamState = {
    /**
     * Move camera along XYZ
     */
    move_: (x: number, y: number, z: number) => CamState;
    /**
     * Rotate camera (radians)
     */
    rotate_: (pitch: number, yaw: number) => CamState;
    /**
     * Move camera to absolute point XYZ
     */
    moveTo_: (x: number, y: number, z: number) => CamState;
    /**
     * Change target focus point
     * @deprecated not yet implemented
     */
    lookAt_: (x: number, y: number, z: number) => CamState;
    /**
     * recalculate transform matrix
     */
    recalculate_: () => CamState;
    /**
     * view-projection matrix
     */
    eye_: Vector;
    lookDir_: Vector;
    matrix_: Matrix;
    viewMatrix_: Matrix;
    projectionMatrix_: Matrix;
};

const MAX_PITCH = PI / 2 - 0.01;
/**
 * Create webgl camera
 */
const Camera = (fov: number, zNear: number, zFar: number, aspect: number): CamState => {
    const projectionMat = M4perspective(M4create(), fov, aspect, zNear, zFar);
    const viewMat = M4create();

    const pos = V3create();
    const up = V3create(0, 1);
    const front = V3create(0, 0, -1);
    // make cam initially point to z=-1
    let yaw = -PI / 2,
        pitch = 0;

    // temporary cached variables
    const t_move = V3create();
    const t_side = V3create();
    const t_dir = V3create();
    const t_view = M4create();
    const t_target = V3create();

    const thisObj: CamState = {
        move_(x, y, z) {
            if (z) {
                V3multiplySc(t_move, front, z);
                // reset y dir, so we always move paralell to the ground
                // regardless of face direction
                t_move[1] = 0;
                V3add(pos, pos, t_move);
            }
            if (y) {
                V3scale(t_move, up, y);
                V3add(pos, pos, t_move);
            }
            if (x) {
                V3cross(t_side, up, front);
                V3normalize(t_side, t_side);
                V3multiplySc(t_move, t_side, x);
                V3add(pos, pos, t_move);
            }
            return thisObj;
        },
        rotate_(ptch, yw) {
            pitch -= ptch;
            yaw += yw;
            if (pitch > MAX_PITCH)
                pitch = MAX_PITCH;
            if (pitch < -MAX_PITCH)
                pitch = -MAX_PITCH;

            const cosPitch = COS(pitch);
            t_dir[0] = COS(yaw) * cosPitch;
            t_dir[1] = SIN(pitch);
            t_dir[2] = SIN(yaw) * cosPitch;
            V3normalize(front, t_dir);
            return thisObj;
        },
        moveTo_(x, y, z) {
            V3set(pos, x, y, z);
            return thisObj;
        },
        // TODO
        lookAt_(_x, _y, _z) {
            //V3set(target, x, y, z);
            return thisObj;
        },
        recalculate_() {
            M4lookAt(t_view, pos, V3add(t_target, pos, front), up);
            M4multiply(thisObj.matrix_, projectionMat, t_view);
            return thisObj;
        },
        matrix_: M4clone(projectionMat),
        viewMatrix_: viewMat,
        projectionMatrix_: projectionMat,
        eye_: pos,
        lookDir_: front,
    };

    return thisObj;
};

export default Camera;
