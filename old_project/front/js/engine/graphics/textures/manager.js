"use strict"
import { atlas } from "./getAtlas.js";
import { autils } from "../../utils/utils.js"

import Texture from "./base.js";
import ColorTexture from "./color.js";


export default class TextureManager {
    static STATUSES = {
        COMPILING: 0,
        READY: 1,
        INIT: 2
    }

    constructor(render) {
        const gl = render.gl
        this._render = render

        this.idCounter = 0
        this.needUpdate = false
        this.status = TextureManager.STATUSES.INIT

        /** @type {Map<String, Texture>} */
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
        // this.plug.atlasCoords = {
        //     x: 0, y: 0, w: 2, h: 2
        // }
        this.textures.set(this.plug.name, this.plug)
        await this.compileAtlas()
    }

    generateId() {
        this.idCounter++
        return this.idCounter
    }

    /**
     * 
     * @param {String} name
     * @param {Texture} texture 
     */
    __safeAdd(name, texture) {
        if(this.textures.has(name)){
            console.warn("WARNING: THIS NAME TEXTURE ALREADY EXIST!!!", name)
        }
        this.add(texture)
        return texture
    }

    createTexture(name, src, frameNumber=1, frameOffset=1){
        let id = this.generateId()
        let texture = new Texture(
            this, id, name, 
            {src: src},
            {number: frameNumber, offset: frameOffset}
        )
        return this.__safeAdd(name, texture)
    }
    
    createColorTexture(name, colors, w, h){
        let id = this.generateId()
        let texture = new ColorTexture(
            this, id, name, 
            {colors: colors, w: w, h: h}
        )
        return this.__safeAdd(name, texture)
    }

    async fromTileset(tilesetInfo){
        // load and init textures from 
        // tileset created by tilemap editor
        let canvas = autils.supportCanvas(tilesetInfo.tilewidth, tilesetInfo.tileheight)
        let ctx = canvas.getContext('2d')
        let img = await autils.loadImage(tilesetInfo.image)

        /** @type {Object<number, Texture>} */
        let tileTextureRegistry = {}
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
            let indexX = tileInfo.id % tilesetInfo.columns
            let indexY = Math.floor(tileInfo.id / tilesetInfo.columns)
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
                    indexX = animData.tileid % tilesetInfo.columns
                    // indexX = tileIndex % tilesetInfo.columns
                    indexY = Math.floor(animData.tileid / tilesetInfo.columns)
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

            tileTextureRegistry[tileGID] = this.createTexture(
                tileName,
                tileSrcData,
                frameNumber,
                frameOffset
            )
        }

