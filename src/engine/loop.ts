import { MIN } from '../globals';

type StepFn = (delta: number) => void;

/**
 * Start the game loop
 * Inspired by:
 * https://codeincomplete.com/articles/javascript-game-foundations-the-game-loop
 *
 */
export const startLoop = (update: StepFn, render: StepFn) => {
    let last = 0, dt = 0, step = 1 / 60;
    (function loop(now: number) {
        // Sanity check - absorb random lag spike / frame jumps
        // (expected delta for 60FPS is 1000/60 = ~16.67ms)
        dt += MIN(now - last, 1e3);
        last = now;

        // don't update with a very large dt
        // (happens if tab lost focus and regained later)
        // if (dt > 1e3)
        //     dt = 0;

        // while (dt > step) {
        //     dt -= step;
        //     update(step);
        // };
        for(;dt>step;dt-=step,update(step));

        render(dt);

        requestAnimationFrame(loop);
    })(0);
};
