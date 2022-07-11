"use strict"

import { AbstractState } from "./abstract";
import { BaseGuard } from "./guards";
import { BaseCharacterState, StayingState } from './states';

export class BaseCharacterMode extends AbstractState {
    /**
     * @param {Character} character 
     */
     constructor(character) {
        /**
         * @type {Character}
         */
        this.character = character
    }
}

export class BattleMode extends BaseCharacterMode {
    constructor(character) {
        super(character)

        /** @type { BaseGuard } */
        this.guard = null
    } 

    do(command) {
        this.guard.do(command)
    }

    undo(command) {
        this.guard.undo(command)
    }
}

export class TravelMode extends BaseCharacterMode {
    constructor(character) {
        super(character)

        /** @type { BaseCharacterState } */
        this.state = new StayingState()
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
        this.state = new state_cls(this.character)
        return true
    }
}