import { Dispatcher } from './interactions/dispatcher.js'
import { Renderer } from './graphics/render.js'
import { Network } from './network/network.js'
import { Physics } from './physics/base.js'
import { Entities, Player, enviroment } from './entities/entities.js'
import { TimeManager, Camera } from './utils/utils.js'

import { Logic } from './logic.js'


// ==========================================
// State of the game
//
// To store and manage game elements
// ==========================================

export class Statement {
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
        this.terrain = new enviroment.Terrain(this)

        this.camera = new Camera()
    }
    run() {
        // Start a Render loops	
        let gameIteraction = () => {
            // calc time
            this.time.calc()

            this.physics.update()
            this.logic.update()

            // call next iteraction
            this.loop.id = setTimeout(
                gameIteraction,
                this.time.toNext(this.loop.interval) * 1000
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




