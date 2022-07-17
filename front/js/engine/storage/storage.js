'use strict'

import Statement from './../statement';


export default class Storage {
    constructor(debugMode=false) {
        /**
         * @type {Statement}
         */
        this._state = null
        this.debugMode = debugMode
    }

    async prepare() {
        console.debug('Preparing Storage...')
        console.debug('Storage prepeared.')
    }
}