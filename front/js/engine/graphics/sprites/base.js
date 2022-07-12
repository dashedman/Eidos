"use strict"
// Realize container for texture, with rect
import Texture from '../textures/base.js';
// import SpriteManager from './managers/base.js';
// import SortingSpriteManager from './managers/sorting.js';

export default class Sprite {
    /**
     * 
     * @param { SpriteManager | SortingSpriteManager } manager 
     * @param {*} bufferIndexes
     * @param { Texture } texture 
     * @param  {...any} mixins 
     */
    constructor(manager, bufferIndexes, texture, ...mixins) {
        this._bufferIndexes = bufferIndexes;
        this._manager = manager;

        this._spriteCoords = {x: 0, y:0, z:0, w:0, h:0}
        this._textureCoords = {x: 0, y:0, w:0, h:0}
        
        this.texture = null
        this.waitInit = this.setTexture(texture)
        // add mixins
        Object.assign(this, ...mixins)

        // z-sort
        //this._manager.requestZSorting()
    }
    async setTexture(texture) {
        if(this.texture) {
            this.release()
        }

        this.texture = texture;
        this.texture.addToTrace(this)

        await this.texture.loadState
        // texture coords
        this.tx = 0
        this.ty = 0
        this.tw = this.texture.image.naturalWidth
        this.th = this.texture.image.naturalHeight
    }

    forceUpdate(){
        // force update for verticles
        this.forceUpdateSprite()
        this.forceUpdateTexture()
    }

    forceUpdateTexture(){
        // force update for verticles
        this.tx = null
        this.ty = null
        this.tw = this.texture.frameOffset
        this.th = this.texture.atlasCoords.h
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
     * @param {number} value
     */
    set tw(value) {
        if(this._textureCoords.w != value || value === null){
            if(value !== null) this._textureCoords.w = value

            const _t = this._manager.textureHandler.data
            const idx = this._bufferIndexes.t
            _t[idx]     = _t[idx + 2] = _t[idx + 6]  = this._textureCoords.x + this.texture.atlasCoords.x;
            _t[idx + 4] = _t[idx + 8] = _t[idx + 10] = this._textureCoords.x + this.texture.atlasCoords.x + value;
            this._manager.textureHandler.needUpdate = true
        }
    }
    /**
     * @param {number} value
     */
    set th(value) {
        if(this._textureCoords.h != value || value === null){
            if(value !== null) this._textureCoords.h = value

            const _t = this._manager.textureHandler.data
            const idx = this._bufferIndexes.t
            _t[idx + 1] = _t[idx + 5] = _t[idx + 9]  = this._textureCoords.y + this.texture.atlasCoords.y;
            _t[idx + 3] = _t[idx + 7] = _t[idx + 11] = this._textureCoords.y + this.texture.atlasCoords.y + value;
            this._manager.textureHandler.needUpdate = true
        }
    }
    /**
     * @param {number} value
     */
    set tx(value) {
        if(this._textureCoords.x != value || value === null){
            if(value !== null) this._textureCoords.x = value

            const _t = this._manager.textureHandler.data
            const idx = this._bufferIndexes.t
            _t[idx]     = _t[idx + 2] = _t[idx + 6]  = value + this.texture.atlasCoords.x;
            _t[idx + 4] = _t[idx + 8] = _t[idx + 10] = value + this.texture.atlasCoords.x + this._textureCoords.w;
            this._manager.textureHandler.needUpdate = true
        }
    }
    /**
     * @param {number} value
     */
    set ty(value) {
        if(this._textureCoords.y != value || value === null){
            if(value !== null) this._textureCoords.y = value

            const _t = this._manager.textureHandler.data
            const idx = this._bufferIndexes.t
            _t[idx + 1] = _t[idx + 5] = _t[idx + 9]  = value + this.texture.atlasCoords.y;
            _t[idx + 3] = _t[idx + 7] = _t[idx + 11] = value + this.texture.atlasCoords.y + this._textureCoords.h;
            this._manager.textureHandler.needUpdate = true
        }
    }

    get sx(){return this._spriteCoords.x}
    get sy(){return this._spriteCoords.y}
    get sz(){return this._spriteCoords.z}
    get sw(){return this._spriteCoords.w}
    get sh(){return this._spriteCoords.h}

    get tx(){return this._textureCoords.x}
    get ty(){return this._textureCoords.y}
    get tw(){return this._textureCoords.w}
    get th(){return this._textureCoords.h}
}
