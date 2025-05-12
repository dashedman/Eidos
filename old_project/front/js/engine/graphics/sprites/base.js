"use strict"
// Realize container for texture, with rect
import Texture from "../textures/base.js";
import SpriteManager from "./managers/base.js";
// import SortingSpriteManager from "./managers/sorting.js";

export const HORIZONTAL_FLIP_BIT = 4
export const VERTICAL_FLIP_BIT = 2
export const AXIS_FLIP_BIT = 1

export default class Sprite {
    /**
     * 
     * @param { SpriteManager | SortingSpriteManager } manager 
     * @param {*} bufferIndexes
     * @param { Texture } texture 
     * @param  {...any} mixins 
     */
    constructor(manager, bufferIndexes, texture, rotate_bits) {
        this._bufferIndexes = bufferIndexes;
        /** @type { SpriteManager } */
        this._manager = manager;

        this._spriteCoords = {x: 0, y:0, z:0, w:0, h:0}
        this._textureCoords = {x: 0, y:0, w:0, h:0}
        
        /** @type { Texture } */
        this.texture = null
        this.waitInit = this.setTexture(texture, rotate_bits)

        // z-sort
        //this._manager.requestZSorting()
    }

    /**
     * 
     * @param {Texture} texture
     * @param {number} rotate_bits - 3 bit value: from 0 to 7
     */
    async setTexture(texture, rotate_bits=0) {
        if(this.texture) {
            this.texture.removeFromTrace()
        }

        this.rotate_bits = rotate_bits

        this.texture = texture;
        this.texture.addToTrace(this)

        await this.texture.loadState
        
        // texture coords
        this.setTextureCoords(0, 0, this.texture.image.naturalWidth, this.texture.image.naturalHeight)
    }

    forceUpdate(){
        // force update for verticles
        this.forceUpdateSprite()
        this.forceUpdateTexture()
    }

    forceUpdateTexture(){
        // force update for verticles
        this.setTextureCoords(null, null, this.texture.frameOffset, this.texture.atlasCoords.h)
    }

    forceUpdateSprite(){
        // force update for verticles
        this.sx = this.sx
        this.sy = this.sy
        this.sz = this.sz
    }

    traceEvent(texture){
        if(this.texture == texture){
            this.forceUpdateTexture()
        }
    }
    
    release() {
        // release memory buffer
        this.texture.removeFromTrace(this)
        this._manager.release(this);
    }

    /**
     * @param {number} value
     */
    set sw(value) {
        if(this._spriteCoords.w != value){
            this._spriteCoords.w = value

            const _p = this._manager.positionHandler.data
            const idx = this._bufferIndexes.p
            _p[idx]     = _p[idx + 3] = _p[idx + 9]  = this.sx;
            _p[idx + 6] = _p[idx + 12] = _p[idx + 15] = this.sx + value;
            this._manager.positionHandler.needUpdate = true
        }
    }

    /**
     * @param {number} value
     */
    set sh(value) {
        if(this._spriteCoords.h != value){
            this._spriteCoords.h = value

            const _p = this._manager.positionHandler.data
            const idx = this._bufferIndexes.p
            _p[idx + 1] = _p[idx + 7] = _p[idx + 13] = this.sy;
            _p[idx + 4] = _p[idx + 10] = _p[idx + 16] = this.sy + value;
            this._manager.positionHandler.needUpdate = true
        }
    }
    /**
     * @param {number} value
     */
    set sx(value) {
        if(this._spriteCoords.x != value){
            this._spriteCoords.x = value

            const _p = this._manager.positionHandler.data
            const idx = this._bufferIndexes.p
            _p[idx]     = _p[idx + 3] = _p[idx + 9]  = value;
            _p[idx + 6] = _p[idx + 12] = _p[idx + 15] = value + this.sw;
            this._manager.positionHandler.needUpdate = true
        }
    }
    /**
     * @param {number} value
     */
    set sy(value) {
        if(this._spriteCoords.y != value){
            this._spriteCoords.y = value

            const _p = this._manager.positionHandler.data
            const idx = this._bufferIndexes.p
            _p[idx + 1] = _p[idx + 7] = _p[idx + 13]  = value;
            _p[idx + 4] = _p[idx + 10] = _p[idx + 16] = value + this.sh;
            this._manager.positionHandler.needUpdate = true
        }
    }
    /**
     * @param {number} value
     */
     set sz(value) {
        if(this._spriteCoords.z != value){
            this._spriteCoords.z = value

            const _p = this._manager.positionHandler.data
            const idx = this._bufferIndexes.p
            for(let i = 2; i < 18; i += 3) _p[idx + i] = value;

            if(this._manager._needZSorting !== undefined)
                this._manager.requestZSorting()
        }
    }

    /**
     * 
     * @param {number?} x 
     * @param {number?} y 
     * @param {number?} w 
     * @param {number?} h 
     */
    setTextureCoords(x, y, w, h) {
        if (x !== null) this._textureCoords.x = x
        if (y !== null) this._textureCoords.y = y
        if (w !== null) this._textureCoords.w = w
        if (h !== null) this._textureCoords.h = h

        let minX = this._textureCoords.x + this.texture.atlasCoords.x
        let minY = this._textureCoords.y + this.texture.atlasCoords.y
        let maxX = this._textureCoords.x + this.texture.atlasCoords.x + this._textureCoords.w
        let maxY = this._textureCoords.y + this.texture.atlasCoords.y + this._textureCoords.h

        let lb_point = [minX, minY]
        let rb_point = [maxX, minY]
        let lu_point = [minX, maxY]
        let ru_point = [maxX, maxY]

        if (AXIS_FLIP_BIT & this.rotate_bits) {
            [lb_point, ru_point] = [ru_point, lb_point]
        }

        if (HORIZONTAL_FLIP_BIT & this.rotate_bits) {
            [lb_point, rb_point, lu_point, ru_point] = [rb_point, lb_point, ru_point, lu_point]
        }

        if (VERTICAL_FLIP_BIT & this.rotate_bits) {
            [lb_point, rb_point, lu_point, ru_point] = [lu_point, ru_point, lb_point, rb_point]
        }

        const _t = this._manager.textureHandler.data
        const idx = this._bufferIndexes.t

        _t[idx] = lb_point[0]
        _t[idx + 1] = lb_point[1]

        _t[idx + 2] = _t[idx + 6] = lu_point[0]
        _t[idx + 3] = _t[idx + 7] = lu_point[1]

        _t[idx + 4] = _t[idx + 8] = rb_point[0]
        _t[idx + 5] = _t[idx + 9] = rb_point[1]

        _t[idx + 10] = ru_point[0]
        _t[idx + 11] = ru_point[1]

        this._manager.textureHandler.needUpdate = true
    }

    get sx(){return this._spriteCoords.x}
    get sy(){return this._spriteCoords.y}
    get sz(){return this._spriteCoords.z}
    get sw(){return this._spriteCoords.w}
    get sh(){return this._spriteCoords.h}
}
