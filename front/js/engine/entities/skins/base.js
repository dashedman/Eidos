'use strict'

/**
 * @typedef {{
 *  pixel_box: [number, number], 
 *  state_name: string,
 *  texture_name: string,
 *  sprite_meta: {animation_duration?: number, loopMode: AnimatedSprite.LOOP_MODE}
 * }} stateSkinData
 */

export default class BaseSkinsList {
    /**
     * 
     * @param {Storage} storage 
     */
    constructor(storage) {
        this.storage = storage
    }

    get state() {
        return this.storage._state
    }
}
