import { createShadedRect } from '../rect';
import rectFrag from '../shaders/panel.frag';

let obj = createShadedRect(rectFrag, 3, 8);

export const update = (dt: number) => {
};

export const render = () => {
    bg.use_().draw_(-3,-0.1,.1);
    playBtn.use_().draw_(-2.5, 6.5, .11);
    stopBtn.use_().draw_(-1.5, 6.5, .11);
};
