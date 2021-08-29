function Network(state) {
    this._state = state
    this.socket = null
}

Network.prototype.updatePlayer = async function(){
    // TODO
    state.player.updateFromNet({x: 0, y: 0})
}

Network.prototype.updateLocation = async function(){
    // TODO
    state.location.updateFromNet([
        new Block(-50, -10, 100, 5),
    ])
}