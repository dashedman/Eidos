import Dispatcher from './../../../../interactions/interactions';
import Character from './../character';

export default class Commander {
    /**
     * @param {Character} character
     * @param {Dispatcher} dispatcher
     */
    constructor(character, dispatcher) {
        /** @type {Character} */
        this.character = character
        /** @type {Dispatcher} */
        this.dispatcher = dispatcher
        this.plugInDispatcher()
    }

    plugInDispatcher() {
        const command_relations = [
            [Dispatcher.KEY.A, Commander.cs.MOVE_LEFT],
            [Dispatcher.KEY.D, Commander.cs.MOVE_RIGHT],
            
            [Dispatcher.KEY.SPACE, Commander.cs.JUMP],
        ]

        for(const [key, command] of command_relations){
            this.dispatcher.subscribe(key, Dispatcher.ACTION.KEY_DOWN, () => {
                this.character.do(command)
            })
            this.dispatcher.subscribe(key, Dispatcher.ACTION.KEY_UP, () => {
                this.character.undo(command)
            })
        }
    }

    /**
     * Enum for common colors.
     * @readonly
     * @enum {Number}
     */
    static commands = {
        STAY: 0,
        MOVE_LEFT: 1,
        MOVE_RIGHT: 2,
        JUMP: 3,
        CHANGE_MODE: 4,
        ATTACK: 5,
        CHANGE_GUARD: 8,
    }
    static cs = Commander.commands   // alias
}
