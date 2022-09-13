import { getAllOperators, resetOperatorStates } from './entities/operators';
import { pauseGame, startGame } from './game';
import { E } from './globals';
import { encodeLevel, Levels } from './levels';
import { loadCustomLevel, loadEditor, loadLevel } from './scene';
import { getLevelStats, isFirstVisit } from './localstorage';

const root = document.getElementById('ui') as HTMLDivElement;

const appendRoot = (...stuff: (string | Node)[]) => {
    root.innerHTML = '';
    root.append(...stuff);
    root.style.display = 'block';
};
const hideRoot = () => root.style.display = 'none';

const fadeOutEle = (blurEle: HTMLElement) => blurEle.style.opacity = '0';
const fadeInEle = (blurEle: HTMLElement) => blurEle.style.opacity = '1';


const showGameHUD = () => {
    //fadeOutEle(document.getElementById('blurscrn'));
    hideRoot();
    const pauseBtn = E('div', { className: 'btn pause', onclick: showPauseScrn }, 'II');
    appendRoot(
        pauseBtn,
        E('div', { id: 'status', onclick: showLevelScrn, },
            E('span', { id: 'timestat', className: 'stats' }, '🕐 -'),
            E('br'),
            E('span', { id: 'nrgstat', className: 'stats' }, '⚡ -'),
            E('br'),
            E('span', { id: 'facestat', className: 'stats' }, '😴 -'),
        ),
    );
    fadeInEle(pauseBtn);
    startGame();
};

export const updateHUDTime = (time: number) => {
    setTimeout(() => {
        const container = document.getElementById('timestat');
        if (container) {
            container.innerHTML = `🕐 ${time ?? '-'}`;
        }
    }, 50);
};

export const updateHUDEnergy = (nrg: number) => {
    setTimeout(() => {
        const container = document.getElementById('nrgstat');
        if (container) {
            container.innerHTML = `⚡ ${nrg ?? '-'}`;
        }
    }, 50);
};

export const updateHUDFace = (face: number) => {
    setTimeout(() => {
        const container = document.getElementById('facestat');
        if (container) {
            container.innerHTML = `😴 ${face ?? '-'}`;
        }
    }, 50);
};

export const showTitleScrn = () => {
    const scrn = E('div', { id: 'bgscrn' },
        E('div', { className: 'title' }, 'CRYONICS INC'),
        E('div', { className: 'btn start', onclick: showLevelScrn, }, 'START'),
    );
    appendRoot(
        scrn
    );
    //fadeInEle(scrn);
};

