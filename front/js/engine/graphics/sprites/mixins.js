"use strict"
export const SpriteMixins = {
    iAnimated: {
        // texture must be framed
        iAnimated: true,
        animationTime: 0,
        animationFrameRate: 70,
        currentFrame: 0,

        initAnimation(frameRate){
            this.currentFrame = 0
            this.animationTime = this._manager._render._state.time.time
            this.animationFrameRate = frameRate || this.animationFrameRate
            this.tw = this.texture.frameOffset
        },
        resetAnimation(){
            this.currentFrame = 0
            this.animationTime = this._manager._render._state.time.time
        },
        doAnimation(time){
            this.currentFrame = (
                this.currentFrame + (time - this.animationTime)/this.animationFrameRate // step
            ) % this.texture.frameNumber // fix by frame edge

            this.tx = this.texture.frameOffset * Math.floor(this.currentFrame)
            this.animationTime = time
        },
    },

}