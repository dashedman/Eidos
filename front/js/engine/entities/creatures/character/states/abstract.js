"use strict"

import { AbstractMethodError } from "../../../../exceptions.js";
import Character from "../character.js";


export class AbstractState {
    /**
     * @abstract
     * @param { Commander.commands } command 
     */
    do(command) {
        throw new AbstractMethodError()
    }

    /**
     * @abstract
     * @param { Commander.commands } command 
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
