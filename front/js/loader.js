async function loadLibs(){
    await Promise.all([
        initScript("js/glMatrix-1.2.min.js"),
        initScript("js/glsl_math.js"),
    ])

    // крутилка


    // большая загрузка
    await allWithProgress([
        initScript("js/utils/time.js"),
        initScript("js/utils/camera.js"),

        initScript("js/textures/base.js"),

        initScript("js/sprites/base.js"),
        initScript("js/sprites/manager.js"),

        initScript("js/entities/base.js"),
        initScript("js/entities/location.js"),
        initScript("js/entities/player.js"),

        initScript("js/physics/base.js"),

        initScript("js/dispatcher.js"),
        initScript("js/network.js"),
        initScript("js/render.js"),
        initScript("js/logic.js"),
        initScript("js/statement.js"),
    ])

    // крутилка офф
}


async function loadGame(state){
    await state.render.as_prepare()

    await state.netwotk.updatePlayer()
    await state.network.updateLocation()
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