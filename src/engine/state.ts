type StateFn = (...args: any[]) => string | number | StateFn | undefined;

type StateObject = {
    [key: string | number]: StateFn
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
 * @returns `run`: Step function, returns last run state.
 * Any args will be passed on to state function.
 * `reset`: reset state to given key.
 */
export const createStateMachine = (states: StateObject, initial: string | number) => {
    let current = states[initial];
    const thisObj = {
        state: initial,
        run: (...data: any[]) => {
            const next = current(...data);
            if (typeof next === 'function') {
                current = next;
            } else if (next !== undefined) {
                current = states[next];
                thisObj.state = next;
            }
        },
        reset: (state: string | number) => {
            current = states[state];
            thisObj.state = state;
        },
    };

    return thisObj;
}
