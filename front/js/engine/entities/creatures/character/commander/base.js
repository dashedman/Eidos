import Dispatcher from "./../../../../interactions/interactions.js";
import Character from "./../character.js";
import Line from "./../../../../graphics/shapes/line.js";

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
        this.network = dispatcher._state.network
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
                this.network.send({
                    input_type: Dispatcher.ACTION.KEY_DOWN,
                    input_action: command,
                })
            })
            this.dispatcher.subscribe(key, Dispatcher.ACTION.KEY_UP, () => {
                this.character.undo(command)
                this.network.send({
                    input_type: Dispatcher.ACTION.KEY_UP,
                    input_action: command,
                })
            })
        }

        this.plugInMouse()
    }

    plugInMouse() {
        const Z_PLANE = 0
        if(this.dispatcher.debugMode){
            this.interchangeLine = null
            this.dispatcher.subscribe(Dispatcher.MOUSE.LEFT, Dispatcher.ACTION.MOUSE_DOWN, () => {
                let mousePoint = this.dispatcher._state.camera.getIntersectMouseWithZPlane(
                    this.dispatcher.mouseCoords.X, 
                    this.dispatcher.mouseCoords.Y,
                    Z_PLANE
                )

                this.interchangeLine = new Line(
                    this.dispatcher._state.render.debugLineManager,
                    [1, 0, 0],
                    [1, 1, 0],
                )
                this.interchangeLine.lx1 = mousePoint.x
                this.interchangeLine.ly1 = mousePoint.y
                this.interchangeLine.lz1 = Z_PLANE
                this.interchangeLine.lx2 = mousePoint.x
                this.interchangeLine.ly2 = mousePoint.y
                this.interchangeLine.lz2 = Z_PLANE
            })
            this.dispatcher.subscribe(Dispatcher.MOUSE.LEFT, Dispatcher.ACTION.MOUSE_MOVE, () => {
                if(this.interchangeLine !== null) {
                    let mousePoint = this.dispatcher._state.camera.getIntersectMouseWithZPlane(
                        this.dispatcher.mouseCoords.X, 
                        this.dispatcher.mouseCoords.Y,
                        Z_PLANE
                    )
                    
                    this.interchangeLine.lx2 = mousePoint.x
                    this.interchangeLine.ly2 = mousePoint.y
                }
            }) 
            this.dispatcher.subscribe(Dispatcher.MOUSE.LEFT, Dispatcher.ACTION.MOUSE_UP, () => {
                if(this.interchangeLine !== null) {
                    this.interchangeLine.release()
                    this.interchangeLine = null
                }
            }) 
        }
        
        // this.dispatcher.subscribe(Dispatcher.MOUSE.LEFT, Dispatcher.ACTION.MOUSE_UP, () => {
        //     this.character.do(Commander.cs.ATTACK)
        // }) 
    }


    /**
     * Enum for common colors.
     * server/engine/inputs.py InputAction must be same
     * 
     * @readonly
     * @enum {Number}
     */
    static commands = {
        STAY: 0,
        MOVE_LEFT: 1,
        MOVE_RIGHT: 2,
        MOVE_UP: 3,
        MOVE_DOWN: 4,
        JUMP: 5,
        DASH: 6,
        ATTACK: 7,
        ATTACK_2: 8,
        ABILITY: 9,
        ITEM: 10
    }
    static cs = Commander.commands   // alias
}
