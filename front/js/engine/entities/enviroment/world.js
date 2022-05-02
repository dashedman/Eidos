"use strict"
import { Layer } from "./layer.js";
import { Decoration } from "../block.js";

import Statement from "../../statement.js";
import { DRAW_GROUND_PLAN } from "../../graphics/graphics.js"

export default class World {
    /**
     * 
     * @param {Statement} state 
     */
    constructor(){
        /**
         * @type {Statement}
         */
        this.state = null
        /**
         * @type {Array<Layer>}
         */
        this.layers = []
        this.decorations = []
        this.mainLayer = null

        this.settings = {
            /** @type {number} */
            chunkSize: null
        }
    }

    /**
     * 
     * @param {Array<[JSON]>} jsonLayers 
     */
    fromLayers(jsonLayers){
        // load World from layers
        // created by tilemap editor
        let mainIsWas = false
        for(let jsonLayer of jsonLayers.reverse()){
            let isMain = (jsonLayer.properties || []).find((layer_prop) => {
                if(layer_prop.name === "isMain" && layer_prop.value === true) 
                    return true
                return false
            }) !== undefined

            /** @type {DRAW_GROUND_PLAN} */
            let groundPlan;
            if(isMain){
                groundPlan = DRAW_GROUND_PLAN.MAIN
                mainIsWas = true
            } else {
                if (mainIsWas)
                groundPlan = DRAW_GROUND_PLAN.BACK
                else groundPlan = DRAW_GROUND_PLAN.FRONT
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

            let layer = new Layer(this, jsonLayer.name, z, groundPlan)

            this.layers.push(layer)
            if(layer.isMain){
                this.mainLayer = layer
                this.settings.chunkSize = jsonLayer.chunks[0].width
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

                const decoration = this.state.entities.create(
                    Decoration, 
                    texture, 
                    groundPlan,
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