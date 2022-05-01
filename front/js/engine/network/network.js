"use strict"
import { WebRTCConnection } from './connection/webrtc_connection.js';
import { WebSockConnection } from './connection/websock_connection.js';

class Network {
    constructor() {
        this._state = null
        this.socket = null
    }

    async updatePlayer() {
        // TODO
        state.player.updateFromNet({ x: 0, y: 0 })
    }

    async updateLocation() {
        // TODO
        state.location.updateFromNet([
            new Block(-50, -10, 100, 5),
        ])
    }

    async prepare() {
        console.debug('Preparing Network...')
        console.debug('Network prepeared.')
    }
}


export default Network
export {
    Network,
    WebRTCConnection,
    WebSockConnection
}
