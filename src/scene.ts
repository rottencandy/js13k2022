import { update as panelUpdate, render as panelRender } from './entities/panel';
import { render as bgRender } from './entities/backdrop';
import { update as objectsUpdate, render as objectsRender } from './entities/objects';

export const update = (dt: number) => {
    panelUpdate(dt);
    objectsUpdate(dt);
};

export const render = () => {
    bgRender();
    panelRender();
    objectsRender();
};
