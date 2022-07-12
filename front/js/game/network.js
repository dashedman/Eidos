"use strict"

import { Network as EngineNetwork } from './../engine/engine.js'
import Camera from '../engine/utils/camera.js'
import World from '../engine/entities/enviroment/world.js'
import Creature from '../engine/entities/creatures/base.js'
import Dispatcher from './../engine/interactions/dispatcher.js';
import Logic from './logic.js'

export default class Network extends EngineNetwork {
    constructor(logic, world, debugMode=false) {
        super(debugMode)
        this.frameId = null

        /** @type {Logic} */
        this.logic = logic
        /** @type {World} */
        this.world = world
    }

    async prepare({ws_host, ws_port}) {
        await super.prepare()
        await this.logic.getPrepareIndicator()

        let url = `ws://${ws_host}:${ws_port}/ws`
        console.debug('Create websocket by url:', url)
        this.socket = new WebSocket(url)
        this.socket.onclose = this.sock_close_handler.bind(this)
        this.socket.onmessage = this.sock_message_handler.bind(this)

        await new Promise((res, rej) => {
            let sock_open_handler = (e) => {
                console.debug("Соединение установлено. Отправляем данные для регистрации сессии на сервер...")
                let data = {
                    'session': {
                        version: 'v0.0.1'
                    }
                }
                this.socket.send(JSON.stringify(data))
                res()
            }

            this.socket.onopen = sock_open_handler
        })
    }

    sock_message_handler(event) {
        /** @type {{case: String, data: Object}} */
        let message = JSON.parse(event.data)
        switch(message.case) {
            case 'positions':
                return this.logic.updateUsersPositions(message.data.positions)
            case 'set_state':
                return this.logic.reloadPlayerState(message.data.state)
            case 'session': 
                return this.logic.player.setSessionId(message.data.id)
            default:
                console.debug('[SOCKET] Unknown message:', event.data)
        }
    }

    sock_close_handler() {
        console.log('[SOCKET] Connection was closed!')
    }

    sock_error_handler(e) {
        console.log('[SOCKET] Catch the error:', e)
    }

    update() {
        this.request('position', {
            'x': this.logic.player.x,
            'y': this.logic.player.y
        })

        while(!this.requestsQueue.isEmpty()){
            let request = this.requestsQueue.popLeft()
            this.socket.send(JSON.stringify(request))
        }
    }

    run() {
        let loop = () => {
            this.update()
            this.frameId = setTimeout(loop, 100)
        }
        loop()
    }

    stop() {
        clearTimeout(this.frameId)
    }

    /**
     * 
     * @param {String} command
     * @param {Object} options
     */
    request(command, options={}) {
        this.requestsQueue.push({
            'case': command,
            'data': options
        })
    }
}
