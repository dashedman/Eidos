class SpriteManager {
    static handlerPattern = {
        data: new Float32Array(),
        offset: 1,
        needUpdate: false,
    }
    
    constructor(state) {
        this._state = state
        this.sprites = []
        this._needZSorting = false

        // buffer of position of verticles
        this.positionHandler = Object.assign({}, SpriteManager.handlerPattern, {offset: 3 * 6})
        // buffer of uv texture coords
        this.textureHandler = Object.assign({}, SpriteManager.handlerPattern, {offset: 2 * 6})
    }

    createSprite(texture, ...mixins){
        let bufferIndexes = this.allocate()
        let sprite = new Sprite(this, bufferIndexes, texture, ...mixins)
        this.sprites.push(sprite)
        return sprite
    }

    async as_createSprite(texture, ...mixins){
        let sprite = this.createSprite(texture, ...mixins)
        await sprite.waitInit
        return sprite
    }

    _allocateWithHandler(handler) {
        // пошаговое предельное управление памятью
        let newIndex = handler.data.length
        let old_data = handler.data
        handler.data = new Float32Array(handler.data.length + handler.offset)
        handler.data.set(old_data)
        return newIndex
    }
    allocate() {
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
        handler.needUpdate = true
    }
    release(spriteToDel) {
        spriteToDelIndex = this.sprites.indexOf(spriteToDel)
        if(spriteToDelIndex != -1){
            let indexes = spriteToDel._bufferIndexes
            // clear verticles
            this._releaseWithHandler(this.positionHandler, indexes.p)
            // clear textures
            this._releaseWithHandler(this.textureHandler, indexes.t)

            this.sprites.splice(spriteToDel, 1)

            for(let spriteIndex = spriteToDelIndex; spriteIndex < this.sprites.length; spriteIndex++){
                sprite._bufferIndexes.p = sprite._bufferIndexes.p - this.positionHandler.offset
                sprite._bufferIndexes.t = sprite._bufferIndexes.t - this.textureHandler.offset
            }
        }
    }

    requestZSorting(){
        if(!this._needZSorting){
            this._needZSorting = true
            this.deferredZSorting()
        }
    }
    
    async deferredZSorting(){
        if(this._needZSorting){
            this._needZSorting = false;
            this.sortByZIndex()
        }
    }

    sortByZIndex(){
        // shake sorting items by z index of sprite 
        // perfect for sorting after inserting one item
        let poshand = this.positionHandler
        
        // create aray with z indexes
        let zIndexArray = new Array(poshand.data.length / poshand.offset)
        for(let index = 0; index < zIndexArray.length; index++){
            zIndexArray[index] = {
                z: poshand.data[index*poshand.offset+2],
                unsortIndex: index
            }
            
            console.log( index,  this.sprites[index]._bufferIndexes)
        }

        // shake sort
        let floorIndex = 0;
        let ceilIndex = zIndexArray.length - 1;
        let lastSwapIndex = -1;
        while(floorIndex < ceilIndex){

            // up
            for(let index = floorIndex; index < ceilIndex; index++){
                // compare z indexes
                if(zIndexArray[index].z > zIndexArray[index + 1].z){
                    // swap
                    let tmp = zIndexArray[index];
                    zIndexArray[index] = zIndexArray[index + 1];
                    zIndexArray[index + 1] = tmp;

                    lastSwapIndex = index
                }
            }
            ceilIndex = lastSwapIndex;

            if(floorIndex >= ceilIndex) break;
            // down
            for(let index = ceilIndex; index > floorIndex; index--){
                // compare z indexes
                if(zIndexArray[index].z < zIndexArray[index - 1].z){
                    // swap
                    let tmp = zIndexArray[index];
                    zIndexArray[index] = zIndexArray[index - 1];
                    zIndexArray[index - 1] = tmp;

                    lastSwapIndex = index
                }
            }
            floorIndex = lastSwapIndex;
        }

        // setting with positionhandler
        let newData = new Float32Array(poshand.data.length)
        let newSprites = new Array(this.sprites.length)

        for(let index = 0; index < zIndexArray.length; index++){
            let oldIndex = zIndexArray[index].unsortIndex*poshand.offset
            for(let shift=0; shift < poshand.offset; shift++)
                newData[index*poshand.offset + shift] = poshand.data[oldIndex + shift]

            // swap
            newSprites[index] = this.sprites[zIndexArray[index].unsortIndex]
            // update sprite indexes
            newSprites[index]._bufferIndexes.p = index*poshand.offset
            newSprites[index]._bufferIndexes.t = index*this.textureHandler.offset
            console.log( zIndexArray[index].unsortIndex, index,  newSprites[index]._bufferIndexes)
        }

        poshand.data = newData
        poshand.needUpdate = true
        this.sprites = newSprites
    }

    sortByZIndex_quick(){
        // quick sorting items by z index of sprite 
    }

    get vertCount(){
        // return number of verticles
        return this.sprites.length * 6
    }
}



