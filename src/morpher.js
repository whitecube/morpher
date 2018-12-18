class Morpher {

    constructor(element, config = {}) {
        this.svg = element;
        this.config = {...Morpher.defaults, ...config};
    }

    /**
    * Access the morpher's default configuration object
    */
    static get defaults() {
        return {
            // The length of an iteration (in milliseconds)
            duration: 500,
            // The number of times an animation cycle should be played before stopping (-1 = infinite)
            iterations: -1,
            // Whether the morpher should animate back to its initial state at the end of an iteration
            alternate: false,
            // The animation easing function (defaults to easeInOutQuad)
            easing: (t) => { return t<.5 ? 2*t*t : -1+(4-2*t)*t; }
        };
    }

    /**
    * Override the configuration's duration
    */
    setDuration(duration) {
        this.config.duration = (duration >= 0) ? duration : Morpher.defaults.duration;
        return this;
    }

    /**
    * Override the configuration's iteration count
    */
    setIterations(iterations) {
        this.config.duration = (iterations === -1 || iterations >= 0) ? iterations : Morpher.defaults.iterations;
        return this;
    }

    /**
    * Override the configuration's alternate mode
    */
    setAlternate(alternate) {
        this.config.alternate = alternate ? true : false;
        return this;
    }

    /**
    * Override the configuration's easing function
    */
    setEasing(callback) {
        this.config.easing = (typeof callback === 'function') ? callback : Morpher.defaults.easing;
        return this;
    }

}

window.Morpher = Morpher;

export default Morpher;