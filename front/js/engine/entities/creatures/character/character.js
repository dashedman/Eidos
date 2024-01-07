"use strict"

import Creature from "../base.js"
import { AbstractState } from "./states/abstract.js";
import { BaseCharacterState } from "./states/states.js";

/**
 * 
 */
export default class Character extends Creature {
    /**
     * 
     * @param {Sprite} sprite 
     * @param {PhInertiaBox} pbox 
     * @param {{x: number, y: number, z:number, w: number, h:number}} param2 
     */
    constructor(sprite, pbox, {x, y, z=1, w=1, h=1}){
        super(sprite, pbox, {x, y, z, w, h})
    }

    /**
     * @param {Commander.commands} command
     */
    do(command) {}

    /**
     * @param {Commander.commands} command
     */
    undo(command) {}
}
