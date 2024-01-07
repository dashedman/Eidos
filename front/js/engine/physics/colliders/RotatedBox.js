"use strict"
import { NotImplementedError } from "../../exceptions.js";
import PhBox from "./box.js";
import { COLLIDER_TYPES } from "./constants.js";

export default class PhRotatedBox extends PhBox{
    colliderType = COLLIDER_TYPES.ROTATED_BOX

    /**
     * 
     * @param {Number} x - X coordinate
     * @param {Number} y - Y coordinate
     * @param {Number} w - width
     * @param {Number} h - height
     * @param {Number} a - angle of rotate in radians
     */
    constructor(x, y, w, h, a) {
        super(x, y, w, h)
        this.a = a || 0;
    }

    getCenter(){
        throw new NotImplementedError()
    }
}