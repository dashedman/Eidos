import BaseSkinsBag from './base';
import StateSkin from './state_skin';

export default class SkinsModeBag extends BaseSkinsBag {
    constructor() {
        /** @type {Map<typeof null, StateSkin>} */
        this.skinsMap = new Map()
    }

    
}