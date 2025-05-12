"use strict"
import { VoidAnimationFunction } from "../../exceptions.js";
import Sprite from "./base.js";

export default class AnimatedSprite extends Sprite {
    static BASE_FRAME_RATE = 70

    /**
     * 
     * @param { SpriteManager | SortingSpriteManager } manager 
     * @param {*} bufferIndexes
     * @param { Texture } texture 
     * @param  {...any} mixins 
     */
     constructor(
        manager, 
        bufferIndexes, 
        texture, 
        rotate_bits=0, 
        animationFrameRate=AnimatedSprite.BASE_FRAME_RATE, 
        loopMode=AnimatedSprite.LOOP_MODE.CYCLE
    ) {
        super(manager, bufferIndexes, texture, rotate_bits)

        // milliseconds per frame
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

    /**
     * 
     * @param {number} duration - duration of animation in milliseconds
     */
    setFrameRateFromDuration(duration) {
        let frameRate = duration / this.texture.frameNumber
        this.animationFrameRate = frameRate
    }

    /**
     * 
     * @param {AnimatedSprite.LOOP_MODE | string} loopMode 
     * @returns 
     */
    setLoopMode(loopMode) {
        if (typeof loopMode === 'string') {
            loopMode = AnimatedSprite.LOOP_MODE[loopMode]
        }

        if (this.loopMode === loopMode) {
            return
        }

        this.loopMode = loopMode
        this.doAnimation = AnimatedSprite.FUNCTIONS.doAnimation[this.loopMode]
        // this.initAnimation = AnimatedSprite.FUNCTIONS.initAnimation[this.loopMode]
        // this.resetAnimation = AnimatedSprite.FUNCTIONS.resetAnimation[this.loopMode]
    }

    initAnimation(frameRate){
        this.currentFrame = 0
        this.animationFrameRate = frameRate || this.animationFrameRate
        this.animationEnded = false

        this.resetTextureCoords()
    }

    resetAnimation(){
        this.currentFrame = 0
        this.animationEnded = false
    }

    doAnimation(timeDelta){
        throw new VoidAnimationFunction()
    }

    resetTextureCoords() {
        this.setTextureCoords(0, null, this.texture.frameOffset, null)
    }

    /**
     * 
     * @param {number} currentFrame - from zero to this.frameNumber - 1
     */
    setFrameNumber(currentFrame) {
        this.setTextureCoords(
            this.texture.frameOffset * currentFrame, 
            null, null, null
        )
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
            
            this.setFrameNumber( Math.floor(this.currentFrame) )
        },
        // ONCE
        function (timeDelta){
            this.currentFrame = Math.min(
                this.currentFrame + timeDelta / this.animationFrameRate,
                this.texture.frameNumber - 1
            )
    
            this.setFrameNumber( Math.floor(this.currentFrame) )
            if(this.currentFrame == this.texture.frameNumber - 1) {
                this.animationEnded = true
            }
        },
    ]
}