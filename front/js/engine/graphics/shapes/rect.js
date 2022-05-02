"use strict"

import LineManager from "./manager.js";

export class Rect {
    /**
     * @constructor
     * @param {LineManager} manager 
     * @param {[number, number, number, number] | [number, number, number]} color 
     */
    constructor(manager, color){
        this._manager = manager
        
        /** @type {Array<Object<String, number>>} */
        this._bufferIndexes = [
            this._manager.allocate(),
            this._manager.allocate(),
            this._manager.allocate(),
            this._manager.allocate(),
        ];
        /** @type {{x: number, y: number, z: number, w: number, h:number}} */
        this._rectCoords = {x: 0, y:0, z:0, w:0, h:0}

        /** @type {[number, number, number, number]} */
        this.color = null
        this.mimicTarget = null
        this.setColor(color || [255, 255, 255, 1])
    }

    /**
     * 
     * @param {Object} obj 
     * @param {Number} obj.x 
     * @param {Number} obj.y
     * @param {Number} obj.w - width
     * @param {Number} obj.h - height
     */
    watchFor(obj) {
        this.mimicTarget = obj
    }

    update() {
        this.rx = this.mimicTarget.x
        this.ry = this.mimicTarget.y
        this.rw = this.mimicTarget.w
        this.rh = this.mimicTarget.h
    }

    updateColor() {
        const _c = this._manager.colorHandler.data
        const [r, g, b, a] = this.color
        for(let idx of this._bufferIndexes){
            _c[idx.c] =     _c[idx.c + 4] = r
            _c[idx.c + 1] = _c[idx.c + 5] = g
            _c[idx.c + 2] = _c[idx.c + 6] = b
            _c[idx.c + 3] = _c[idx.c + 7] = a
        }
        this._manager.colorHandler.needUpdate = true
    }

    /**
     * 
     * @param {[number, number, number, number] | [number, number, number]} color 
     */
    setColor(color) {
        if(color.length === 3) {
            // add alpha chanel
            color.push(1)
        }
        this.color = color
        this.updateColor()
    }

    /**
     * @param {number} value
     */
     set rw(value) {
        if(this._rectCoords.w != value){
            this._rectCoords.w = value

            const _p = this._manager.positionHandler.data
            const idx0 = this._bufferIndexes[0].p
            const idx1 = this._bufferIndexes[1].p
            const idx2 = this._bufferIndexes[2].p
            const idx3 = this._bufferIndexes[3].p
            _p[idx0] = _p[idx2 + 3] = _p[idx3] = _p[idx3 + 3] = this._rectCoords.x;
            _p[idx0 + 3] = _p[idx1] = _p[idx1 + 3] = _p[idx2] = this._rectCoords.x + value;
            this._manager.positionHandler.needUpdate = true
        }
    }

    /**
     * @param {number} value
     */
    set rh(value) {
        if(this._rectCoords.h != value){
            this._rectCoords.h = value

            const _p = this._manager.positionHandler.data
            const idx0 = this._bufferIndexes[0].p
            const idx1 = this._bufferIndexes[1].p
            const idx2 = this._bufferIndexes[2].p
            const idx3 = this._bufferIndexes[3].p
            _p[idx1 + 4] = _p[idx2 + 1] = _p[idx2 + 4] = _p[idx3 + 1] = this._rectCoords.y;
            _p[idx0 + 1] = _p[idx0 + 4] = _p[idx1 + 1] = _p[idx3 + 4] = this._rectCoords.y + value;
            this._manager.positionHandler.needUpdate = true
        }
    }
    /**
     * @param {number} value
     */
    set rx(value) {
        if(this._rectCoords.x != value){
            this._rectCoords.x = value

            const _p = this._manager.positionHandler.data
            const idx0 = this._bufferIndexes[0].p
            const idx1 = this._bufferIndexes[1].p
            const idx2 = this._bufferIndexes[2].p
            const idx3 = this._bufferIndexes[3].p
            _p[idx0] = _p[idx2 + 3] = _p[idx3] = _p[idx3 + 3] = value;
            _p[idx0 + 3] = _p[idx1] = _p[idx1 + 3] = _p[idx2] = value + this._rectCoords.w;
            this._manager.positionHandler.needUpdate = true
        }
    }
    /**
     * @param {number} value
     */
    set ry(value) {
        if(this._rectCoords.y != value){
            this._rectCoords.y = value

            const _p = this._manager.positionHandler.data
            const idx0 = this._bufferIndexes[0].p
            const idx1 = this._bufferIndexes[1].p
            const idx2 = this._bufferIndexes[2].p
            const idx3 = this._bufferIndexes[3].p
            _p[idx1 + 4] = _p[idx2 + 1] = _p[idx2 + 4] = _p[idx3 + 1] = value;
            _p[idx0 + 1] = _p[idx0 + 4] = _p[idx1 + 1] = _p[idx3 + 4] = value + this._rectCoords.h;
            this._manager.positionHandler.needUpdate = true
        }
    }
    /**
     * @param {number} value
     */
     set rz(value) {
        if(this._rectCoords.z != value){
            this._rectCoords.z = value

            const _p = this._manager.positionHandler.data
            for(let idx of this._bufferIndexes){
                _p[idx.p + 2] = _p[idx.p + 5] = value
            }
            this._manager.positionHandler.needUpdate = true
        }
    }

    get rx(){return this._rectCoords.x}
    get ry(){return this._rectCoords.y}
    get rz(){return this._rectCoords.z}
    get rw(){return this._rectCoords.w}
    get rh(){return this._rectCoords.h}
}
