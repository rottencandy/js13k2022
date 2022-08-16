import { startLoop } from './engine/loop';
import { showTitle } from './ui';
import { update, render } from './game';

startLoop(
    update,
    render,
);

showTitle();
