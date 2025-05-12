import BaseSkinsList from "./base.js";
import CharacterSkinsList from "./character_skins_list.js";
import { Storage } from "../../engine.js";

export default class GlobalSkinsList extends BaseSkinsList {
    /**
     * 
     * @param {Storage} storage 
     */
    constructor(storage) {
        super(storage)
        
        /** @type {Map<string, CharacterSkinsList>} */
        this.skinsMap = new Map()
    }

    set(key, val) {
        return this.skinsMap.set(key, val)
    }

    get(key) {
        return this.skinsMap.get(key)
    }

    /**
     * @param {string} characterName
     * @param {statesMeta: import("./base").stateSkinData[]} skinsSet 
     */
    addSkinsSet(characterName, skinsSet) {
        console.log('Adding skins set for character ' + characterName)
        let characterSkins = new CharacterSkinsList(this.storage)

        for(let char_state of skinsSet) {
            characterSkins.addFromData(char_state)
        }

        this.set(characterName, characterSkins)
    }
}