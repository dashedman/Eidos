"use strict"

import PhInertiaBox from "../../physics/colliders/inertia_box";
import Statement from "../../statement.js";
import { Square } from "../block.js";
import AnimatedSprite from './../../graphics/sprites/animated';

export default class Creature extends Square {
    /**
     * 
     * @param {Statement} state
     * @param {*} prepareParams
     * @param {{x: number, y: number, z:number, w: number, h:number}} param2 
     */
     constructor(state, prepareParams, {x, y, z=1, w=1, h=1}){
        super(state, prepareParams, {x, y, z, w, h})

        /** @type { PhInertiaBox } */
        this.pbox
        /** @type { AnimatedSprite } */
        this.sprite

        /** @type { -1 | 1 } */
        this.direction = 1
    }

    /**
     * @param { Statement } state
     */
    getPhysBox(state) {
        return state.physics.createInertedBox()
    }
}
