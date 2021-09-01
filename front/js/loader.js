async function loadLibs(){
    // крутилка

    // большая загрузка
    let load_chunks = [
        [
            "js/glMatrix-1.2.min.js",
            "js/glsl_math.js",
        ], [
            "js/utils/time.js",
            "js/utils/camera.js",

            "js/textures/base.js",
            "js/textures/color.js",
            "js/textures/getAtlas.js",
            "js/textures/manager.js",
        ], [
            "js/sprites/base.js",
            "js/sprites/manager.js",
        ], [
            "js/entities/base.js",
            "js/entities/location.js",
            "js/entities/player.js",

            "js/physics/base.js",
            "js/physics/box.js",
        ], [
            "js/dispatcher.js",
            "js/network.js",
            "js/render.js",
            "js/statement.js",
        ]
    ]
    
    for(let load_chunk of load_chunks){
        let load_process = []
        for(let src of load_chunk){
            load_process.push(
                utils.initScript(src, 'defer')
            )
        }
        await Promise.all(load_process)
    }

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
    let test_sprite = state.render.staticSpriteManager.createSprite(test_texture)
    
    state.test = [test_texture, test_sprite]
    console.log(state.test)

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