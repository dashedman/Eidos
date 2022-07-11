"use strict"

import Statement from "../statement"


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