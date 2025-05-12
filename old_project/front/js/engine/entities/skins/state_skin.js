import { NotImplementedError } from "../../exceptions.js"
import PhBox from "./../../physics/colliders/box.js";
import Statement from "../../statement.js";
import AnimatedSprite from "./../../graphics/sprites/animated.js";
import { Storage } from "../../engine.js";

export class AlignInfo {
    /**
     * 
     * @param {StateSkin.alignMode} horizontal 
     * @param {StateSkin.alignMode} vertical 
     */
    constructor(horizontal, vertical) {
        this.horizontal = horizontal
        this.vertical = vertical
    }
}

export class ChangeBoxData {
    /**
     * 
     * @param {Number} w 
     * @param {Number} h 
     * @param {Number} shiftX 
     * @param {Number} shiftY 
     * @param {AlignInfo} alignInfo 
     */
    constructor(w, h, shiftX, shiftY, alignInfo) {
        this.w = w
        this.h = h
        this.shiftX = shiftX
        this.shiftY = shiftY
        this.alignInfo = alignInfo
    }
}

export default class StateSkin {
    /**
     * @param {{texture_name: String, box: ChangeBoxData, sprite_meta: {rotate_bits?: number, loop_mode: string, animation_duration?: number}}} data 
     * @param {Storage} storage
     */
    constructor(data, storage) {
        /** @type { Storage } */
        this.storage = storage
        this.data = data
    }

    get state() {
        return this.storage._state
    }

    getTexture() {
        return this.state.render.textureManager.getByName(
            this.data.texture_name
        )
    }

    getSpriteMeta() {
        return this.data.sprite_meta
    }

    /**
     * @param {PhBox} pbox
     */
    adaptPhysicBox(pbox) {
        let changeBox = this.data.box
        switch (changeBox.alignInfo.horizontal) {
            case StateSkin.alignMode.LEFT:
                pbox.w = changeBox.w
                break
            case StateSkin.alignMode.CENTER:
                pbox.x += pbox.w * 0.5 - changeBox.w * 0.5
                pbox.w = changeBox.w
                break
            case StateSkin.alignMode.RIGHT:
                pbox.x += pbox.w - changeBox.w
                pbox.w = changeBox.w
                break
        }
        pbox.x += changeBox.shiftX

        switch (changeBox.alignInfo.vertical) {
            case StateSkin.alignMode.BOTTOM:
                pbox.h = changeBox.h
                break
            case StateSkin.alignMode.CENTER:
                pbox.y += pbox.h * 0.5 - changeBox.h * 0.5
                pbox.w = changeBox.h
                break
            case StateSkin.alignMode.TOP:
                pbox.y += pbox.h - changeBox.h
                pbox.w = changeBox.h
                break
        }
        pbox.y += changeBox.shiftY
    }
}

/**
 * Enum for common colors.
 * @readonly
 * @enum {Number}
 */
StateSkin.alignMode = {
    LEFT: -1,
    CENTER: 0,
    RIGHT: 1,
    BOTTOM: -1,
    TOP: 1,
}
