"use strict"

import { Renderer } from "../render.js";
import Texture from "../textures/base.js";
import TextBox from "./text.js";


export default class TextManager {
    /**
     * 
     * @param {Renderer} render 
     */
    constructor (render, ignoreCase=false) {
        this._render = render
        this._ignoreCase = ignoreCase
        /** @type {Object.<String, Texture>} */
        this._alphabeth = {}
    }

    async prepare(glyphInfo) {
        let raw_alphabet = await this._render.textureManager.fromGlyphAtlas(glyphInfo)
        if (this._ignoreCase) {
            this._alphabeth = {}
            for(let [key, texture] of Object.entries(raw_alphabet)){
                this._alphabeth[key.toLowerCase()] = this._alphabeth[key.toUpperCase()] = texture
            }
        } else {
            this._alphabeth = raw_alphabet
        }
        
    }

    createTextBox(text='', x=0, y=0, z=1, signWidth, signHeight) {
        return new TextBox(this, text, {x, y, z, signWidth, signHeight})
    }
}