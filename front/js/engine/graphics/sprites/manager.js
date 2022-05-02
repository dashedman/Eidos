"use strict"
import { Renderer } from "../render.js";
import { Sprite } from "./base.js";


export class SpriteManager {
    static handlerPattern = {
        data: new Float32Array(),
        offset: 1,
        needUpdate: false,
        _glBuffer: null
    }
    
    /**
     * 
     * @param {Renderer} render
     */
    constructor(render) {
        const gl = render.gl
        this._render = render
        this.sprites = []

        // buffer of position of verticles
        this.positionHandler = Object.assign({}, SpriteManager.handlerPattern, {offset: 3 * 6})
        this.positionHandler._glBuffer = gl.createBuffer()
        // buffer of uv texture coords
        this.textureHandler = Object.assign({}, SpriteManager.handlerPattern, {offset: 2 * 6})
        this.textureHandler._glBuffer = gl.createBuffer()
    }

    createSprite({texture, mixins=[]}){
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

    get vertCount(){
        // return number of verticles
        return this.sprites.length * 6
    }

    /**
     * 
     * @param {WebGL2RenderingContext.GLenum} usage - a GLenum specifying the intended usage pattern of the data store for optimization purposes. 
     * Possible values:
     * - gl.STATIC_DRAW: The contents are intended to be specified once by the application, and used many times as the source for WebGL drawing and image specification commands.
     * - gl.DYNAMIC_DRAW: The contents are intended to be respecified repeatedly by the application, and used many times as the source for WebGL drawing and image specification commands.
     * - gl.STREAM_DRAW: The contents are intended to be specified once by the application, and used at most a few times as the source for WebGL drawing and image specification commands. 
     * @param {Object} locals - container for varables with shader locations
     */
    draw(usage, locals){
        const gl = this._render.gl

        // positions
        gl.enableVertexAttribArray(locals.a_position);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionHandler._glBuffer);
        // update buffer
        if (this.positionHandler.needUpdate) {
            gl.bufferData(gl.ARRAY_BUFFER, this.positionHandler.data, usage);
            this.positionHandler.needUpdate = false
        }
        gl.vertexAttribPointer(locals.a_position, 3, gl.FLOAT, false, 0, 0);

        // textures
        gl.enableVertexAttribArray(locals.a_texture);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureHandler._glBuffer);
        // update buffer
        if (this.textureHandler.needUpdate) {
            gl.bufferData(gl.ARRAY_BUFFER, this.textureHandler.data, gl.DYNAMIC_DRAW);
            this.textureHandler.needUpdate = false
        }
        gl.vertexAttribPointer(locals.a_texture, 2, gl.FLOAT, false, 0, 0);

        // draw
        gl.drawArrays(gl.TRIANGLES, 0, this.vertCount);
    }
}

/**
 * Sprite Manager that automaticaly sorting sprites by Z coord(depth)
 */
export class SortingSpriteManager extends SpriteManager {
    constructor(render){
        super(render)
        /** @type {Boolean} */
        this._needZSorting = false
    }

    requestZSorting(){
        if(!this._needZSorting){
            this._needZSorting = true
            setTimeout(() => {this.deferredZSorting()}, 0)
        }
    }
    
    deferredZSorting(){
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
        }

        // shake sort
        let floorIndex = 0;
        let ceilIndex = zIndexArray.length - 1;
        let lastSwapIndex = -1;
        while(floorIndex < ceilIndex){

            // up
            for(let index = floorIndex; index < ceilIndex; index++){
                // compare z indexes
                if(zIndexArray[index].z < zIndexArray[index + 1].z){ // desc
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
                if(zIndexArray[index].z > zIndexArray[index - 1].z){ // desc
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
        let newTexData = new Float32Array(this.textureHandler.data.length)
        let newSprites = new Array(this.sprites.length)


        for(let index = 0; index < zIndexArray.length; index++){

            // swap position vertcles
            let oldIndex = zIndexArray[index].unsortIndex * poshand.offset
            for(let shift = 0; shift < poshand.offset; shift++)
                newData[index*poshand.offset + shift] = poshand.data[oldIndex + shift]

            // swap texture verticles
            oldIndex = zIndexArray[index].unsortIndex * this.textureHandler.offset
            for(let shift = 0; shift < this.textureHandler.offset; shift++)
                newTexData[index*this.textureHandler.offset + shift] = this.textureHandler.data[oldIndex + shift]

            // swap sprites
            newSprites[index] = this.sprites[zIndexArray[index].unsortIndex]

            // update sprite indexes
            newSprites[index]._bufferIndexes.p = index*poshand.offset
            newSprites[index]._bufferIndexes.t = index*this.textureHandler.offset
        }

        poshand.data = newData
        poshand.needUpdate = true

        this.textureHandler.data = newTexData
        this.textureHandler.needUpdate = true

        this.sprites = newSprites
    }
}

