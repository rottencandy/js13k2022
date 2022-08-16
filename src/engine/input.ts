import { deviceScaleRatio, DOC } from '../globals';

type WatchedKeys = {
    left_: boolean,
    right_: boolean,
    up_: boolean,
    down_: boolean,
    space_: boolean,
    esc_: boolean,
    clicked_: boolean,
    pointerLocked_: boolean,
    touchX_: number,
    touchY_: number,
    ptrX_: number,
    ptrY_: number,
};

export const Keys: WatchedKeys = {
    left_: !!0,
    right_: !!0,
    up_: !!0,
    down_: !!0,

    space_: !!0,
    esc_: !!0,

    clicked_: !!0,
    touchX_: 0,
    touchY_: 0,

    pointerLocked_: !!0,
    ptrX_: 0,
    ptrY_: 0,
};

export const dirKeysPressed = (): boolean => !!(Keys.left_ || Keys.right_ || Keys.up_ || Keys.down_);

const ARROW = 'Arrow';

/**
 * Initialize onkey listeners
*/
export const setupKeyListener = (canvas: HTMLCanvasElement, width: number, height: number, lockPointer?: boolean) => {
    // TODO: use keycode here?
    const setKeyState = (value: boolean) => ({ key: code }) => {
        switch (code) {
            case ARROW + 'Up':
            case 'w':
            case 'z':
                Keys.up_ = value;
                break;
            case ARROW + 'Down':
            case 's':
                Keys.down_ = value;
                break;
            case ARROW + 'Left':
            case 'a':
            case 'q':
                Keys.left_ = value;
                break;
            case ARROW + 'Right':
            case 'd':
                Keys.right_ = value;
                break;
            case 'Escape':
                Keys.esc_ = value;
                break;
            case ' ':
                Keys.space_ = value;
        }
    }

    onkeydown = setKeyState(!!1);
    onkeyup = setKeyState(!!0);

    canvas.onpointerdown = () => Keys.clicked_ = !!1;
    canvas.onpointerup = () => Keys.clicked_ = !!0;
    canvas.onpointermove = e => {
        const ratio = deviceScaleRatio(width, height);
        Keys.touchX_ = e.offsetX / ratio;
        Keys.touchY_ = e.offsetY / ratio;
    };

    canvas.ontouchstart = canvas.ontouchmove = canvas.ontouchend = canvas.ontouchcancel = e => {
        e.preventDefault();
        Keys.clicked_ = e.touches.length > 0;
        if (Keys.clicked_) {
            const offset = canvas.getBoundingClientRect();
            const ratio = deviceScaleRatio(width, height);
            Keys.touchX_ = (e.touches[0].clientX - offset.left) / ratio;
            // offset.top is not needed since canvas is always stuck to top
            Keys.touchY_ = e.touches[0].clientY / ratio;
        }
    };

    if (lockPointer) {
        canvas.onclick = () => {
            if (!Keys.pointerLocked_) {
                canvas.requestPointerLock();
            }
        };
    }
    DOC.addEventListener('pointerlockchange', () => {
        Keys.pointerLocked_ = DOC.pointerLockElement === canvas;
    });
    DOC.onmousemove = (e) => {
        Keys.ptrX_ = e.movementX;
        Keys.ptrY_ = e.movementY;
    };
};
