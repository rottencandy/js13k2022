import { update as panelUpdate, render as panelRender } from './entities/panel';
import { render as bgRender } from './entities/backdrop';
import { update as objectsUpdate, render as objectsRender } from './entities/objects';
import { update as operatorsUpdate, render as operatorsRender } from './entities/operators';

export const update = (dt: number) => {
    panelUpdate(dt);
    objectsUpdate(dt);
    operatorsUpdate(dt);
};

export const render = () => {
    bgRender();
    panelRender();
    operatorsRender();
    objectsRender();
};
