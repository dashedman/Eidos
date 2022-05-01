"use strict"
import { atlas } from "./getAtlas.js";
import { autils } from "../../utils/utils.js"

import { Texture } from "./base.js";
import { ColorTexture } from "./color.js";


export class TextureManager {
    static STATUSES = {
        COMPILING: 0,
        READY: 1,
        INIT: 2
    }

    constructor(render) {
        const gl = render.gl
        this._render = render

        this.needUpdate = false
        this.status = TextureManager.STATUSES.INIT

        this.textures = new Map()
        this.atlas = null
        this._glTexture = gl.createTexture()
    }

    async prepare() {
        await this.createPlug()
    }

    async createPlug() {
        this.plug = new ColorTexture(
            this, 
            -1,
            '_plug',
            {
                colors: [
                    0, 0, 0, 255,
                    255, 0, 255, 255,
                    255, 0, 255, 255,
                    0, 0, 0, 255,
                ], 
                w: 2, 
                h: 2
            }
        )
        this.textures.set(this.plug.id, this.plug)
        await this.compileAtlas()
    }

    /**
     * 
     * @param {*} id 
     * @param {Texture} texture 
     */
    __safeAddT(id, texture) {
        if(this.textures.has(id)){
            console.warn("WARNING: THIS ID TEXTURE ALREADY EXIST!!!")
        }
        this.addT(texture)
        return texture
    }

    createTexture(id, name, src, frameNumber, frameOffset){
        let texture = new Texture(
            this, id, name, 
            {src: src},
            {number: frameNumber, offset: frameOffset}
        )
        return this.__safeAddT(id, texture)
    }
    
    createColorTexture(id, name, colors, w, h){
        let texture = new ColorTexture(
            this, id, name, 
            {colors: colors, w: w, h: h}
        )
        return this.__safeAddT(id, texture)
    }

    async fromTileset(tilesetInfo){
        // load and init textures from 
        // tileset created by tilemap editor
        let canvas = autils.supportCanvas(tilesetInfo.tilewidth, tilesetInfo.tileheight)
        let ctx = canvas.getContext('2d')
        
        let img = new Image()
        img.src = `./resources/${tilesetInfo.image}`
        await autils.getImageLoadPromise(img)

        let tileArray = []
        let realTileIndex = 0;
        for(let tileIndex = 0; tileIndex < tilesetInfo.tilecount && realTileIndex < tilesetInfo.tiles.length;){
            
            let tileInfo = tilesetInfo.tiles[realTileIndex]
            realTileIndex++;

            // skip empty tile
            if(tileInfo.type == "null") {
                tileIndex++
                continue
            }
            

            // let indexX = tileIndex % tilesetInfo.columns
            let fullId = (tilesetInfo.firstgid + tileInfo.id)
            let indexX = fullId % tilesetInfo.columns
            let indexY = Math.floor(fullId / tilesetInfo.columns)
            let coordX = indexX * tilesetInfo.tilewidth
            let coordY = indexY * tilesetInfo.tileheight
            
            let frameNumber
            let frameOffset
            if(tileInfo.animation !== undefined){
                // processing animations
                frameNumber = tileInfo.animation.length;
                frameOffset = tilesetInfo.tilewidth;
                // resize canvas to contain all animation sequence
                canvas.width = frameNumber*frameOffset
                // draw frames
                for(let [frameIndex, animData] of tileInfo.animation.entries()){

                    
                    let fullId = (tilesetInfo.firstgid + animData.id)
                    indexX = fullId % tilesetInfo.columns
                    // indexX = tileIndex % tilesetInfo.columns
                    indexY = Math.floor(fullId / tilesetInfo.columns)
                    // indexY = Math.floor(tileIndex / tilesetInfo.columns)
                    coordX = indexX * tilesetInfo.tilewidth
                    coordY = indexY * tilesetInfo.tileheight

                    let frameXShift = frameIndex*frameOffset

                    ctx.drawImage(
                        img, // source 
                        coordX, coordY, tilesetInfo.tilewidth, tilesetInfo.tileheight,  // coords in source
                        frameXShift, 0, tilesetInfo.tilewidth, tilesetInfo.tileheight   //coords in canvas
                    )

                    tileIndex++
                }    
            }else{
                // non animated tile

                // resize canvas to contain one tile
                canvas.width = tilesetInfo.tilewidth

                ctx.drawImage(
                    img, // source 
                    coordX, coordY, tilesetInfo.tilewidth, tilesetInfo.tileheight,  // coords in source
                    0, 0, tilesetInfo.tilewidth, tilesetInfo.tileheight   //coords in canvas
                )

                tileIndex++
            }
 
            // create new texture
            let tileGID = tilesetInfo.firstgid + tileInfo.id
            let tileName = `${tilesetInfo.name}#${tileInfo.id}`
            let tileSrcData = canvas.toDataURL()

            tileArray.push(
                this.createTexture(
                    tileGID,
                    tileName,
                    tileSrcData,
                    frameNumber,
                    frameOffset
                )
            )
        }

        return tileArray
    }

    addT(texture) {
        // TODO
        if (!this.textures.has(texture.id))
            this.textures.set(texture.id, texture)

        texture.setAtlas(this.plug.coords)
        this.compileAtlas()
    }

    delT(id) {
        // TODO
        this.textures.delete(id)
        this.compileAtlas()
    }

    getT(id){
        return this.textures.get(id)
    }

    async compileAtlas() {
        if (this.status == TextureManager.STATUSES.COMPILING)
            return
        this.status = TextureManager.STATUSES.COMPILING
        console.debug('Start compile texture altas')

        for (const tex of this.textures.values()) {
            await tex.loadState
        }

        // this.worker.onmessage = function(e){
        //     this.bindAtlas(e.data.atlas)
        //     for(let tile of e.data.tiling){
        //         this.textures[tile.index].setAtlas({
        //             w: tile.w,
        //             h: tile.h,
        //             x: tile.x,
        //             y: tile.y,
        //         })
        //     }
        //     this.status = this.STATUSES.READY
        // }
        // this.worker.postMessage({textures: [...this.textures]})
        // SYNC
        let data = atlas.syncCompiling({ textures: [...this.textures.values()], extrude: true })

        await this.bindAtlas(data.atlas)

        for (let tile of data.tiling) {
            let inverted_tile = Object.assign({}, tile)
            inverted_tile.y = this.atlas.naturalHeight - tile.h - tile.y

            this.textures.get(tile.id).setAtlas({
                w: inverted_tile.w,
                h: inverted_tile.h,
                x: inverted_tile.x,
                y: inverted_tile.y,
            })
        }
        console.debug('Texture altas compile done')
        this.status = TextureManager.STATUSES.READY
    }
    async bindAtlas(atlas) {
        this.atlas = new Image()
        this.atlas.src = atlas

        await autils.getImageLoadPromise(this.atlas)

        this.needUpdate = true
    }
    draw(locals){
        if(this.needUpdate){
            const gl = this._render.gl
            // SET IMAGE
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.bindTexture(gl.TEXTURE_2D, this._glTexture)
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                this.atlas // image
            )
    
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    
            gl.uniform2f(
                locals.u_texture_resolution, 
                this.atlas.naturalWidth, this.atlas.naturalHeight
            )
    
            this.needUpdate = false
        }
    }
}











