"use strict"

import { BackgroundBlock, Block } from "../entities.js"

export class Chunk {
    constructor(x, y, width, height){
        this.x = x
        this.y = y
        this.width = width
        this.height = height

        /** 
         * @typedef {(BackgroundBlock | Block)} SomeBlock
         * @type {Array<Array<SomeBlock>>} 
         * */
        this.grid = new Array(width)
        for(let x = 0; x < width; x++){
            this.grid[x] = new Array(height)
        }
    }
}