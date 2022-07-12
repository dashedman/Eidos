"use strict"

import User from "./user";
import Commander from './character/commander/base';
import { BattleMode, TravelMode } from "./character/states/modes";
import { MovingLeftState, MovingRightState, StayingState } from "./character/states/states";
import Map2D from './../../utils/map2d';
import CharacterSkinsList from './../skins/character_skins_list';
import Character from './character/character';
import ModeSkinsList from './../skins/mode_skins_list';
import StateSkin, { AlignInfo, ChangeBoxData } from './../skins/state_skin';
import Statement from "../../statement";
import { SpriteMixins } from "../../graphics/sprites/mixins";
import { DRAW_GROUND_PLAN } from "../../graphics/constants";

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
        this.skinsSources = this.prepareSkinsSources()

        /** @type { BaseCharacterMode } */
        this.mode = new TravelMode(this)
        /** @type { Commander } */
        this.commander = new Commander(this, dispatcher)
        /** @type { Boolean[] } */
        this.commandsFlags = new Array(16)
        this.commandsFlags.fill(false)

        this.changeState(StayingState)
        this.ACCELERATION = 1
        this.MAX_SPEED = 10
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
        this.commandsFlags[command] = true
        this.mode.do(command)
    }

    undo(command) {
        this.commandsFlags[command] = false
        this.mode.undo(command)
    }

    /**
     * @param { typeof BaseCharacterState } state_cls
     */
    changeState(state_cls) {
        const is_changed = this.mode.changeState(state_cls)
        if(is_changed) {
            let state_skin = this.skinsSources.get(this.mode.constructor).get(state_cls)
            console.log(state_skin)
            state_skin.adaptPhysicBox(this.pbox)
            this.sprite.setTexture(state_skin.getTexture())
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
     * 
     * @returns { CharacterSkinsList }
     */
    prepareSkinsSources() {
        /**
         * @type { [typeof BaseCharacterMode, [typeof BaseCharacterState, {texture: string, box: string}][]][] }
         */
        let travel_mode_skins = new ModeSkinsList()

        // TODO: more automatisation
        travel_mode_skins.set(StayingState, new StateSkin({texture_name: 'player_staying', box: new ChangeBoxData(
            1, 1, 0, 0, new AlignInfo(StateSkin.alignMode.CENTER, StateSkin.alignMode.BOTTOM)
        )}))
        travel_mode_skins.set(MovingRightState, new StateSkin({texture_name: 'player_moving', box: new ChangeBoxData(
            1, 1, 0, 0, new AlignInfo(StateSkin.alignMode.CENTER, StateSkin.alignMode.BOTTOM)
        )}))
        travel_mode_skins.set(MovingLeftState, new StateSkin({texture_name: 'player_moving', box: new ChangeBoxData(
            1, 1, 0, 0, new AlignInfo(StateSkin.alignMode.CENTER, StateSkin.alignMode.BOTTOM)
        )}))

        // TODO: remove global state
        let character_skins = new CharacterSkinsList(state)
        character_skins.set(TravelMode, travel_mode_skins)  

        return character_skins
    }
}
