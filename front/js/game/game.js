"use strict"

import engine from "../engine/engine.js"
import Statement from "../engine/statement.js"
import World from "../engine/entities/enviroment/world.js"
import Physics from "./physic.js"
import Logic from "./logic.js"
import Renderer from './render.js'
import Storage from "./storage.js"
import { Player } from './../engine/entities/creatures/player';
import { loadGame } from './data/init';
let utils = engine.utils.autils


async function initGame(){
    console.log("Game started...")
    let canvas = document.getElementById("viewport");
    let debugMode = true
    // let debugMode = true
    let world = new World()

    let dispatcher = new engine.Dispatcher(canvas, debugMode)
    let renderer = new Renderer(canvas, debugMode)
    let physics = new Physics(world, debugMode)
    let logic = new Logic(world, debugMode)
    let network = new engine.Network(logic, world, debugMode)
    let storage = new Storage(debugMode)
    // let network = new Network(logic, world, debugMode)
    let entities = new engine.Entities()

    let state = window.state = new engine.Statement(
        dispatcher, renderer,
        physics, logic,
        network, entities,
        storage
    )
    state.setLoopDelay(0.01)
    world.state = state

    let mapConfig = await utils.loadJsonResources('resources/maps/polygon.json')
    await state.prepare({
        render_config: {
            tilesets: mapConfig.tilesets,
            glyphInfo: {
                resource: 'font.png',
                signWidth: 8,
                signHeight: 8,
                markdown: {
                    'a': { x:  0, y:  0 },
                    'b': { x:  8, y:  0 },
                    'c': { x: 16, y:  0 },
                    'd': { x: 24, y:  0 },
                    'e': { x: 32, y:  0 },
                    'f': { x: 40, y:  0 },
                    'g': { x: 48, y:  0 },
                    'h': { x: 56, y:  0 },
                    'i': { x:  0, y:  8 },
                    'j': { x:  8, y:  8 },
                    'k': { x: 16, y:  8 },
                    'l': { x: 24, y:  8 },
                    'm': { x: 32, y:  8 },
                    'n': { x: 40, y:  8 },
                    'o': { x: 48, y:  8 },
                    'p': { x: 56, y:  8 },
                    'q': { x:  0, y: 16 },
                    'r': { x:  8, y: 16 },
                    's': { x: 16, y: 16 },
                    't': { x: 24, y: 16 },
                    'u': { x: 32, y: 16 },
                    'v': { x: 40, y: 16 },
                    'w': { x: 48, y: 16 },
                    'x': { x: 56, y: 16 },
                    'y': { x:  0, y: 24 },
                    'z': { x:  8, y: 24 },
                    '0': { x: 16, y: 24 },
                    '1': { x: 24, y: 24 },
                    '2': { x: 32, y: 24 },
                    '3': { x: 40, y: 24 },
                    '4': { x: 48, y: 24 },
                    '5': { x: 56, y: 24 },
                    '6': { x:  0, y: 32 },
                    '7': { x:  8, y: 32 },
                    '8': { x: 16, y: 32 },
                    '9': { x: 24, y: 32 },
                    '-': { x: 32, y: 32 },
                    '*': { x: 40, y: 32 },
                    '!': { x: 48, y: 32 },
                    '?': { x: 56, y: 32 },
                }
            }
        },
        logic_config: {
            layers: mapConfig.layers,
        },
        network_config: {
            ws_host: document.domain,
            ws_port: 8000
        }
    })

    state.storage.skinsList = loadGame(state)

    let player = new Player(state, {}, {x: 0, y: 5, h: 1.5}, state.dispatcher)
    state.logic.setPlayer(player)

    await debugInit(state)
    state.run(true)
}
/**
 * 
 * @param {Statement} state 
 */
async function debugInit(state) {
    console.debug('Start debug init')
    // TODO: remove
    let green_pixel = state.render.createColorTexture("green", [0, 128, 0, 255], 1, 1)
    let yellow_pixel = state.render.createColorTexture("yellow", [128, 128, 0, 255], 1, 1)
    let red_pixel = state.render.createColorTexture("red", [255, 0, 0, 255], 1, 1)
    console.debug('End debug init')
}
// start
initGame()
