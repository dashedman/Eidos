'use strict'

import { Storage as EngineStorage } from "../engine/engine"
import GlobalSkinsList from './../engine/entities/skins/global_skins_list';


export default class Storage extends EngineStorage {
    constructor(debugMode=false) {
        super(debugMode)

        /** @type {GlobalSkinsList} */
        this.skinsList = null
    }
}