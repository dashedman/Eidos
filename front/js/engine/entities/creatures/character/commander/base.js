import Dispatcher from './../../../../interactions/interactions';
import Character from './../character';
import Line from './../../../../graphics/shapes/line';

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
            [Dispatcher.KEY.TAB,   Commander.cs.CHANGE_MODE],
        ]

        for(const [key, command] of command_relations){
            this.dispatcher.subscribe(key, Dispatcher.ACTION.KEY_DOWN, () => {
                this.character.do(command)
            })
            this.dispatcher.subscribe(key, Dispatcher.ACTION.KEY_UP, () => {
                this.character.undo(command)
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
