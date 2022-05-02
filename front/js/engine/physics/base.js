"use strict"

import { NotImplementedError } from "../exceptions.js";
import Statement from "../statement.js";
import PhBox from "./colliders/box.js";
import PhPoint from './colliders/point.js';
import PhInertiaBox from './colliders/inertia_box.js';

export default class Physics {
    constructor(debugMode=false) {
        this.debugMode = debugMode
        if(this.debugMode) {
            this.debugShapes = []
        }
        /** @type {Statement} */
        this._state = null;
        /** @type {Set<PhInertiaBox>} */
        this.inertedColliders = new Set()
    }

    update(){
        throw new NotImplementedError()
    }

    async prepare() {
        console.debug('Preparing Physics...')
        console.debug('Physics prepeared.')
    }

    /**
     * 
     * @param {PhPoint} colliderCls 
     * @param {*} args 
     * @returns 
     */
    createCollider(colliderCls, args) {
        let collider = new colliderCls(args)
        return collider
    }

    createPhysicBox({x, y, w, h}={}, cls=PhBox) {
        let pbox = this.createCollider(cls, {x: x, y: y, w: w, h: h})
        if(this.debugMode){
            let hightlightRect = this._state.render.debugLineManager.createRect([255, 255, 0])
            hightlightRect.watchFor(pbox)
            this.debugShapes.push(hightlightRect)
        }
        return pbox
    }

    createInertedCollider({x, y, w, h}={}) {
        let iphbox = this.createPhysicBox({x: x, y: y, w: w, h: h}, PhInertiaBox)
        this.inertedColliders.add(iphbox)
        return iphbox
    }
}
