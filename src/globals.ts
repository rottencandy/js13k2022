import { createGLContext } from './engine/webgl2';
import Camera from './engine/cam';

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

export const CTX = createGLContext(document.getElementById('c') as HTMLCanvasElement, 640, 360);
(window.onresize = CTX.resize_)();

export const CAM = Camera(radians(45), 1, 400, 640/360).move_(0,0,-10);
