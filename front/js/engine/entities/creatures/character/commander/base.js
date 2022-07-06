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
            [Dispatcher.KEY.A, Character.commands.MOVE_LEFT],
            [Dispatcher.KEY.D, Character.commands.MOVE_RIGHT],
            
            [Dispatcher.KEY.SPACE, Character.commands.JUMP],
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
}
