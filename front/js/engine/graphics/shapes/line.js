"use strict"
import LineManager from './manager';

export default class Line {
    /**
     * @constructor
     * @param { LineManager } manager 
     * @param {  [number, number, number, number] | [number, number, number] } color1 
     * @param {?([number, number, number, number] | [number, number, number])} color2 
     */
     constructor(manager, color1, color2=null){
        this._manager = manager
        
        /** @type {Object<String, number>} */
        this._bufferIndex = this._manager.allocate()

        /** @type {{x1: number, y1: number, z1: number, x2: number, y2: number, z2: number}} */
        this._capsCoords = {x1: 0, y1: 0, z1: 0, x2: 0, y2: 0, z2: 0}

        /** @type {[number, number, number, number]} */
        this.color1 = null
        /** @type {[number, number, number, number]} */
        this.color2 = null
        this.setColors(color1 || [1, 1, 1, 1], color2)
    }

    release() {
        this._manager.release(this._bufferIndex)
    }

    updateColor() {
        const _c = this._manager.colorHandler.data

        const [r1, g1, b1, a1] = this.color1
        const [r2, g2, b2, a2] = this.color2

        // first cap
        _c[this._bufferIndex.c]     = r1
        _c[this._bufferIndex.c + 1] = g1
        _c[this._bufferIndex.c + 2] = b1
        _c[this._bufferIndex.c + 3] = a1
        // second cap
        _c[this._bufferIndex.c + 4] = r2
        _c[this._bufferIndex.c + 5] = g2
        _c[this._bufferIndex.c + 6] = b2
        _c[this._bufferIndex.c + 7] = a2

        this._manager.colorHandler.needUpdate = true
    }

    /**
     * 
     * @param {[number, number, number, number] | [number, number, number]} color 
     */
    setColors(color1, color2=null) {
        if(color2 === null) {
            color2 = [...color1]
        }
        if(color1.length === 3) {
            // add alpha chanel
            color1.push(1)
        }
        if(color2.length === 3) {
            // add alpha chanel
            color2.push(1)
        }

        this.color1 = color1
        this.color2 = color2
        this.updateColor()
    }

    /**
     * @param {number} value
     */
    set lx1(value) {
        if(this._capsCoords.x1 != value){
            this._capsCoords.x1 = value
            this._manager.positionHandler.data[this._bufferIndex.p] = value;
            this._manager.positionHandler.needUpdate = true
        }
    }

    /**
     * @param {number} value
     */
    set ly1(value) {
        if(this._capsCoords.y1 != value){
            this._capsCoords.y1 = value
            this._manager.positionHandler.data[this._bufferIndex.p + 1] = value;
            this._manager.positionHandler.needUpdate = true
        }
    }

    /**
     * @param {number} value
     */
     set lz1(value) {
        if(this._capsCoords.z1 != value){
            this._capsCoords.z1 = value
            this._manager.positionHandler.data[this._bufferIndex.p + 2] = value;
            this._manager.positionHandler.needUpdate = true
        }
    }

    /**
     * @param {number} value
     */
    set lx2(value) {
        if(this._capsCoords.x2 != value){
            this._capsCoords.x2 = value
            this._manager.positionHandler.data[this._bufferIndex.p + 3] = value;
            this._manager.positionHandler.needUpdate = true
        }
    }
    
    /**
     * @param {number} value
     */
    set ly2(value) {
        if(this._capsCoords.y2 != value){
            this._capsCoords.y2 = value
            this._manager.positionHandler.data[this._bufferIndex.p + 4] = value;
            this._manager.positionHandler.needUpdate = true
        }
    }

    /**
     * @param {number} value
     */
     set lz2(value) {
        if(this._capsCoords.z2 != value){
            this._capsCoords.z2 = value
            this._manager.positionHandler.data[this._bufferIndex.p + 5] = value;
            this._manager.positionHandler.needUpdate = true
        }
    }
    get lx1(){return this._capsCoords.x1}
    get ly1(){return this._capsCoords.y1}
    get lz1(){return this._capsCoords.z1}
    get lx2(){return this._capsCoords.x2}
    get ly2(){return this._capsCoords.y2}
    get lz2(){return this._capsCoords.z2}
}