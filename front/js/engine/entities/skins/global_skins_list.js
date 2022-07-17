import BaseSkinsList from "./base";
import Creature from './../creatures/base';
import CharacterSkinsList from './character_skins_list';

export default class GlobalSkinsList extends BaseSkinsList {
    constructor(state = null) {
        super()
        
        /** @type {Map<typeof Creature, CharacterSkinsList>} */
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
}