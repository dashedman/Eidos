const SpriteMixins = {
    iAnimated: {
        // texture must be framed
        iAnimated: true,
        animationTime: 0,
        animationFrameRate: 1,
        currentFrame: 0,

        initAnimation(frameRate){
            this.animationTime = 0
            this.animationFrameRate = frameRate || this.animationFrameRate
            this.tw = this.texture.frameOffset
        },
        resetAnimation(){
            this.currentFrame = 0
            this.animationTime = 0
        },
        doAnimation(time){
            this.currentFrame = (
                this.currentFrame + (time - this.animationTime)/this.animationFrameRate // step
            ) % this.texture.frameNumber // fix by frame edge

            this.tx = this.texture.frameOffset * Math.floor(this.currentFrame)
            this.animationTime = time
        },
    },
    iStated: {
        iStated: true,
        state_textures: new Map(),
        current_state: undefined,

        initStates(texture_map){ // {state: texture}
            // create mapping state -> index -> texture
            this.state_textures.clear()

            this.current_state = 0;
            this.state_textures.set(this.current_state, this.texture)

            for(let [state, texture] in texture_map){
                this.state_textures.set(state, texture)
            }
            
        },
        setState(state_id){
            this.current_state = state_id
            this.texture = this.textures.get(this.current_state)

            if(this.iAnimated){
                this.texture.computeFrameOffset()
                this.initAnimation()
            }
        },
    },
}