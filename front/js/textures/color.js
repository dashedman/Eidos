function ColorTexture( colors, w, h ){
    
    this.x = 0
    this.y = 0
    this.w = w
    this.h = h
    this.atlasCoords = {}

    this.loadState;
    this.loadColors( colors )
}

Texture.prototype.loadColors = function( colors ){
    // render color pixels to image
    let canvas = new OffscreenCanvas(this.w, this.h)
    let ctx = canvas.getContext('2d')
    let pixels = ctx.createImageData(this.w, this.h)
    for (let i = 0; i < pixels.data.length; i++) {
        // Modify pixel data
        pixels.data[i] = colors[i]
    }
    ctx.putImageData(pixels, 0, 0)

    this.image = new Image()
    this.image.src = canvas.toDataUrl()

    this.loadState = new Promise((resolve, reject) => {
        this.image.onload = resolve
        this.image.onerror = reject
    })
    // Add texture to Atlas
    state.render.TextureManager.push(this);
}

Texture.prototype.delete = function(){
    // release memory buffer
    state.render.TextureManager.pop(this);
}

Texture.prototype.setAtlas = function(coords){
    this.atlasCoords = Object.assign({}, coords)
    // TODO reset verticles
}