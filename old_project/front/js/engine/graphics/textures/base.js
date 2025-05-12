"use strict"
import { autils } from "../../utils/utils.js"
import TextureManager from "./manager.js";

export default class Texture {
    /**
     * 
     * @param {TextureManager} manager 
     * @param {*} id 
     * @param {String} name 
     * @param {*} loadParams 
     * @param {*} frameParams 
     */
    constructor(manager, id, name, loadParams, frameParams={}) {
        // params is [src: str]
        this._manager = manager;
        this._traced = new Set()

        /** @type {{x: number, y: number, w: number, h: number}} */
        this.atlasCoords = {};

        /** @type {number} */
        this.frameNumber = frameParams.number || 1
        /** @type {number} */
        this.frameOffset = frameParams.offset || 1 // frame width

        this.loadState;
        this.stateLoaded = false;
        this.id = id;
        this.name = name;
        this.loadData( loadParams );
    }

    loadData({src}) {
        this.image = new Image();
        this.image.src = src;

        this.loadState = autils.getImageLoadPromise(this.image).then(() => {
            this.stateLoaded = true
        })
    }

    release() {
        // release memory buffer
        this._manager.pop(this.id);
    }

    /**
     * 
     * @param {{w: number, h: number, x: number, y: number}} coords
     */
    setAtlas(coords) {
        this.atlasCoords = Object.assign({}, coords);
        this.computeFrameOffset()

        for(const traced_obj of this._traced){
            traced_obj.traceEvent(this)
        }
    }

    addToTrace(obj){
        this._traced.add(obj)
    }

    removeFromTrace(obj){
        this._traced.delete(obj)
    }

    computeFrameOffset(){
        this.frameOffset = this.atlasCoords.w / this.frameNumber
    }
}



