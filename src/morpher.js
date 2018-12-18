class Morpher {

    constructor(pathElement, config = {}) {
        this.path = pathElement;
        if(!this.path || this.path.tagName.toUpperCase() !== 'PATH') return console.warn('Morpherjs: provided DOM element should be a PATH node.')
        this.config = {...Morpher.defaults, ...config};
        this.steps = [];
        this.start = undefined;
        this.iterations = undefined;
        this.iteration = undefined;
        this.direction = undefined;
        this.isPlaying = false;
        this.isPaused = false;
        this.isDone = false;
        this.addStep(this.path.getAttribute('d'));
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
            alternate: true,
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

    /**
    * Add a step to the morphing cycle
    */
    addStep(d) {
        if(!d) return this;
        let step = {};
        step.points = this.parseDirectionsString(d);
        this.steps.push(step);
        return this;
    }

    /**
    * Add multiple steps at once to the morphing cycle
    */
    addSteps(steps = []) {
        for (var i = 0; i < steps.length; i++) {
            this.addStep(steps[i]);
        }
        return this;
    }

    /**
    * Launch animation
    */
    play(time) {
        if(this.isPlaying) return;
        if(!this.start) this.start = time ? time : Date.now();
        if(this.isPaused) this.start = Date.now() - (this.isPaused - this.start);
        this.isPlaying = true;
        this.isPaused = false;
        this.isDone = false;
        this.draw(this.start);
    }

    /**
    * Stop animation without resetting it
    */
    pause() {
        this.isPlaying = false;
        this.isPaused = Date.now();
        this.isDone = false;
    }

    /**
    * Stop animation and reset it
    */
    stop() {
        this.start = undefined;
        this.isPlaying = false;
        this.isPaused = false;
        this.isDone = false;
    }

    /**
    * Set the path's new "d" attribute and request a new frame if necessary
    */
    draw(time) {
        if(!this.isPlaying) return;
        console.log(this);
    }

    /**
    * Transform a SVG path "d" attribute into an array of instructions
    */
    parseDirectionsString(d) {
        let points = [], instruction;
        for (var i = 0; i < d.length; i++) {
            if(this.isCoordinateCharacter(d[i])) this.appendCoordinateCharacter(instruction, d[i]);
            else if(this.isInstructionCharacter(d[i])) {
                if(instruction) points.push(this.cleanInstruction(instruction, points.length ? points[points.length - 1] : null));
                instruction = {};
                instruction.type = d[i];
            }
        }
        if(instruction) points.push(this.cleanInstruction(instruction, points.length ? points[points.length - 1] : null));
        return points;
    }

    /**
    * Check if given character is part of a coordinate
    */
    isCoordinateCharacter(string) {
        if(!isNaN(string)) return true;
        if(string == ' ' || string == '.' || string == ',' || string == '-' || string == '+') return true;
        return false;
    }

    /**
    * Check if given character is starting a new instruction
    */
    isInstructionCharacter(string) {
        string = string.toLowerCase();
        if(string == 'm') return true;
        if(string == 'z') return true;
        if(string == 'l') return true;
        if(string == 'h') return true;
        if(string == 'v') return true;
        if(string == 'c') return true;
        if(string == 's') return true;
        if(string == 'q') return true;
        if(string == 't') return true;
        if(string == 'a') return true;
        return false;
    }

    /**
    * Add character to the coordinates of an existing instruction
    */
    appendCoordinateCharacter(instruction, string) {
        if(!instruction.coordinates) instruction.coordinates = [''];
        if(string == ',' || string == ' ' || string == '+' && instruction.coordinates[instruction.coordinates.length - 1].length) {
            return instruction.coordinates.push('');
        }
        if(string == '-' && instruction.coordinates[instruction.coordinates.length - 1].length) {
            return instruction.coordinates.push('-');
        }
        instruction.coordinates[instruction.coordinates.length - 1] += string;
    }

    /**
    * Transform a raw instruction into a parsed & usable instruction
    */
    cleanInstruction(instruction, previous) {
        if(!instruction.coordinates) return instruction;
        let coordinates = [];
        for (var i = 0; i < instruction.coordinates.length; i++) {
            if(!instruction.coordinates[i].length) continue;
            coordinates.push(parseFloat(instruction.coordinates[i]));
        }
        instruction.coordinates = coordinates;
        instruction.start = this.getInstructionAnchor(instruction, previous, true);
        instruction.end = this.getInstructionAnchor(instruction, previous);
        if(instruction.type == instruction.type.toLowerCase()) {
            instruction.coordinates = this.getCoordinatesFromRelative(instruction);
        }
        else instruction.coordinates = this.getCoordinatesFromAbsolute(instruction);
        return instruction;
    }

    /**
    * Retrieve an anchor's coordinates
    */
    getInstructionAnchor(instruction, previous, isStartPoint) {
        if(isStartPoint) {
            if(previous) return this.getAnchorFromAbsoluteValues(previous.end.abs.x, previous.end.abs.y, previous);
            return this.getAnchorFromAbsoluteValues(0, 0);
        }
        if(instruction.type == 'h') {
            return this.getAnchorFromRelativeValues(instruction.coordinates[instruction.coordinates.length - 1], 0, previous);
        }
        if(instruction.type == 'H') {
            return this.getAnchorFromAbsoluteValues(instruction.coordinates[instruction.coordinates.length - 1], previous.end.abs.y, previous);
        }
        if(instruction.type == 'v') {
            return this.getAnchorFromRelativeValues(0, instruction.coordinates[instruction.coordinates.length - 1], previous);
        }
        if(instruction.type == 'V') {
            return this.getAnchorFromAbsoluteValues(previous.end.abs.x, instruction.coordinates[instruction.coordinates.length - 1], previous);
        }
        if(instruction.type == instruction.type.toLowerCase()) {
            return this.getAnchorFromRelativeValues(
                instruction.coordinates[instruction.coordinates.length - 2],
                instruction.coordinates[instruction.coordinates.length - 1],
                previous
            );
        }
        return this.getAnchorFromAbsoluteValues(
            instruction.coordinates[instruction.coordinates.length - 2],
            instruction.coordinates[instruction.coordinates.length - 1],
            previous
        );
    }

    /**
    * Normalize coordinates from absolute coordinates
    */
    getAnchorFromAbsoluteValues(x, y, previous) {
        return {
            abs: {x, y},
            rel: {x: (x - (previous ? previous.end.abs.x : 0)), y: (y - (previous ? previous.end.abs.y : 0))}
        };
    }

    /**
    * Normalize coordinates from relative coordinates
    */
    getAnchorFromRelativeValues(x, y, previous) {
        return {
            abs: {x: ((previous ? previous.end.abs.x : 0) + x), y: ((previous ? previous.end.abs.y : 0) + y)},
            rel: {x, y}
        };
    }

    /**
    * Get the axis name (X or Y) for given instruction argument
    */
    getCoordinateAxis(type, index) {
        if(type.toLowerCase() == 'h') return 'x';
        if(type.toLowerCase() == 'v') return 'y';
        if((index % 2) > 0) return 'y';
        return 'x';
    }

    /**
    * Get normalized coordinates for given relative instruction
    */
    getCoordinatesFromRelative(instruction) {
        let coords = {}, axis;
        coords.rel = instruction.coordinates;
        coords.abs = [];
        for (var i = 0; i < coords.rel.length; i++) {
            axis = this.getCoordinateAxis(instruction.type, i);
            coords.abs.push(instruction.start.abs[axis] + coords.rel[i]);
        }
        return coords;
    }

    /**
    * Get normalized coordinates for given absolute instruction
    */
    getCoordinatesFromAbsolute(instruction) {
        let coords = {}, axis;
        coords.abs = instruction.coordinates;
        coords.rel = [];
        for (var i = 0; i < coords.abs.length; i++) {
            axis = this.getCoordinateAxis(instruction.type, i);
            coords.rel.push(coords.abs[i] - instruction.start.abs[axis]);
        }
        return coords;
    }

}

window.Morpher = Morpher;

export default Morpher;