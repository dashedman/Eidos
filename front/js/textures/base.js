class Texture {
    constructor(state, name, src) {
        this._state = state;
        this._traced = new Set()

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
        for(const [traced_obj, _] of this._traced){
            traced_obj.trace_event(this)
        }
    }
    addToTrace(obj){
        this._traced.add(obj)
    }
    removeFromTrace(obj){
        this._traced.delete(obj)
    }
}



