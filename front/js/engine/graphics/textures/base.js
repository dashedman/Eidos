"use strict"
import { autils } from "../../utils/utils.js"

export class Texture {
    constructor(manager, id, name, loadParams, frameParams={}) {
        // params is [src: str]
        this._manager = manager;
        this._traced = new Set()

        this.atlasCoords = {};

        this.frameNumber = frameParams.number || 1,
        this.frameOffset = frameParams.offset || 1, // frame width

        this.loadState;
        this.id = id;
        this.name = name;
        this.loadData( loadParams );
    }
    loadData({src}) {
        this.image = new Image();
        this.image.src = src;

        this.loadState =  autils.getImageLoadPromise(this.image)
    }
    delete() {
        // release memory buffer
        this._manager.pop(this.id);
    }
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



