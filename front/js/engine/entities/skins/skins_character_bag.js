import BaseSkinsBag from "./base";
import SkinsModeBag from './skins_mode_bag';

export default class SkinsCharacterBag extends BaseSkinsBag {
    constructor() {
        /** @type {Map<typeof null, SkinsModeBag>} */
        this.skinsMap = new Map()
    }
}