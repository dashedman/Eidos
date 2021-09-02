const SpriteMixins = {
    iAnimated: {
        iAnimated: true,
        animationTime: 0,
        animationOffset: 0,
        animationFrames: 1,
        animationDuration: 1,

        initAnimation: function(framesAmount, animationDuration){
            this.animationTime = 0
            this.animationOffset = 0
            this.animationFrames = framesAmount
            this.animationDuration = animationDuration
        },
        resetAnimation(){

        },
        doAnimation: function(time){
            this.animationOffset = 0
            this.animationTime = 0
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
                this.initAnimation(
                    this.texture.frames || 1,
                    
                )
            }
        },
    },
}