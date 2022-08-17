import { startGame } from './game';
import { createEle } from './globals';

const root = document.getElementById('ui') as HTMLDivElement;

const clearRoot = () => root.innerHTML = '';

export const showUI = () => {
    root.className = 'fadei';
    setTimeout(() => root.style.display = 'block', 1000);
}

export const hideUI = () => {
    root.className = 'fadeo';
    setTimeout(() => root.style.display = 'none', 1000);
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
