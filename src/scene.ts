import { createRectTex, createShadedRect } from './rect';
import { makeTextTex } from './text';
import rectFrag from './shaders/rect.frag';

let obj1 = createRectTex(makeTextTex('😭', 120));
let obj2 = createShadedRect(rectFrag, 2);

export const update = (dt: number) => {
};

export const render = () => {
    obj1.use_();
    obj1.draw_(0,0,0);
    obj2.use_();
    obj2.draw_(2,0,0);
};