const showLevelCreatedScrn = () => {
    pauseGame();
    const input = E('input', { type: 'number', value: 1, className: 'num' });

    const scrn = E('div', { id: 'bgscrn' },
        E('div', { className: 'btn back', onclick: showLevelScrn, }, '↼'),
        E('div', {}, 'ENTER UNIT COUNT'),
        input,
        E('div', {
            className: 'btn', onclick: () => {
                // @ts-ignore
                const lv = encodeLevel({ operators: getAllOperators(), spawnCount: input.value });
                const lvInput = E('input', { readOnly: true, value: lv });
                appendRoot(
                    E('div', { id: 'bgscrn' },
                        E('div', { className: 'btn back', onclick: showLevelScrn, }, '↼'),
                        E('div', { className: 'subtitle' }, 'LEVEL CREATED'),
                        lvInput,
                        E('a', {
                            className: 'btn',
                            target: '_blank',
                            // @ts-ignore
                            href: `https://twitter.com/intent/tweet?url=https://js13kgames.com/entries/cryonics-inc&text=Checkout this custom Cryonics Inc level: ${lvInput.value}`
                        }, 'SHARE 🐦'),
                    ));

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
    // give it some time to attach to DOM
    setTimeout(() => input.focus(), 50);
    setTimeout(() => fadeInEle(scrn), 10);
};

const showLevelInputScrn = () => {
    const input = E('input');
    const scrn = E('div', { id: 'bgscrn' },
        E('div', { className: 'btn back', onclick: showLevelScrn, }, '↼'),
        E('div', { className: 'subtitle' }, 'ENTER LEVEL DATA'),
        input,
        E('div', {
            className: 'btn', onclick: () => {
                // @ts-ignore
                loadCustomLevel(input.value);
                startGame();
            },
        }, 'START'),
    );
    appendRoot(
        scrn
    );
    //fadeOutEle(scrn);
    //setTimeout(() => fadeInEle(scrn), 10);
};

const showLevelEditorHUD = () => {
    fadeOutEle(document.getElementById('bgscrn'));
    hideRoot();
    appendRoot(
        E('div', { className: 'btn pause', onclick: showPauseScrn }, 'II'),
        E('div', { className: 'btn pause', onclick: showLevelCreatedScrn }, '✅'),
    );
    loadEditor();
    startGame();
};

const showCustomScrn = () => {
    const scrn = E('div', { id: 'bgscrn' },
        E('div', { className: 'btn back', onclick: showLevelScrn, }, '↼'),
        E('div', { className: 'subtitle' }, 'CUSTOM LEVELS'),
        E('div', { className: 'btn', onclick: showLevelEditorHUD, }, 'LEVEL EDITOR'),
        E('div', { className: 'btn', onclick: showLevelInputScrn, }, 'PLAY LEVEL'),
    );
    appendRoot(
        scrn
    );
    //fadeOutEle(scrn);
    //setTimeout(() => fadeInEle(scrn), 10);
};

const showInstructions = () => {
    appendRoot(
        E('div', { id: 'blurscrn', className: 'instr', onclick: showGameHUD },
            E('div', { className: 'instrbox box1', }, '❷ start/stop machines'),
            E('div', { className: 'instrbox box2', }, '❶ select machines'),
            E('div', { className: 'instrbox box3', }, '❸ place machines & move frozen bodies to cryochambers'),
        ),
    );
};

const showStartLetter = () => {
    appendRoot(
        E('div', { id: 'blurscrn', onclick: showInstructions },
            E('div', { className: 'letter', },
                'From: Management',
                E('br'),
                E('br'),
                'To: EMPLOYEE_130847',
                E('br'),
                E('br'),
                'Welcome to your first day at Cryonics Inc.™',
                E('br'),
                E('br'),
                `Your job is to ensure that all bodies are frozen & stored in cryochambers,
                so that they could one day be resurrected and be immortal.
                But don\'t worry too much about it, they\'re already ', `, E('s', {}, 'dead'), ' vitrified.',
                E('br'),
                E('br'),
                'Have fun in your new role!',
                E('br'),
                E('br'),
                ' (CLICK TO CONTINUE) ',
            ),
        ),
    );
};

const handleGameStart = () => {
    if (isFirstVisit()) {
        showStartLetter();
    } else {
        showGameHUD();
    }
};

const showLevelScrn = () => {
    const scrn = E('div', { id: 'bgscrn' },
        E('div', { className: 'btn cstm', onclick: showCustomScrn, }, 'CUSTOM LEVELS'),
        E('div', { className: 'subtitle' }, 'LEVELS'),
        E('div', { className: 'levels', },
            ...Levels.map((_, i) => {
                const [energy, time] = getLevelStats(i);
                return E('div', {
                    className: 'level btn ' + (energy && time ? 'visited' : ''),
                    onclick: () => {
                        resetOperatorStates();
                        loadLevel(i);
                        handleGameStart();
                    },
                },
                    i + 1 + '',
                    E('br'),
                    E('span', { className: 'stats' }, `🕐 ${time ?? '-'}`),
                    E('br'),
                    E('span', { className: 'stats' }, `⚡ ${energy ?? '-'}`),
                )
            })),
    );
    appendRoot(
        scrn
    );
    //fadeOutEle(scrn);
    //setTimeout(() => fadeInEle(scrn), 10);
};

export const showLevelEndScrn = () => {
    pauseGame();
    const scrn = E('div', { id: 'bgscrn' },
        E('div', { className: 'subtitle' }, 'LEVEL COMPLETE!'),
        E('div', { className: 'btn', onclick: showLevelScrn, }, 'NEXT'),
    );
    appendRoot(
        scrn
    );
    //fadeOutEle(scrn);
    //setTimeout(() => fadeInEle(scrn), 10);
};

const showPauseScrn = () => {
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
