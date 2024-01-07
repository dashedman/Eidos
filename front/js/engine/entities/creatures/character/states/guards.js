"use strict"

import { AbstractState } from "./abstract.js";
import { BaseCharacterState } from "./states.js";


export class BaseGuard extends AbstractState {
    constructor(character) {
        this.character = character

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