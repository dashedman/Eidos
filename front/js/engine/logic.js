import { Statement } from "./statement.js";
import { Dispatcher } from './interactions/interactions.js';

export default class Logic {
    constructor(state) {
        /**
         * @type {Statement}
         */
        this.state = state;
    }

    update(){
        let deltaTime = this.state.time.deltaTime * 0.01

        let disp = this.state.dispatcher
        let newDummiePos = state.debugger.dummie.pb
        if(disp.pressedKeys[Dispatcher.KEY.A]){
            newDummiePos.x -= deltaTime;
        }
        if(disp.pressedKeys[Dispatcher.KEY.D]){
            newDummiePos.x += deltaTime;
        }
        if(disp.pressedKeys[Dispatcher.KEY.S]){
            newDummiePos.y -= deltaTime;
        }
        if(disp.pressedKeys[Dispatcher.KEY.W]){
            newDummiePos.y += deltaTime;
        }
        // if(disp.pressedKeys[Dispatcher.KEY.X]){
        //     newCamPos[2] -= deltaTime;
        // }
        // if(disp.pressedKeys[Dispatcher.KEY.Z]){
        //     newCamPos[2] += deltaTime;
        // }
    }
}