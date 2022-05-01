"use strict"
import Map2D from "../../utils/map2d.js";
import { Chunk } from "./chunk.js";
import { Block, BackgroundBlock } from "../block.js";

import { Terrain } from "./terrain.js";

/** */
export class Layer {
    /**
     * 
     * @param {Terrain} terrain 
     * @param {*} name 
     * @param {*} z 
     * @param {*} isMain 
     */
    constructor(terrain, name, z = 1, isMain=false){
        /**
         * @type {Terrain}
         */
        this.terrain = terrain
        this.name = name
        this.z = z
        this.isMain = isMain
        /**
         * @type {Map2D}
         */
        this.chunks = new Map2D()
    }

    /**
     * 
     * @param {JSON} chunkJson 
     * @param {SPRITE_ROLES} layerRole
     */
     fromChunk(chunkJson, layerRole){
        const state = this.terrain.state
        // create entities from chunk
        const chunkCoordX = Math.floor(chunkJson.x/chunkJson.width)
        const chunkCoordY = Math.floor(-1 - chunkJson.y/chunkJson.height) // inverted Y
        const chunk = new Chunk(chunkCoordX, chunkCoordY, chunkJson.width, chunkJson.height)

        const ClassOfTile = this.isMain ? Block : BackgroundBlock

        for(let tileY = 0; tileY < chunk.height; tileY++){
            for(let tileX = 0; tileX < chunk.width; tileX++){
            
                const tileIndex = tileY*chunk.width + tileX
                const tileGID = chunkJson.data[tileIndex]
                const texture = state.render.textureManager.getT(tileGID)

                const invertedY = chunk.height - tileY - 1

                if(texture == undefined){
                    chunk.grid[tileX][invertedY] = null
                    continue
                }

                chunk.grid[tileX][invertedY] = state.entities.create(
                    ClassOfTile,
                    texture,
                    layerRole,
                    {
                        x: chunk.x*chunk.width + tileX, // global world coords
                        y: chunk.y*chunk.height + invertedY, // global world coords
                    }
                )
            }
        }
        
        this.chunks.set(chunk.x, chunk.y, chunk)
    }

    setZ(z){
        this.z = z
        for(const chunk of this.chunks.values()){
            for(const column of chunk.grid){
                for(const ceil of column){
                    if(ceil !== null){
                        ceil.sz = this.z
                    }
                }
            }
        }
    }
}