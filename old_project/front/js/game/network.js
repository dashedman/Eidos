"use strict"

import { Network as EngineNetwork } from "./../engine/engine.js"
import World from "../engine/entities/enviroment/world.js"
import Logic from "./logic.js"
import { waitTick } from "../engine/utils/async_utils.js"

/**
 * @enum {number}
 */
const MessageCode = {
    Init: 0,
    Positions: 1,
    Map: 2,
}
    


export default class Network extends EngineNetwork {
    constructor(logic, world, debugMode=false) {
        super(debugMode)
        this.frameId = null

        /** @type {Logic} */
        this.logic = logic
        /** @type {World} */
        this.world = world

        this.initiated = false
    }

    get render() {
        return this._state.render
    }

    get storage() {
        return this._state.storage
    }

    async prepare({ws_host, ws_port}) {
        await super.prepare()
        await this.logic.getPrepareIndicator()

        let url = (ws_host == '127.0.0.1' ? 'ws' : 'wss') + `://${ws_host}:${ws_port}/`
        console.debug('Create websocket by url:', url)
        this.socket = new WebSocket(url)
        this.socket.onclose = (e) => this.sock_close_handler.bind(e)
        this.socket.onmessage = (e) => this.sock_message_handler(e)

        await new Promise((res, rej) => {
            let sock_open_handler = (e) => {
                console.debug("Соединение установлено. Отправляем данные для регистрации сессии на сервер...")
                let data = {
                    'type': MessageCode.Init,
                    'session': {
                        version: 'v0.0.1'
                    }
                }
                this.socket.send(JSON.stringify(data))
                res()
            }

            this.socket.onopen = sock_open_handler
        })

        let startWait = performance.now()
        // wait init message for 20 sec
        while (!this.initiated && performance.now() < startWait + 20000) {
            await waitTick()
        }

        if (!this.initiated) {
             new Error('Timeout! Websocket connection is not initiated!!!')
        }
    }

    async sock_message_handler(event) {
        /** @type {{type: MessageCode, data: Object}} */
        let message = JSON.parse(event.data)
        switch(message.type) {
            case MessageCode.Positions:
                if(this.initiated) {
                    this.logic.updateUsersPositions(message.data.positions)
                }
                return 
            case MessageCode.Map:
                if(this.initiated) {
                    this.logic.updateMap(message.data)
                }
                return 
            case MessageCode.Init: 
                /* TODO: 
                    - add durations of state animations
                */
                console.log('Catch init message from server!')
                this.world.settings.chunkSize = message.data.chunk_size
                console.log(message.data.tilesets)
                await this.render.updateTilesetData(message.data.tilesets)
                for (let [characterName, skinSet] of Object.entries(message.data.skin_sets)) {
                    this.storage.skinsList.addSkinsSet(characterName, skinSet)
                }

                this.logic.initPlayer(message.data.id)
                this.initiated = true
                return 
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

    close() {
        this.socket.close()
    }

    /**
     * 
     * @param {MessageCode} command
     * @param {*} options
     */
    async request(command, options=null) {
        this.socket.send(JSON.stringify({
            'type': command,
            'data': options
        }))
    }

    /**
     * 
     * @param {*} request
     */
    async send(request) {
        this.socket.send(JSON.stringify(request))
    }
}
