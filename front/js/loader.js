async function loadLibs(){
    await Promise.all([
        utils.initScript("js/glMatrix-1.2.min.js"),
        utils.initScript("js/glsl_math.js"),
    ])

    // крутилка


    // большая загрузка
    await Promise.all([
        utils.initScript("js/utils/time.js"),
        utils.initScript("js/utils/camera.js"),

        utils.initScript("js/textures/base.js"),
        utils.initScript("js/textures/color.js"),
        utils.initScript("js/textures/manager.js"),
        utils.initScript("js/textures/getAtlas.js"),

        utils.initScript("js/sprites/base.js"),
        utils.initScript("js/sprites/manager.js"),

        utils.initScript("js/entities/base.js"),
        utils.initScript("js/entities/location.js"),
        utils.initScript("js/entities/player.js"),

        utils.initScript("js/physics/base.js"),

        utils.initScript("js/dispatcher.js"),
        utils.initScript("js/network.js"),
        utils.initScript("js/render.js"),
        utils.initScript("js/logic.js"),
        utils.initScript("js/statement.js"),
    ])

    // крутилка офф
}


async function loadGame(state){
    await state.render.as_prepare()

    let test_texture = state.render.textureManager.createTexture('test', 'resources/test.jpg')
    let test_col_texture = state.render.textureManager.createColorTexture(
        'color', 
        [ 0, 255, 0 , 255],
        50, 30
    )
    let test_sprite = new Sprite(state, test_texture)

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