import { Direction } from '../rect';
import { Operator } from './operators';

export const pistonArmPos = (p: Operator, multiplier = 1) => {
    switch (p.dir) {
        case Direction.Top:
            return { x: p.x, y: p.y + multiplier };
        case Direction.Rgt:
            return { x: p.x + multiplier, y: p.y };
        case Direction.Btm:
            return { x: p.x, y: p.y - multiplier };
        case Direction.Lft:
            return { x: p.x - multiplier, y: p.y };
    }
}

export const pistonIntent = (p: Operator, x: number, y: number) => {
    if (p.data)
        return false;
    const arm = pistonArmPos(p);
    const isInArmRange = arm.x === x && arm.y === y;
    if (isInArmRange)
        p.data = true;
    return isInArmRange;
};

export const canCollidePiston = (p: Operator, x: number, y: number) => {
    const canCollide = p.x === x && p.y === y;
    if (p.data) {
        const arm = pistonArmPos(p);
        const canCollideArm = arm.x === x && arm.y === y;
        return canCollide || canCollideArm;
    }
    return canCollide;
};
