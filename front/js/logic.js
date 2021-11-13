import { Dispatcher } from "./dispatcher.js";

export class Logic {
    constructor(state) {
        this.state = state;
    }

    update(){
        let deltaTime = this.state.time.deltaTime * 0.01

        let disp = this.state.dispatcher
        let newCamPos = state.camera.position
        if(disp.pressedKeys[Dispatcher.KEY.A]){
            newCamPos[0] -= deltaTime;
        }
        if(disp.pressedKeys[Dispatcher.KEY.D]){
            newCamPos[0] += deltaTime;
        }
        if(disp.pressedKeys[Dispatcher.KEY.S]){
            newCamPos[1] -= deltaTime;
        }
        if(disp.pressedKeys[Dispatcher.KEY.W]){
            newCamPos[1] += deltaTime;
        }
        if(disp.pressedKeys[Dispatcher.KEY.X]){
            newCamPos[2] -= deltaTime;
        }
        if(disp.pressedKeys[Dispatcher.KEY.Z]){
            newCamPos[2] += deltaTime;
        }

        state.camera.setPosition(...newCamPos)
    }
}