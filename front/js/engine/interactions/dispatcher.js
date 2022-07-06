"use strict"

import Statement from "../statement.js";
import Dispatcher from './interactions';

export default class Dispatcher {
    constructor(el) {
        // id of the game loop to handle
        /** @type {Statement} */
        this._state = null
        this._target = el

        const KEYS_NUMBER = 128
        this.pressedKeys = new Uint8Array(KEYS_NUMBER)
        /**
         * @callback eventCallback
         */
        /** @type {eventCallback[][]} */
        this.keyDownListeners = new Array(KEYS_NUMBER)
        /** @type {eventCallback[][]} */
        this.keyUpListeners = new Array(KEYS_NUMBER)
        for(let i = 0; i < KEYS_NUMBER; i++) {
            this.keyDownListeners[i] = []
            this.keyUpListeners[i] = []
        }

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

    /**
     * 
     * @param {Dispatcher.KEY} keyCode 
     * @param {Dispatcher.ACTION} dispatcherAction 
     * @param {Function} callback 
     */
    subscribe(keyCode, dispatcherAction, callback) {
        switch (dispatcherAction) {
            case Dispatcher.ACTION.KEY_DOWN:
                this.keyDownListeners[keyCode].push(callback)
                break
            case Dispatcher.ACTION.KEY_UP:
                this.keyUpListeners[keyCode].push(callback)
                break
            default:
                console.warn('Undefined dispatcher action!')
        }
    }

    setupListeners() {
        this.target.addEventListener('keydown', this.onKeyDown);
        this.target.addEventListener('keyup', this.onKeyUp);

        this.target.addEventListener('mousedown', this.onMouseDown);
        this.target.addEventListener('mouseup', this.onMouseUp);
        this.target.addEventListener('click', this.onMouseClick);

        window.addEventListener('blur', this.onBlur)
        window.addEventListener('focus', this.onFocus)
    }

    /**
     * @param {KeyboardEvent} event 
     */
    onKeyDown(event) {
        this.pressedKeys[event.keyCode] = true;
        for(let callback in this.keyDownListeners[event.keyCode]) {
            callback()
        }
    }

    /**
     * @param {KeyboardEvent} event 
     */
    onKeyUp(event) {
        this.pressedKeys[event.keyCode] = false;
        for(let callback in this.keyUpListeners[event.keyCode]) {
            callback()
        }
    }

    /**
     * @param {MouseEvent} e
     */
    onMouseDown(e) {
        this.mouse.pressed = true;
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }

    /**
     * @param {MouseEvent} e
     */
    onMouseUp(e) {
        this.mouse.pressed = false;
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }

    /**
     * @param {MouseEvent} e
     */
    onMouseClick(e) {
        this.mouse.clicked = true;
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }

    /**
     * @param {FocusEvent} e
     */
    onBlur(e) {
        this._state.stop()
    }

    /**
     * @param {FocusEvent} e
     */
     onFocus(e) {
        this._state.run()
    }
}

/**
 * Enum for common colors.
 * @readonly
 * @enum {Number}
 */
Dispatcher.ACTION = {
    KEY_DOWN: 1,
    KEY_UP: 2,
}

/**
 * Enum for common colors.
 * @readonly
 * @enum {Number}
 */
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