"use strict"

import Creature from "../base.js"
import { AbstractState } from './states/abstract';
import { BaseCharacterState } from './states/states';

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
     * @param {Character.commands} command
     */
    do(command) {}

    /**
     * @param {Character.commands} command
     */
    undo(command) {}
}

/**
 * Enum for common colors.
 * @readonly
 * @enum {Number}
 */
Character.commands = {
    STAY: 0,
    MOVE_LEFT: 1,
    MOVE_RIGHT: 2,
    JUMP: 3,
    CHANGE_MODE: 4,
    ATTACK: 5,
    CHANGE_GUARD: 8,
}
