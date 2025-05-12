"use strict"

import Dispatcher from "./interactions/interactions.js"
import Renderer from "./graphics/graphics.js"
import Network from "./network/network.js"
import Physics from "./physics/physics.js"
import Entities from "./entities/entities.js"
import Logic from "./logic.js"
import Storage from "./storage/storage.js"

import Camera from "./utils/camera.js";
import TimeManager from "./utils/time.js"


// ==========================================
// State of the game
//
// To store and manage game elements
// ==========================================

export default class Statement {
    PIXELS_MEASURE = 32
    GAME_SPEED = 1
    
    /**
     * getting extended classes
     * 
     * @param {Dispatcher} dispatcher 
     * @param {Renderer} renderer 
     * @param {Physics} physics 
     * @param {Logic} logic 
     * @param {Network} network 
     * @param {Entities} entities 
     * @param {Storage} storage
     */
    constructor(dispatcher, renderer, physics, logic, network, entities, storage) {
        // id of the game loop to handle
        this.loop = {
            id: -1,
            interval: 60
        }
        this.time = new TimeManager()
        this.agregatedDelta = 0

        this.camera = new Camera()

        this.dispatcher = dispatcher
        this.render = renderer
        this.network = network
        this.physics = physics
        this.logic = logic
        this.entities = entities // array of entities
        this.storage = storage

        this.dispatcher._state = this
        this.render._state = this
        this.network._state = this
        this.physics._state = this
        this.logic._state = this
        this.entities._state = this
        this.storage._state = this

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

            const rawTimeDelta = (timeStamp - this.prevTimeStamp) * this.GAME_SPEED
            const timeDelta = rawTimeDelta * 0.001 // sec

            // 20 ticks per sec
            // this.agregatedDelta += timeDelta
            // if(this.agregatedDelta >= 0.05) {
            //     this.logic.update(this.agregatedDelta)
            //     this.physics.update(this.agregatedDelta)
            //     this.agregatedDelta = 0
            // }

            this.logic.update(timeDelta)
            this.physics.update(timeDelta)

            // camera control
                    
            if(this.dispatcher.pressedKeys[Dispatcher.KEY.PLUS]) {
                this.camera.setPositionZ(this.camera.position[2] + timeDelta)
                console.log(this.camera.position)
            } else if(this.dispatcher.pressedKeys[Dispatcher.KEY.MINUS]) {
                this.camera.setPositionZ(this.camera.position[2] - timeDelta)
                console.log(this.camera.position)
            }
            
            // Draw world
            this.render.update(timeDelta)
            this.render.updateAnimations(rawTimeDelta)
            this.render.draw();
            // call next frame
            this.frameId = requestAnimationFrame(renderFrame);
            this.prevTimeStamp = timeStamp
        };

        console.log('Starting main loop!')
        this.frameId = requestAnimationFrame(renderFrame);
        this.prevTimeStamp = performance.now()
        this.is_running = true
    }

    stop() {
        if(this.is_running){
            clearTimeout(this.loop.id)
            cancelAnimationFrame(this.frameId)
            this.render.stop()
            this.network.close()
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
