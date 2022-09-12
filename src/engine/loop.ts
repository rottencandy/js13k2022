type StepFn = (delta: number) => void;

/**
 * Start the game loop
 * Inspired by:
 * https://codeincomplete.com/articles/javascript-game-foundations-the-game-loop
 *
 */
export const startLoop = (update: StepFn, render: StepFn) => {
    let last = 0, dt = 0, step = 1 / 60, t = 0;
    (function loop(now: number) {
        // Sanity check - absorb random lag spike / frame jumps
        // (expected delta for 60FPS is 1000/60 = ~16.67ms)
        dt += now - last;
        if (dt > 1e3) dt = 0;
        last = now;


        while (dt > step) {
            dt -= step;
            update(step);
        };

        render(t++);

        requestAnimationFrame(loop);
    })(0);
};
