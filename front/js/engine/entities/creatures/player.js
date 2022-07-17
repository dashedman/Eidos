"use strict"

import User from "./user";
import Commander from './character/commander/base';
import { BattleMode, TravelMode } from "./character/states/modes";
import CharacterSkinsList from './../skins/character_skins_list';
import Statement from "../../statement";
import { SpriteMixins } from "../../graphics/sprites/mixins";
import { DRAW_GROUND_PLAN } from "../../graphics/constants";
import { StayingState } from "./character/states/states";

export class Player extends User{
    /**
     * 
     * @param { Statement } state
     * @param {*} prepareParams
     * @param {{x: number, y: number, z:number, w: number, h:number}} param2 
     */
    constructor(state, prepareParams, {x, y, z=1, w=1, h=1}, dispatcher) {
        super(state, prepareParams, {x, y, z, w, h})
        /** @type { CharacterSkinsList } */
        this.skinsSources = this.prepareSkinsSources(state)

        /** @type { BaseCharacterMode } */
        this.mode = new TravelMode(this)
        /** @type { Commander } */
        this.commander = new Commander(this, dispatcher)
        /** @type { Boolean[] } */
        this.commandsFlags = new Array(16)
        this.commandsFlags.fill(false)

        this.changeState(StayingState)
        this.ACCELERATION = 10
        this.MAX_SPEED = 15
        this.JUMP_START_SPEED = 6
    }

    /**
     * @param { Statement } state 
     * @param {*} param1 
     */
    prepare(state, {role=DRAW_GROUND_PLAN.MAIN}) {
        let texture = state.render.textureManager.plug

        this.sprite = state.render.createSprite({
            texture: texture,
            mixins: [SpriteMixins.iAnimated]
        }, role)

        this.pbox = this.getPhysBox(state)
    }

    do(command) {
        if(this.commandsFlags[command]) return 

        this.commandsFlags[command] = true
        this.mode.do(command)
    }

    undo(command) {
        if(!this.commandsFlags[command]) return 
        
        this.commandsFlags[command] = false
        this.mode.undo(command)
    }

    /**
     * @param { typeof BaseCharacterState } state_cls
     */
    changeState(state_cls) {
        const is_changed = this.mode.changeState(state_cls)
        if(is_changed) {
            console.log(state_cls.name)
            let state_skin = this.skinsSources.get(this.mode.constructor).get(state_cls)
            if(!state_skin) return

            state_skin.adaptPhysicBox(this.pbox)
            this.sprite.setTexture(state_skin.getTexture())
                .then(() => {
                    this.sprite.initAnimation()
                })
            this.syncSpriteWithBox()
        }
    }

    /**
     * @param { typeof BaseCharacterMode } mode_cls
     */
    changeMode(mode_cls) {
        this.mode = new mode_cls(this)
        return true
    }

    update(timedelta) {
        this.mode.update(timedelta)
    }

    /**
     * @param { Statement } state
     * @returns { CharacterSkinsList }
     */
    prepareSkinsSources(state) {
        return state.storage.skinsList.get(this.constructor)
    }
}
