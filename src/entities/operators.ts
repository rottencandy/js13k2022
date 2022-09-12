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

let BeltOps: Operator[] = [];
let PistonOps: Operator[] = [];
let SpawnerOps: Operator[] = [];
let BlockOps: Operator[] = [];
let FreezerOps: Operator[] = [];
let ThawOps: Operator[] = [];
let EndOps: Operator[] = [];
const State = {
    selectedOperator: OperatorType.Belt,
    showHoverOpShadow: false,
    showCellEditBtns: false,
    lastEditPos: { x: -5, y: -5 },
    gridCheckType: null,
};

// Utils {{{

export const isObstaclePresent = (x: number, y: number) => {
    return SpawnerOps.some(o => o.x === x && o.y === y) ||
        BlockOps.some(o => o.x === x && o.y === y) ||
        PistonOps.some(o => canCollidePiston(o, x, y));
};

export const isFreezeOprPresent = (x: number, y: number) => {
    return FreezerOps.some(o => o.x === x && o.y === y);
};

export const getThawOprs = () => {
    return ThawOps.map(o => ({ x: o.x, y: o.y }));
};

export const getEndOprs = () => {
    return EndOps.map(o => ({ x: o.x, y: o.y }));
};


export const getOperatorIntent = (x: number, y: number): Direction => {
    let op = BeltOps.find(o => o.x === x && o.y === y) ||
        SpawnerOps.find(o => o.x === x && o.y === y) ||
        BeltOps.find(o => o.x === x && o.y === y) ||
        PistonOps.find(o => pistonIntent(o, x, y));
    if (op) {
        return op.dir;
    }
    return Direction.Non;
};

export const setSelectedOperator = (o: OperatorType) => (State.selectedOperator = o);

export const loadOperators = (operators: Operator[], isEditor?: boolean) => {
    BeltOps = [];
    BlockOps = [];
    PistonOps = [];
    SpawnerOps = [];
    EndOps = [];
    FreezerOps = [];
    ThawOps = [];

    operators.map(o => {
        switch (o.type) {
            case OperatorType.Belt:
                BeltOps.push(o);
                break;
            case OperatorType.Block:
                BlockOps.push(o);
                break;
            case OperatorType.Piston:
                PistonOps.push(o);
                break;
            case OperatorType.Spawner:
                SpawnerOps.push(o);
                break;
            case OperatorType.End:
                EndOps.push(o);
                break;
            case OperatorType.Freezer:
                FreezerOps.push(o);
                break;
            case OperatorType.Thawer:
                ThawOps.push(o);
                break;
        }
    });
    if (isEditor) {
        State.selectedOperator = OperatorType.Block;
        State.gridCheckType = checkGridEdiorUpdates;
    } else {
        OperatorType.Belt;
        State.gridCheckType = checkGridLevelUpdates;
    };
};

export const getAllOperators = () => [
    ...BeltOps,
    ...BlockOps,
    ...PistonOps,
    ...SpawnerOps,
    ...EndOps,
    ...FreezerOps,
    ...ThawOps,
]

// }}}

// Update {{{

const spawnOperator = (x: number, y: number, type: OperatorType, dir: Direction) => {
    const opr = { x, y, type, dir };
    switch (type) {
        case OperatorType.Block:
            BlockOps.push(opr);
            break;
        case OperatorType.Belt:
            BeltOps.push(opr);
            break;
        case OperatorType.Piston:
            PistonOps.push(opr);
            break;
        case OperatorType.Spawner:
            SpawnerOps.push(opr);
            break;
        case OperatorType.Freezer:
            FreezerOps.push(opr);
            break;
        case OperatorType.Thawer:
            ThawOps.push(opr);
            break;
        case OperatorType.End:
            EndOps.push(opr);
            break;
    }
}

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

