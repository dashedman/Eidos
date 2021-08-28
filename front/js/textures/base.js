function Texture( name, src ){
    
    this.x = 0
    this.y = 0
    this.w = 0
    this.h = 0
    this.atlasCoords = {}

    this.loadState;
    this.name = name
    this.loadImage( src )
}

Texture.prototype.loadImage = function( src ){
    this.image = new Image()
    this.image.src = src

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