"use strict"
import { Renderer } from "../../render.js";
import Sprite from "../base.js";
import AnimatedSprite from './../animated';


export default class SpriteManager {
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
        this.animatedSprites = []

        // buffer of position of verticles
        this.positionHandler = Object.assign({}, SpriteManager.handlerPattern, {offset: 3 * 6})
        this.positionHandler._glBuffer = gl.createBuffer()
        // buffer of uv texture coords
        this.textureHandler = Object.assign({}, SpriteManager.handlerPattern, {offset: 2 * 6})
        this.textureHandler._glBuffer = gl.createBuffer()
    }

    createSprite({texture, reversed=false, isAnimated=false}){
        let bufferIndexes = this.allocate()
        let sprite_cls = Sprite
        if(isAnimated) {
            sprite_cls = AnimatedSprite
        }

        let sprite = new sprite_cls(this, bufferIndexes, texture, reversed)
        this.sprites.push(sprite)

        if(isAnimated) {
            this.animatedSprites.push(sprite)
        }
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
        let spriteToDelIndex = this.sprites.indexOf(spriteToDel)
        if(spriteToDelIndex != -1){
            let indexes = spriteToDel._bufferIndexes
            // clear verticles
            this._releaseWithHandler(this.positionHandler, indexes.p)
            // clear textures
            this._releaseWithHandler(this.textureHandler, indexes.t)

            this.sprites.splice(spriteToDelIndex, 1)

            // remove if animated sprite
            const animIndex = this.animatedSprites.indexOf(spriteToDel);
            if (animIndex > -1) {
                this.animatedSprites.splice(animIndex, 1)
            }

            for(let spriteIndex = spriteToDelIndex; spriteIndex < this.sprites.length; spriteIndex++){
                let sprite = this.sprites[spriteIndex]
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
export { SpriteManager }
