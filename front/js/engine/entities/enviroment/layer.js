"use strict"
import Map2D from "../../utils/map2d.js";
import { Chunk } from "./chunk.js";
import { Block, BackgroundBlock } from "../block.js";

import World from "./world.js";
import { DRAW_GROUND_PLAN } from "../../graphics/constants.js";

/** */
export class Layer {
    /**
     * 
     * @param {World} World 
     * @param {String} name 
     * @param {Number} z 
     * @param {DRAW_GROUND_PLAN} groundPlan
     */
    constructor(world, name, z = 1, groundPlan=DRAW_GROUND_PLAN.BACK){
        /** @type {World} */
        this.world = world
        /** @type {String} */
        this.name = name
        /** @type {Number} */
        this.z = z
        /** @type {DRAW_GROUND_PLAN} */
        this.groundPlan = groundPlan

        /** @type {Map2D<number, number, Chunk>} */
        this.chunks = new Map2D()
    }

    get isMain() {return this.groundPlan === DRAW_GROUND_PLAN.MAIN}

    /**
     * 
     * @param {JSON} chunkJson 
     */
     fromChunk(chunkJson){
        const state = this.world.state
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
                    this.groundPlan,
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