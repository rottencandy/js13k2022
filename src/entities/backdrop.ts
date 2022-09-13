import { createShadedRect } from '../rect';
import rectFrag from '../shaders/backdrop.frag';

let obj = createShadedRect(rectFrag, 16, 10);

export const render = (t: number) => {
    obj.use_();
    obj.uni`uTime`.u1f_(t);
    obj.draw_(-2,-1,-.07);
};
