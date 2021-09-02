// Realize container for texture, with rect

class Sprite {
    constructor(manager, bufferIndexes, texture, ...mixins) {
        this._bufferIndexes = bufferIndexes;

        this._spriteCoords = {x: 0, y:0, z:0, w:0, h:0}
        this._textureCoords = {x: 0, y:0, w:0, h:0}

        this._manager = manager;
        this._p = this._manager.positionHandler.data;
        this._t = this._manager.textureHandler.data;

        this.texture = texture;
        texture.addToTrace(this)
        // async constructor
        this.waitInit = this.async_constructor()

        // add mixins
        Object.assign(this, ...mixins)
    }
    async async_constructor(resolve){
        await this.texture.loadState

        this.sx = 0
        this.sy = 0
        this.sz = -1
        this.sw = this.texture.image.naturalWidth
        this.sh = this.texture.image.naturalHeight

        // texture coords
        console.log(this.texture.image)
        this.tx = 0
        this.ty = 0
        this.tw = this.texture.image.naturalWidth
        this.th = this.texture.image.naturalHeight
    }
    forceUpdate(){
        // force update for verticles
        forceUpdateSprite()
        forceUpdateTexture()
    }
    forceUpdateTexture(){
        // force update for verticles
        this.tx = this.tx
        this.ty = this.ty
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
    delete() {
        // release memory buffer
        this.texture.removeFromTrace(this)
        this._manager.release(this._bufferIndexes);
    }

    /**
     * @param {number} value
     */
    set sw(value) {
        this._spriteCoords.w = value

        const idx = this._bufferIndexes.p
        this._p[idx]     = this._p[idx + 3] = this._p[idx + 9]  = this.sx;
        this._p[idx + 6] = this._p[idx + 12] = this._p[idx + 15] = this.sx + value;
        this._manager.positionHandler.needUpdate = true
    }

    /**
     * @param {number} value
     */
    set sh(value) {
        this._spriteCoords.h = value

        const idx = this._bufferIndexes.p
        this._p[idx + 1] = this._p[idx + 7] = this._p[idx + 13] = this.sy;
        this._p[idx + 4] = this._p[idx + 10] = this._p[idx + 16] = this.sy + value;
        this._manager.positionHandler.needUpdate = true
    }
    /**
     * @param {number} value
     */
    set sx(value) {
        this._spriteCoords.x = value

        const idx = this._bufferIndexes.p
        this._p[idx]     = this._p[idx + 3] = this._p[idx + 9]  = value;
        this._p[idx + 6] = this._p[idx + 12] = this._p[idx + 15] = value + this.sw;
        this._manager.positionHandler.needUpdate = true
    }
    /**
     * @param {number} value
     */
    set sy(value) {
        this._spriteCoords.y = value

        const idx = this._bufferIndexes.p
        this._p[idx + 1] = this._p[idx + 7] = this._p[idx + 13]  = value;
        this._p[idx + 4] = this._p[idx + 10] = this._p[idx + 16] = value + this.sh;
        this._manager.positionHandler.needUpdate = true
    }
    /**
     * @param {number} value
     */
     set sz(value) {
        this._spriteCoords.z = value

        const idx = this._bufferIndexes.p
        for(let i = 2; i < 18; i += 3) this._p[idx + i] = value;
        this._manager.positionHandler.needUpdate = true
    }

    /**
     * @param {number} value
     */
    set tw(value) {
        this._textureCoords.w = value

        const idx = this._bufferIndexes.t
        this._t[idx]     = this._t[idx + 2] = this._t[idx + 6]  = this._textureCoords.x + this.texture.atlasCoords.x;
        this._t[idx + 4] = this._t[idx + 8] = this._t[idx + 10] = this._textureCoords.x + this.texture.atlasCoords.x + value;
        this._manager.textureHandler.needUpdate = true
    }
    /**
     * @param {number} value
     */
    set th(value) {
        this._textureCoords.h = value

        const idx = this._bufferIndexes.t
        this._t[idx + 1] = this._t[idx + 5] = this._t[idx + 9]  = this._textureCoords.y + this.texture.atlasCoords.y;
        this._t[idx + 3] = this._t[idx + 7] = this._t[idx + 11] = this._textureCoords.y + this.texture.atlasCoords.y + value;
        this._manager.textureHandler.needUpdate = true
    }
    /**
     * @param {number} value
     */
    set tx(value) {
        this._textureCoords.x = value

        const idx = this._bufferIndexes.t
        this._t[idx]     = this._t[idx + 2] = this._t[idx + 6]  = value + this.texture.atlasCoords.x;
        this._t[idx + 4] = this._t[idx + 8] = this._t[idx + 10] = value + this.texture.atlasCoords.x +this._textureCoords.w;
        this._manager.textureHandler.needUpdate = true
    }
    /**
     * @param {number} value
     */
    set ty(value) {
        this._textureCoords.y = value

        const idx = this._bufferIndexes.t
        this._t[idx + 1] = this._t[idx + 5] = this._t[idx + 9]  = value + this.texture.atlasCoords.y;
        this._t[idx + 3] = this._t[idx + 7] = this._t[idx + 11] = value + this.texture.atlasCoords.y + this._textureCoords.h;
        this._manager.textureHandler.needUpdate = true
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
