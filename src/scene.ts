import { createRectTex } from './rect';
import { makeTextTex } from './text';

let obj = null;
export const init = () => {
    obj = createRectTex(makeTextTex('😭', 120));
    obj.use_();
};

export const update = (dt: number) => {
};

export const render = () => {
    obj.draw_(0,0,0);
};
