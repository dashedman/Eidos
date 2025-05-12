import { Storage } from "../../engine.js";
import BaseSkinsList from "./base.js";
import StateSkin, { AlignInfo, ChangeBoxData } from "./state_skin.js";

export default class CharacterSkinsList extends BaseSkinsList {
    constructor(storage) {
        super(storage)
        
        /** @type {Map<string, StateSkin>} */
        this.skinsMap = new Map()
    }

    set(key, val) {
        return this.skinsMap.set(key, val)
    }

    get(key) {
        return this.skinsMap.get(key)
    }

    /**
     * 
     * @param {import("./base").stateSkinData} characterState 
     */
    addFromData(characterState) {
        const [pw, ph] = characterState.pixel_box
        const [w, h] = [pw / this.state.PIXELS_MEASURE, ph / this.state.PIXELS_MEASURE]
        let box_data = new ChangeBoxData(
            w, h, 0, 0, 
            new AlignInfo(StateSkin.alignMode.CENTER, StateSkin.alignMode.BOTTOM)
        )

        this.set(
            characterState.state_name, 
            new StateSkin({
                texture_name: characterState.texture_name, 
                box: box_data,
                sprite_meta: characterState.sprite_meta
            }, this.storage)
        )
    }
}