import { Keys } from '../engine/input';
import { CursorGridPos } from '../globals';
import { createRectTex, Direction, nextDir } from '../rect';
import { SceneState } from '../scene';
import { makeTextTex } from '../text';
import { isCellEmpty, spawnThawedObject } from './objects';
import { canCollidePiston, pistonArmPos, pistonIntent } from './piston';

// Types {{{

export const enum OperatorType {
    Belt,
    Block,
    Piston,
    Spawner,
    End,
    Freezer,
    Thawer,
}

export type Operator = {
    x: number;
    y: number;
    type: OperatorType;
    dir: Direction;
    data?: any;
}

// }}}

const BeltOperators: Operator[] = [];
const PistonOperators: Operator[] = [];
const SpawnerOperators: Operator[] = [];
const BlockOperators: Operator[] = [];
const FreezerOperators: Operator[] = [];
const ThawOperators: Operator[] = [];
const EndOperators: Operator[] = [];
const State = {
    selectedOperator: OperatorType.Belt,
    showHoverOpShadow: false,
    showCellEditBtns: false,
    lastEditPos: { x: -5, y: -5 },
};

// Utils {{{

export const isObstaclePresent = (x: number, y: number) => {
    return SpawnerOperators.some(o => o.x === x && o.y === y) ||
        BlockOperators.some(o => o.x === x && o.y === y) ||
        PistonOperators.some(o => canCollidePiston(o, x, y));
};

export const isFreezeOprPresent = (x: number, y: number) => {
    return FreezerOperators.some(o => o.x === x && o.y === y);
};

export const getThawOprs = () => {
    return ThawOperators.map(o => ({ x: o.x, y: o.y }));
};

export const getEndOprs = () => {
    return EndOperators.map(o => ({ x: o.x, y: o.y }));
};


export const getOperatorIntent = (x: number, y: number): Direction => {
    let op = BeltOperators.find(o => o.x === x && o.y === y) ||
        SpawnerOperators.find(o => o.x === x && o.y === y) ||
        BeltOperators.find(o => o.x === x && o.y === y) ||
        PistonOperators.find(o => pistonIntent(o, x, y));
    if (op) {
        return op.dir;
    }
    return Direction.Non;
};

export const setSelectedOperator = (o: OperatorType) => (State.selectedOperator = o);

// }}}

// Update {{{

const spawnOperator = (x: number, y: number, type: OperatorType, dir: Direction) => {
    const opr = { x, y, type, dir };
    switch (type) {
        case OperatorType.Belt:
            BeltOperators.push(opr);
            break;
        case OperatorType.Piston:
            PistonOperators.push(opr);
            break;
        case OperatorType.Spawner:
            SpawnerOperators.push(opr);
            break;
        case OperatorType.Freezer:
            FreezerOperators.push(opr);
            break;
        case OperatorType.Thawer:
            ThawOperators.push(opr);
            break;
        case OperatorType.End:
            EndOperators.push(opr);
            break;
    }
}
spawnOperator(2, 2, OperatorType.Spawner, Direction.Rgt);
spawnOperator(4, 4, OperatorType.End, Direction.Non);

const checkHoverWithBtns = (oprs: Operator[]) => {
    return oprs.some((o, i) => {
        if (o.x === CursorGridPos.x && o.y === CursorGridPos.y) {
            if (Keys.justClicked_) {
                if (CursorGridPos.leftHalf) {
                    o.dir = nextDir(o.dir);
                } else {
                    oprs.splice(i, 1);
                }
            }
            State.showHoverOpShadow = false;
            return State.showCellEditBtns = true;
        }
    });
};
const checkHoverWithoutBtns = (oprs: Operator[]) => {
    return oprs.some(o => {
        if (o.x === CursorGridPos.x && o.y === CursorGridPos.y) {
            State.showHoverOpShadow = false;
            State.showCellEditBtns = false;
            return true;
        }
    })
};

export const checkGridUpdates = () => {
    if (CursorGridPos.isInRange) {
        State.showHoverOpShadow = true;
        State.showCellEditBtns = true;
        checkHoverWithoutBtns(SpawnerOperators) ||
            checkHoverWithoutBtns(EndOperators) ||
            checkHoverWithBtns(BeltOperators) ||
            checkHoverWithBtns(PistonOperators) ||
            checkHoverWithBtns(FreezerOperators) ||
            checkHoverWithBtns(ThawOperators) ||
            (State.showCellEditBtns = false);
        if (Keys.justClicked_ && State.showHoverOpShadow) {
            spawnOperator(
                CursorGridPos.x,
                CursorGridPos.y,
                State.selectedOperator,
                Direction.Top
            );
        }
    } else {
        State.showHoverOpShadow = false;
        State.showCellEditBtns = false;
    }
};

export const trySpawn = (count: number): number => {
    let spawnCount = 0;
    for (let i = 0; i < Math.min(count, SpawnerOperators.length); i++) {
        const o = SpawnerOperators[i];
        if (isCellEmpty(o.x, o.y)) {
            spawnThawedObject(o.x, o.y, o.dir);
            spawnCount++;
        }
    }
    return spawnCount;
};

