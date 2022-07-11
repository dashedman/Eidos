"use strict"

import PhInertiaBox from "../../physics/colliders/inertia_box.js";
import Statement from "../../statement.js";
import { Square } from "../block.js";
import PhInertiaBox from './../../physics/colliders/inertia_box';

export default class Creature extends Square {
    /**
     * 
     * @param {Sprite} sprite 
     * @param {PhInertiaBox} pbox 
     * @param {{x: number, y: number, z:number, w: number, h:number}} param2 
     */
     constructor(sprite, pbox, {x, y, z=1, w=1, h=1}){
        super(sprite, pbox, {x, y, z, w, h})
        /**
         * @type {PhInertiaBox}
         */
        this.pbox
    }

    /**
     * @param { Statement } state
     */
    getPhysBox(state) {
        return state.physics.createInertedBox()
    }
}
