import { startLoop } from './engine/loop';
import { showTitleScrn } from './ui';
import { update, render } from './game';

setTimeout(() => startLoop(
    update,
    render,
), 150);

showTitleScrn();
