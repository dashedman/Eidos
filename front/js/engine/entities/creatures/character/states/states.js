"use strict"

import { AbstractState } from "./abstract";
import Character from "../character";

export class BaseCharacterState extends AbstractState {
    /**
     * 
     * @param {Character} character 
     */
    constructor(character) {
        super()
        /**
         * @type {Character}
         */
        this.character = character
    }

    /**
     * @param { typeof BaseCharacterState } state_cls
     */
    changeState(state_cls) {
        return this.character.changeState(state_cls)
    }

    update(timedelta) {
        this.updateByPhysic(timedelta) ||
        this.updateByEnviroment(timedelta) ||
        this.updateByLogic(timedelta) ||
        this.updateByState(timedelta)
    }

    updateByPhysic() {}
    updateByEnviroment() {}
    updateByLogic() {}
    updateByState() {}
}

export class StayingState extends BaseCharacterState {
    updateByPhysic() {
        if(this.character.pbox.vy < 0) {
            return this.changeState(FallingState)
        } else if(this.character.pbox.vy > 0) {
            return this.changeState(JumpingState)
        }
    }

    updateByState() {
        if(this.character.pbox.vx) this.character.pbox.vx = 0
    }

    do(command) {
        switch(command) {
            case Character.commands.MOVE_LEFT:
                return this.changeState(MovingLeftState)
            case Character.commands.MOVE_RIGHT:
                return this.changeState(MovingRightState)
        }
    }
}

export class MovingState extends BaseCharacterState {
    updateByPhysic() {
        if(this.character.pbox.vy < 0) {
            return this.changeState(FallingState)
        } else if(this.character.pbox.vy > 0) {
            return this.changeState(JumpingState)
        }
    }

    undo(command) {
        switch(command) {
            case Character.commands.MOVE_RIGHT:
            case Character.commands.MOVE_LEFT:
                return this.changeState(StayingState)
        }
    }
}

export class MovingLeftState extends MovingState {
    updateByState(timedelta) {
        this.character.pbox.vx = Math.max(
            this.character.pbox.vx - this.character.ACCELERATION * timedelta,
            -this.character.MAX_SPEED
        )
    }
}
export class MovingRightState extends MovingState {
    updateByState(timedelta) {
        this.character.pbox.vx = Math.min(
            this.character.pbox.vx + this.character.ACCELERATION * timedelta,
            this.character.MAX_SPEED
        )
    }
}

export class JumpingState extends BaseCharacterState {
    updateByPhysic() {
        if(this.character.pbox.vy < 0) {
            return this.changeState(FallingState)
        } else if(this.character.pbox.vy == 0) {
            return this.changeState(StayingState)
        }
    }
}

class FallingState extends BaseCharacterState {
    updateByPhysic() {
        if(this.character.pbox.vy > 0) {
            return this.changeState(JumpingState)
        } else if(this.character.pbox.vy == 0) {
            return this.changeState(StayingState)
        }
    }
}

class RollingState extends BaseCharacterState {
    
}

class WallowState extends BaseCharacterState {
    updateByPhysic() {
        if(this.character.pbox.vy < 0) {
            return this.changeState(FallingState)
        } else if(this.character.pbox.vy > 0) {
            return this.changeState(JumpingState)
        }
    }
}
