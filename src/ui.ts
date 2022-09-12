import { getAllOperators, resetOperatorStates } from './entities/operators';
import { pauseGame, startGame } from './game';
import { E } from './globals';
import { encodeLevel, Levels } from './levels';
import { loadEditor, loadLevel } from './scene';

const root = document.getElementById('ui') as HTMLDivElement;
const transition = (func: Function) => setTimeout(func, 750);

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
        E('div', { className: 'btn', onclick: showLevelScrn, }, 'START'),
    );
    appendRoot(
        scrn
    );
    fadeInEle(scrn);
};

const showLevelCreatedScrn = () => {
    pauseGame();
    const input = E('input', { type: 'number', value: 1 });

    const scrn = E('div', { id: 'blurscrn' },
        E('div', { className: 'title' }, '😔 COUNT'),
        E('div', { className: 'btn', onclick: showLevelScrn, }, '↼'),
        input,
        E('div', {
            className: 'btn', onclick: () => {
                // @ts-ignore
                const lv = encodeLevel({ operators: getAllOperators(), spawnCount: input.value });
                const lvInput = E('input', { readOnly: true, value: lv });
                appendRoot(
                    E('div', { className: 'btn', onclick: showLevelScrn, }, '↼'),
                    E('div', { className: 'title' }, 'CREATED'),
                    lvInput,
                );

                // give it some time to attach to DOM
                setTimeout(() => {
                    lvInput.focus();
                    // @ts-ignore
                    lvInput.select();
                }, 50)
            },
        }, 'CREATE'),
    );
    appendRoot(
        scrn
    );
    fadeOutEle(scrn);
    setTimeout(() => fadeInEle(scrn), 10);
};

const showLevelInputScrn = () => {
    const input = E('input');
    const scrn = E('div', { id: 'blurscrn' },
        E('div', { className: 'title' }, 'ENTER LEVEL DATA'),
        E('div', { className: 'btn', onclick: showLevelScrn, }, '↼'),
        input,
        E('div', { className: 'btn', onclick: showLevelScrn, }, 'START'),
    );
    appendRoot(
        scrn
    );
    fadeOutEle(scrn);
    setTimeout(() => fadeInEle(scrn), 10);
};

const showLevelEditorHUD = () => {
    fadeOutEle(document.getElementById('blurscrn'));
    transition(() => {
        hideRoot();
        appendRoot(
            E('div', { className: 'btn pause', onclick: showPauseScrn }, 'II'),
            E('div', { className: 'btn pause', onclick: showLevelCreatedScrn }, '✅'),
        );
        loadEditor();
        startGame();
    });
};

const showCustomScrn = () => {
    const scrn = E('div', { id: 'blurscrn' },
        E('div', { className: 'title' }, 'CUSTOM LEVELS'),
        E('div', { className: 'btn', onclick: showLevelScrn, }, '↼'),
        E('div', { className: 'btn', onclick: showLevelEditorHUD, }, 'LEVEL EDITOR'),
        E('div', { className: 'btn', onclick: showLevelInputScrn, }, 'PLAY LEVEL'),
    );
    appendRoot(
        scrn
    );
    fadeOutEle(scrn);
    setTimeout(() => fadeInEle(scrn), 10);
};

const showLevelScrn = () => {
    const scrn = E('div', { id: 'blurscrn' },
        E('div', { className: 'title' }, 'LEVELS'),
        E('div', { className: 'btn', onclick: showCustomScrn, }, 'CUSTOM LEVELS'),
        E('div', { className: 'levels', onclick: showGameHUD, },
            ...Levels.map((_, i) =>
                E('div', {
                    className: 'level btn',
                    onclick: () => {
                        resetOperatorStates();
                        loadLevel(i);
                        showGameHUD();
                    },
                },
                    i + 1 + ''))),
    );
    appendRoot(
        scrn
    );
    fadeOutEle(scrn);
    setTimeout(() => fadeInEle(scrn), 10);
};

export const showLevelEndScrn = () => {
    pauseGame();
    const scrn = E('div', { id: 'blurscrn' },
        E('div', { className: 'title' }, 'LEVEL COMPLETE!'),
        E('div', { className: 'btn', onclick: showLevelScrn, }, 'LEVELS'),
    );
    appendRoot(
        scrn
    );
    fadeOutEle(scrn);
    setTimeout(() => fadeInEle(scrn), 10);
};

export const showPauseScrn = () => {
    pauseGame();
    const scrn = E('div', { id: 'blurscrn' },
        E('div', { className: 'title' }, 'PAUSED'),
        E('div', { className: 'btn', onclick: showGameHUD, }, 'RESUME'),
        E('div', { className: 'btn', onclick: showLevelScrn, }, 'LEVELS'),
    );
    appendRoot(
        scrn
    );
    fadeOutEle(scrn);
    setTimeout(() => fadeInEle(scrn), 10);
};
