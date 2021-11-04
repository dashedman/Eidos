var utils = {
  waitTick: () => new Promise( (resolve) => {
    setTimeout(()=>{
      resolve()
    }, 0)
  }),
  waitTicks: async (ticks = 1) => {
    for(let i=0; i<ticks; i++){
      await utils.waitTick()
    }
  },
  loadTextResources: function (url){
    return new Promise(function(resolve, reject){
      const request = new XMLHttpRequest()
      request.open('GET', url, true)
      request.onload = function(){
        if (request.status >=200 && request.status < 300){
          resolve(request.responseText)
        }else{
          reject("Error: HTTP-status - " + request.status + " on resource " + url)
        }
      }
      request.send()
    })
  },
  loadJsonResources(url){
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
  },
  loadScript: function (src, params){
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
  },
  getImageLoadPromise(img){
    return new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
    });
  },
  initScript: async function (src, params) {
    await utils.loadScript(src, params)
    await utils.waitTick()
  },
  waitAfter: async function(target, tasks){
    await target
    await Promise.all(tasks)
  },
  supportCanvas: function (width, height){
    let canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    //canvas.style = "display: none;"
    //document.body.appendChild(canvas)
    return canvas
  }
}