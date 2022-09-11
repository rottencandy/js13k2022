import { Keys } from '../engine/input';
import { CursorGridPos } from '../globals';
import { createRectTex, Direction, nextDir } from '../rect';
import { SceneState } from '../scene';
import { makeTextTex } from '../text';
import { isCellEmpty, spawnThawedObject } from './objects';

// Types {{{

export const enum OperatorType {
    Belt,
    Block,
    Piston,
    Spawner,
    Freezer,
}

type Operator = {
    x: number;
    y: number;
    type: OperatorType;
    dir: Direction;
}

// }}}

const BeltOperators: Operator[] = [];
const SpawnerOperators: Operator[] = [];
const BlockOperators: Operator[] = [];
const FreezerOperators: Operator[] = [];
const State = {
    selectedOperator: OperatorType.Belt,
    showHoverOpShadow: false,
    showCellEditBtns: false,
    lastEditPos: { x: -5, y: -5 },
};

// Utils {{{

export const isObstaclePresent = (x: number, y: number) => {
    return SpawnerOperators.some(o => o.x === x && o.y === y) ||
        BlockOperators.some(o => o.x === x && o.y === y);
};

export const isTransformerPresent = (x: number, y: number) => {
    return FreezerOperators.some(o => o.x === x && o.y === y);
};

export const getOperatorIntent = (x: number, y: number): Direction => {
    let op = BeltOperators.find(o => o.x === x && o.y === y);
    if (!op) {
        op = SpawnerOperators.find(o => o.x === x && o.y === y);
    }
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
        case OperatorType.Spawner:
            SpawnerOperators.push(opr);
            break;
        case OperatorType.Freezer:
            FreezerOperators.push(opr);
            break;
    }
}
spawnOperator(2, 2, OperatorType.Spawner, Direction.Rgt);

const checkHoverForOperatorType = (oprs: Operator[]) => {
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

export const checkGridUpdates = () => {
    if (CursorGridPos.isInRange) {
        State.showHoverOpShadow = true;
        State.showCellEditBtns = true;
        SpawnerOperators.some(o => {
            if (o.x === CursorGridPos.x && o.y === CursorGridPos.y) {
                State.showHoverOpShadow = false;
                State.showCellEditBtns = false;
                return true;
            }
        }) ||
            checkHoverForOperatorType(BeltOperators) ||
            checkHoverForOperatorType(FreezerOperators) ||
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

// }}}

// Render {{{

let beltCtx = null;
let blockCtx = null;
let spawnerCtx = null;
let freezerCtx = null;
let rotateCtx = null;
let crossCtx = null;
setTimeout(() => {
    beltCtx = createRectTex(makeTextTex('⏫', 100));
    blockCtx = createRectTex(makeTextTex('⬛', 100));
    spawnerCtx = createRectTex(makeTextTex('🔳', 100));
    freezerCtx = createRectTex(makeTextTex('🆒', 100));
    rotateCtx = createRectTex(makeTextTex('↻', 170));
    crossCtx = createRectTex(makeTextTex('×', 170));
}, 100);

export const operatorTypeCtx = (t: OperatorType) => {
    switch (t) {
        case OperatorType.Belt:
            return beltCtx;
        case OperatorType.Block:
            return blockCtx;
        case OperatorType.Spawner:
            return spawnerCtx;
        case OperatorType.Freezer:
            return freezerCtx;
    }
};

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
    freezerCtx.draw_(o.x, o.y, -0.02, 1, 1, o.dir);
    checkEditBtnPos(o.x, o.y);
};

const drawBeltOperator = (o: Operator) => {
    beltCtx.draw_(o.x, o.y, -0.02, 1, 1, o.dir);
    checkEditBtnPos(o.x, o.y);
};

// }}}

export const render = (state: SceneState) => {
    beltCtx.use_();
    BeltOperators.map(drawBeltOperator);
    spawnerCtx.use_();
    SpawnerOperators.map(drawSpawner);
    freezerCtx.use_();
    FreezerOperators.map(drawFreezer);
    if (state === SceneState.Editing) {
        if (State.showHoverOpShadow) {
            const ctx = operatorTypeCtx(State.selectedOperator);
            ctx.use_().draw_(CursorGridPos.x, CursorGridPos.y, -0.02, 1, .7);
        }
        if (State.showCellEditBtns) {
            rotateCtx.use_().draw_(State.lastEditPos.x - 0.2, State.lastEditPos.y - 0.1, -0.01);
            crossCtx.use_().draw_(State.lastEditPos.x + 0.2, State.lastEditPos.y - 0.2, -0.01);
        }
    }
};

// vim: fdm=marker:fdl=0:
