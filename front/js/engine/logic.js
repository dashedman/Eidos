"use strict"
import Statement from "./statement.js";
import { NotImplementedError } from "./exceptions.js";

export default class Logic {
    constructor() {
        /**
         * @type {Statement}
         */
        this._state = null;
    }

    update(){
        throw new NotImplementedError()
    }

    async prepare() {
        console.debug('Preparing Logic...')
        console.debug('Logic prepeared.')
    }
}