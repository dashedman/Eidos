"use sctrict"

import PhBox from "./box.js";

export default class PhInertiaBox extends PhBox {
    constructor(x, y, w, h) {
        super(x, y, w, h)

        this.vx = 0
        this.vy = 0
        this.ax = 0
        this.ay = 0
    }
}
