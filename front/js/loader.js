async function loadLibs(){
    // крутилка

    // большая загрузка
    let load_chunks = [
        [
            "js/gl-matrix-min.js",
            "js/glsl_math.js",
        ], [
            "js/utils/time.js",
            "js/utils/camera.js",
            "js/utils/map2d.js",

            "js/textures/base.js",
        ], [
            "js/textures/color.js",
            "js/textures/getAtlas.js",
            "js/textures/manager.js",
            
            "js/sprites/base.js",
            "js/sprites/manager.js",
            "js/sprites/mixins.js",
        ], [
            "js/entities/base.js",
            "js/entities/block.js",
            "js/entities/location.js",
            "js/entities/player.js",
            "js/entities/entities.js",

            "js/entities/enviroment/terrain.js",
            "js/entities/enviroment/layer.js",
            "js/entities/enviroment/chunk.js",

            "js/physics/base.js",
            "js/physics/box.js",
            "js/physics/manager.js",
        ], [
            "js/dispatcher.js",
            "js/network.js",
            "js/render.js",
            "js/statement.js",
            "js/logic.js",
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

    initLibs()
    // крутилка офф
}

function initLibs(){
    window.mat4 = glMatrix.mat4
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