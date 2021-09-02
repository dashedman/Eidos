class SpriteManager {
    static handlerPattern = {
        data: new Float32Array(),
        offset: 1,
        used: [],
        needUpdate: false,
    }
    
    constructor(state) {
        this._state = state
        this.sprites = new Set()
        this.length = 0

        this.positionHandler = Object.assign({}, SpriteManager.handlerPattern, {offset: 3 * 6})
        this.textureHandler = Object.assign({}, SpriteManager.handlerPattern, {offset: 2 * 6})
    }

    createSprite(texture, ...mixins){
        let bufferIndexes = this.allocate()
        let sprite = new Sprite(this, bufferIndexes, texture, ...mixins)
        this.sprites.add(sprite)
        return sprite
    }

    async as_createSprite(texture, ...mixins){
        let sprite = this.createSprite(texture, ...mixins)
        await sprite.waitInit
        return sprite
    }

    _allocateWithHandler(handler) {
        // пошаговое предельное управление памятью
        let dataIndex = handler.data.length
        let old_data = handler.data
        handler.data = new Float32Array(handler.data.length + handler.offset)
        handler.data.set(old_data)
        return dataIndex
    }
    allocate() {
        this.length += 6
        
        let positionIndex = this._allocateWithHandler(this.positionHandler)
        let textureIndex = this._allocateWithHandler(this.textureHandler)

        return { p: positionIndex, t: textureIndex }
    }
    
    _releaseWithHandler(handler, index){
        // пошаговое предельное управление памятью
        let old_data = handler.data
        handler.data = new Float32Array(handler.data.length - handler.offset)
        handler.data.set(old_data.subarray(0, index))
        handler.data.set(old_data.subarray(index + handler.offset), index)

        let idxToDel = handler.usedIndexes.indexOf(index)
        handler.usedIndexes.splice(idxToDel, 1)
        for (let i = idxToDel; i < buffers.usedIndexes.length; i++) {
            handler.usedIndexes[i] -= handler.offset
        }
        handler.needUpdate = true
    }
    release(sprite) {
        if(this.sprites.has(sprite)){
            this.length -= 6
            let indexes = sprite._bufferIndexes
            // clear verticles
            this._releaseWithHandler(this.positionHandler, indexes.p)
            // clear textures
            this._releaseWithHandler(this.textureHandler, indexes.t)

            this.sprites.delete(sprite)
        }
    }
}