export const resetOperatorStates = () => {
    PistonOperators.map(p => p.data = false);
};

// }}}

// Render {{{

let beltCtx = null;
let blockCtx = null;
let spawnerCtx = null;
let freezerCtx = null;
let thawCtx = null;
let endCtx = null;
let rotateCtx = null;
let crossCtx = null;
let pistonBaseCtx = null;
let pistonArmCtx = null;
export let operatorTypeCtx: { [key: number ]: any } = {};
export let panelOperatorTypeCtx: { [key: number ]: any } = {};
setTimeout(() => {
    beltCtx = createRectTex(makeTextTex('⏫', 100));
    blockCtx = createRectTex(makeTextTex('⬛', 100));
    spawnerCtx = createRectTex(makeTextTex('🔳', 100));
    freezerCtx = createRectTex(makeTextTex('🆒', 100));
    thawCtx = createRectTex(makeTextTex('📛', 100));
    endCtx = createRectTex(makeTextTex('🔲', 100));

    rotateCtx = createRectTex(makeTextTex('↻', 170));
    crossCtx = createRectTex(makeTextTex('×', 170));

    pistonBaseCtx = createRectTex(makeTextTex('🔝', 100));
    pistonArmCtx = createRectTex(makeTextTex('T', 100));

    operatorTypeCtx = {
        [OperatorType.Belt]: beltCtx,
        [OperatorType.Piston]: pistonBaseCtx,
        [OperatorType.Block]: blockCtx,
        [OperatorType.Spawner]: spawnerCtx,
        [OperatorType.Freezer]: freezerCtx,
        [OperatorType.Thawer]: thawCtx,
        [OperatorType.End]: endCtx,
    }

    panelOperatorTypeCtx = {
        [OperatorType.Belt]: beltCtx,
        [OperatorType.Piston]: pistonBaseCtx,
        [OperatorType.Freezer]: freezerCtx,
        [OperatorType.Thawer]: thawCtx,
    }
}, 100);

const drawSpawner = (o: Operator) => {
    spawnerCtx.draw_(o.x, o.y, -0.02, 1, 1, o.dir);
};

const checkEditBtnPos = (x: number, y: number) => {
    if (x === CursorGridPos.x && y === CursorGridPos.y) {
        State.lastEditPos.x = x;
        State.lastEditPos.y = y;
    }
}

const drawFreezer = (o: Operator) => {
    freezerCtx.draw_(o.x, o.y, -0.04, 1, 1, o.dir);
    checkEditBtnPos(o.x, o.y);
};

const drawThawer = (o: Operator) => {
    thawCtx.draw_(o.x, o.y, -0.04, 1, 1, o.dir);
    checkEditBtnPos(o.x, o.y);
};

const drawEnd = (o: Operator) => {
    endCtx.draw_(o.x, o.y, -0.04, 1, 1);
    checkEditBtnPos(o.x, o.y);
};

const drawBeltOperator = (o: Operator) => {
    beltCtx.draw_(o.x, o.y, -0.04, 1, 1, o.dir);
    checkEditBtnPos(o.x, o.y);
};

const drawPistonBase = (o: Operator) => {
    pistonBaseCtx.draw_(o.x, o.y, -0.02, 1, 1, o.dir);
    checkEditBtnPos(o.x, o.y);
};

const drawPistonArm = (p: Operator, tweenVal: number) => {
    if (p.data) {
        const arm = pistonArmPos(p, tweenVal);
        pistonArmCtx.use_().draw_(arm.x, arm.y, -0.03, 1, 1, p.dir);
    }
};

// }}}

export const render = (state: SceneState, tweenDur: number) => {
    beltCtx.use_();
    BeltOperators.map(drawBeltOperator);
    spawnerCtx.use_();
    SpawnerOperators.map(drawSpawner);
    freezerCtx.use_();
    FreezerOperators.map(drawFreezer);
    thawCtx.use_();
    ThawOperators.map(drawThawer);
    endCtx.use_();
    EndOperators.map(drawEnd);
    pistonBaseCtx.use_();
    PistonOperators.map(drawPistonBase);
    pistonArmCtx.use_();
    PistonOperators.map(p => drawPistonArm(p, tweenDur));
    if (state === SceneState.Editing) {
        if (State.showHoverOpShadow) {
            const ctx = operatorTypeCtx[State.selectedOperator];
            ctx.use_().draw_(CursorGridPos.x, CursorGridPos.y, -0.02, 1, .7);
        }
        if (State.showCellEditBtns) {
            rotateCtx.use_().draw_(State.lastEditPos.x - 0.2, State.lastEditPos.y - 0.1, -0.01);
            crossCtx.use_().draw_(State.lastEditPos.x + 0.2, State.lastEditPos.y - 0.2, -0.01);
        }
    }
};

// vim: fdm=marker:fdl=0:
