import { createRectTex } from './rect';
import { makeTextTex } from './text';
import { update as panelUpdate, render as panelRender } from './entities/panel';
import { render as bgRender } from './entities/backdrop';

let obj1 = createRectTex(makeTextTex('🥳', 120));

export const update = (dt: number) => {
    panelUpdate(dt);
};

export const render = () => {
    bgRender();
    panelRender();
    obj1.use_();
    obj1.draw_(3,0,0);
};
