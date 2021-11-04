class Terrain {
    constructor(state){
        this.state = state
        this.layers = []
        this.decorations = []
        this.mainLayer = null

        this.settings = {}
    }

    /**
     * 
     * @param {[JSON]} layers 
     */
    fromLayers(jsonLayers){
        // load terrain from layers
        // created by tilemap editor
        for(let jsonLayer of jsonLayers){
            this.fromLayer(jsonLayer)
        }

        //this.recalcZforLayers()
    }

    /**
     * 
     * @param {JSON} jsonLayer 
     */
    fromLayer(jsonLayer){
        let z = this.ZfromParallax(jsonLayer.parallaxx || 1)
        if(jsonLayer.type == "tilelayer"){
            let layer = new Layer(this, jsonLayer.name, z, jsonLayer.isMain)

            this.layers.push(layer)
            if(layer.isMain){
                this.mainLayer = layer
            }

            for(let chunk of jsonLayer.chunks){
                layer.fromChunk(chunk)
            }
        }

        if(jsonLayer.type == "objectgroup"){
            for(const obj of jsonLayer.objects){
                const texture = this.state.render.textureManager.get(obj.gid)

                console.log(obj.gid, texture)
                if(texture === undefined)
                    continue
                
                const decoration = this.state.entities.create(
                    Decoration, 
                    texture, 
                    {
                        x: obj.x/32,
                        y: -obj.y/32,
                        width: obj.width/32,
                        height: obj.height/32
                    }
                )
                this.decorations.push(decoration)
            }
        }
    }

    ZfromParallax(parallax){
        const camera = this.state.camera
        const z0 = 1 - camera.position[2]
        const alpha = Math.atan(0.5 / z0)
        const zx = 0.5 / Math.tan(parallax * alpha) + camera.position[2]
        // magic formule )))
        console.debug("PARALAX", parallax, "->", zx)
        return zx;
    }

    recalcZforLayers(){
        let lastZ = -Infinity;
        for(const layer of this.layers){
            if(layer.z <= lastZ){
                console.log("Found intersept z", layer.name)
                layer.setZ(lastZ + 0.1)
            }
            lastZ = layer.z
        }
    }
}