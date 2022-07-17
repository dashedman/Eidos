"use strict"
import Statement from '../statement.js';
import Deque from '../utils/deque.js';
import { WebRTCConnection } from './connection/webrtc_connection.js';
import { WebSockConnection } from './connection/websock_connection.js';

class Network {
    constructor(config, debugMode=false) {
        /** @type {Statement} */
        this._state = null
        /** @type {WebSocket} */
        this.socket = null
        /** @type {Deque<{case: String, data: Object}>} */
        this.requestsQueue = new Deque()
        /** @type {boolean} */
        this.debugMode = debugMode
    }

    async prepare() {
        console.debug('Preparing Network...')
    }

    run() {}
    stop() {}
}


export default Network
export {
    Network,
    WebRTCConnection,
    WebSockConnection
}
