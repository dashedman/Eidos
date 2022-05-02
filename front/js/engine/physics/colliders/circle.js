"use strict"

import { COLLIDER_TYPES } from "./constants.js";
import { PhBox, PhPoint, PhRotatedBox } from "./colliders.js";

export default class PhCircle extends PhPoint {
    colliderType = COLLIDER_TYPES.CIRCLE

    constructor(x, y, r) {
        super(x, y)
        this.r = r || 0;
    }
}
