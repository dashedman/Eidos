class Texture {
    constructor(manager, name, ...params) {
        // params is [src: str]
        this._manager = manager;
        this._traced = new Set()

        this.atlasCoords = {};

        this.loadState;
        this.name = name;
        this.loadData( ...params );
    }
    loadData(src) {
        this.image = new Image();
        this.image.src = src;

        this.loadState = new Promise((resolve, reject) => {
            this.image.onload = resolve;
            this.image.onerror = reject;
        });
    }
    delete() {
        // release memory buffer
        this._manager.pop(this.name);
    }
    setAtlas(coords) {
        console.log('set', this.name, coords)
        this.atlasCoords = Object.assign({}, coords);
        // TODO reset verticles
        for(const traced_obj of this._traced){
            traced_obj.traceEvent(this)
        }
    }
    addToTrace(obj){
        this._traced.add(obj)
    }
    removeFromTrace(obj){
        this._traced.delete(obj)
    }
}



