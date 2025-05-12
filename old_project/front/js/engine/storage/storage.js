'use strict'

import GlobalSkinsList from "../entities/skins/global_skins_list.js";
import Statement from "./../statement.js";


export default class Storage {
    constructor(state, debugMode=false) {
        /**
         * @type {Statement}
         */
        this._state = state
        this.debugMode = debugMode

        /** @type {GlobalSkinsList} */
        this.skinsList = new GlobalSkinsList(this)
    }

    async prepare() {
        console.debug('Preparing Storage...')
        console.debug('Storage prepeared.')
    }
}