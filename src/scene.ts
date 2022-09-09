import { update as panelUpdate, render as panelRender, readStateBtns, readOprBtns } from './entities/panel';
import { render as bgRender } from './entities/backdrop';
import { render as objectsRender, prepareNextStep, endCurrentStep } from './entities/objects';
import { render as operatorsRender, checkGridUpdates, trySpawn } from './entities/operators';
import { createStateMachine } from './engine/state';
import { calcCursorGridPos } from './globals';
import { createTween, ticker } from './engine/interpolation';

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
    remainingSpawns: 5,
};

const waitTicker = ticker(900);
const stepTween = createTween(0, 1, 900);
const stepState = createStateMachine({
    [StepState.Idle]: (dt) => {
        if (waitTicker(dt)) {
            if (State.remainingSpawns > 0) {
                const spawnCount = trySpawn(State.remainingSpawns);
                State.remainingSpawns -= spawnCount;
            }
            prepareNextStep();
            return StepState.Moving;
        };
    },
    [StepState.Moving]: (dt) => {
        stepTween.step(dt);
        if (stepTween.done) {
            stepTween.reset();
            endCurrentStep();
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
        return next;
    },
    [SceneState.Paused]: () => {
        const next = readStateBtns(SceneState.Paused);
        return next;
    },
}, SceneState.Editing);

export const update = (dt: number) => {
    sceneState.run(dt);
    panelUpdate(dt);
};

export const render = () => {
    bgRender();
    panelRender();
    operatorsRender(sceneState.state as SceneState);
    objectsRender(stepTween.val);
};
