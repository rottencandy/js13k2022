import { render as panelRender, readStateBtns, readOprBtns, setupPanel } from './entities/panel';
import { render as bgRender } from './entities/backdrop';
import { render as objectsRender, prepareNextStep, endCurrentStep, clearGroups } from './entities/objects';
import { render as operatorsRender, trySpawn, resetOperatorStates, loadOperators, checkGridUpdates } from './entities/operators';
import { createStateMachine } from './engine/state';
import { calcCursorGridPos } from './globals';
import { createTween, ticker } from './engine/interpolation';
import { Levels, parseLevel } from './levels';
import { showLevelEndScrn } from './ui';

export const enum SceneState {
    Editing = 1,
    Running,
    Paused,
};

const enum StepState {
    Idle,
    Moving,
};

// todo: read this from level data
const SPAWNS = 5;

const State = {
    remainingSpawns: SPAWNS,
    completedObjs: 0,
};

export const resetScene = () => {
    State.remainingSpawns = SPAWNS;
    State.completedObjs = 0;
}

const waitTicker = ticker(900);
const stepTween = createTween(0, 1, 900);
const stepState = createStateMachine({
    [StepState.Idle]: (dt) => {
        if (waitTicker(dt)) {
            if (State.remainingSpawns > 0) {
                const spawnCount = trySpawn(State.remainingSpawns);
                State.remainingSpawns -= spawnCount;
            }
            resetOperatorStates();
            prepareNextStep();
            return StepState.Moving;
        };
    },
    [StepState.Moving]: (dt) => {
        stepTween.step(dt);
        if (stepTween.done) {
            stepTween.reset();
            const count = endCurrentStep();
            if (count) State.completedObjs += count;
            if (State.completedObjs === State.remainingSpawns) showLevelEndScrn();
            return StepState.Idle;
        };
    },
}, StepState.Idle);

const sceneState = createStateMachine({
    [SceneState.Editing]: () => {
        const next = readStateBtns(SceneState.Editing);
        calcCursorGridPos();
        readOprBtns();
        checkGridUpdates();
        return next;
    },
    [SceneState.Running]: (dt: number) => {
        stepState.run(dt);
        const next = readStateBtns(SceneState.Running);
        if (next === SceneState.Editing) {
            clearGroups();
            resetScene();
        }
        return next;
    },
    [SceneState.Paused]: () => {
        const next = readStateBtns(SceneState.Paused);
        if (next === SceneState.Editing) {
            clearGroups();
            resetScene();
        }
        return next;
    },
}, SceneState.Editing);

export const loadEditor = () => {
    resetOperatorStates();
    setupPanel(true);
    loadOperators([], true);
};

export const loadLevel = (id: number) => {
    setupPanel();
    const ops = parseLevel(Levels[id]);
    State.remainingSpawns = ops.spawnCount;
    State.completedObjs = 0;
    loadOperators(ops.operators);
};

export const loadCustomLevel = (lv: string) => {
    setupPanel();
    const ops = parseLevel(lv);
    State.remainingSpawns = ops.spawnCount;
    State.completedObjs = 0;
    loadOperators(ops.operators);
};

export const update = (dt: number) => {
    sceneState.run(dt);
};

export const render = () => {
    bgRender();
    panelRender();
    operatorsRender(sceneState.state as SceneState, stepTween.val);
    objectsRender(stepTween.val);
};
