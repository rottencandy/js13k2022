import { createStateMachine } from './engine/state';
import { ctx } from './main';

// ts enums are expensive
const sPaused = 0;
const sPlaying = 1;

const sm = createStateMachine({
    [sPaused]: () => {
    },
    [sPlaying]: () => {
    }
}, sPaused);

export const update = () => {
    sm.run_();
};

export const render = () => {
    ctx.clear_();
};

export const startGame = () => sm.reset_(sPlaying);
