"use strict"
import Statement from "./statement.js";
import { NotImplementedError } from "./exceptions.js";

export default class Logic {
    constructor(debugMode=false) {
        /**
         * @type {Statement}
         */
        this._state = null;
        this.debugMode = debugMode
    }

    update(){
        throw new NotImplementedError()
    }

    async prepare() {
        console.debug('Preparing Logic...')
        console.debug('Logic prepeared.')
    }
}