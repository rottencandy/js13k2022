import { SIN } from '../globals';

type TweenFn = (t: number) => number;

export const LINEAR: TweenFn = t => t;
export const EASEOUTQUAD: TweenFn = t => t * (2 - t);
export const EASEOUTQUINT: TweenFn = t => 1 + (--t) * t * t * t * t;
export const EASEINQUINT: TweenFn = t => t * t * t * t * t;
export const EASEINOUTCUBIC: TweenFn = t => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
export const THERENBACK: TweenFn = t => t < .5 ? 2 * t : 2 * (1 - t)
// elastic bounce effect at the beginning
export const EASEINELASTIC: TweenFn = (t) => (.04 - .04 / t) * SIN(25 * t) + 1;
// elastic bounce effect at the end
export const EASEOUTELASTIC: TweenFn = (t) => .04 * t / (--t) * SIN(25 * t);
// elastic bounce effect at the beginning and end
export const EASEINOUTELASTIC: TweenFn = (t) => (t -= .5) < 0 ? (.02 + .01 / t) * SIN(50 * t) : (.02 - .01 / t) * SIN(50 * t) + 1;

/**
* Linearly interpolate between two values.
* `weight` should be between 0 & 1, but may be larger for extrapolation
*/
export const lerp = (from: number, to: number, weight: number) => {
    return from + (to - from) * weight;
};

export const clamp = (value: number, min: number, max: number) => {
    value < min ? min : value > max ? max : value;
};

/**
* Returns true every time `interval` ticks have passed.
*/
export const ticker = (interval: number) => {
    let ticks = 0;
    return () => {
        if (++ticks > interval) {
            ticks = 0;
            return true;
        } else {
            return false;
        }
    };
};

type Tween = {
    interpolate_: (delta: number) => boolean;
    value_: number;
    reset_: () => void;
};

// TODO: Make all tweens update singularly through mainloop?
export const createTween = (from: number, to: number, func = LINEAR, duration = 1): Tween => {
  // t goes from 0 -> duration
  let t = 0, value_ = from;

  const interpolate_ = (delta: number) => {
    // check if interpolation is done
    if (t >= duration) {
      value_ = to;
      return !1;

    } else {
      t += delta;
      // convert t into range 0 -> 1 and get interpolated value
      value_ = lerp(from, to, func(t / duration))
      return !0;
    }
  };

  const reset_ = () => (t = 0, value_ = from);

  return {
    interpolate_,
    value_,
    reset_,
  }
};
