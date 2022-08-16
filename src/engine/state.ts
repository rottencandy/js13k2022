type StateObject = {
    [key: string]: (...args: any[]) => string
};

/**
 * Create linear state machine.
 * Initial state is always first function.
 * States can return a function instead of string,
 * which becomes the next state.
 *
 * @param states - Array of state functions, each optionally returning the next state.
 *
 * @example
 * const step = createSM({
 *   IDLE: () => {},
 *   MOVE: () => {}
 * });
 *
 * @returns `run_`: Step function, returns last run state.
 * Any args will be passed on to state function.
 * `reset_`: reset state to given key.
 */
export const createStateMachine = (states: StateObject, initial: string) => {
    let current = states[initial];
    return {
        run_: (...data: any[]) => {
            const next = current(...data);
            if (typeof next === 'function') {
                current = next;
            } else if (next) {
                current = states[next];
            }
            return next;
        },
        reset_: (state: string) => current = states[state],
    };
}
