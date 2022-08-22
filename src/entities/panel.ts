import { createShadedRect } from '../rect';
import rectFrag from '../shaders/panel.frag';

let obj = createShadedRect(rectFrag, 3, 8);

export const update = (dt: number) => {
};

export const render = () => {
    obj.use_();
    obj.draw_(-3,0,.1);
};
