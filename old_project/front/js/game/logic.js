"use strict"

import { Logic as EngineLogic } from "./../engine/engine.js"
import Camera from "../engine/utils/camera.js"
import World from "../engine/entities/enviroment/world.js"
import Creature from "../engine/entities/creatures/base.js"
import User from "../engine/entities/creatures/user.js"
import { DRAW_GROUND_PLAN } from "../engine/graphics/constants.js"
import { autils } from "../engine/utils/utils.js"
import { Player } from "../engine/entities/entities.js"
import { waitTick } from "../engine/utils/async_utils.js"

export default class Logic extends EngineLogic {
    constructor(world, debugMode=false) {
        super(debugMode)

        /** @type {User} */
        this.player = null
        /** @type {Map<number, User>} */
        this.users = new Map()
        /** @type {Camera} */
        this.camera = null
        /** @type {World} */
        this.world = world

        this._prepeared = false
    }

    async prepare() {
        console.debug('Preparing Logic...')
        const ratio = state.render.canvas.width / state.render.canvas.height
        this.camera = this._state.camera
        this.camera.setRatio(ratio)
        this.camera.setPosition(0, 0, -10)
        this.camera.speed = 5
        this.camera.setMovingMode(Camera.MOVING_MODES.LINEAR)

        await this._state.render.getPrepareIndicator()
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
     * @param {number} sessionId 
     */
    initPlayer(sessionId) {
        console.log('Init player')
        let player = new Player(this._state, {}, {x: NaN, y: NaN, h: 1.5}, this._state.dispatcher)
        this.setPlayer(player)
        player.setSessionId(sessionId)

        this.users.set(player.sessionId, player)
    }

    async waitForPlayer() {
        console.log('Wait for player')
        let startWait = performance.now()
        // wait 40 sec
        while (startWait + 40000 > performance.now()) {
            if (this.player !== null && this.player.x !== NaN && this.player.y !== NaN) {
                return
            }
            await waitTick()
        }

        throw new Error('Player coordinates not loaded')
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
     * @param {Array<{id: number, x: number, y: number, vx: number, vy: number}>} users 
     */
    updateUsersPositions(users){
        let current_ids_to_del = new Set(this.users.keys())

        for(let userUpdate of users) {
            let user = this.users.get(userUpdate.id)
            current_ids_to_del.delete(userUpdate.id)
            if(user !== undefined) {
                user.x = userUpdate.x
                user.y = userUpdate.y
                user.pbox.vx = userUpdate.vx
                user.pbox.vy = userUpdate.vy
            } else {
                if (userUpdate.id == this.player.sessionId) {
                    console.error('Player detected in created users!')
                    continue
                }

                let yellow_pixel = this._state.render.textureManager.getByName('yellow')
                user = this._state.entities.create(
                    User, 
                    yellow_pixel, 
                    DRAW_GROUND_PLAN.MAIN,
                    {
                        x: userUpdate.x, 
                        y: userUpdate.y,
                        h: 1.5
                    })
                user.setSessionId(userUpdate.id)
                user.pbox.vx = userUpdate.vx
                user.pbox.vy = userUpdate.vy
                this.users.set(user.sessionId, user)
            }
        }

        // delete others
        for(let session_id of current_ids_to_del){
            let user = this.users.get(session_id)
            this.users.delete(session_id)
            user.sprite.release()
        }
    }

    async waitForWorld() {
        console.log('Wait for world')
        let startWait = performance.now()
        // wait 40 sec
        while (startWait + 40000 > performance.now()) {
            if (this.world.mainLayer !== null) {
                return
            }
            await waitTick()
        }

        if (this.world.mainLayer === null) 
            throw new Error('World not loaded')
    }

    /**
     * 
     * @param {{tid: string, x: number, y: number, rotate_bits: number}[]} cellsData 
     */
    updateMap(cellsData) {
        this.world.updateMap(cellsData)
        if(this.debugMode) {
            for(let chunk of this.world.mainLayer.chunks.values()){
                let chunk_box = {
                    x: chunk.x * chunk.width, 
                    y: chunk.y * chunk.height,
                    w: chunk.width, 
                    h: chunk.height, 
                }
                this._state.render.addToHighlight(chunk_box, [0, 0, 1])
            }
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
