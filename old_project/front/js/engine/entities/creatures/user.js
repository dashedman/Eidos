"use strict"

import Character from "./character/character.js"

export default class User extends Character {
    /**
     * 
     * @param { Statement } state
     * @param {*} prepareParams
     * @param {{x: number, y: number, z:number, w: number, h:number}} param2 
     */
    constructor(state, prepareParams, {x, y, z=1, w=1, h=1}){
        super(state, prepareParams, {x, y, z, w, h})

        this.sessionId = null
    }

    /**
     * 
     * @param {Number} newId 
     */
    setSessionId(newId) {
        this.sessionId = newId
    }
}
