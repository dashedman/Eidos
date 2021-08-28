function SpriteManager()
{
    this.static = {
        verticles: new Float32Array(),
        textures: new Float32Array(),
        usedIndexes: [],
        updateFlags: {
            v: false,
            t: false,
        }
    }
    this.dynamic = {
        verticles: new Float32Array(),
        textures: new Float32Array(),
        usedIndexes: [],
        updateFlags: {
            v: false,
            t: false,
        }
    }
    this.stream = null
    this.fluids = null
}
SpriteManager.prototype.TEXTURES_OFFSET = 6*2
SpriteManager.prototype.VERTICLES_OFFSET = 6*3

SpriteManager.prototype.allocate = function(type, sprite){
    let buffers;
    if(type == 'static'){
        buffers = this.static
    } else if (type == 'dynamic') {
        buffers = this.dynamic
    } else {return null}

    if(type == 'static'){
        let elemIndex = buffers.verticles.length/this.VERTICLES_OFFSET
        let vertIndex = buffers.verticles.length
        buffers.verticles.push( // two triangles = rect
            sprite.x, sprite.y,                     sprite.z,
            sprite.x, sprite.y + sprite.h,          sprite.z,
            sprite.x + sprite.w, sprite.y,          sprite.z,

            sprite.x, sprite.y + sprite.h,          sprite.z,
            sprite.x + sprite.w, sprite.y,          sprite.z,
            sprite.x + sprite.w, sprite.y+sprite.h, sprite.z,
        )

        let textureIndex = buffers.textures.length
        let tex = sprite.texture
        // TODO: set normal coords
        buffers.textures.push( // two triangles = rect
            tex.x, tex.y, 
            tex.x, tex.y + tex.h,
            tex.x + tex.w, tex.y,

            tex.x, tex.y + tex.h, 
            tex.x + tex.w, tex.y,
            tex.x + tex.w, tex.y+tex.h,
            tex.x + tex.w, tex.y+tex.h,
        )

        buffers.updateFlags.v = true

        const indexes = {v: vertIndex, t: textureIndex}
        usedIndexes.push(indexes)
        return indexes;
    }
}

SpriteManager.prototype.release = function(type, indexes){
    // choose buffer type
    let buffers;
    if(type == 'static'){
        buffers = this.static
    } else if (type == 'dynamic') {
        buffers = this.dynamic
    } else {return}

    // clear verticles
    buffers.verticles.splice(indexes.v, this.VERTICLES_OFFSET)     
    // clear textures
    buffers.textures.splice(indexes.t, this.TEXTURES_OFFSET)
    // offset indexes
    let idxToDel = buffers.usedIndexes.indexOf(indexes)
    buffers.usedIndexes.splice(idxToDel, 1)
    for(let i = idxToDel; i < buffers.usedIndexes.length; i++){
        buffers.usedIndexes[i].v -= this.VERTICLES_OFFSET
        buffers.usedIndexes[i].t -= this.TEXTURES_OFFSET
    }

    buffers.updateFlags.v = true
}