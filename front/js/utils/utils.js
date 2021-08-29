var utils = {
  waitTick: () => new Promise( (resolve) => {
    setTimeout(()=>{
      console.log('tick')
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
  loadScript: function (src){
    // load and insert script
    // After load you need wait setTimeout zero
    // to initialize js
    return new Promise(function(resolve, reject){
      let newScript = document.createElement('script');
      newScript.type = 'text/javascript';
      newScript.src = src;
      document.head.appendChild(newScript);

      newScript.onload = resolve
      newScript.onerror = (e) => reject('Failed to load script ['+src+']: '+e)
    })
  },
  initScript: async function (src){
    // load, insert and initialize script
    return new Promise(function(resolve, reject){
      console.log('Start init: '+src)
      utils.loadScript(src)
      .then(() => {
        setTimeout(() => {
          console.log('Finish init: '+src)
          resolve()
        }, 0)
      })
      .catch()
    })
  },
  supportCanvas: function (width, height){
    let canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    //canvas.style = "display: none;"
    //document.body.appendChild(canvas)
    return canvas
  },
  removeCanvas: function (canvas){
    document.body.removeChild(canvas)
  }
}