"use strict"
import Dispatcher from './interactions/interactions.js'
import Renderer from './graphics/graphics.js'
import Network from './network/network.js'
import Physics from './physics/physics.js'
import Entities from './entities/entities.js'
import Logic from './logic.js'

import Camera from './utils/camera.js';
import TimeManager from './utils/time.js'


// ==========================================
// State of the game
//
// To store and manage game elements
// ==========================================

export default class Statement {
    /**
     * getting extended classes
     * 
     * @param {Dispatcher} dispatcher 
     * @param {Renderer} renderer 
     * @param {Physics} physics 
     * @param {Logic} logic 
     * @param {Network} network 
     * @param {Entities} entities 
     */
    constructor(dispatcher, renderer, physics, logic, network, entities) {
        // id of the game loop to handle
        this.loop = {
            id: -1,
            interval: 60
        }
        this.time = new TimeManager()

        this.camera = new Camera()

        this.dispatcher = dispatcher
        this.render = renderer
        this.network = network
        this.physics = physics
        this.logic = logic
        this.entities = entities // array of entities

        this.dispatcher._state = this
        this.render._state = this
        this.network._state = this
        this.physics._state = this
        this.logic._state = this
        this.entities._state = this
    }

    /**
     * 
     * @param {Object} param0 
     */
    async prepare({
        dispatcherSettings, renderSettings, 
        networkSettings, physicsSettings, 
        logicSettings, entitesSettings
    }) {
        console.debug('Preparing Statement...')
        await Promise.all([
            this.dispatcher.prepare(dispatcherSettings),
            this.render.prepare(renderSettings),
            this.network.prepare(networkSettings),
            this.physics.prepare(physicsSettings),
            this.logic.prepare(logicSettings),
            this.entities.prepare(entitesSettings),
        ])
        console.debug('Statement prepeared.')
    }
    run() {
        // Start a Render loops	
        let gameIteraction = () => {
            // calc time
            this.time.calc()
            const deltaTimeSec = this.time.deltaTime / 1000

            this.physics.update(deltaTimeSec)
            this.logic.update(deltaTimeSec)

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
        this.render.stop()
    }

    /**
     * 
     * @param {Number} delay 
     */
    setLoopDelay(delay) {
        this.loop.interval = delay
    }
}
