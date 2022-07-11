"use strict"

import { Entity } from "./base.js";
import Sprite from "../graphics/sprites/base.js";
import PhBox from './../physics/colliders/box.js';
import Statement from "../statement.js";
import { PrepareEntityError } from "../exceptions.js";
import { DRAW_GROUND_PLAN } from "../graphics/constants.js";
import { SpriteMixins } from './../graphics/sprites/mixins';

export class BackgroundBlock extends Entity {
    /**
     * 
     * @param {Statement} state
     * @param {*} prepareParams
     * @param {{x: number, y: number, z:number}} param2
     */
    constructor(state, prepareParams, {x, y, z=1}) {
        super(state, prepareParams)

        /** @type {Sprite} */
        this.sprite

        this.sx = x
        this.sy = y
        this.sz = z
        this.sw = 1
        this.sh = 1
    }

    /**
     * 
     * @param { Statement } state 
     * @param {*} param1 
     */
    prepare(state, {texture=null, textureData, role=DRAW_GROUND_PLAN.MAIN}) {
        if (!texture && textureData){
            texture = state.render.textureManager.getByName(textureData.name)

            if( !texture ) {
                if (textureData.src) {
                    texture = state.render.createTexture(
                        textureData.name, 
                        textureData.src,
                        textureData.frameNumber,
                        textureData.frameOffset
                    )
                } else if (textureData.color) {
                    texture = state.render.createColorTexture(
                        textureData.name, 
                        textureData.color,
                        textureData.width,
                        textureData.height
                    )
                }
            }
        }
        
        let mixins = []
        if( texture ){
            if(texture.frameNumber > 1) mixins.push(SpriteMixins.iAnimated)
        } else {
            throw new PrepareEntityError('Texture didn\'t found')
        }

        this.sprite = state.render.createSprite({
            texture: texture, 
            mixins: mixins
        }, role)
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
     * @param { Statement } state
     * @param {*} prepareParams
     * @param {{x: number, y: number, z:number}} param2 
     */
    constructor(state, prepareParams, {x, y, z=1}) {
        super(state, prepareParams, {x, y, z})

        this.px = x
        this.py = y
        this.pz = z
        this.pw = 1
        this.ph = 1
    }

    /**
     * 
     * @param { Statement } state 
     * @param {*} prepareParams 
     */
    prepare(state, prepareParams) {
        super.prepare(state, prepareParams)

        if(prepareParams.pbox) {
            this.pbox = prepareParams.pbox
        } else {
            this.pbox = this.getPhysBox(state)
        }  
    }

    /**
     * 
     * @param { Statement } state 
     */
    getPhysBox(state) {
        return state.physics.createPhysicBox()
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
    syncSpriteWithBox() {
        this.sx = this.px
        this.sy = this.py
        this.sh = this.ph
        this.sw = this.pw
    }
}

export class Decoration extends BackgroundBlock {
    /**
     * 
     * @param { Statement } state
     * @param {*} prepareParams
     * @param {{x: number, y: number, z:number, width: number, height:number}} param1 
     */
    constructor(state, prepareParams, {x, y, z=1, width, height}) {
        super(state, prepareParams, {x, y, z})

        this.sw = width
        this.sh = height
    }
}

export class Square extends Block {
    /**
     * 
     * @param { Statement } state
     * @param {*} prepareParams
     * @param {{x: number, y: number, z:number, w: number, h:number}} param2 
     */
    constructor(state, prepareParams, {x, y, z=1, w=1, h=1}){
        super(state, prepareParams, {x, y, z})

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
