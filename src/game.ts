import { CTX } from './globals';
import { createStateMachine } from './engine/state';
import { update as sceneUpdate, render as sceneRender, init } from './scene';

// ts enums are expensive
const sPaused = 0;
const sPlaying = 1;

const sm = createStateMachine({
    [sPaused]: () => {
    },
    [sPlaying]: (dt: number) => {
        sceneUpdate(dt);
    }
}, sPaused);

export const update = (dt: number) => {
    sm.run_(dt);
};

export const render = () => {
    CTX.clear_();
    sceneRender();
};

init();

export const startGame = () => sm.reset_(sPlaying);
