function Texture(state, name, src ){
    this._state = state
    
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
}

Texture.prototype.delete = function(){
    // release memory buffer
    this._state.render.textureManager.pop(this.name);
}

Texture.prototype.setAtlas = function(coords){
    this.atlasCoords = Object.assign({}, coords)
    // TODO reset verticles
}