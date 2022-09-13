const KEY = 'js-13k-22-cryonics-inc';

const getStorageObj = () => {
    const objStr = localStorage.getItem(KEY);
    let obj = {};
    try {
        obj = JSON.parse(objStr) || {};
    } finally {
        return obj;
    }
};

const setStorageObj = (obj: {}) => {
    localStorage.setItem(KEY, JSON.stringify(obj));
};

export const setLevelStats = (id: number, energy: number, time: number) => {
    const obj = getStorageObj();
    obj[id] = [energy, time];
    setStorageObj(obj);
};

export const getLevelStats = (id: number) => {
    const obj = getStorageObj();
    const lvdata = obj[id];
    try {
        const [energy, time] = lvdata;
        return [energy, time]
    } catch {
        return [];
    }
};

export const isFirstVisit = () => {
    return !localStorage.getItem(KEY);
}
