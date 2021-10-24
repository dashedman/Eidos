// LOADER SCRIPT
async function initGame(){
    await utils.loadScript("js/loader.js")
    await loadLibs()

    console.log("Game started...")
    let canvas = document.getElementById("viewport");

    state = new Statement(canvas)
    state.loop.interval = 0.016
    
    await loadGame(state)

    state.run()
}

async function loadGame(state){
    await state.render.waitInit
    state.camera.setPosition(0, 0, -5)

    let texture1 = state.render.textureManager.createTexture('run', 'resources/dwarf_run.png')
    texture1.frameNumber = 6
    let texture2 = state.render.textureManager.createTexture('roll', 'resources/dwarf_roll.png')
    texture2.frameNumber = 5

    let test_sprite = await state.render.staticSpriteManager.as_createSprite(
        texture1, 
        SpriteMixins.iAnimated, 
        SpriteMixins.iStated
    )
    test_sprite.addState(1, texture2)
    // test_sprite.initAnimation()
    test_sprite.sw = 0.5
    test_sprite.sh = 0.5
    
    state.test = test_sprite
    console.log(state.test)

    test_sprite = await state.render.staticSpriteManager.as_createSprite(
        texture1, 
        SpriteMixins.iAnimated, 
        SpriteMixins.iStated
    )
    test_sprite.addState(1, texture2)
    // test_sprite.initAnimation()
    test_sprite.sw = -0.5
    test_sprite.sh = 0.5

    test_sprite.sz = 1
    
    state.test2 = test_sprite
    console.log(state.test2)

    //await state.netwotk.updatePlayer()
    //await state.network.updateLocation()
}

function gameFrame(){
    state.test.doAnimation(state.time.time)
}

// start
initGame()