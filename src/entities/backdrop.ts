import { createShadedRect } from '../rect';
import rectFrag from '../shaders/backdrop.frag';

let obj = createShadedRect(rectFrag, 16, 10);

export const render = () => {
    obj.use_();
    obj.draw_(-3,-1,0);
};
