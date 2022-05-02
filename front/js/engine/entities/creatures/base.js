"use strict"

import PhInertiaBox from "../../physics/colliders/inertia_box.js";
import { Square } from "../block.js";

export default class Creature extends Square {
    /**
     * 
     * @param {Sprite} sprite 
     * @param {PhInertiaBox} pbox 
     * @param {{x: number, y: number, z:number, w: number, h:number}} param2 
     */
     constructor(sprite, pbox, {x, y, z=1, w=1, h=1}){
        super(sprite, pbox, {x, y, z, w, h})
    }
}
