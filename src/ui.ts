import { pauseGame, startGame } from './game';
import { E } from './globals';

const root = document.getElementById('ui') as HTMLDivElement;
const transition = (func: Function) => {
    setTimeout(func, 750);
};

const appendRoot = (...stuff: (string | Node)[]) => {
    root.innerHTML = '';
    root.append(...stuff);
    root.style.display = 'block';
};
const hideRoot = () => root.style.display = 'none';

export const fadeOutEle = (blurEle: HTMLElement) => blurEle.style.opacity = '0';
export const fadeInEle = (blurEle: HTMLElement) => blurEle.style.opacity = '1';


const showGameHUD = () => {
    fadeOutEle(document.getElementById('blurscrn'));
    transition(() => {
        hideRoot();
        const pauseBtn = E('div', { className: 'btn pause', onclick: showPauseScrn }, 'II');
        appendRoot(
            pauseBtn
        );
        fadeInEle(pauseBtn);
        startGame();
    });
};

export const showTitleScrn = () => {
    const scrn = E('div', { id: 'blurscrn' },
        E('div', { className: 'title' }, 'UNTITLED'),
        E('div', { className: 'btn', onclick: showGameHUD, }, 'START'),
    );
    appendRoot(
        scrn
    );
    fadeInEle(scrn);
};

export const showPauseScrn = () => {
    pauseGame();
    const scrn = E('div', { id: 'blurscrn' },
        E('div', { className: 'title' }, 'PAUSED'),
        E('div', { className: 'btn', onclick: showGameHUD, }, 'RESUME'),
        E('div', { className: 'btn', onclick: showGameHUD, }, 'LEVELS'),
    );
    appendRoot(
        scrn
    );
    fadeOutEle(scrn);
    setTimeout(() => fadeInEle(scrn), 10);
};
