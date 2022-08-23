type TweenFn = (t: number) => number;

export const LINEAR: TweenFn = t => t;
export const EASEOUTQUAD: TweenFn = t => t * (2 - t);
export const EASEOUTQUINT: TweenFn = t => 1 + (--t) * t * t * t * t;
export const EASEINQUINT: TweenFn = t => t * t * t * t * t;
export const EASEINOUTCUBIC: TweenFn = t => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
export const THERENBACK: TweenFn = t => t < .5 ? 2 * t : 2 * (1 - t)
// elastic bounce effect at the beginning
export const EASEINELASTIC: TweenFn = (t) => (.04 - .04 / t) * Math.sin(25 * t) + 1;
// elastic bounce effect at the end
export const EASEOUTELASTIC: TweenFn = (t) => .04 * t / (--t) * Math.sin(25 * t);
// elastic bounce effect at the beginning and end
export const EASEINOUTELASTIC: TweenFn = (t) => (t -= .5) < 0 ? (.02 + .01 / t) * Math.sin(50 * t) : (.02 - .01 / t) * Math.sin(50 * t) + 1;

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
    return (dt: number) => {
        if ((ticks+=dt) > interval) {
            ticks = 0;
            return true;
        } else {
            return false;
        }
    };
};

export const createTween = (from: number, to: number, duration = 1, func = LINEAR) => {
  // t goes from 0 -> duration
  let t = 0;

  const obj = {
    val: from,
    done: false,
    step(delta: number) {
        // check if interpolation is done
        if (obj.done) {
            obj.val = to;
            return obj.val;

        } else {
            obj.done = t >= duration;

            t += delta;
            // convert t into range 0 -> 1 and get interpolated value
            obj.val = lerp(from, to, func(t / duration))
            return obj.val;
        }
    },
    reset: () => (t = 0, obj.val = from, obj.done = false),
  };

  return obj;
};
