"use strict"

import { Renderer } from "../render.js"
import { Rect } from "./rect.js"

export default class LineManager {
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
    constructor(render){
        const gl = render.gl
        this._render = render
        /** @type {Array<>} */
        this.lines = []

        // buffer of position of verticles
        this.positionHandler = Object.assign({}, LineManager.handlerPattern, {offset: 3 * 2})
        this.positionHandler._glBuffer = gl.createBuffer()
        // buffer of rgba color for every vertex
        this.colorHandler = Object.assign({}, LineManager.handlerPattern, {offset: 4 * 2})
        this.colorHandler._glBuffer = gl.createBuffer()
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
        let colorIndex = this._allocateWithHandler(this.colorHandler)
        let buffIndex = { p: positionIndex, c: colorIndex }
        this.lines.push(buffIndex)
        return buffIndex
    }

    _releaseWithHandler(handler, index){
        // пошаговое предельное управление памятью
        let old_data = handler.data
        handler.data = new Float32Array(handler.data.length - handler.offset)
        handler.data.set(old_data.subarray(0, index))
        handler.data.set(old_data.subarray(index + handler.offset), index)
        handler.needUpdate = true
    }

    release(lineBuffToDel) {
        lineToDelIndex = this.lines.indexOf(lineBuffToDel)
        if(lineToDelIndex != -1){
            // clear verticles
            this._releaseWithHandler(this.positionHandler, lineBuffToDel.p)
            // clear colors
            this._releaseWithHandler(this.colorHandler, lineBuffToDel.c)

            this.lines.splice(lineToDelIndex, 1)

            for(let lineIndex = lineToDelIndex; lineIndex < this.lines.length; lineIndex++){
                let otherLineBuff = this.lines[lineIndex]
                otherLineBuff.p = otherLineBuff.p - this.positionHandler.offset
                otherLineBuff.c = otherLineBuff.c - this.colorHandler.offset
            }
        }
    }

    get vertCount(){
        // return number of verticles
        return this.lines.length * 2
    }

    ///**
    //  * 
    //  * @param {[number, number, number]} position1 - [X, Y, Z] coords of first line vertex
    //  * @param {[number, number, number]} position2 - [X, Y, Z] coords of second line vertex
    //  * @param {[number, number, number] | [number, number, number, number]} color1 - rgb or rgba color of first vertex
    //  * @param {[number, number, number] | [number, number, number, number]} [color2] - rgb or rgba color of second vertex
    //  * @returns 
    //  */
    // createLine(position1, position2, color1, color2=null){
    //     if(color2 === null) {
    //         color2 = color1
    //     }

    //     let bufferIndexes = this.allocate()
    //     let line = new Line(this, bufferIndexes, texture, ...mixins)
    //     this.lines.push(line)
    //     return line
    // }

    /**
     * 
     * @param {[number, number, number, number] | [number, number, number]} color 
     * @returns 
     */
    createRect(color){
        return new Rect(this, color)
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

        // colors
        gl.enableVertexAttribArray(locals.a_color);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorHandler._glBuffer);
        // update buffer
        if (this.colorHandler.needUpdate) {
            gl.bufferData(gl.ARRAY_BUFFER, this.colorHandler.data, gl.DYNAMIC_DRAW);
            this.colorHandler.needUpdate = false
        }
        gl.vertexAttribPointer(locals.a_color, 4, gl.FLOAT, false, 0, 0);

        // draw
        gl.drawArrays(gl.LINES, 0, this.vertCount);
    }
}