        return tileTextureRegistry
    }

    /**
     * 
     * @param {import("../render").TileSetData} tileSetData
     * @returns {Record<string, Texture>}
     */
    async fromTileSetData(tileSetData){
        // load and init textures from 
        // tileset created by tilemap editor
        let canvas = autils.supportCanvas(tileSetData.tile_width, tileSetData.tile_height)
        let ctx = canvas.getContext('2d')
        let img = await autils.loadImage(tileSetData.image)

        /** @type {Record<string, Texture>} */
        let tileTextureRegistry = {}
        let realTileIndex = 0;
        for(
            let tileIndex = 0; 
            tileIndex < tileSetData.tile_count && realTileIndex < tileSetData.tiles.length;
        ){
            
            let tileInfo = tileSetData.tiles[realTileIndex]
            realTileIndex++;

            // skip empty tile
            if(tileInfo.type == "null") {
                tileIndex++
                continue
            }

            let indexX = tileInfo.id % tileSetData.columns
            let indexY = Math.floor(tileInfo.id / tileSetData.columns)
            let coordX = indexX * tileSetData.tile_width
            let coordY = indexY * tileSetData.tile_height
            
            let frameNumber
            let frameOffset
            if(tileInfo.animation !== null){
                // processing animations
                frameNumber = tileInfo.animation.length;
                frameOffset = tileSetData.tile_width;
                // resize canvas to contain all animation sequence
                canvas.width = frameNumber * frameOffset
                // draw frames
                for(let [frameIndex, [anim_tile_id, duration]] of tileInfo.animation.entries()){
                    indexX = anim_tile_id % tileSetData.columns
                    // indexX = tileIndex % tileSetData.columns
                    indexY = Math.floor(anim_tile_id / tileSetData.columns)
                    // indexY = Math.floor(tileIndex / tileSetData.columns)
                    coordX = indexX * tileSetData.tile_width
                    coordY = indexY * tileSetData.tile_height

                    let frameXShift = frameIndex * frameOffset
                    ctx.drawImage(
                        img, // source 
                        coordX, coordY, tileSetData.tile_width, tileSetData.tile_height,  // coords in source
                        frameXShift, 0, tileSetData.tile_width, tileSetData.tile_height   //coords in canvas
                    )

                    tileIndex++
                }    
            }else{
                // non animated tile

                // resize canvas to contain one tile
                canvas.width = tileSetData.tile_width

                ctx.drawImage(
                    img, // source 
                    coordX, coordY, tileSetData.tile_width, tileSetData.tile_height,  // coords in source
                    0, 0, tileSetData.tile_width, tileSetData.tile_height   //coords in canvas
                )

                tileIndex++
            }
 
            // create new texture
            let tileGID = tileSetData.first_gid + tileInfo.id
            let textureId = `${tileSetData.name}_${tileGID}`
            let tileName = tileSetData.name + (realTileIndex === 1 ? '' : tileInfo.id)
            let tileSrcData = canvas.toDataURL()

            tileTextureRegistry[textureId] = this.createTexture(
                tileName,
                tileSrcData,
                frameNumber,
                frameOffset
            )
            console.log('Load texture:', textureId, tileName, frameNumber, frameOffset)
        }

        return tileTextureRegistry
    }

    /**
     * 
     * @param {{resource: string, signWidth: number, signHeight: number, markdown: Object.<string, {x: number, y: number}>}} glyphInfo 
     * @returns {Object.<String, Texture>}
     */
    async fromGlyphAtlas(glyphInfo) {
        let signsTextures = {}
        let signWidth = glyphInfo.signWidth, signHeight = glyphInfo.signHeight

        let canvas = autils.supportCanvas(signWidth, signHeight)
        let ctx = canvas.getContext('2d')
        let img = await autils.loadImage(glyphInfo.resource)

        for(let [sign, s_markdown] of Object.entries(glyphInfo.markdown)) {
            ctx.drawImage(
                img, // source 
                s_markdown.x, s_markdown.y, signWidth, signHeight,  // coords in source
                0, 0, signWidth, signHeight  //coords in canvas
            )

            let glyphSrcdata = canvas.toDataURL()
            let texture = this.createTexture(`glyph_${sign}`, glyphSrcdata)

            signsTextures[sign] = texture
        }

        return signsTextures
    }

    /**
     * 
     * @param {Texture} texture 
     */
    add(texture) {
        // TODO
        if (!this.textures.has(texture.name))
            this.textures.set(texture.name, texture)

        texture.setAtlas(this.plug.atlasCoords)
        this.compileAtlas()
    }

    deleteByName(name) {
        // TODO
        this.textures.delete(name)
        this.compileAtlas()
    }

    getByName(name){
        let texture = this.textures.get(name)
        if (!texture) {
            throw new Error(`Texture by name ${name} not found!`)
        }
        return texture
    }

    async compileAtlas() {
        if (this.status == TextureManager.STATUSES.COMPILING)
            return
        this.status = TextureManager.STATUSES.COMPILING
        console.debug('Start compile texture altas')

        let unloadedCounter = 1
        while (unloadedCounter) {
            unloadedCounter = 0
            for (const tex of this.textures.values()) {
                if (!tex.stateLoaded) {
                    unloadedCounter++
                    await tex.loadState
                }
            }
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

            this.textures.get(tile.name).setAtlas({
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
            console.info('Load atlas to GPU')
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











