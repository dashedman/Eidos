import engine from "../engine/engine.js"
import * as entities from "../engine/entities/entities.js"
import { Terrain } from "../engine/entities/enviroment/terrain.js"
let utils = engine.utils.autils
let Camera = engine.utils.Camera
let Block = entities.Block


async function initGame(){
    console.log("Game started...")
    let canvas = document.getElementById("viewport");

    let dispatcher = new engine.Dispatcher(document)
    let renderer = new engine.Renderer(canvas)
    let physics = new engine.Physics()
    let logic = new engine.Logic()
    let network = new engine.Network()
    let entities = new engine.Entities()

    let state = window.state = new engine.Statement(
        dispatcher, renderer,
        physics, logic,
        network, entities
    )
    state.setLoopDelay(0.01)
    await state.prepare()
    await loadGame(state)
    state.run()
}

/**
 * 
 * @param {engine.Statement} state 
 */
async function loadGame(state){
    const ratio = state.render.canvas.width / state.render.canvas.height
    state.camera.setPosition(0, 0, -10)
    state.camera.setRatio(ratio)
    state.camera.setMovingMode(Camera.MOVING_MODES.CONSTANT)

    // debug map center
    let red_pixel = state.render.createColorTexture(-2, "red", [255, 0, 0, 255], 1, 1)
    let hline = state.render.createSprite({texture: red_pixel}, 'BACK') // horizontal
    hline.sx = -5
    hline.sy = -0.05
    hline.sz = 1.9
    hline.sw = 10
    hline.sh = 0.1
    let vline = state.render.createSprite({texture: red_pixel}, 'BACK') // vertical
    vline.sx = -0.05
    vline.sy = -5
    vline.sz = 1.9
    vline.sw = 0.1
    vline.sh = 10

    // debug map chuncks
    let blue_pixel = state.render.createColorTexture(-3, "blue", [0, 0, 255, 255], 1, 1)
    for(let x = -128; x <= 128; x += 16){
        let x = 0
        vline = state.render.createSprite({texture: blue_pixel}, 'BACK') // vertical
        vline.sx = x - 0.025
        vline.sy = -128
        vline.sw = 0.05
        vline.sh = 256
        vline.sz = 2
    }
    for(let y = -128; y <= 128; y += 16){
        let y = 0
        hline = state.render.createSprite({texture: blue_pixel}, 'BACK') // horizontal
        hline.sx = -128
        hline.sy = y - 0.025
        hline.sw = 256
        hline.sh = 0.05
        hline.sz = 2
    }
    
    let green_pixel = state.render.createColorTexture(-4, "green", [0, 255, 0, 255], 1, 1)
    let greenBlock = state.entities.create(Block, green_pixel, 'MAIN', {x: 0, y: 0})
    state.debugger = {
        dummie: greenBlock
    }
    state.camera.addTarget(greenBlock.pb)


    let mapConfig = await utils.loadJsonResources('resources/Test ph  (4).json')
    console.log(mapConfig)
    for(let tileset of mapConfig.tilesets){
        await state.render.textureManager.fromTileset(tileset)
    }

    state.terrain = new Terrain(state)
    state.terrain.fromLayers(mapConfig.layers)
    
    // for(let layer of state.terrain.layers){
    //     console.debug('layer', layer.name)
    //     for(let chunk of layer.chunks.values()){
    //         console.debug('chunk', chunk.x, chunk.y)
    //         for(let column of chunk.grid){
    //             for(let ceil of column){
    //                 if(ceil !== null) console.debug(
    //                     'ceil', 
    //                     ceil.sprite.sx, 
    //                     ceil.sprite.sy,
    //                     ceil.sprite.sz, 
    //                     ceil.sprite.sw,
    //                     ceil.sprite.sh, 
    //                     ceil
    //                 )
    //             }
    //         }
    //     }
    // }
    //await state.netwotk.updatePlayer()
    //await state.network.updateLocation()
}

// start
initGame()