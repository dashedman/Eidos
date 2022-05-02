"use strict"

import { COLLIDER_TYPES } from "./constants.js";
import PhPoint from "./point.js";

export default class PhCircle extends PhPoint {
    static colliderType = COLLIDER_TYPES.CIRCLE

    constructor(x, y, r) {
        super(x, y)
        this.r = r || 0;
    }
}
