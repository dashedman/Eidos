"use strict"

import { Renderer as EngineRenderer } from './../engine/engine.js'

export default class Renderer extends EngineRenderer {

    update(timeStamp) {
        this._state.logic.player.sync()
        if(this.debugMode){
            for(let [targ, rect] of this.debugShapes.entries()){
                rect.rx = targ.x
                rect.ry = targ.y
                rect.rw = targ.w
                rect.rh = targ.h
            }
        }
        this._state.camera.calculatePositionByTargets(timeStamp)
    }
}
