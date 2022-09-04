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

export const render = () => {
    CTX.clear_();
    sceneRender();
};

export const startGame = () => sm.reset(State.Playing);
