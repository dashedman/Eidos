// Realize container for texture, with rect

class Sprite {
    _v;
    _t;
    _bufferIndexes;
    constructor(state, bufferIndexes, texture) {
        this._state = state;
        this._bufferIndexes = bufferIndexes;

        this.texture = texture;
        texture.addToTrace(this)

        this._spriteCoords = {x: 0, y:0, z:0, w:0, h:0}
        this._textureCoords = {x: 0, y:0, z:0, w:0, h:0}
        

        let _s = this._state.render.staticSspriteManager;
        this._v = _s.verticles;
        this._t = _s.textures;

        // async constructor
        this.initState = this.async_constructor()
    }
    async async_constructor(resolve){
        await this.texture.loadState

        this.sx = 0
        this.sy = 0
        this.sz = 0
        this.sw = this.texture.image.width
        this.sh = this.texture.image.height

        // texture coords
        this.tx = 0
        this.ty = 0
        this.tw = this.texture.image.width
        this.th = this.texture.image.height
    }
    forceUpdate(){
        // force update for verticles
        this.sx = this.sx
        this.sy = this.sy
        this.sz = this.sz

        this.tx = this.tx
        this.ty = this.ty
    }
    tracerEvent(texture){
        if(this.texture == texture){
            forceUpdate()
        }
    }
    delete() {
        // release memory buffer
        this.texture.removeFromTrace(this)
        this._state.render.spriteManager.release('static', _bufferIndexes);
    }

    /**
     * @param {number} value
     */
    set sw(value) {
        this._spriteCoords.w = value

        const idx = _bufferIndexes.v
        _v[idx]     = _v[idx + 2] = _v[idx + 6]  = this.sx;
        _v[idx + 4] = _v[idx + 8] = _v[idx + 10] = this.sx + value;
    }

    /**
     * @param {number} value
     */
    set sh(value) {
        this._spriteCoords.h = value

        const idx = _bufferIndexes.v
        _v[idx + 1] = _v[idx + 5] = _v[idx + 9]  = this.sy;
        _v[idx + 3] = _v[idx + 7] = _v[idx + 11] = this.sy + value;
    }
    /**
     * @param {number} value
     */
    set sx(value) {
        this._spriteCoords.x = value

        const idx = _bufferIndexes.v
        _v[idx]     = _v[idx + 3] = _v[idx + 9]  = value;
        _v[idx + 6] = _v[idx + 12] = _v[idx + 15] = value + this.sw;
    }
    /**
     * @param {number} value
     */
    set sy(value) {
        this._spriteCoords.y = value

        const idx = this._bufferIndexes.v
        _v[idx + 1] = _v[idx + 7] = _v[idx + 13]  = value;
        _v[idx + 4] = _v[idx + 10] = _v[idx + 16] = value + this.sh;
    }
    /**
     * @param {number} value
     */
     set sz(value) {
        this._spriteCoords.z = value

        const idx = this._bufferIndexes.v
        for(let i = 2; i < 18; i += 3) _v[idx + i] = value;
    }

    /**
     * @param {number} value
     */
    set tw(value) {
        this._textureCoords.w = value

        const idx = _bufferIndexes.t
        _t[idx]     = _t[idx + 2] = _t[idx + 6]  = this._textureCoords.x + this.texture.atlasCoords.x;
        _t[idx + 4] = _t[idx + 8] = _t[idx + 10] = this._textureCoords.x + this.texture.atlasCoords.x + value;
    }
    /**
     * @param {number} value
     */
    set th(value) {
        this._textureCoords.h = value

        const idx = _bufferIndexes.t
        _t[idx + 1] = _t[idx + 5] = _t[idx + 9]  = this._textureCoords.y + this.texture.atlasCoords.y;
        _t[idx + 3] = _t[idx + 7] = _t[idx + 11] = this._textureCoords.y + this.texture.atlasCoords.y + value;
    }
    /**
     * @param {number} value
     */
    set tx(value) {
        this._textureCoords.x = value

        const idx = _bufferIndexes.t
        _t[idx]     = _t[idx + 2] = _t[idx + 6]  = value + this.texture.atlasCoords.x;
        _t[idx + 4] = _t[idx + 8] = _t[idx + 10] = value + this.texture.atlasCoords.x +this._textureCoords.w;
    }
    /**
     * @param {number} value
     */
    set ty(value) {
        this._textureCoords.y = value

        const idx = this._bufferIndexes.t
        _t[idx + 1] = _t[idx + 5] = _t[idx + 9]  = value + this.texture.atlasCoords.y;
        _t[idx + 3] = _t[idx + 7] = _t[idx + 11] = value + this.texture.atlasCoords.y + this._textureCoords.h;
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
