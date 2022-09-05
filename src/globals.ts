import { createGLContext } from './engine/webgl2';
import Camera from './engine/cam';

export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 360;
export const GRID_WIDTH = 8;
export const GRID_HEIGHT = 8;

/** Create element with props */
export const createEle = (name: string, props = {}, val = null) => {
    const ele = document.createElement(name);
    for (let k in props) {
        ele[k] = props[k];
    }
    ele.append(val);
    return ele;
};

export const
    deviceScaleRatio = (width: number, height: number) => Math.min(window.innerWidth / width, window.innerHeight / height),

    FLOOR = (x: number) => ~~x,
    radians = (a: number) => a * Math.PI / 180,
    F32 = (x: Iterable<number>) => new Float32Array(x);

export const CTX = createGLContext(document.getElementById('c') as HTMLCanvasElement, GAME_WIDTH, GAME_HEIGHT);
(window.onresize = CTX.resize_)();

export const CAM = Camera(radians(45), 1, 400, 640/360).move_(-4,4,-10).recalculate_();
