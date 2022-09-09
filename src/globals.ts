import { createGLContext } from './engine/webgl2';
import Camera from './engine/cam';
import { Keys } from './engine/input';

export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 360;
export const GRID_WIDTH = 11;
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

export const CAM = Camera(radians(45), 1, 400, 640 / 360).move_(-4, 4, -10).recalculate_();


export const CursorGridPos = {
    x: 0,
    y: 0,
    isInRange: false,
    leftHalf: false,
};

export const calcCursorGridPos = () => {
    const ptrXPos = 0.228;
    const ptrYPos = 0.985;
    const cellWidth = 0.068;
    const cellHeight = 0.122;

    CursorGridPos.isInRange = false;
    if (Keys.ptrX_ < ptrXPos && Keys.ptrY_ > ptrYPos) return;

    const xBasePos = Keys.ptrX_ - ptrXPos;

    const xPos = Math.floor(xBasePos / cellWidth);
    const yPos = Math.floor(((1 - Keys.ptrY_) - (1 - ptrYPos)) / cellHeight);
    const leftHalf = xBasePos % cellWidth < cellWidth / 2;

    if (xPos >= 0 && xPos < GRID_WIDTH && yPos >= 0 && yPos < GRID_HEIGHT) {
        CursorGridPos.x = xPos;
        CursorGridPos.y = yPos;
        CursorGridPos.isInRange = true;
        CursorGridPos.leftHalf = leftHalf;
    }
};
