class SpriteManager {
    static handlerPattern = {
        data: new Float32Array(),
        offset: 1,
        used: [],
        needUpdate: false,
    }
    
    constructor(state) {
        this._state = state
        this.sprites = []

        positionHandler = Object.assign({
            offset: 3 * 6
        }, SpriteManager.handlerPattern)
        textureHandler = Object.assign({
            offset: 2 * 6
        }, SpriteManager.handlerPattern)
    }

    _allocateWithHandler(handler, verticles) {
        // new data index
        let dataIndex = handler.data.length
        handler.date.push(
            ...verticles
        )
        handler.needUpdate = true
        return dataIndex
    }
    allocate(type, sprite) {
        let positionIndex = this._allocateWithHandler( 
            this.positionHandler,
            [
                sprite.x, sprite.y, sprite.z,
                sprite.x, sprite.y + sprite.h, sprite.z,
                sprite.x + sprite.w, sprite.y, sprite.z,

                sprite.x, sprite.y + sprite.h, sprite.z,
                sprite.x + sprite.w, sprite.y, sprite.z,
                sprite.x + sprite.w, sprite.y + sprite.h, sprite.z
            ]
        )

        buffers.textures.length
        let tex = sprite.texture
        // TODO: set normal coords
        let textureIndex = this._allocateWithHandler(
            this.textureHandler,
            [
                tex.x, tex.y,
                tex.x, tex.y + tex.h,
                tex.x + tex.w, tex.y,

                tex.x, tex.y + tex.h,
                tex.x + tex.w, tex.y,
                tex.x + tex.w, tex.y + tex.h,
                tex.x + tex.w, tex.y + tex.h
            ]
        )
        return { p: position, t: textureIndex }
    }
    
    _releaseWithHandler(handler, index){
        handler.data.splice(index, handler.offset)

        let idxToDel = handler.usedIndexes.indexOf(index)
        handler.usedIndexes.splice(idxToDel, 1)
        for (let i = idxToDel; i < buffers.usedIndexes.length; i++) {
            handler.usedIndexes[i] -= handler.offset
        }
        handler.needUpdate = true
    }
    release(type, indexes) {
        // clear verticles
        this._releaseWithHandler(this.positionHandler, indexes.p)
        // clear textures
        this._releaseWithHandler(this.textureHandler, indexes.t)
    }
}



