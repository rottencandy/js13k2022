import { createGLContext } from './engine/webgl2';
import { startLoop } from './engine/loop';
import { showTitle } from './ui';
import { getById } from './globals';
import { update, render } from './game';

export const ctx = createGLContext(getById('c'), 640, 360);
(onresize = ctx.resize_)();

startLoop(
    update,
    render,
);

showTitle();
