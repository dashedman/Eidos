"use strict"
import SpriteManager from "./base.js"

/**
 * Sprite Manager that automaticaly sorting sprites by Z coord(depth)
 */
export default class SortingSpriteManager extends SpriteManager {
    constructor(render){
        super(render)
        /** @type {Boolean} */
        this._needZSorting = false
    }

    requestZSorting(){
        if(!this._needZSorting){
            this._needZSorting = true
            setTimeout(() => {this.deferredZSorting()}, 0)
        }
    }
    
    deferredZSorting(){
        if(this._needZSorting){
            this._needZSorting = false;
            this.sortByZIndex()
        }
    }

    sortByZIndex(){
        // shake sorting items by z index of sprite 
        // perfect for sorting after inserting one item
        let poshand = this.positionHandler
        
        // create aray with z indexes
        let zIndexArray = new Array(poshand.data.length / poshand.offset)
        for(let index = 0; index < zIndexArray.length; index++){
            zIndexArray[index] = {
                z: poshand.data[index*poshand.offset+2],
                unsortIndex: index
            }
        }

        // shake sort
        let floorIndex = 0;
        let ceilIndex = zIndexArray.length - 1;
        let lastSwapIndex = -1;
        while(floorIndex < ceilIndex){

            // up
            for(let index = floorIndex; index < ceilIndex; index++){
                // compare z indexes
                if(zIndexArray[index].z < zIndexArray[index + 1].z){ // desc
                    // swap
                    let tmp = zIndexArray[index];
                    zIndexArray[index] = zIndexArray[index + 1];
                    zIndexArray[index + 1] = tmp;

                    lastSwapIndex = index
                }
            }
            ceilIndex = lastSwapIndex;

            if(floorIndex >= ceilIndex) break;
            // down
            for(let index = ceilIndex; index > floorIndex; index--){
                // compare z indexes
                if(zIndexArray[index].z > zIndexArray[index - 1].z){ // desc
                    // swap
                    let tmp = zIndexArray[index];
                    zIndexArray[index] = zIndexArray[index - 1];
                    zIndexArray[index - 1] = tmp;

                    lastSwapIndex = index
                }
            }
            floorIndex = lastSwapIndex;
        }
        // setting with positionhandler
        let newData = new Float32Array(poshand.data.length)
        let newTexData = new Float32Array(this.textureHandler.data.length)
        let newSprites = new Array(this.sprites.length)


        for(let index = 0; index < zIndexArray.length; index++){

            // swap position vertcles
            let oldIndex = zIndexArray[index].unsortIndex * poshand.offset
            for(let shift = 0; shift < poshand.offset; shift++)
                newData[index*poshand.offset + shift] = poshand.data[oldIndex + shift]

            // swap texture verticles
            oldIndex = zIndexArray[index].unsortIndex * this.textureHandler.offset
            for(let shift = 0; shift < this.textureHandler.offset; shift++)
                newTexData[index*this.textureHandler.offset + shift] = this.textureHandler.data[oldIndex + shift]

            // swap sprites
            newSprites[index] = this.sprites[zIndexArray[index].unsortIndex]

            // update sprite indexes
            newSprites[index]._bufferIndexes.p = index*poshand.offset
            newSprites[index]._bufferIndexes.t = index*this.textureHandler.offset
        }

        poshand.data = newData
        poshand.needUpdate = true

        this.textureHandler.data = newTexData
        this.textureHandler.needUpdate = true

        this.sprites = newSprites
    }
}
console.log('SSM+')
