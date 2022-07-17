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
    changeState(state_cls, continueAnimation=false) {
        return this.character.changeState(state_cls, continueAnimation)
    }

    onStart() {}
    onFinish() {}

    do() {}
    undo() {}

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

    updateByState(timedelta) {
        const vx = this.character.pbox.vx
        if(vx) {
            if(vx > 0){
                this.character.pbox.vx = Math.max(
                    vx - this.character.ACCELERATION * 5 * timedelta, 0
                ) 
            } else {
                this.character.pbox.vx = Math.min(
                    vx + this.character.ACCELERATION * 5 * timedelta, 0
                )
            }
        }
    }

    do(command) {
        switch(command) {
            case Character.commands.MOVE_LEFT:
                return this.changeState(MovingLeftState)
            case Character.commands.MOVE_RIGHT:
                return this.changeState(MovingRightState)
            case Character.commands.JUMP:
                return this.changeState(JumpingState)
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

    do(command) {
        switch(command) {
            case Character.commands.JUMP:
                return this.changeState(JumpingState)
        }
    }

    undo(command) {
        switch(command) {
            case Character.commands.MOVE_RIGHT:
            case Character.commands.MOVE_LEFT:
                if(this.character.commandsFlags[Character.commands.MOVE_LEFT])
                    return this.changeState(MovingLeftState)
                else if(this.character.commandsFlags[Character.commands.MOVE_RIGHT])
                    return this.changeState(MovingRightState)
                else 
                    return this.changeState(StayingState)
        }
    }
}

export class MovingLeftState extends MovingState {
    updateByState(timedelta) {
        if(this.character.pbox.vx > 0){
            this.character.pbox.vx = Math.max(
                this.character.pbox.vx - this.character.ACCELERATION * 5 * timedelta, 0
            ) 
        } else {
            this.character.pbox.vx = Math.max(
                this.character.pbox.vx - this.character.ACCELERATION * timedelta,
                -this.character.MAX_SPEED
            )
        }
        
    }
}
export class MovingRightState extends MovingState {
    updateByState(timedelta) {
        if(this.character.pbox.vx < 0){
            this.character.pbox.vx = Math.min(
                this.character.pbox.vx + this.character.ACCELERATION * 5 * timedelta, 0
            ) 
        } else {
            this.character.pbox.vx = Math.min(
                this.character.pbox.vx + this.character.ACCELERATION * timedelta,
                this.character.MAX_SPEED
            )
        }
        
    }
}

export class JumpingState extends BaseCharacterState {
    onStart() {
        if(this.character.pbox.vy <= 0) this.character.pbox.vy += this.character.JUMP_START_SPEED

        if(this.constructor == JumpingState) {
            if(this.character.commandsFlags[Character.commands.MOVE_RIGHT])
                this.changeState(JumpingRightState)
            else if(this.character.commandsFlags[Character.commands.MOVE_LEFT])
                this.changeState(JumpingLeftState)
        }
    }

    updateByPhysic() {
        if(this.character.pbox.vy < 0) {
            return this.changeState(FallingState)
        } else if(this.character.pbox.vy == 0) {
            if(this.character.pbox.vx < 0)
                return this.changeState(MovingLeftState)
            else if (this.character.pbox.vx > 0)
                return this.changeState(MovingRightState)
            else
                return this.changeState(StayingState)
        }
    }

    do(command) {
        switch(command) {
            case Character.commands.MOVE_LEFT:
                return this.changeState(JumpingLeftState, true)
            case Character.commands.MOVE_RIGHT:
                return this.changeState(JumpingRightState, true)
        }
    }

    undo(command) {
        switch(command) {
            case Character.commands.MOVE_RIGHT:
            case Character.commands.MOVE_LEFT:
                return this.changeState(JumpingState, true)
        }
    }
}

export class JumpingRightState extends JumpingState {
    updateByState(timedelta) {
        this.character.pbox.vx = Math.min(
            this.character.pbox.vx + this.character.JUMP_ACCELERATION * timedelta,
            this.character.MAX_SPEED
        )
    }
}

export class JumpingLeftState extends JumpingState {
    updateByState(timedelta) {
        this.character.pbox.vx = Math.max(
            this.character.pbox.vx - this.character.JUMP_ACCELERATION * timedelta,
            -this.character.MAX_SPEED
        )
    }
}

export class FallingState extends BaseCharacterState {
    onStart() {
        if(this.constructor == FallingState) {
            if(this.character.commandsFlags[Character.commands.MOVE_RIGHT])
                this.changeState(FallingRightState)
            else if(this.character.commandsFlags[Character.commands.MOVE_LEFT])
                this.changeState(FallingLeftState)
        }
    }

    updateByPhysic() {
        if(this.character.pbox.vy > 0) {
            return this.changeState(JumpingState)
        } else if(this.character.pbox.vy == 0) {
            if(this.character.commandsFlags[Character.commands.MOVE_LEFT])
                return this.changeState(LandingLeftState)
            else if (this.character.commandsFlags[Character.commands.MOVE_RIGHT])
                return this.changeState(LandingRightState)
            else
                return this.changeState(LandingState)
        }
    }

    do(command) {
        switch(command) {
            case Character.commands.MOVE_LEFT:
                return this.changeState(FallingLeftState, true)
            case Character.commands.MOVE_RIGHT:
                return this.changeState(FallingRightState, true)
        }
    }

    undo(command) {
        switch(command) {
            case Character.commands.MOVE_RIGHT:
            case Character.commands.MOVE_LEFT:
                return this.changeState(FallingState, true)
        }
    }
}

export class FallingRightState extends FallingState {
    updateByState(timedelta) {
        this.character.pbox.vx = Math.min(
            this.character.pbox.vx + this.character.JUMP_ACCELERATION * timedelta,
            this.character.MAX_SPEED
        )
    }
}

export class FallingLeftState extends FallingState {
    updateByState(timedelta) {
        this.character.pbox.vx = Math.max(
            this.character.pbox.vx - this.character.JUMP_ACCELERATION * timedelta,
            -this.character.MAX_SPEED
        )
    }
}

export class LandingState extends BaseCharacterState{
    updateByPhysic() {
        if(this.character.pbox.vy < 0) {
            return this.changeState(FallingState)
        }
    }

    landingSpeedUpdate(timedelta) {
        const vx = this.character.pbox.vx
        if(this.character.commandsFlags[Character.commands.MOVE_LEFT]) {
            this.character.pbox.vx = Math.max(
                this.character.pbox.vx - this.character.JUMP_ACCELERATION * timedelta,
                -this.character.MAX_SPEED
            )
        } else if (this.character.commandsFlags[Character.commands.MOVE_RIGHT]){
            this.character.pbox.vx = Math.min(
                this.character.pbox.vx + this.character.JUMP_ACCELERATION * timedelta,
                this.character.MAX_SPEED
            )
        } else {
            if(vx) {
                if(vx > 0){
                    this.character.pbox.vx = Math.max(
                        vx - this.character.ACCELERATION * timedelta, 0
                    ) 
                } else {
                    this.character.pbox.vx = Math.min(
                        vx + this.character.ACCELERATION * timedelta, 0
                    )
                }
            }
        }
    }

    updateByState(timedelta) {
        this.landingSpeedUpdate(timedelta)

        if(this.character.sprite.animationEnded) {
            if(this.character.commandsFlags[Character.commands.MOVE_LEFT])
                return this.changeState(MovingLeftState)
            else if (this.character.commandsFlags[Character.commands.MOVE_RIGHT])
                return this.changeState(MovingRightState)
            else
                return this.changeState(StayingState)
        }
    }
}

export class LandingRightState extends LandingState {
}

export class LandingLeftState extends LandingState {

}

export class RollingState extends BaseCharacterState {}

export class WallowState extends BaseCharacterState {
    updateByPhysic() {
        if(this.character.pbox.vy < 0) {
            return this.changeState(FallingState)
        } else if(this.character.pbox.vy > 0) {
            return this.changeState(JumpingState)
        }
    }
}
