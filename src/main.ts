import { createGLContext } from './engine/webgl2';
import { getById } from './globals';

const ctx = createGLContext(getById('c'), 640, 360);
ctx.clear_();
(onresize = ctx.resize_)();
