utils = {
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
      newScript.onerror = (e) => reject('Failed on load script ['+src+']: '+e)
    })
  },
  initScript: async function (src){
    // load, insert and initialize script
    return new Promise(function(resolve, reject){
      loadScript(src)
      .then(() => setTimeout(resolve, 0))
      .catch(reject)
    })
  },
}