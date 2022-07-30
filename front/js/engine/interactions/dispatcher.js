"use strict"

import Statement from "../statement.js";

export default class Dispatcher {
    /**
     * @param { HTMLElement } el 
     * @param { boolean } debugMode 
     */
    constructor(el, debugMode=false) {
        // id of the game loop to handle
        /** @type {Statement} */
        this._state = null
        this._target = el
        this.debugMode = debugMode

        const KEYS_NUMBER = 256
        const BUTTONS_NUMBER = 3

        this.pressedKeys = new Uint8Array(KEYS_NUMBER)
        this.pressedMouseButtons = new Uint8Array(BUTTONS_NUMBER)
        /**
         * @callback eventCallback
         */
        /** @type {eventCallback[][]} */
        this.keyDownListeners = new Array(KEYS_NUMBER)
        /** @type {eventCallback[][]} */
        this.keyUpListeners = new Array(KEYS_NUMBER)
        /** @type {eventCallback[][]} */
        this.mouseDownListeners = new Array(BUTTONS_NUMBER)
        /** @type {eventCallback[][]} */
        this.mouseMoveListeners = new Array(BUTTONS_NUMBER)
        /** @type {eventCallback[][]} */
        this.mouseUpListeners = new Array(BUTTONS_NUMBER)


        for(let i = 0; i < KEYS_NUMBER; i++) {
            this.keyDownListeners[i] = []
            this.keyUpListeners[i] = []
        }
        for(let i = 0; i < BUTTONS_NUMBER; i++) {
            this.mouseDownListeners[i] = []
            this.mouseMoveListeners[i] = []
            this.mouseUpListeners[i] = []
        }

        // NDC coords
        /** @type {{X: number, Y: number, prevX: number, prevY: number, downX: number, downY: number, upX: number, upY: number}} */
        this.mouseCoords = {
            X: 0,
            Y: 0,
            prevX: 0,
            prevY: 0,
            downX: 0,
            downY: 0,
            upX: 0,
            upY: 0
        }; 
    }

    async prepare() {
        console.debug('Preparing Dispatcher...')
        this.setupListeners()
        if(this.debugMode) {
            // this.addDebugInputLog()
        }
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
            case Dispatcher.ACTION.MOUSE_DOWN:
                this.mouseDownListeners[keyCode].push(callback)
                break
            case Dispatcher.ACTION.MOUSE_MOVE:
                this.mouseMoveListeners[keyCode].push(callback)
                break
            case Dispatcher.ACTION.MOUSE_UP:
                this.mouseUpListeners[keyCode].push(callback)
                break
            default:
                console.warn('Undefined dispatcher action!')
        }
    }

    setupListeners() {
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));

        this.target.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.target.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.target.addEventListener('mouseup', this.onMouseUp.bind(this));

        window.addEventListener('blur', this.onBlur.bind(this))
        window.addEventListener('focus', this.onFocus.bind(this))
    }

    /**
     * @param {KeyboardEvent} event 
     */
    onKeyDown(event) {
        this.pressedKeys[event.keyCode] = true;
        for(let callback of this.keyDownListeners[event.keyCode]) {
            callback()
        }
    }

    /**
     * @param {KeyboardEvent} event 
     */
    onKeyUp(event) {
        this.pressedKeys[event.keyCode] = false;
        for(let callback of this.keyUpListeners[event.keyCode]) {
            callback()
        }
    }

    /**
     * @param {MouseEvent} e
     */
    onMouseDown(e) {
        this.pressedMouseButtons[e.button] = true
        this.mouseCoords.downX = this.mouseCoords.X = 2 * (e.clientX / this._target.clientWidth) - 1
        this.mouseCoords.downY = this.mouseCoords.Y = -2 * (e.clientY / this._target.clientHeight) + 1

        for(let callback of this.mouseDownListeners[e.button]) {
            callback()
        }
    }

    /**
     * @param {MouseEvent} e
     */
    onMouseMove(e) {
        this.mouseCoords.prevX = this.mouseCoords.X
        this.mouseCoords.prevY = this.mouseCoords.Y
        this.mouseCoords.X = 2 * (e.clientX / this._target.clientWidth) - 1
        this.mouseCoords.Y = -2 * (e.clientY / this._target.clientHeight) + 1

        for(let callback of this.mouseMoveListeners[e.button]) {
            callback()
        }
    }

    /**
     * @param {MouseEvent} e
     */
    onMouseUp(e) {
        this.pressedMouseButtons[e.button] = false
        this.mouseCoords.upX = this.mouseCoords.X = 2 * (e.clientX / this._target.clientWidth) - 1
        this.mouseCoords.upY = this.mouseCoords.Y = -2 * (e.clientY / this._target.clientHeight) + 1

        for(let callback of this.mouseUpListeners[e.button]) {
            callback()
        }
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

    addDebugInputLog() {
        let usedValues = []
        for(let [key, value] of Object.entries(Dispatcher.KEY)) {
            this.subscribe(value, Dispatcher.ACTION.KEY_DOWN, () => {console.debug('Key down:', key)})
            this.subscribe(value, Dispatcher.ACTION.KEY_UP,   () => {console.debug('Key up:',   key)})
            usedValues.push(value)
        }

        for(let i = 0; i < 256; i++) {
            if(usedValues.includes(i)) continue
            this.subscribe(i, Dispatcher.ACTION.KEY_DOWN, () => {console.debug('Key down:', i)})
            this.subscribe(i, Dispatcher.ACTION.KEY_UP,   () => {console.debug('Key up:',   i)})
        }

        for(let [key, value] of Object.entries(Dispatcher.MOUSE)) {
            this.subscribe(value, Dispatcher.ACTION.MOUSE_DOWN, () => {console.debug('Mouse down:', key, this.mouseCoords.X, this.mouseCoords.Y)})
            this.subscribe(value, Dispatcher.ACTION.MOUSE_MOVE, () => {console.debug('Mouse move:', key, this.mouseCoords.X, this.mouseCoords.Y)})
            this.subscribe(value, Dispatcher.ACTION.MOUSE_UP,   () => {console.debug('Mouse up:',   key, this.mouseCoords.X, this.mouseCoords.Y)})
        }
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
    MOUSE_DOWN: 3,
    MOUSE_MOVE: 4,
    MOUSE_UP: 5
}

/**
 * Enum for common colors.
 * @readonly
 * @enum {Number}
 */
 Dispatcher.MOUSE = {
    LEFT: 0,
    WHEEL: 1,
    RIGHT: 2
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
    PLUS: 61,
    EQUAL: 61,
    MINUS: 173,
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