"use strict"

import Sprite from '../sprites/base.js';
import TextManager from './manager.js';
import Texture from '../textures/base.js';
import { DRAW_GROUND_PLAN } from '../constants.js';


export default class TextBox{
    /**
     * @param {TextManager} manager
     * @param {String} text 
     * @param {{x: number, y: number, z: number, signWidth: number, signHeight: number}} param2
     */
    constructor(manager, text='', {x=0, y=0, z=1, signWidth=0.2, signHeight=0.2}) {
        this._manager = manager
        this._x = x
        this._y = y
        this._z = z
        this._signWidth = signWidth
        this._signHeight = signHeight
        this._text = text

        /** @type {Array<Array<Sprite>>} */
        this._symbols_sequence = []
        this.rebuildSprites()
    }

    get text() { return this._text }
    set text(new_text) { this._text = new_text; this.rebuildSprites() }
    get x() { return this._x }
    set x(new_x) { this._x = new_x; this.updateTextPosition() }
    get y() { return this._y }
    set y(new_y) { this._y = new_y; this.updateTextPosition() }
    get z() { return this._z }
    set z(new_z) { this._z = new_z; this.updateTextPosition() }
    get signWidth() { return this._signWidth }
    set signWidth(new_signWidth) { this._signWidth = new_signWidth; this.updateTextPosition() }
    get signHeight() { return this._signHeight }
    set signHeight(new_signHeight) { this._signHeight = new_signHeight; this.updateTextPosition() }

    rebuildSprites() {
        for(let text_line of this._symbols_sequence)
            for(let sprite of text_line) {
                if(sprite !== null)
                    sprite.release()
            }
        this._symbols_sequence.length = 0


        let text_line = []
        for(let sign of this._text) {
            // process multi line
            if(sign === '\n') {
                this._symbols_sequence.push(text_line)
                text_line = []
                continue
            }
            // process spaces
            if(sign === ' ') {
                text_line.push(null)
                continue
            }

            /** @type {Texture} */
            let texture = this._manager._alphabeth[sign]
            if(texture === undefined) {
                texture = this._manager._render.textureManager.plug
            }

            let sprite = this._manager._render.createSprite({ texture }, DRAW_GROUND_PLAN.MAIN)
            text_line.push(sprite)
        }
        this._symbols_sequence.push(text_line)
        this.updateTextPosition()
    }

    updateTextPosition() {
        for(let [indexY, text_line] of this._symbols_sequence.entries()) {
            for(let [indexX, sprite] of text_line.entries()){
                if(sprite === null) continue
                sprite.sx = this._x + indexX * this.signWidth
                sprite.sy = this._y - (indexY + 1) * this.signHeight
                sprite.sz = this._z
                sprite.sw = this._signWidth
                sprite.sh = this._signHeight
            }
        }
    }
}