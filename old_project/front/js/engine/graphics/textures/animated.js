"use strict"
import { autils } from "../../utils/utils.js";
import Texture from "./base.js";

export default class TexturesSequence extends Texture{

    /**
     * 
     * @param {TextureManager} manager 
     * @param {*} id 
     * @param {String} name 
     * @param {*} loadParams 
     * @param {*} frameParams 
     */
    constructor(manager, id, name, loadParams, frameParams={}) {
        super(manager, id, name, loadParams)
        
        this.frameNumber = frameParams.number || 1
        this.frameOffset = frameParams.offset || 1 // frame width
    }
    
}




