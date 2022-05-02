"use strict"

import { Logic as EngineLogic } from './../engine/engine.js'
import Camera from '../engine/utils/camera.js'
import World from '../engine/entities/enviroment/world.js'
import Creature from '../engine/entities/creatures/base.js'
import Dispatcher from './../engine/interactions/dispatcher.js';

export default class Logic extends EngineLogic {
    constructor(world, debugMode=false) {
        super(debugMode)

        /** @type {Entity} */
        this.player = null
        /** @type {Camera} */
        this.camera = null
        /** @type {World} */
        this.world = world
    }

    async prepare({layers}) {
        console.debug('Preparing Logic...')
        const ratio = state.render.canvas.width / state.render.canvas.height
        this.camera = this._state.camera
        this.camera.setRatio(ratio)
        this.camera.setPosition(0, 0, -10)
        this.camera.setMovingMode(Camera.MOVING_MODES.LINEAR)

        await this._state.render.getPrepareIndicator()
        this.world.fromLayers(layers)
        if(this.debugMode) {
            for(let chunk of this.world.mainLayer.chunks.values()){
                let chunk_box = {
                    x: chunk.x * chunk.width, 
                    y: chunk.y * chunk.height,
                    w: chunk.width, 
                    h: chunk.height, 
                }
                this._state.render.addToHighlight(chunk_box, [0, 0, 255])
            }
        }
        console.debug('Logic prepeared.')
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
     * @param {Number} deltaTimeSec - time difference between previous and current ticks in seconds
     */
    update(deltaTimeSec) {
        this.updateControl(deltaTimeSec)
    }

    updateControl(deltaTimeSec) {
        let disp = this._state.dispatcher
        if(disp.pressedKeys[Dispatcher.KEY.A]){
            this.player.pbox.vx -= deltaTimeSec;
        }
        if(disp.pressedKeys[Dispatcher.KEY.D]){
            this.player.pbox.vx += deltaTimeSec;
        }
        if(disp.pressedKeys[Dispatcher.KEY.S]){
            this.player.pbox.vy -= deltaTimeSec;
        }
        if(disp.pressedKeys[Dispatcher.KEY.W]){
            this.player.pbox.vy += deltaTimeSec;
        }
        if(disp.pressedKeys[Dispatcher.KEY.SPACE]){
            this.player.pbox.vx = 0;
            this.player.pbox.vy = 0;
        }
        // if(disp.pressedKeys[Dispatcher.KEY.X]){
        //     newCamPos[2] -= deltaTime;
        // }
        // if(disp.pressedKeys[Dispatcher.KEY.Z]){
        //     newCamPos[2] += deltaTime;
        // }
    }
}
