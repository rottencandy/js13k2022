import { startGame } from './game';
import { after, createEle, getById } from './globals';

const root: HTMLDivElement = getById('ui');

const clearRoot = () => root.innerHTML = '';

export const showUI = () => {
    root.className = 'fadei';
    after(1000, () => root.style.display = 'block');
}

export const hideUI = () => {
    root.className = 'fadeo';
    after(1000, () => root.style.display = 'none');
}

export const showTitle = () => {
    clearRoot();
    const startBtn = createEle('div', { id: 'start', onclick: () => { startGame(); hideUI(); }, }, 'start');

    root.append(
        createEle('div', { id: 'title' }, 'Untitled Game'),
        startBtn,
    );
    showUI();
};
