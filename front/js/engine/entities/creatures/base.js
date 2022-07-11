"use strict"

import PhInertiaBox from "../../physics/colliders/inertia_box";
import Statement from "../../statement.js";
import { Square } from "../block.js";

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
    }

    /**
     * @param { Statement } state
     */
    getPhysBox(state) {
        return state.physics.createInertedBox()
    }
}
