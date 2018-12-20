# Morpher

A small dependency-free javascript tool for animating simple SVG paths.

![Animation example](animation.gif)

## Installation

Download the latest release of this repository and include it in your project.

## Usage

First, you'll need to properly prepare your SVG files. Each animation step should be defined separately and contain **exactly the same amount of points**:

```html
<path id="step1" d="M2173.94,2504.94c0-351.61,229.03-425.81,458.06-425.81s254.84-283.87,25.81-283.87s-316.13-148.39-274.19-290.32c41.94-141.94,496.25-64.52,433.61-493.55s-417.48-338.71-533.61-254.84c-116.13,83.87-416.13,29.03-348.39-274.19S1790.06,66.23,1644.9,95.26s-383.87,174.19-203.23,641.94c180.65,467.74-212.9,422.58-329.03,332.26c-116.13-90.32-396.77,0-277.42,270.97s638.71,61.29,596.77,432.26s135.48,438.71,332.26,425.81S1932,2504.94,1932,2504.94H2173.94z" />
<path id="step2" d="M645.71,2580.98c137.35-323.68,305.53-194.95,516.37-105.49c210.84,89.46,345.12-55.32,147.53-239.74c-167.44-156.27-236.75-230.53-142.71-344.81c94.05-114.28,450.95,220.99,624.83-34.56c243.91-358.47-157.55-555.89-439.97-679.71c-131.19-57.52-59.62-274.23,121.19-526.91s48.98-432.06-55.63-501.09c-202.03-133.32-501.48,57.05-624.08,543.25c-76.4,302.97-421.52,260.82-376.74-23.71C472.55,312.12,72.62,432.74,76.65,728.8c4.03,296.06,528.52,649.46,250.28,898.37c-250.31,223.93-197.59,495.29,61.35,511.67c196.8,12.45,34.71,347.63,34.71,347.63L645.71,2580.98z" />
```

Also beware that the points should be defined in the same order in all steps, otherwize you'll get weird transitions between each SVG state.

The library only needs a single `path` element for initialization:

```javascript
// using the default settings
let default = new Morpher(document.getElementById('step1'));

// with custom settings
let custom = new Morpher(document.getElementById('step1'), {
    // The length of an iteration (in milliseconds)
    duration: 500,
    // The number of times an animation cycle should be played before stopping (-1 = infinite)
    iterations: -1,
    // Whether the morpher should animate back to its initial state at the end of an iteration
    alternate: true,
    // The animation easing function (defaults to easeInOutQuad)
    easing: (t) => { return t<.5 ? 2*t*t : -1+(4-2*t)*t; },
    // The amount of decimals we should output in the interpolated SVG paths
    decimals: 3
});
```

Alternatively you can also change the morpher's settings using the following methods:

```javascript
// using the default settings
let morpher = (new Morpher(document.getElementById('step1')))
    // Override the configuration's duration
    .setDuration(1200);
    // Override the configuration's iteration count
    .setIterations(5)
    // Override the configuration's alternate mode
    .setAlternate(false)
    // Override the configuration's easing function
    .setEasing((t) => { return t; });
```

The first step will automatically be defined by the `path`'s initial `d` attribute. More steps can be added using the `morpher.addStep(string)` or `morpher.addSteps(array)` methods:

```javascript
let morpher = new Morpher(document.getElementById('step1')),
    step2 = document.getElementById('step2').getAttribute('d');

morpher.addStep(step2);
// or morpher.addSteps([step2, step3, step4]);
```

Once the animation is fully configurated, you can control its state thanks to the `play()`, `pause()` and `stop()` methods. If necessary, you can also provide a timestamp to the `play()` call. This way you can sync the animation with whatever is useful in your project:

```javascript
let morpher1 = new Morpher(document.getElementById('morpher1')),
    morpher2 = new Morpher(document.getElementById('morpher2')),
    now = Date.now();

morpher2.path.classList.add('hidden');
morpher1.play(now);

setTimeout(function() {
    morpher2.play(now);
    morpher2.path.classList.remove('hidden');
}, 600);
```

## API

Here's a full list of available methods. Since this is an early version of the tool, some changes could be made to these methods in the future. Please le us know in the issues if there are use cases you'd love to have in this library.

### `new Morpher(pathElement, configuration = {})`

Create a new morpher instance. 

- `pathElement`: _required_ - A `<path>` node with a valid `d` attribute
- `configuration`: _optional_ - A settings object. Possible keys are :
    - `duration`: The length (duration) of an animation cycle in milliseconds. Default: `500`
    - `iterations`: The number of times an animation cycle should be played before stopping. Default: `-1` (= infinite)
    - `alternate`: A boolean indicating if the animation should play backwards after a regular cycle. Default: `true`
    - `easing`: A callback function that will alter the animation's progress graph. Default: `easeInOutQuad` (more easing function examples [here](https://gist.github.com/gre/1650294))
    - `decimals`: The maximal amount of decimals that should be used in the interpolated SVG path arguments

### `morpher.setDuration(int)`

> Update the morpher's cycle animation duration. If no value is given, the morpher's default duration will be used.

### `morpher.setIterations(int)`

> Update the morpher's maximal cycles count. If no value is given, the morpher's default iterations count will be used (`-1`).

### `morpher.setAlternate(bool)`

> Update the morpher's alternation mode. If no value is given, the morpher's default alternation mode will be used.

### `morpher.setEasing(callback)`

> Update the morpher's easing function. The given callback function will receive a single argument (`t`), which is a float value between `0` and `1` representing the cycle's animation progress.

The following example is the default easing function:

```javascript
function easeInOutQuad(t) {
    return t<.5 ? 2*t*t : -1+(4-2*t)*t;
}
```

More useful easing functions can be found in [Gaëtan Renaudeau's Gist](https://gist.github.com/gre/1650294).

### `morpher.addStep(string)`

> Add a new SVG path state to the morphing cycle. This is typically the content of a `path` node's `d` attribute.

### `morpher.addSteps(array)`

> Add multiple SVG path states to the morphing cycle.

### `morpher.play(timestamp = Date.now())`

> Launch the morpher's animation. The `timestamp` argument is optional and defaults the current timestamp.

### `morpher.pause()`

> Pause the morpher's animation. The animation can be resumed by calling `morpher.play()` at any moment.

### `morpher.stop()`

> Stop and reset the morpher's animation.

## Browser Support

This package is still in an early stage and has not yet been tested in all browsers. Please feel free to let us know if there are caveats in the issues.

`requestAnimationFrame` is used under the hood, meaning you'll have to use [Paul Irish's polyfill](https://gist.github.com/paulirish/1579671) if you need to support older browsers.

## Contributing

Feel free to suggest changes, ask for new features or fix bugs yourself. We're sure there are still a lot of improvements that could be made and we would be very happy to merge useful pull requests.

Thanks!