const checkGridLevelUpdates = () => {
    if (CursorGridPos.isInRange) {
        State.showHoverOpShadow = true;
        State.showCellEditBtns = true;
        checkHoverWithoutBtns(SpawnerOps) ||
            checkHoverWithoutBtns(EndOps) ||
            checkHoverWithoutBtns(BlockOps) ||

            checkHoverWithBtns(BeltOps) ||
            checkHoverWithBtns(PistonOps) ||
            checkHoverWithBtns(FreezerOps) ||
            checkHoverWithBtns(ThawOps) ||
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

const checkGridEdiorUpdates = () => {
    if (CursorGridPos.isInRange) {
        State.showHoverOpShadow = true;
        State.showCellEditBtns = true;
        checkHoverWithBtns(SpawnerOps) ||
            checkHoverWithBtns(EndOps) ||
            checkHoverWithBtns(BlockOps) ||
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

State.gridCheckType = checkGridLevelUpdates;

export const checkGridUpdates = () => {
    State.gridCheckType();
};

export const trySpawn = (count: number): number => {
    let spawnCount = 0;
    for (let i = 0; i < Math.min(count, SpawnerOps.length); i++) {
        const o = SpawnerOps[i];
        if (isCellEmpty(o.x, o.y)) {
            spawnThawedObject(o.x, o.y, o.dir);
            spawnCount++;
        }
    }
    return spawnCount;
};

export const resetOperatorStates = () => {
    PistonOps.map(p => p.data = false);
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
export const operatorTypeCtx: { [key: number]: any } = {};
export const playPanelOprCtx: { [key: number]: any } = {};
export const editPanelOprCtx: { [key: number]: any } = {};
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

    operatorTypeCtx[OperatorType.Belt] = beltCtx;
    operatorTypeCtx[OperatorType.Piston] = pistonBaseCtx;
    operatorTypeCtx[OperatorType.Block] = blockCtx;
    operatorTypeCtx[OperatorType.Spawner] = spawnerCtx;
    operatorTypeCtx[OperatorType.Freezer] = freezerCtx;
    operatorTypeCtx[OperatorType.Thawer] = thawCtx;
    operatorTypeCtx[OperatorType.End] = endCtx;

    editPanelOprCtx[OperatorType.Block] = blockCtx;
    editPanelOprCtx[OperatorType.Spawner] = spawnerCtx;
    editPanelOprCtx[OperatorType.End] = endCtx;

    playPanelOprCtx[OperatorType.Belt] = beltCtx;
    playPanelOprCtx[OperatorType.Piston] = pistonBaseCtx;
    playPanelOprCtx[OperatorType.Freezer] = freezerCtx;
    playPanelOprCtx[OperatorType.Thawer] = thawCtx;
}, 100);

const checkEditBtnPos = (x: number, y: number) => {
    if (x === CursorGridPos.x && y === CursorGridPos.y) {
        State.lastEditPos.x = x;
        State.lastEditPos.y = y;
    }
}

const drawBlock = (o: Operator) => {
    checkEditBtnPos(o.x, o.y);
    blockCtx.draw_(o.x, o.y, -0.02, 1, 1, o.dir);
};

const drawSpawner = (o: Operator) => {
    checkEditBtnPos(o.x, o.y);
    spawnerCtx.draw_(o.x, o.y, -0.02, 1, 1, o.dir);
};

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

const drawBelt = (o: Operator) => {
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
    BeltOps.map(drawBelt);
    spawnerCtx.use_();
    SpawnerOps.map(drawSpawner);
    freezerCtx.use_();
    FreezerOps.map(drawFreezer);
    thawCtx.use_();
    ThawOps.map(drawThawer);
    endCtx.use_();
    EndOps.map(drawEnd);
    pistonBaseCtx.use_();
    PistonOps.map(drawPistonBase);
    pistonArmCtx.use_();
    PistonOps.map(p => drawPistonArm(p, tweenDur));
    blockCtx.use_();
    BlockOps.map(drawBlock);
    if (state === SceneState.Editing) {
        if (State.showHoverOpShadow) {
            operatorTypeCtx[State.selectedOperator]
                .use_()
                .draw_(CursorGridPos.x, CursorGridPos.y, -0.02, 1, .7);
        }
        if (State.showCellEditBtns) {
            rotateCtx.use_().draw_(State.lastEditPos.x - 0.2, State.lastEditPos.y - 0.1, -0.01);
            crossCtx.use_().draw_(State.lastEditPos.x + 0.2, State.lastEditPos.y - 0.2, -0.01);
        }
    }
};

// vim: fdm=marker:fdl=0:
