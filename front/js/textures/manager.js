// TODO: BIG ATLAS GENERATOR

function TextureManager()
{
    this.state = this.STATES.INIT
    this.worker = new Worker('js/textures/getAtlas.js')

    this.textures = new Map()
    this.atlas;

    this.waitInit = new Promise((resolve, reject) => {
        setTimeout(this.createPlug, 0, resolve, reject)
    })

    this.gl_texture = gl.createTexture();
}


TextureManager.prototype.STATES = {
    COMPILING: 0,
    READY: 1,
    INIT: 2
}

TextureManager.prototype.createPlug = async function(resolve, rej){
    this.plug = new ColorTexture([
        0, 0, 0, 255,
        255, 0, 255, 255,
        0, 0, 0, 255,
        255, 0, 255, 255,
    ], 2, 2)
    this.textures.set('_plug', this.plug)
    await this.compileAtlas()
    resolve()
}


TextureManager.prototype.push = async function(texture){
    // TODO
    if(!this.textures.has(texture.name)) this.textures.set(texture.name, texture)

    texture.setAtlas(this.plug.coords)
    this.compileAtlas()
}


TextureManager.prototype.pop = async function(texture){
    // TODO
    this.textures.delete(texture.name)
    this.compileAtlas()
}


TextureManager.prototype.compileAtlas = async function (){
    if(this.state == this.STATES.COMPILING) return;
    this.state = this.STATES.COMPILING

    for(const tex of this.textures){
        await tex.loadState
    }
    
    this.worker.onmessage = function(e){
        this.bindAtlas(e.data.atlas)

        for(let tile of e.data.tiling){
            this.textures[tile.index].setAtlas({
                w: tile.w,
                h: tile.h,
                x: tile.x,
                y: tile.y,
            })
        }

        this.state = this.STATES.READY
    }
    this.worker.postMessage({textures: [...this.textures]})
}


TextureManager.prototype.bindAtlas = function (atlas){
    this.atlas = atlas
    let gl = state.render.gl
    // SET IMAGE
    gl.bindTexture(gl.TEXTURE_2D, this.gl_texture);
    gl.texImage2D(
        gl.TEXTURE_2D, 
        0, // level
        gl.RGBA, // format
        gl.RGBA, // sourse format
        gl.UNSIGNED_BYTE, // source type
        this.atlas // image
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}


TextureManager.prototype.getTexture = function(){
    return this.atlas
}