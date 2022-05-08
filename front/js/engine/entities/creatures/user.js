"use strict"

import Creature from "./base.js"

export default class User extends Creature {
    /**
     * 
     * @param {Sprite} sprite 
     * @param {PhInertiaBox} pbox 
     * @param {{x: number, y: number, z:number, w: number, h:number}} param2 
     */
    constructor(sprite, pbox, {x, y, z=1, w=1, h=1}){
        super(sprite, pbox, {x, y, z, w, h})

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
