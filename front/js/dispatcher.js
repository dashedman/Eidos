function Dispatcher(state, el) {
    // id of the game loop to handle
    this._state = state

	this.pressedKeys = new Uint8Array(128)
    this.pressedOnce = new Set()

    this.mouse = {
        pressed: false,
        clicked: false,
        x: 0,
        y: 0,
        oldX: 0,
        oldY: 0,
    }

    el.addEventListener('keydown', function(event) {
        this.pressedKeys[event.keyCode] = true
        this.pressedOnce.add(event.keyCode)
    });
    el.addEventListener('keyup', function(event) {
        this.pressedKeys[event.keyCode] = false
    });

    el.addEventListener('mousedown', (e)=>{
        this.mouse.pressed = true
        this.mouse.x = e.clientX
        this.mouse.y = e.clientY
    })
    el.addEventListener('mouseup', (e)=>{
        this.mouse.pressed = false
        this.mouse.x = e.clientX
        this.mouse.y = e.clientY
    })
    el.addEventListener('click', (e)=>{
        this.mouse.clicked = true
        this.mouse.x = e.clientX
        this.mouse.y = e.clientY
    })
}