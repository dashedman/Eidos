"use strict"

import { Logic as EngineLogic } from './../engine/engine.js'
import Camera from '../engine/utils/camera.js'
import World from '../engine/entities/enviroment/world.js'
import Creature from '../engine/entities/creatures/base.js'
import Dispatcher from './../engine/interactions/dispatcher.js';
import User from '../engine/entities/creatures/user.js'
import { DRAW_GROUND_PLAN } from '../engine/graphics/constants.js'
import { autils } from '../engine/utils/utils.js'

export default class Logic extends EngineLogic {
    constructor(world, debugMode=false) {
        super(debugMode)

        /** @type {User} */
        this.player = null
        /** @type {User[]} */
        this.users = []
        /** @type {Camera} */
        this.camera = null
        /** @type {World} */
        this.world = world

        this._prepeared = false
    }

    async prepare({layers}) {
        console.debug('Preparing Logic...')
        const ratio = state.render.canvas.width / state.render.canvas.height
        this.camera = this._state.camera
        this.camera.setRatio(ratio)
        this.camera.setPosition(0, 0, -10)
        this.camera.speed = 5
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
        this._prepeared = true
        console.debug('Logic prepeared.')
    }

    async getPrepareIndicator() {
        while(!this._prepeared) {
            await autils.waitTick()
        }
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
     * 
     * @param {Array<{id: number, x: number, y: number}>} users 
     */
    updateUsersPositions(users){
        for(let updated_user of users) {
            let user = this.users.find((user) => user.sessionId == updated_user.id)
            if(user !== undefined) {
                user.x = updated_user.x
                user.y = updated_user.y
            } else {
                if (updated_user.id == this.player.sessionId) 
                    continue

                let yellow_pixel = this._state.render.textureManager.getByName('yellow')
                user = state.entities.create(
                    User, 
                    yellow_pixel, 
                    DRAW_GROUND_PLAN.MAIN,
                    {
                        x: updated_user.x, 
                        y: updated_user.y, 
                        h: 1.5
                    })
                user.setSessionId(updated_user.id)
                this.users.push(user)
            }
        }

        // delete others
        for(let i=0; i<this.users.length; i++){
            let user = this.users[i]
            let updated_user = users.find((updated_user) => user.sessionId == updated_user.id)
            if(updated_user !== undefined) continue

            user.sprite.release()
            this.users.splice(i, 1)
        }
    }

    /**
     * @param {Number} deltaTimeSec - time difference between previous and current ticks in seconds
     */
    update(deltaTimeSec) {
        // updates control and states
        this.player.update(deltaTimeSec)
    }
}
