
"use strict"

import { Logic as EngineLogic } from './../engine/engine.js'
import Camera from '../engine/utils/camera.js'
import World from '../engine/entities/enviroment/world.js'
import Creature from '../engine/entities/creatures/base.js'

export default class Logic extends EngineLogic {
    constructor(world) {
        /** @type {Entity} */
        this.player = null
        /** @type {Camera} */
        this.camera = null
        /** @type {World} */
        this.world = world
    }

    async prepare() {
        const ratio = state.render.canvas.width / state.render.canvas.height
        this.camera = this._state.camera
        this.camera.setRatio(ratio)
        this.camera.setPosition(0, 0, -10)
        this.camera.setMovingMode(Camera.MOVING_MODES.LINEAR)
    }

    /**
     * 
     * @param {Creature} creature
     */
    setPlayer(creature){
        this.player = creature
        this.camera.clearTargets()
        this.camera.addTarget(this.player)
    }

    /**
     * @param {Number} deltaTime - time difference between previous and current ticks in milliseconds
     */
    update(deltaTime) {
        this.updateControl()
        
    }

    updateControl() {
        let disp = this._state.dispatcher
        if(disp.pressedKeys[Dispatcher.KEY.A]){
            this.player.x -= deltaTime;
        }
        if(disp.pressedKeys[Dispatcher.KEY.D]){
            this.player.x += deltaTime;
        }
        if(disp.pressedKeys[Dispatcher.KEY.S]){
            this.player.y -= deltaTime;
        }
        if(disp.pressedKeys[Dispatcher.KEY.W]){
            this.player.y += deltaTime;
        }
        // if(disp.pressedKeys[Dispatcher.KEY.X]){
        //     newCamPos[2] -= deltaTime;
        // }
        // if(disp.pressedKeys[Dispatcher.KEY.Z]){
        //     newCamPos[2] += deltaTime;
        // }
    }
}
