import { BaseCharacterMode } from "../creatures/character/states/modes";
import BaseSkinsList from "./base";
import ModeSkinsList from './mode_skins_list';

export default class CharacterSkinsList extends BaseSkinsList {
    constructor(state = null) {
        super()
        
        /** @type {Map<typeof BaseCharacterMode, ModeSkinsList>} */
        this.skinsMap = new Map()
        this.state = state
    }

    set(key, val) {
        val.bindState(this.state)
        return this.skinsMap.set(key, val)
    }

    get(key) {
        return this.skinsMap.get(key)
    }

    bindState(state) {
        this.state = state
        
        for(let skin of this.skinsMap.values()) {
            skin.bindState(this.state)
        }
    }
}