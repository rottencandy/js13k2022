import { createRectTex, createShadedRect } from '../rect';
import { makeTextTex } from '../text';
import rectFrag from '../shaders/panel.frag';
import { Keys } from '../engine/input';
import { SceneState } from '../scene';
import { editPanelOprCtx, OperatorType, operatorTypeCtx, playPanelOprCtx, setSelectedOperator } from './operators';

let bg = createShadedRect(rectFrag, 3.7, 8.5);
let selectorCtx = null;
let playBtn = null;
let pauseBtn = null;
let stopBtn = null;
setTimeout(() => {
    selectorCtx = createRectTex(makeTextTex('⛶', 105));
    playBtn = createRectTex(makeTextTex('▶', 130));
    pauseBtn = createRectTex(makeTextTex('⏸', 130));
    stopBtn = createRectTex(makeTextTex('🔁', 130));

    state.selectedOpr = Object.keys(state.panelOprList)[0];
}, 100);

const oprMap = {
    [OperatorType.Belt]: OperatorType.Belt,
    [OperatorType.Block]: OperatorType.Block,
    [OperatorType.Piston]: OperatorType.Piston,
    [OperatorType.Freezer]: OperatorType.Freezer,
    [OperatorType.Thawer]: OperatorType.Thawer,
    [OperatorType.End]: OperatorType.End,
    [OperatorType.Spawner]: OperatorType.Spawner,
};

const state = {
    paused: true,
    scene: SceneState.Editing,
    scale: {
        btn1: 1,
        btn2: 1,
        [OperatorType.Belt]: 1,
    },
    panelOprList: {},
    selectedOpr: null,
    isEditor: false,
};
// todo: lerped hover size
const BTN_HOVER_SIZE = 1.2;
const OPR_HOVER_SIZE = 1.1;

const btn1Pos = { x: 0.027, y: 0.075 };
const btn2Pos = { x: 0.096, y: 0.075 };
const oprBtnPos = { x: 0.069, y: 0.26 };
const btnHeight = 0.125;
const btnWidth = 0.069;

const isPtrInBounds = (bx: number, by: number, width: number, height: number) => {
    return Keys.ptrX_ >= bx && Keys.ptrX_ < bx + width && Keys.ptrY_ >= by && Keys.ptrY_ < by + height;
}

export const readStateBtns = (prevState: SceneState) => {
    state.scene = prevState;
    // outside panel
    if (Keys.ptrX_ > 0.205) return;

    if (isPtrInBounds(btn1Pos.x, btn1Pos.y, btnWidth, btnHeight)) {
        state.scale.btn1 = BTN_HOVER_SIZE;
        if (Keys.justClicked_) {
            // hint: there's an assignment here
            if (state.paused = !state.paused) return state.scene = SceneState.Paused;
            else return state.scene = SceneState.Running;
        }
    } else state.scale.btn1 = 1;
    if (isPtrInBounds(btn2Pos.x, btn2Pos.y, btnWidth, btnHeight)) {
        state.scale.btn2 = BTN_HOVER_SIZE;
        if (Keys.justClicked_) {
            state.paused = true;
            return state.scene = SceneState.Editing;
        }
    } else state.scale.btn2 = 1;
};

export const setupPanel = (isEditor?: boolean) => {
    state.panelOprList = isEditor ? operatorTypeCtx : playPanelOprCtx;
    state.selectedOpr = Object.keys(state.panelOprList)[0];
    state.isEditor = isEditor;
    state.paused = true;
};

export const readOprBtns = () => {
    if (Keys.ptrX_ > 0.205 || Keys.ptrY_ < 0.25) return;
    Object.keys(state.panelOprList).map((o, i) => {
        if (isPtrInBounds(oprBtnPos.x, oprBtnPos.y + i * btnHeight, btnWidth, btnHeight)) {
            state.scale[o] = OPR_HOVER_SIZE;
            if (Keys.justClicked_) setSelectedOperator(oprMap[state.selectedOpr = o]);
        } else {
            state.scale[o] = 1;
        }
    });
};

export const render = () => {
    bg.use_().draw_(-4, -0.1, .1);
    if (!state.isEditor) {
        if (state.paused) {
            playBtn.use_().draw_(-2.9, 6.5, .11, state.scale.btn1);
        } else {
            pauseBtn.use_().draw_(-2.9, 6.5, .11, state.scale.btn1);
        }
        stopBtn.use_().draw_(-1.9, 6.5, .11, state.scale.btn2);
    }

    const opacity = state.paused ? 1 : .7;
    Object.keys(state.panelOprList).map((o, i) => {
        state.panelOprList[o].use_().draw_(-2.3, 5 - i, .11, state.scale[o], opacity);
        if (state.scene === SceneState.Editing && state.selectedOpr === o) {
            selectorCtx.use_().draw_(-2.3, 5 - i, .11, 1.1, 1, 0, 0);
        }
    });
};
