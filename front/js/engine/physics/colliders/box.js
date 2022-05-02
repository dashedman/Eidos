"use strict"

import PhCircle from "./circle.js";
import { COLLIDER_TYPES } from "./constants.js";
import PhPoint from "./point.js";
import PhRotatedBox from "./RotatedBox.js";

export default class PhBox extends PhPoint {
    static colliderType = COLLIDER_TYPES.BOX

    constructor(x, y, w, h) {
        super(x, y)
        this.w = w || 0;
        this.h = h || 0;
    }

    getCenter() {
        return {
            x: this.x + this.w * 0.5,
            y: this.y + this.h * 0.5,
        }
    }

    getBoundingCoords() {
        return [this.x, this.y, this.x + this.w, this.y + this.h]
    }

    /**
     * @typedef {(PhPoint | PhBox | PhCircle | PhRotatedBox)} PhCollider
     * @param {PhCollider} phCollider 
     */
    isCollideWith(phCollider) {
        switch(phCollider.colliderType){
            case COLLIDER_TYPES.POINT:
                return phCollider.isCollideWith(this)
            case COLLIDER_TYPES.CIRCLE:
                throw new NotImplementedError()
            case COLLIDER_TYPES.BOX:
                // TODO: KNF optimization???
                return (
                    this.x >= phCollider.x && this.x <= phCollider.x + phCollider.w
                    || this.x + this.w >= phCollider.x && this.x + this.w <= phCollider.x + phCollider.w
                    || this.x < phCollider.x && this.x + this.w >= phCollider.x + phCollider.w
                ) && (
                    this.y >= phCollider.y && this.y <= phCollider.y + phCollider.h
                    || this.y + this.h >= phCollider.y && this.y + this.h <= phCollider.y + phCollider.h
                    || this.y < phCollider.y && this.y + this.h >= phCollider.y + phCollider.h
                )
            case COLLIDER_TYPES.ROTATED_BOX:
                throw new NotImplementedError()
            default:
                return false;
        }
    }
}
