"use strict"
import engine from "../engine/engine.js"
import Statement from "../engine/statement.js"
import World from "../engine/entities/enviroment/world.js"
import Physics from "./physic.js"
import Logic from "./logic.js"
import Renderer from './render.js';
import Creature from "../engine/entities/creatures/base.js"
import { DRAW_GROUND_PLAN } from "../engine/graphics/constants.js"
let utils = engine.utils.autils


async function initGame(){
    console.log("Game started...")
    let canvas = document.getElementById("viewport");

    let world = new World()

    let dispatcher = new engine.Dispatcher(document)
    let renderer = new Renderer(canvas, true)
    let physics = new Physics(world, true)
    let logic = new Logic(world, true)
    let network = new engine.Network()
    let entities = new engine.Entities()

    let state = window.state = new engine.Statement(
        dispatcher, renderer,
        physics, logic,
        network, entities
    )
    state.setLoopDelay(0.01)
    world.state = state

    let mapConfig = await utils.loadJsonResources('resources/Test ph  (4).json')
    await state.prepare({
        renderSettings: {
            tilesets: mapConfig.tilesets
        },
        logicSettings: {
            layers: mapConfig.layers
        }
    })

    await debugInit(state)
    state.run(true)
}
/**
 * 
 * @param {Statement} state 
 */
async function debugInit(state) {
    // TODO: remove
    let green_pixel = state.render.createColorTexture(-4, "green", [0, 255, 0, 255], 1, 1)
    let greenMan = state.entities.create(Creature, green_pixel, DRAW_GROUND_PLAN.MAIN, {x: 0, y: 0, h: 1.5})
    state.logic.setPlayer(greenMan)
}
// start
initGame()
