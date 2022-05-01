"use strict"
import { Entity } from "./base.js";
import colliders from "../physics/colliders/colliders.js"
import { Sprite } from "../graphics/sprites/base.js";

export class BackgroundBlock extends Entity {
    constructor(sprite, {x, y, z=1}) {
        super()

        /** @type {Sprite} */
        this.sprite = sprite

        this.sx = x
        this.sy = y
        this.sz = z

        this.sw = 1
        this.sh = 1
    }

    get sx() {return this.sprite.sx}
    get sy() {return this.sprite.sy}
    get sz() {return this.sprite.sz}
    get sw() {return this.sprite.sw}
    get sh() {return this.sprite.sh}

    set sx(value) {this.sprite.sx = value}
    set sy(value) {this.sprite.sy = value}
    set sz(value) {this.sprite.sz = value}
    set sw(value) {this.sprite.sw = value}
    set sh(value) {this.sprite.sh = value}
}

export class Block extends BackgroundBlock {
    constructor(sprite, {x, y, z=1}) {
        super(sprite, {x, y, z})

        this.pb = new colliders.PhBox(x, y, 1, 1)
    }
}

export class Decoration extends BackgroundBlock {
    constructor(sprite, {x, y, z=1, width, height}) {
        super(sprite, {x, y, z})

        this.sw = width,
        this.sh = height
    }
}
