async function loadLibs(){
    await Promise.all([
        utils.initScript("js/glMatrix-1.2.min.js"),
        utils.initScript("js/glsl_math.js"),
    ])

    // крутилка


    // большая загрузка
    await Promise.all([
        utils.initScript("js/utils/time.js", 'defer'),
        utils.initScript("js/utils/camera.js", 'defer'),

        utils.initScript("js/textures/base.js", 'defer'),
        utils.initScript("js/textures/color.js", 'defer'),
        utils.initScript("js/textures/getAtlas.js", 'defer'),
        utils.initScript("js/textures/manager.js", 'defer'),

        utils.initScript("js/sprites/base.js", 'defer'),
        utils.initScript("js/sprites/manager.js", 'defer'),

        utils.initScript("js/entities/base.js", 'defer'),
        utils.initScript("js/entities/location.js", 'defer'),
        utils.initScript("js/entities/player.js", 'defer'),

        utils.initScript("js/physics/base.js", 'defer'),
        utils.initScript("js/physics/box.js", 'defer'),

        utils.initScript("js/dispatcher.js", 'defer'),
        utils.initScript("js/network.js", 'defer'),
        utils.initScript("js/render.js", 'defer'),
        utils.initScript("js/logic.js", 'defer'),
        utils.initScript("js/statement.js", 'defer'),
    ])

    // крутилка офф
}


async function loadGame(state){
    console.log('hoba')
    await state.render.as_prepare()

    console.log('hoba')
    let test_texture = state.render.textureManager.createTexture('test', 'resources/test.jpg')
    let test_col_texture = state.render.textureManager.createColorTexture(
        'color', 
        [ 0, 255, 0 , 255],
        50, 30
    )
    let test_sprite = state.render.staticSpriteManager.createSprite(test_texture)
    console.log(test_sprite)

    //await state.netwotk.updatePlayer()
    //await state.network.updateLocation()
}


async function allWithProgress(promises, callback){
    callback = callback || (()=>{})

    let workedPromises = promises.map((p, index)=>{
        return new Promise((res, rej)=>{
            p.then(res(index)).catch(rej)
        })
    })
    while(workedPromises.length > 0){
        let ready_index = await Promise.race(workedPromises)
        workedPromises.splice(ready_index, 1)

        callback(1 - workedPromises.length/promises.length)
    }
    await Promise.all(promises)
}