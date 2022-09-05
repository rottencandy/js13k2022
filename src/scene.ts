import { update as panelUpdate, render as panelRender, readStateBtns, readOprBtns } from './entities/panel';
import { render as bgRender } from './entities/backdrop';
import { update as objectsUpdate, render as objectsRender } from './entities/objects';
import { update as operatorsUpdate, render as operatorsRender, checkGridUpdates } from './entities/operators';
import { createStateMachine } from './engine/state';
import { calcCursorGridPos } from './globals';

export const enum SceneState {
    Editing = 1,
    Running,
    Paused,
};

const sm = createStateMachine({
    [SceneState.Editing]: () => {
        const next = readStateBtns(SceneState.Editing);
        calcCursorGridPos();
        readOprBtns();
        calcHoverOprPreview();
        return next;
    },
    [SceneState.Running]: (dt: number) => {
        objectsUpdate(dt);
        const next = readStateBtns(SceneState.Running);
        return next;
    },
    [SceneState.Paused]: () => {
        const next = readStateBtns(SceneState.Paused);
        return next;
    },
}, SceneState.Editing);

export const update = (dt: number) => {
    sm.run(dt);
    panelUpdate(dt);
    operatorsUpdate(dt);
};

export const render = () => {
    bgRender();
    panelRender();
    operatorsRender(sm.state as SceneState);
    objectsRender();
};
