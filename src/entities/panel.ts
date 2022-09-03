import { createRectTex, createShadedRect } from '../rect';
import { makeTextTex } from '../text';
import rectFrag from '../shaders/panel.frag';
import { justClicked, Keys } from '../engine/input';
import { SceneState } from '../scene';

let bg = createShadedRect(rectFrag, 3.7, 8.5);
const selectorCtx = createRectTex(makeTextTex('⛶', 100));
const playBtn = createRectTex(makeTextTex('▶', 100));
const pauseBtn = createRectTex(makeTextTex('⏸', 100));
const stopBtn = createRectTex(makeTextTex('⏹', 100));

const state = {
    paused: true,
    scene: SceneState.Editing,
    btn1Scale: 1,
    btn2Scale: 1,
};
// todo: lerped hover size
const BTN_HOVER_SIZE = 1.2;

const btn1Pos = { x: 0.027, y: 0.075 };
const btn2Pos = { x: 0.096, y: 0.075 };
const btnHeight = 0.125;
const btnWidth = 0.069;

const isPtrInBounds = (bx: number, by: number, width: number, height: number) => {
    return Keys.ptrX_ >= bx && Keys.ptrX_ < bx + width && Keys.ptrY_ >= by && Keys.ptrY_ < by + height;
}

export const readStateBtns = (prevState: SceneState) => {
    // todo: update this prop below
    state.scene = prevState;
    // outside panel
    if (Keys.ptrX_ > 0.205) return;

    const clicked = justClicked();

    if (isPtrInBounds(btn1Pos.x, btn1Pos.y, btnWidth, btnHeight)) {
        state.btn1Scale = BTN_HOVER_SIZE;
        if (clicked) {
            if (state.paused = !state.paused) return SceneState.Paused;
            else return SceneState.Running;
        }
    } else state.btn1Scale = 1;
    if (isPtrInBounds(btn2Pos.x, btn2Pos.y, btnWidth, btnHeight)) {
        state.btn2Scale = BTN_HOVER_SIZE;
        if (clicked) {
            // todo: change state
            return SceneState.Editing;
        }
    } else state.btn2Scale = 1;
};

export const update = (dt: number) => {
};

export const render = () => {
    bg.use_().draw_(-4, -0.1, .1);
    if (state.paused) {
        playBtn.use_().draw_(-2.9, 6.5, .11, state.btn1Scale);
    } else {
        pauseBtn.use_().draw_(-2.9, 6.5, .11, state.btn1Scale);
    }
    stopBtn.use_().draw_(-1.9, 6.5, .11, state.btn2Scale);
};
