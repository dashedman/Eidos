"use strict"
import { Layer } from "./layer.js";
import { Block, Decoration } from "../block.js";

import Statement from "../../statement.js";
import { DRAW_GROUND_PLAN } from "../../graphics/graphics.js"
import { Chunk } from "./chunk.js";
import GMath from "../../utils/glsl_math.js";


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
        /** @type {Layer | null} */
        this.mainLayer = null

        this.settings = {
            /** @type {number} */
            chunkSize: null
        }
    }

    /**
     * 
     * @param {{tid: string, x: number, y: number, rotate_bits: number}[]} cellsData 
     */
    updateMap(cellsData) {
        for(let cellData of cellsData) {
            this.updateCell(cellData)
        }
    }

    /**
     * 
     * @param {{tid: string, x: number, y: number, rotate_bits: number}} cellData 
     */
    updateCell(cellData) {
        if(this.mainLayer === null) {
            // create main layer
            // TODO: layer name from cellData
            this.initLayer('main')
        }

        let chunkX = Math.floor(cellData.x / this.settings.chunkSize)
        let chunkY = Math.floor(cellData.y / this.settings.chunkSize)
        let chunk = this.mainLayer.chunks.get(chunkX, chunkY)
        if (chunk === undefined) {
            // create chunk
            chunk = new Chunk(chunkX, chunkY, this.settings.chunkSize, this.settings.chunkSize)
            this.mainLayer.chunks.set(chunkX, chunkY, chunk)
        }

        let cellX = GMath.mod(cellData.x, this.settings.chunkSize)
        let cellY = GMath.mod(cellData.y, this.settings.chunkSize)

        let texture = this.state.render.textureGIDRegistry.get(cellData.tid)
        if(texture === undefined){
            console.warn('Cannot find texture for cell:', cellData.tid, this.state.render.textureGIDRegistry)
        }

        chunk.grid[cellX][cellY] = this.state.entities.create(
            Block,
            texture,
            this.mainLayer.groundPlan,
            {
                x: cellData.x, // global world coords
                y: cellData.y, // global world coords
            }, 
            {rotate_bits: cellData.rotate_bits}
        )
    }

    /**
     * 
     * @param {string} name 
     * @param {DRAW_GROUND_PLAN} groundPlan
     */
    initLayer(name, groundPlan=DRAW_GROUND_PLAN.MAIN) {
        const z = 1
        let layer = new Layer(this, name, z, groundPlan)
        this.layers.push(layer)
        if(layer.isMain){
            this.mainLayer = layer
        }
    }

    /**
     * 
     * @param {Array<[JSON]>} jsonLayers 
     */
    fromLayers(jsonLayers){
        console.debug('Load layers from json...')
        // load World from layers
        // created by tilemap editor
        let mainIsWas = false
        for(let jsonLayer of jsonLayers.reverse()){
            let isMain = (jsonLayer.properties || []).find((layer_prop) => {
                if(layer_prop.name === "main" && layer_prop.value === true) 
                    return true
                return false
            }) !== undefined

            /** @type {DRAW_GROUND_PLAN} */
            let groundPlan;
            if(isMain){
                groundPlan = DRAW_GROUND_PLAN.MAIN
                mainIsWas = true
            } else {
                groundPlan = mainIsWas ? DRAW_GROUND_PLAN.BACK : DRAW_GROUND_PLAN.FRONT
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
                if (obj.gid !== undefined) {
                    const texture = this.state.render.textureGIDRegistry.get(obj.gid)
                    if(texture === undefined)
                        continue

                    const decoration = this.state.entities.create(
                        Decoration, 
                        texture, 
                        groundPlan,
                        {
                            x: obj.x / this.state.PIXELS_MEASURE,
                            y: -obj.y / this.state.PIXELS_MEASURE,
                            width: obj.width / this.state.PIXELS_MEASURE,
                            height: obj.height / this.state.PIXELS_MEASURE,
                        }
                    )
                    this.decorations.push(decoration)
                } else if (obj.text !== undefined) {
                    const text_decoration = this.state.entities.createText(
                        obj.text.text,
                        {
                            x: obj.x / this.state.PIXELS_MEASURE,
                            y: -obj.y / this.state.PIXELS_MEASURE,
                            width: obj.width / this.state.PIXELS_MEASURE,
                            height: obj.height / this.state.PIXELS_MEASURE,
                        },
                        groundPlan,
                    )
                    this.decorations.push(text_decoration)
                }
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
        let mainLayerIndex = this.layers.findIndex((l) => l.isMain)

        let lastZ = +Infinity;
        for(const layer of this.layers.slice(0, mainLayerIndex + 1).reverse()){
            if(layer.z >= lastZ){
                console.log("Found intersept z", layer.name)
                layer.setZ(lastZ - 0.03)
            }
            lastZ = layer.z
        }
        lastZ = -Infinity;
        for(const layer of this.layers.slice(mainLayerIndex)){
            if(layer.z <= lastZ){
                console.log("Found intersept z", layer.name)
                layer.setZ(lastZ + 0.03)
            }
            lastZ = layer.z
        }
    }

    /**
     * 
     * @param {number} startX 
     * @param {number} startY 
     * @param {number} endX 
     * @param {number} endY 
     */
    *sliceGridGen(startX, startY, endX, endY) {
        const chunkSize = this.settings.chunkSize

        // get chunk
        const startChunkX = Math.floor(startX / chunkSize)
        const endChunkX = Math.floor(endX / chunkSize)
        const startChunkY = Math.floor(startY / chunkSize)
        const endChunkY = Math.floor(endY / chunkSize)

        for(let chunkX = startChunkX; chunkX <= endChunkX; chunkX++)
            for(let chunkY = startChunkY; chunkY <= endChunkY; chunkY++) {
                const chunk = this.mainLayer.chunks.get(chunkX, chunkY)
                if(chunk === undefined) continue 

                // get grid from chunck
                const startGridX = Math.max(Math.floor(startX - (chunkX * chunkSize)), 0)
                const endGridX = Math.min(Math.floor(endX - (chunkX * chunkSize)), chunkSize - 1)
                const startGridY = Math.max(Math.floor(startY - (chunkY * chunkSize)), 0)
                const endGridY = Math.min(Math.floor(endY - (chunkY * chunkSize)), chunkSize - 1)

                for(let gridX = startGridX; gridX <= endGridX; gridX++)
                    for(let gridY = startGridY; gridY <= endGridY; gridY++)
                        yield chunk.grid[gridX][gridY]
            }
    }

    *sliceGridGenDirected(startX, startY, endX, endY, dirX, dirY) {
        const chunkSize = this.settings.chunkSize

        // get chunk
        let startChunkX = Math.floor(startX / chunkSize)
        let endChunkX = Math.floor(endX / chunkSize)
        let startChunkY = Math.floor(startY / chunkSize)
        let endChunkY = Math.floor(endY / chunkSize)

        //swap in directon
        if(dirX < 0) {
            [startChunkX, endChunkX] = [endChunkX, startChunkX + dirX]
        } else {
            endChunkX += dirX
        }
        if(dirY < 0) {
            [startChunkY, endChunkY] = [endChunkY, startChunkY + dirY]
        } else {
            endChunkY += dirY
        }

        for(let chunkX = startChunkX; chunkX != endChunkX; chunkX += dirX)
            for(let chunkY = startChunkY; chunkY != endChunkY; chunkY += dirY) {
                const chunk = this.mainLayer.chunks.get(chunkX, chunkY)
                if(chunk === undefined) continue 

                // get grid from chunck
                let startGridX = Math.max(Math.floor(startX - (chunkX * chunkSize)), 0)
                let endGridX = Math.min(Math.floor(endX - (chunkX * chunkSize)), chunkSize - 1)
                let startGridY = Math.max(Math.floor(startY - (chunkY * chunkSize)), 0)
                let endGridY = Math.min(Math.floor(endY - (chunkY * chunkSize)), chunkSize - 1)

                if(dirX < 0) {
                    [startGridX, endGridX] = [endGridX, startGridX + dirX]
                } else {
                    endGridX += dirX
                }
                if(dirY < 0) {
                    [startGridY, endGridY] = [endGridY, startGridY + dirY]
                } else {
                    endGridY += dirY
                }

                for(let gridX = startGridX; gridX != endGridX; gridX += dirX)
                    for(let gridY = startGridY; gridY != endGridY; gridY += dirY){
                        yield chunk.grid[gridX][gridY]
                    }
            }
    }
}