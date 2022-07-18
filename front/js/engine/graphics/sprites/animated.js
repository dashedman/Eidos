"use strict"
import { VoidAnimationFunction } from '../../exceptions';
import Sprite from './base';

export default class AnimatedSprite extends Sprite {
    static BASE_FRAME_RATE = 70

    /**
     * 
     * @param { SpriteManager | SortingSpriteManager } manager 
     * @param {*} bufferIndexes
     * @param { Texture } texture 
     * @param  {...any} mixins 
     */
     constructor(manager, bufferIndexes, texture, reversed=false, 
        animationFrameRate=AnimatedSprite.BASE_FRAME_RATE, 
        loopMode=AnimatedSprite.LOOP_MODE.CYCLE
    ) {
        super(manager, bufferIndexes, texture, reversed)

        this.animationFrameRate = animationFrameRate
        this.currentFrame = 0
        this.loopMode = 0
        this.animationEnded = false
        
        this.setLoopMode(loopMode)
    }

    setFrameRate(frameRate=null) {
        if(frameRate !== null)
            this.animationFrameRate = frameRate
        else
            this.animationFrameRate = AnimatedSprite.BASE_FRAME_RATE
    }

    setLoopMode(loopMode) {
        if(this.loopMode == loopMode) return 
        this.loopMode = loopMode
        this.doAnimation = AnimatedSprite.FUNCTIONS.doAnimation[this.loopMode]
        // this.initAnimation = AnimatedSprite.FUNCTIONS.initAnimation[this.loopMode]
        // this.resetAnimation = AnimatedSprite.FUNCTIONS.resetAnimation[this.loopMode]
    }

    initAnimation(frameRate){
        this.currentFrame = 0
        this.animationFrameRate = frameRate || this.animationFrameRate
        this.animationEnded = false

        this.tx = this.reversed ? this.texture.frameOffset : 0
        this.tw = this.texture.frameOffset * (this.reversed ? -1 : 1)
    }

    resetAnimation(){
        this.currentFrame = 0
        this.animationEnded = false
    }

    doAnimation(timeDelta){
        throw VoidAnimationFunction()
    }
}

/**
 * Enum for common colors.
 * @readonly
 * @enum {Number}
 */
AnimatedSprite.LOOP_MODE = {
    CYCLE: 1,
    ONCE: 2,
    BOUNCED: 3,
    REVERSE_CYCLE: 4,
    REVERSE_ONCE: 5,
    FIRST_FRAME: 6,
    LAST_FRAME: 7,
}

/**
 * Enum for common colors.
 * @readonly
 * @enum {Function[]}
 */
AnimatedSprite.FUNCTIONS = {
    doAnimation: [
        // NULL
        function (){},
        // CYCLE
        function (timeDelta){
            this.currentFrame = (
                this.currentFrame + timeDelta / this.animationFrameRate // step
            ) % this.texture.frameNumber // fix by frame edge
            
            this.tx = ( this.texture.frameOffset ) * Math.floor(this.currentFrame + this.reversed)
        },
        // ONCE
        function (timeDelta){
            this.currentFrame = Math.min(
                this.currentFrame + timeDelta / this.animationFrameRate,
                this.texture.frameNumber - 1
            )
    
            this.tx = ( this.texture.frameOffset ) * Math.floor(this.currentFrame + this.reversed)
            if(this.currentFrame == this.texture.frameNumber - 1) {
                this.animationEnded = true
            }
        },
    ]
}