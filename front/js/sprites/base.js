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
        

        let _s = this._state.render.spriteManager.static;
        this._v = _s.verticles;
        this._t = _s.textures;

        // async constructor
        this.initState = this.async_constructor()
    }
    async async_constructor(resolve){
        await this.texture.loadState

        this.x = 0
        this.y = 0
        this.w = this.texture.image.width
        this.h = this.texture.image.height
    }
    tracerEvent(){
        
    }
    delete() {
        // release memory buffer
        this.texture.removeFromTrace(this)
        this._state.render.spriteManager.release('static', _bufferIndexes);
    }

    set w(value) {
        const idx = _bufferIndexes.v
        _v[idx]     = _v[idx + 2] = _v[idx + 6]  = this.x;
        _v[idx + 4] = _v[idx + 8] = _v[idx + 10] = this.x + value;
    }

    set h(value) {
        const idx = _bufferIndexes.v
        _v[idx + 1] = _v[idx + 5] = _v[idx + 9]  = this.y;
        _v[idx + 3] = _v[idx + 7] = _v[idx + 11] = this.y + value;
    }
    set x(value) {
        const idx = _bufferIndexes.v
        _v[idx]     = _v[idx + 2] = _v[idx + 6]  = value;
        _v[idx + 4] = _v[idx + 8] = _v[idx + 10] = value + this.w;
    }
    set y(value) {
        const idx = this._bufferIndexes.v
        _v[idx + 1] = _v[idx + 5] = _v[idx + 9]  = value;
        _v[idx + 3] = _v[idx + 7] = _v[idx + 11] = value + this.h;
    }
}
