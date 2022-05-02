"use strict"

import { Entity } from "./base.js";
import { Sprite } from "../graphics/sprites/base.js";
import PhBox from './../physics/colliders/box.js';

export class BackgroundBlock extends Entity {
    /**
     * 
     * @param {Sprite} sprite
     * @param {{x: number, y: number, z:number}} param1
     */
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
    /**
     * 
     * @param {Sprite} sprite 
     * @param {PhBox} pbox 
     * @param {{x: number, y: number, z:number}} param2 
     */
    constructor(sprite, pbox, {x, y, z=1}) {
        super(sprite, {x, y, z})

        this.pbox = pbox

        this.px = x
        this.py = y
        this.pz = z
        this.pw = 1
        this.ph = 1
    }

    get px() {return this.pbox.x}
    get py() {return this.pbox.y}
    get pw() {return this.pbox.w}
    get ph() {return this.pbox.h}

    set px(value) {this.pbox.x = value}
    set py(value) {this.pbox.y = value}
    set pw(value) {this.pbox.w = value}
    set ph(value) {this.pbox.h = value}

    /**
     * Synchronize physics box with sprite
     */
    sync() {
        this.sx = this.px
        this.sy = this.py
        this.sh = this.ph
        this.sw = this.pw
    }
}

export class Decoration extends BackgroundBlock {
    /**
     * 
     * @param {Sprite} sprite 
     * @param {{x: number, y: number, z:number, width: number, height:number}} param1 
     */
    constructor(sprite, {x, y, z=1, width, height}) {
        super(sprite, {x, y, z})

        this.sw = width,
        this.sh = height
    }
}

export class Square extends Block {
    /**
     * 
     * @param {Sprite} sprite 
     * @param {PhBox} pbox 
     * @param {{x: number, y: number, z:number, w: number, h:number}} param2 
     */
    constructor(sprite, pbox, {x, y, z=1, w=1, h=1}){
        super(sprite, pbox, {x, y, z})

        // set 
        this.w = w
        this.h = h
    }

    getCenter() {
        return this.pbox.getCenter()
    }

    get x() {return this.px}
    get y() {return this.py}
    get w() {return this.pw}
    get h() {return this.ph}

    set x(value) {this.sx = value; this.px = value}
    set y(value) {this.sy = value; this.py = value}
    set w(value) {this.sw = value; this.pw = value}
    set h(value) {this.sh = value; this.ph = value}
}
