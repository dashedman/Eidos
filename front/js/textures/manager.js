// TODO: BIG ATLAS GENERATOR

class TextureManager {
    static STATUSES = {
        COMPILING: 0,
        READY: 1,
        INIT: 2
    }

    constructor(state) {
        this._state = state

        this.status = TextureManager.STATUSES.INIT
        this.worker = new Worker('js/textures/getAtlas.js')

        this.textures = new Map()
        this.atlas

        this.waitInit = new Promise((resolve, reject) => {
            setTimeout(() => {
                this.createPlug(resolve, reject)
            }, 0)
        })

        let gl = this._state.render.gl
        this.gl_texture = gl.createTexture()
    }

    async createPlug(wait_resolve, wait_reject) {
        this.plug = new ColorTexture(
            this, '_plug',
            [
                0, 0, 0, 255,
                255, 0, 255, 255,
                255, 0, 255, 255,
                0, 0, 0, 255,
            ], 
            2, 2
        )
        this.textures.set(this.plug.name, this.plug)
        await this.compileAtlas()
        wait_resolve()
    }

    createTexture(name, src){
        let texture = new Texture(this, name, src)
        this.push(texture)
        return texture
    }

    createColorTexture(name, colors, w, h){
        let texture = new ColorTexture(this, name, colors, w, h)
        this.push(texture)
        return texture
    }

    push(texture) {
        // TODO
        if (!this.textures.has(texture.name))
            this.textures.set(texture.name, texture)

        texture.setAtlas(this.plug.coords)
        this.compileAtlas()
    }

    pop(name) {
        // TODO
        this.textures.delete(name)
        this.compileAtlas()
    }

    async compileAtlas() {
        if (this.status == TextureManager.STATUSES.COMPILING)
            return
        this.status = TextureManager.STATUSES.COMPILING
        console.log('Start compile texture altas')

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
        let data = atlas.syncCompiling({ textures: [...this.textures.values()] })

        this.bindAtlas(data.atlas)

        for (let tile of data.tiling) {
            this.textures.get(tile.name).setAtlas({
                w: tile.w,
                h: tile.h,
                x: tile.x,
                y: tile.y,
            })
        }
        console.log('Texture altas compile done')
        this.status = TextureManager.STATUSES.READY
    }
    bindAtlas(atlas) {
        this.atlas = new Image()
        this.atlas.src = atlas

        this.atlas.onload = () => {
            let gl = this._state.render.gl
            gl.useProgram(this._state.render.programs.sprite)
            // SET IMAGE
            gl.bindTexture(gl.TEXTURE_2D, this.gl_texture)
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
        }
    }
    getTexture() {
        return this.gl_texture
    }
}











