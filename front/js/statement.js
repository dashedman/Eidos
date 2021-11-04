// ==========================================
// State of the game
//
// To store and manage game elements
// ==========================================

class Statement {
    constructor(canvas_el) {
        // id of the game loop to handle
        this.loop = {
            id: -1,
            interval: 0
        }
        this.time = new TimeManager()

        this.dispatcher = new Dispatcher(this, document)
        this.render = new Renderer(this, canvas_el)
        this.network = new Network(this)
        this.physics = new Physics(this)
        this.logic = new Logic(this)

        // Set up entities and location
        this.player = new Player()
        this.entities = new Entities(this) // array of entities
        this.terrain = new Terrain(this)

        this.camera = new Camera()
    }
    run() {
        // Start a Render loops	
        let gameIteraction = () => {
            // calc time
            this.time.calc()

            // Simulate world
            gameFrame()

            // console.log(this.debugger.cameraCenter.sx, this.debugger.cameraCenter.sw)
            this.debugger.cameraCenter.sx = this.camera.position[0] - this.debugger.cameraCenter.sw / 2
            this.debugger.cameraCenter.sy = this.camera.position[1] - this.debugger.cameraCenter.sh / 2

            this.physics.update()
            this.logic.update()

            // call next iteraction
            this.loop.id = setTimeout(
                gameIteraction,
                this.time.toNext(this.loop.interval)
            )
        }
        this.loop.id = setTimeout(gameIteraction, 0)

        // start render loop
        this.render.run()
    }
    stop() {
        clearTimeout(this.loop.id)
    }
}




