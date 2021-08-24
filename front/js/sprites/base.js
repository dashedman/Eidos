const SQUARE_VERTEXES = [
    -0.5, -0.5, -0.5, 0.5,
    0.5, -0.5, 0.5, 0.5,
]
const BASE_MATRIX = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
]

function Sprite( src )
{
    this.src = src || null;
    if(this.src){
        this.data = new Image();
        this.data.src = this.src
    }

    this._m = new Float32Array(BASE_MATRIX)
    this._v = new Float32Array(SQUARE_VERTEXES)
}
// Object.defineProperty(Sprite.prototype, "width", {
//     get: function(){
//         return this._m[0];
//     },
//     set: function(value) {
//         this._m[0] = value;
//     }
//   });
// Object.defineProperty(Sprite.prototype, "height", {
//     get: function(){
//         return this._m[5];
//     },
//     set: function(value) {
//         this._m[5] = value;
//     }
// });