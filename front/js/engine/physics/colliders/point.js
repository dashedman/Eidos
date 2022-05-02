"use strict"

import { COLLIDER_TYPES } from "./constants.js";
import PhBox from './box.js';
import PhCircle from './circle.js';
import PhRotatedBox from './RotatedBox.js';
import { NotImplementedError } from "../../exceptions.js";


export default class PhPoint {
    static colliderType = COLLIDER_TYPES.POINT

    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    /**
     * 
     * @returns {{x:number, y:number}}
     */
    getCenter(){
        return {
            x: this.x,
            y: this.y,
        }
    }

    /**
     * 
     * @returns {[number, number, number, number]}
     */
    getBoundingCoords() {
        return [this.x, this.y, this.x, this.y]
    }
    
    /**
     * @typedef {(PhPoint | PhBox | PhCircle | PhRotatedBox)} PhCollider
     * @param {PhCollider} phCollider 
     */
    isCollideWith(phCollider) {
        switch(phCollider.colliderType){
            case COLLIDER_TYPES.POINT:
                return this.x == phCollider.x && this.y == phCollider.y
            case COLLIDER_TYPES.CIRCLE:
                return Math.hypot(this.x - phCollider.x, this.y - phCollider.y) <= phCollider.r
            case COLLIDER_TYPES.BOX:
                return (
                    this.x >= phCollider.x && this.x <= phCollider.x + phCollider.w
                    && this.y >= phCollider.y && this.y <= phCollider.y + phCollider.h
                )
            case COLLIDER_TYPES.ROTATED_BOX:
                throw new NotImplementedError()
            return false;
        }
    }
}
