import { WebRTCConnection } from './connection/webrtc_connection.js';
import { WebSockConnection } from './connection/websock_connection.js';

export default {
    Network,
    WebRTCConnection,
    WebSockConnection
}
export {
    Network,
    WebRTCConnection,
    WebSockConnection
}

class Network {
    constructor(state) {
        this._state = state
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
}
