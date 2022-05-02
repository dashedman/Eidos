"use strict"
import engine from "../engine/engine.js"
import Statement from "../engine/statement.js"
import * as entities from "../engine/entities/entities.js"
import World from "../engine/entities/enviroment/world.js"
import { DRAW_GROUND_PLAN } from "../engine/graphics/constants.js"
import Physics from "./physic.js"
import Logic from "./logic.js"
let utils = engine.utils.autils


async function initGame(){
    console.log("Game started...")
    let canvas = document.getElementById("viewport");

    let world = new World()

    let dispatcher = new engine.Dispatcher(document)
    let renderer = new engine.Renderer(canvas, true)
    let physics = new Physics(world, true)
    let logic = new Logic(world)
    let network = new engine.Network()
    let entities = new engine.Entities()

    let state = window.state = new engine.Statement(
        dispatcher, renderer,
        physics, logic,
        network, entities
    )

    state.setLoopDelay(0.01)
    let mapConfig = await utils.loadJsonResources('resources/Test ph  (4).json')
    await state.prepare({
        render: {
            tilesets: mapConfig.tilesets
        },
    })
    state.run()
}

// start
initGame()
