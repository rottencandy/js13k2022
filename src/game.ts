import { CTX } from './globals';
import { createStateMachine } from './engine/state';
import { update as sceneUpdate, render as sceneRender } from './scene';
import { inputPressCheck } from './engine/input';

const enum State {
    Paused,
    Playing,
};

const sm = createStateMachine({
    [State.Paused]: () => {
        return undefined;
    },
    [State.Playing]: (dt: number) => {
        inputPressCheck();
        sceneUpdate(dt);
        return undefined;
    }
}, State.Paused);

export const update = (dt: number) => {
    sm.run(dt);
};

export const render = (t: number) => {
    CTX.clear_();
    sceneRender(t);
};

export const startGame = () => sm.reset(State.Playing);
export const pauseGame = () => sm.reset(State.Paused);
