class Texture {
    constructor(state, name, src) {
        this._state = state;

        this.atlasCoords = {};

        this.loadState;
        this.name = name;
        this.loadImage(src);
    }
    loadImage(src) {
        this.image = new Image();
        this.image.src = src;

        this.loadState = new Promise((resolve, reject) => {
            this.image.onload = resolve;
            this.image.onerror = reject;
        });
    }
    delete() {
        // release memory buffer
        this._state.render.textureManager.pop(this.name);
    }
    setAtlas(coords) {
        this.atlasCoords = Object.assign({}, coords);
        // TODO reset verticles
        let evt = new CustomEvent('resetTextureAtlas', {detail: 
            {
                texture_name: this.name
            }
        })
        document.dispatchEvent(evt)
    }
}



