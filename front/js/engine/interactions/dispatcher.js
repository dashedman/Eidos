"use strict"

import Statement from "../statement.js";

export default class Dispatcher {
    constructor(el) {
        // id of the game loop to handle
        /** @type {Statement} */
        this._state = null;
        this._target = el

        this.pressedKeys = new Uint8Array(128);
        this.pressedOnce = new Set();

        this.mouse = {
            pressed: false,
            clicked: false,
            x: 0,
            y: 0,
            oldX: 0,
            oldY: 0,
        }; 
    }

    async prepare() {
        console.debug('Preparing Dispatcher...')
        this.setupListeners()
        console.debug('Dispatcher prepeared.')
    }

    get target(){
        return this._target
    }
    set target(new_target){
        this._target = new_target
    }

    setupListeners() {
        this.target.addEventListener('keydown', (event) => {
            this.pressedKeys[event.keyCode] = true;
            this.pressedOnce.add(event.keyCode);
        });
        this.target.addEventListener('keyup', (event) => {
            this.pressedKeys[event.keyCode] = false;
        });

        this.target.addEventListener('mousedown', (e) => {
            this.mouse.pressed = true;
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        this.target.addEventListener('mouseup', (e) => {
            this.mouse.pressed = false;
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        this.target.addEventListener('click', (e) => {
            this.mouse.clicked = true;
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('blur', () => {
            this._state.stop()
        })
        window.addEventListener('focus', () => {
            this._state.run()
        })
    }
}

Dispatcher.KEY = {
    // special keys
    ESCAPE: 27,
    BACKSPACE: 8,
    TAB: 9,
    SPACE: 32,
    ENTER: 13,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    // arrows
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    // math
    PLUS: 187,
    EQUAL: 187,
    MINUS: 189,
    // alphabeth
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,
    // digits
    ZERO: 48,
    ONE: 49,
    TWO: 50,
    THREE: 51,
    FOUR: 52,
    FIVE: 53,
    SIX: 54,
    SEVEN: 55,
    EIGHT: 56,
    NINE: 57,
}