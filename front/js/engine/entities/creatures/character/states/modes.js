"use strict"

import { AbstractState } from "./abstract";
import { BaseGuard } from "./guards";
import { BaseCharacterState, StayingState } from './states';

export class BaseCharacterMode extends AbstractState {
    /**
     * @param {Character} character 
     */
     constructor(character) {
        super()
        /**
         * @type {Character}
         */
        this.character = character
    }
}

export class BattleMode extends BaseCharacterMode {
    constructor(character, guardsList) {
        super(character)

        /** @type { BaseGuard } */
        this.guard = null
        this.guardsList = guardsList
    } 

    do(command) {
        this.guard.do(command)
    }

    undo(command) {
        this.guard.undo(command)
    }

    /**
     * @param { typeof BaseCharacterState } state_cls
     */
    changeState(state_cls) {
        this.guard.changeState(state_cls)
    }

    update(timedelta) {
        this.guard.update(timedelta)
    }
}

export class TravelMode extends BaseCharacterMode {
    constructor(character) {
        super(character)

        /** @type { BaseCharacterState } */
        this.state = new BaseCharacterState(this.character)
    }

    do(command) {
        this.state.do(command)
    }

    undo(command) {
        this.state.undo(command)
    }

    /**
     * @param { typeof BaseCharacterState } state_cls
     */
    changeState(state_cls) {
        this.state.onFinish()
        this.state = new state_cls(this.character)
        this.state.onStart()
    }

    update(timedelta) {
        this.state.update(timedelta)
    }
}