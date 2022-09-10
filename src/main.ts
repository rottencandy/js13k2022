import { startLoop } from './engine/loop';
import { showTitle } from './ui';
import { update, render } from './game';

setTimeout(() => startLoop(
    update,
    render,
), 150);

showTitle();
