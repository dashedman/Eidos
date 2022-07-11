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

        this.is_running = false
    }

    /**
     * 
     * @param {Object} param0 
     */
    async prepare({
        dispatcher_config, render_config, 
        network_config, physics_config, 
        logic_config, entites_config
    }) {
        console.debug('Preparing Statement...')
        await Promise.all([
            this.dispatcher.prepare(dispatcher_config),
            this.render.prepare(render_config),
            this.network.prepare(network_config),
            this.physics.prepare(physics_config),
            this.logic.prepare(logic_config),
            this.entities.prepare(entites_config),
        ])
        console.debug('Statement prepeared.')
    }
    run() {
        if(this.is_running) {
            console.warn('Loop already running')
            return
        }
        let renderFrame = (timeStamp) => {
            // calc timeDelta in seconds
            const timeDelta = (timeStamp - this.prevTimeStamp) / 1000

            this.physics.update(timeDelta)
            this.logic.update(timeDelta)
            // Draw world
            this.render.update(timeDelta)
            // TODO: rework animations
            this.render.updateAnimations()
            this.render.draw();
            // call next frame
            this.frameId = requestAnimationFrame(renderFrame);
            this.prevTimeStamp = timeStamp
        };
        this.frameId = requestAnimationFrame(renderFrame);
        this.prevTimeStamp = performance.now()
        // this.network.run()
        this.is_running = true
    }
    stop() {
        if(this.is_running){
            clearTimeout(this.loop.id)
            cancelAnimationFrame(this.frameId)
            this.render.stop()
            this.network.stop()
            this.is_running = false
        }   
    }

    /**
     * 
     * @param {Number} delay 
     */
    setLoopDelay(delay) {
        this.loop.interval = delay
    }
}
