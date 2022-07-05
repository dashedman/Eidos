import { NotImplementedError } from "../../exceptions"
import PhBox from './../../physics/colliders/box';

export default class StateSkin {
    /**
     * @typedef {{horizontal: StateSkin.alignMode, vertical: StateSkin.alignMode}} alignInfo
     * @typedef {{w: number, h: number, shiftX: number, shiftY: number, alignInfo: alignInfo}} changeBoxData
     * @param {{texture_source: String, box: changeBoxData}} data 
     */
    constructor(data) {
        this.data = data
    }

    compileSprite() {
        throw new NotImplementedError()
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
