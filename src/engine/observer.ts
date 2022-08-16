type Callback = (arg: any) => void;

const CALLBACKS: { [event: string]: Callback[] } = {};

export const enable = (event: string, callback: Callback) => {
    CALLBACKS[event] = CALLBACKS[event] || [];
    CALLBACKS[event].push(callback);
}

export const disable = (event: string, callback: Callback) => {
    const fns = CALLBACKS[event];
    fns && fns.filter(fn => fn != callback);
}

export const emit = (event: string, arg: any) => {
    const fns = CALLBACKS[event];
    fns && fns.map(fn => fn(arg));
}
