"use strict"

import User from "./user";
import Commander from './character/commander/base';
import { BattleMode, TravelMode } from "./character/states/character";
import { MovingLeftState, MovingRightState, StayingState } from "./character/states/states";
import Map2D from './../../utils/map2d';

export class Player extends User{
    constructor(sprite, pbox, {x, y, z=1, w=1, h=1}, dispatcher) {
        super(sprite, pbox, {x, y, z=1, w=1, h=1})
        /** @type { BaseCharacterMode } */
        this.mode = new TravelMode()
        /** @type { Commander } */
        this.commander = new Commander(this, dispatcher)
        /** @type { Boolean[] } */
        this.commandsFlags = new Array(16)
        this.commandsFlags.fill(false)

        this.spriteSources = this.prepareSpriteSources()
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
            texture, box = this.spriteSources.get(this.mode_cls, state_cls)
        }
    }

    /**
     * @param { typeof BaseCharacterMode } mode_cls
     */
     changeMode(mode_cls) {
        this.mode_cls = mode_cls
        this.mode = new mode_cls(this)
        return true
    }

    /**
     * 
     * @returns { Map2D<typeof BaseCharacterMode, typeof BaseCharacterState, {texture: string, box: string}> }
     */
    prepareSpriteSources() {
        /**
         * @type { [typeof BaseCharacterMode, [typeof BaseCharacterState, {texture: string, box: string}][]][] }
         */
        const mode_state_texture_relations = [
            [
                TravelMode, [
                    [StayingState, {texture: '', box: ''}],
                    [MovingRightState, {texture: '', box: ''}],
                    [MovingLeftState, {texture: '', box: ''}],
                ]
            ],
            [
                BattleMode, []
            ]
        ]

        const assessment = []
        for(let [mode, states] of mode_state_texture_relations) {
            for(let [state, data] of states) {
                assessment.push([mode, state, data])
            }
        }

        return new Map2D(assessment)
    }
}
