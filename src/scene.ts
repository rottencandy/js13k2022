import { render as panelRender, readStateBtns, readOprBtns, setupPanel } from './entities/panel';
import { render as bgRender } from './entities/backdrop';
import { render as objectsRender, prepareNextStep, endCurrentStep, clearGroups } from './entities/objects';
import { render as operatorsRender, trySpawn, resetOperatorStates, loadOperators, checkGridUpdates, getOpCount } from './entities/operators';
import { createStateMachine } from './engine/state';
import { calcCursorGridPos } from './globals';
import { createTween, ticker } from './engine/interpolation';
import { Levels, parseLevel } from './levels';
import { showLevelEndScrn, updateHUDFace, updateHUDTime } from './ui';
import { setLevelStats } from './localstorage';

export const enum SceneState {
    Editing = 1,
    Running,
    Paused,
};

const enum StepState {
    Idle,
    Moving,
};

const State = {
    // spawns not yet in scene
    remainingSpawns: 0,
    // total no. does not change
    curLevelSpawns: 0,
    // no. of finished spawns
    completedObjs: 0,
    activeLevel: null,
    stepTime: 0,
};

export const resetScene = () => {
    State.remainingSpawns = State.curLevelSpawns;
    updateHUDFace(State.curLevelSpawns - State.completedObjs);
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
            const completedCount = endCurrentStep();
            if (completedCount) State.completedObjs += completedCount;
            updateHUDFace(State.curLevelSpawns - State.completedObjs);
            updateHUDTime(++State.stepTime);
            if (State.completedObjs === State.curLevelSpawns) {
                setLevelStats(State.activeLevel, getOpCount(), State.stepTime);
                showLevelEndScrn();
            }
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
            updateHUDTime(State.stepTime = 0);
            clearGroups();
            resetScene();
        }
        return next;
    },
    [SceneState.Paused]: () => {
        const next = readStateBtns(SceneState.Paused);
        if (next === SceneState.Editing) {
            updateHUDTime(State.stepTime = 0);
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
    sceneState.reset(SceneState.Editing);
    State.curLevelSpawns = 0;
    State.stepTime = 0;
};

export const loadLevel = (id: number) => {
    State.activeLevel = id;
    setupPanel();
    const ops = parseLevel(Levels[id]);
    State.remainingSpawns = ops.spawnCount;
    State.curLevelSpawns = ops.spawnCount;
    State.completedObjs = 0;
    State.stepTime = 0;
    updateHUDFace(State.curLevelSpawns - State.completedObjs);
    loadOperators(ops.operators);
    sceneState.reset(SceneState.Editing);
};

export const loadCustomLevel = (lv: string) => {
    State.activeLevel = null;
    setupPanel();
    try {
        const ops = parseLevel(lv);
        State.remainingSpawns = ops.spawnCount;
        State.curLevelSpawns = ops.spawnCount;
        State.completedObjs = 0;
        State.stepTime = 0;
        updateHUDFace(State.curLevelSpawns - State.completedObjs);
        loadOperators(ops.operators);
        sceneState.reset(SceneState.Editing);
    } catch (e) {
        alert('Invalid Level: ' + e);
    }
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
