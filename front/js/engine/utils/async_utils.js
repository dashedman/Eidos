async function waitTick () {
    return new Promise( (resolve) => {
        setTimeout(()=>{
        resolve()
        }, 0)
    })
}

async function waitTicks (ticks = 1) {
    for(let i=0; i<ticks; i++){
        await utils.waitTick()
    }
}

async function loadRowResources(url){
    return new Promise(function(resolve, reject){
        const request = new XMLHttpRequest()
        request.open('GET', url, true)
        request.onload = function(){
            if (request.status >=200 && request.status < 300){
                resolve(request)
            }else{
                reject("Error: HTTP-status - " + request.status + " on resource " + url)
            }
        }
        request.send()
    })
}

async function loadTextResources(url){
    return (await loadRowResources(url)).responseText
}

async function loadJsonResources(url){
    return new Promise(function(resolve, reject){
        const request = new XMLHttpRequest()

        request.open('GET', url, true)
        request.onload = function(){
            if (request.status >=200 && request.status < 300){
                resolve(request.response)
            }else{
                reject("Error: HTTP-status - " + request.status + " on resource " + url)
            }
        }
        request.responseType = 'json'
        request.send()
    })
}
async function loadScript(src, params){
    // load and insert script
    // After load you need wait setTimeout zero
    // to initialize js
    //
    // modificators: defer, async
    return new Promise(function(resolve, reject){
        console.log('Start load: ' + src)
        let newScript = document.createElement('script');
        newScript.type = 'text/javascript';
        newScript.src = src;

        if(params == 'defer') newScript.defer = true
        if(params == 'async') newScript.async = true

        document.head.appendChild(newScript);

        newScript.onload = ()=>{
            console.log('Finish load: ' + src)
            resolve(newScript)
        }
        newScript.onerror = (e) => reject('Failed to load script ['+src+']: '+e)
    })
}

async function getImageLoadPromise(img){
    return new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
    });
}

async function initScript(src, params) {
    await utils.loadScript(src, params)
    await utils.waitTick()
}
async function waitAfter (target, tasks){
    await target
    await Promise.all(tasks)
}
function supportCanvas (width, height){
    let canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    //canvas.style = "display: none;"
    //document.body.appendChild(canvas)
    return canvas
}

export default {
    waitAfter,
    waitTick,
    waitTicks,
    loadTextResources,
    loadJsonResources,
    loadScript,
    getImageLoadPromise,
    initScript,
    supportCanvas
}
