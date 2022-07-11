import BaseSkinsList from './base';
import StateSkin from './state_skin';
import { BaseCharacterState } from './../creatures/character/states/states';

export default class ModeSkinsList extends BaseSkinsList {
    constructor(state=null) {
        /** @type {Map<typeof BaseCharacterState, StateSkin>} */
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