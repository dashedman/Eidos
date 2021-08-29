// Realize container for texture, with rect

class Sprite {
    constructor(state, bufferIndexes, texture) {
        this._state = state;
        this._bufferIndexes = bufferIndexes;

        this.texture = texture;
        this.x = 0
        this.y = 0
        this.w = texture.image.width
        this.h = texture.image.height

        let _s = this._state.render.spriteManager.static;
        let _v = _s.verticles;
        let _t = _s.textures;
        // buffer indexes for verticles and textures
        
    }
    delete() {
        // release memory buffer
        this._state.render.spriteManager.release('static', _bufferIndexes);
    }
}
// Object.defineProperty(Sprite.prototype, "w", {
//     set: function(value) {
//         const idx = this._bufferIndexes.v
//         _v[idx]     = _v[idx + 2] = _v[idx + 6]  = this.x;
//         _v[idx + 4] = _v[idx + 8] = _v[idx + 10] = this.x + value;
//     }
//   });
// Object.defineProperty(Sprite.prototype, "h", {
//     set: function(value) {
//         const idx = this._bufferIndexes.v
//         _v[idx + 1] = _v[idx + 5] = _v[idx + 9]  = this.y;
//         _v[idx + 3] = _v[idx + 7] = _v[idx + 11] = this.y + value;
//     }
// });
// Object.defineProperty(Sprite.prototype, "x", {
//     set: function(value) {
//         const idx = this._bufferIndexes.v
//         _v[idx]     = _v[idx + 2] = _v[idx + 6]  = value;
//         _v[idx + 4] = _v[idx + 8] = _v[idx + 10] = value + this.w;
//     }
//   });
// Object.defineProperty(Sprite.prototype, "y", {
//     set: function(value) {
//         const idx = this._bufferIndexes.v
//         _v[idx + 1] = _v[idx + 5] = _v[idx + 9]  = value;
//         _v[idx + 3] = _v[idx + 7] = _v[idx + 11] = value + this.h;
//     }
// });


