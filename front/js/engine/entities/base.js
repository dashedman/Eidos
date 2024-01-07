"use strict"

import Statement from "../statement.js"


export class Entity {
    /**
     * 
     * @param { Statement } state 
     * @param {*} prepareParams 
     */
    constructor(state, prepareParams={}) {
        this.prepare(state, prepareParams)
    }

    /**
     * 
     * @param { Statement } state 
     * @param {*} prepareParams 
     */
    prepare(state, prepareParams) {}
}