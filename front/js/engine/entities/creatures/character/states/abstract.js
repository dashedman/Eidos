"use strict"

import { AbstractMethodError } from "../../../../exceptions";
import Character from "../character";


export class AbstractState {
    /**
     * @abstract
     * @param { Character.commands } command 
     */
    do(command) {
        throw new AbstractMethodError()
    }

    /**
     * @abstract
     * @param { Character.commands } command 
     */
    undo(command) {
        throw new AbstractMethodError()
    }

    /**
     * @abstract
     */
    update() {
        throw new AbstractMethodError()
    }

    /**
     * @abstract
     */
    onStart() {
        throw new AbstractMethodError()
    }

    /**
     * @abstract
     */
    onFinish() {
        throw new AbstractMethodError()
    }
}

export class IStated {

}
