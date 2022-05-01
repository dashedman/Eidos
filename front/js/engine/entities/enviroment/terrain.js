"use strict"
import { Layer } from "./layer.js";
import { Decoration } from "../block.js";

import Statement from "../../statement.js";
import { SPRITE_ROLES } from "../../graphics/graphics.js"

export class Terrain {
    /**
     * 
     * @param {Statement} state 
     */
    constructor(state){
        /**
         * @type {Statement}
         */
        this.state = state
        /**
         * @type {Array<Layer>}
         */
        this.layers = []
        this.decorations = []
        this.mainLayer = null

        this.settings = {}
    }

    /**
     * 
     * @param {Array<[JSON]>} jsonLayers 
     */
    fromLayers(jsonLayers){
        // load terrain from layers
        // created by tilemap editor
        let mainIsWas = false
        for(let jsonLayer of jsonLayers.reverse()){
            let isMain = (jsonLayer.properties || []).find((layer_prop) => {
                if(layer_prop.name === "isMain" && layer_prop.value === true) 
                    return true
                return false
            }) !== undefined

            /** @type {SPRITE_ROLES} */
            let ground_plan;
            if(isMain){
                ground_plan = SPRITE_ROLES.MAIN
                mainIsWas = true
            } else {
                if (mainIsWas)
                    ground_plan = SPRITE_ROLES.BACK
                else ground_plan = SPRITE_ROLES.FRONT
            }

            this.fromLayer(jsonLayer, groundPlan)
        }

        // this.fromLayer(jsonLayers[1])

        this.recalcZforLayers()
    }

    /**
     * 
     * @param {JSON} jsonLayer 
     */
    fromLayer(jsonLayer, groundPlan){
        let z = this.ZfromParallax(jsonLayer.parallaxx || 1)
        if(jsonLayer.type == "tilelayer"){
            // check that layer is main layer
            // and they have physicaly 

            let layer = new Layer(this, jsonLayer.name, z, isMain)

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
                const texture = this.state.render.textureManager.getT(obj.gid)

                if(texture === undefined)
                    continue
                
                let roleOnScene = z > 1 ? 'BACK' : 'FRONT'
                const decoration = this.state.entities.create(
                    Decoration, 
                    texture, 
                    roleOnScene,
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
        return zx;
    }

    recalcZforLayers(){
        let lastZ = -Infinity;
        for(const layer of this.layers){
            if(layer.z <= lastZ){
                console.log("Found intersept z", layer.name)
                layer.setZ(lastZ + 0.03)
            }
            lastZ = layer.z
        }
    }
}