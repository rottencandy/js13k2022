import { createStateMachine } from '../engine/state';
import { createTween, ticker } from '../engine/interpolation';
import { createRectTex } from '../rect';
import { makeTextTex } from '../text';

type Obj = {
    x: number;
    y: number;
    next: Direction;
};

const enum Direction {
    Top,
    Rgt,
    Btm,
    Lft,
};

//const WIDTH = 8;
//const HEIGHT = 8;

const OBJECTS: Obj[] = [];

export const spawnObject = (x: number, y: number) => {
    OBJECTS.push({ x, y, next: Direction.Top });
};

let objCtx = createRectTex(makeTextTex('🥳', 120));

const draw = (o: Obj) => {
    objCtx.draw_(o.x, o.y, 0);
};

const updatePos = (o: Obj) => {
    switch (o.next) {
        case Direction.Top:
            o.y ++;
            break;
        case Direction.Rgt:
            o.x ++;
            break;
        case Direction.Btm:
            o.y --;
            break;
        case Direction.Lft:
            o.x --;
    }
};

const drawLerped = (o: Obj) => {
    let x = o.x, y = o.y;
    // origin is bottom left
    switch (o.next) {
        case Direction.Top:
            y += moveTween.val;
            break;
        case Direction.Rgt:
            x += moveTween.val;
            break;
        case Direction.Btm:
            y -= moveTween.val;
            break;
        case Direction.Lft:
            x -= moveTween.val;
    }
    objCtx.draw_(x, y, 0);
};

const enum State {
    Idle,
    Moving,
};

const waitTicker = ticker(900);
const moveTween = createTween(0, 1, 900);

const sm = createStateMachine({
    [State.Idle]: (dt) => {
        if (waitTicker(dt)) {
            return State.Moving
        };
    },
    [State.Moving]: (dt) => {
        moveTween.step(dt);
        if (moveTween.done) {
            moveTween.reset();
            OBJECTS.map(updatePos);
            return State.Idle;
        };
    },
}, State.Idle);

spawnObject(0, 0);

export const update = (dt: number) => {
    sm.run(dt);
};

export const render = () => {
    objCtx.use_()
    OBJECTS.map(moveTween.done ? draw : drawLerped);
};
