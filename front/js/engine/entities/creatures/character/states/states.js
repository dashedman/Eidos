"use strict"

import { AbstractState } from "./abstract.js";
import Character from "../character.js";
import Commander from "./../commander/base.js";

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
    changeState(state_cls, direction=null, continueAnimation=false) {
        return this.character.changeState(state_cls, direction, continueAnimation)
    }

    onStart() {}
    onFinish() {}

    do() {}
    undo() {}

    update(timedelta) {
        this.updatePhysic(timedelta)

        this.updateByPhysic(timedelta) ||
        this.updateByState(timedelta)
    }

    updatePhysic() {}
    updateByPhysic() {}
    updateByState() {}
}

export class StayingState extends BaseCharacterState {
    updatePhysic(timedelta) {
        // stoping
        const vx = this.character.pbox.vx
        if(vx) {
            const limitFunc = vx > 0 ? Math.max : Math.min
            const sign = Math.sign(vx)
            this.character.pbox.vx = limitFunc(
                0, vx - sign * this.character.ACCELERATION * 5 * timedelta
            )
        }
    }

    updateByPhysic(timedelta) {
        if(this.character.pbox.vy < 0) {
            return this.changeState(FallingState)
        } else if(this.character.pbox.vy > 0) {
            return this.changeState(JumpingState)
        }
    }

    updateByState(timedelta) {
        const vx = this.character.pbox.vx
        if(vx) {
            const limitFunc = vx > 0 ? Math.max : Math.min
            const sign = Math.sign(vx)
            this.character.pbox.vx = limitFunc(
                0, vx - sign * this.character.ACCELERATION * 5 * timedelta
            )
        } else {
            if( this.character.cf[Commander.cs.MOVE_RIGHT] ^ this.character.cf[Commander.cs.MOVE_LEFT]){
                if( this.character.cf[Commander.cs.MOVE_RIGHT] ) {
                    return this.changeState(WindupState, 1)
                }
                if (this.character.cf[Commander.cs.MOVE_LEFT]) {
                    return this.changeState(WindupState, -1)
                }
            }
            if (this.character.cf[Commander.cs.JUMP]) {
                return this.changeState(JumpingState)
            }
        }
    }
}

export class MovingState extends BaseCharacterState {
    updatePhysic(timedelta) {
        // moving
        const limitFunc = this.character.direction > 0 ? Math.min : Math.max
        this.character.pbox.vx = limitFunc(
            this.character.pbox.vx + this.character.direction * this.character.ACCELERATION * timedelta,
            this.character.direction * this.character.MAX_SPEED
        )
    }

    updateByPhysic(timedelta) {
        if(this.character.pbox.vy < 0) {
            return this.changeState(FallingState)
        } else if(this.character.pbox.vy > 0) {
            return this.changeState(JumpingState)
        }  
    }

    updateByState(timedelta) {
        if (this.character.cf[Commander.cs.JUMP]) {
            // jump
            return this.changeState(JumpingState)
        }
        if (
            // unpresed keys by direction
            this.character.direction > 0 && !this.character.cf[Commander.cs.MOVE_RIGHT] ||
            this.character.direction < 0 && !this.character.cf[Commander.cs.MOVE_LEFT] ||
            // unpresed keys 
            // or
            // double pressed - double direction run - error
            !( this.character.cf[Commander.cs.MOVE_LEFT] ^ this.character.cf[Commander.cs.MOVE_RIGHT] )
        ) {
            
            return this.changeState(StayingState)
        }
    }
}

export class WindupState extends MovingState {
    updateByState(timedelta) {
        // next state
        if(this.character.sprite.animationEnded) {
            return this.changeState(MovingState)
        }

        if (!( this.character.cf[Commander.cs.MOVE_LEFT] ^ this.character.cf[Commander.cs.MOVE_RIGHT] )) {
            // unpresed keys 
            // or
            // double pressed - double direction run - error
            return this.changeState(StayingState)
        }
    }
}

export class JumpingState extends BaseCharacterState {
    onStart() {
        if(this.character.pbox.vy <= 0) this.character.pbox.vy += this.character.JUMP_START_SPEED
    }

    updatePhysic(timedelta) {
        // stoping
        const vx = this.character.pbox.vx
        if(vx) {
            const limitFunc = vx > 0 ? Math.max : Math.min
            const sign = Math.sign(vx)
            this.character.pbox.vx = limitFunc(
                0, vx - sign * this.character.JUMP_ACCELERATION * timedelta
            )
        }
    }

    updateByPhysic(timedelta) {
        if(this.character.pbox.vy < 0) {
            return this.changeState(FallingState)
        }
    }

    updateByState(timedelta) {
        if( this.character.cf[Commander.cs.MOVE_RIGHT] ^ this.character.cf[Commander.cs.MOVE_LEFT]){
            if(this.character.cf[Commander.cs.MOVE_RIGHT]) {
                if(this.character.pbox.vx >= 0)
                    return this.changeState(JumpingMoveState, 1, true)
                else if (this.character.direction < 0)
                    return this.changeState(JumpingState, 1, true)
            }
    
            if(this.character.cf[Commander.cs.MOVE_LEFT]) {
                if(this.character.pbox.vx <= 0)
                    return this.changeState(JumpingMoveState, -1, true)
                else if (this.character.direction > 0)
                    return this.changeState(JumpingState, -1, true)
            }
        }
    }
}

export class JumpingMoveState  extends JumpingState {
    updatePhysic(timedelta) {
        const limitFunc = this.character.direction > 0 ? Math.min : Math.max
        this.character.pbox.vx = limitFunc(
            this.character.pbox.vx + this.character.direction * this.character.JUMP_ACCELERATION * timedelta,
            this.character.direction * this.character.MAX_SPEED
        )
    }

    updateByPhysic(timedelta) {
        if(this.character.pbox.vy < 0) {
            return this.changeState(FallingMoveState)
        }
    }

    updateByState(timedelta) {
        if (
            // unpresed keys by direction
            this.character.direction > 0 && !this.character.cf[Commander.cs.MOVE_RIGHT] ||
            this.character.direction < 0 && !this.character.cf[Commander.cs.MOVE_LEFT] ||
            // unpresed keys 
            // or
            // double pressed - double direction run - error
            !( this.character.cf[Commander.cs.MOVE_LEFT] ^ this.character.cf[Commander.cs.MOVE_RIGHT] )
        ) {
            return this.changeState(JumpingState, null, true)
        }
    }
}


export class FallingState extends BaseCharacterState {
    updatePhysic = JumpingState.prototype.updatePhysic

    updateByPhysic(timedelta) {
        if(this.character.pbox.vy > 0) {
            return this.changeState(JumpingState)
        } else if(this.character.pbox.vy == 0) {
            return this.changeState(LandingState)
        }
    }

    updateByState(timedelta) {
        if( this.character.cf[Commander.cs.MOVE_RIGHT] ^ this.character.cf[Commander.cs.MOVE_LEFT]){
            if(this.character.cf[Commander.cs.MOVE_RIGHT]) {
                if(this.character.pbox.vx >= 0)
                    return this.changeState(FallingMoveState, 1, true)
                else if (this.character.direction < 0)
                    return this.changeState(FallingState, 1, true)
            }
    
            if(this.character.cf[Commander.cs.MOVE_LEFT]) {
                if(this.character.pbox.vx <= 0)
                    return this.changeState(FallingMoveState, -1, true)
                else if (this.character.direction > 0)
                    return this.changeState(FallingState, -1, true)
            }
        }
        
    }
}

export class FallingMoveState extends FallingState {
    updatePhysic = JumpingMoveState.prototype.updatePhysic

    updateByPhysic(timedelta) {
        if(this.character.pbox.vy > 0) {
            return this.changeState(JumpingMoveState)
        } else if(this.character.pbox.vy == 0) {
            return this.changeState(LandingMoveState)
        }
    }

    updateByState(timedelta) {
        if (
            // unpresed keys by direction
            this.character.direction > 0 && !this.character.cf[Commander.cs.MOVE_RIGHT] ||
            this.character.direction < 0 && !this.character.cf[Commander.cs.MOVE_LEFT] ||
            // unpresed keys 
            // or
            // double pressed - double direction run - error
            !( this.character.cf[Commander.cs.MOVE_LEFT] ^ this.character.cf[Commander.cs.MOVE_RIGHT] )
        ) {
            return this.changeState(FallingState, null, true)
        }
    }
}

export class LandingState extends BaseCharacterState{
    updatePhysic = StayingState.prototype.updatePhysic
    updateByPhysic(timedelta) {
        if(this.character.pbox.vy < 0) {
            return this.changeState(FallingState)
        }
    }

    updateByState(timedelta) {
        if(this.character.sprite.animationEnded) {
            return this.changeState(StayingState)
        }
    }
}

export class LandingMoveState extends LandingState {
    updatePhysic = MovingState.prototype.updatePhysic
    updateByState = WindupState.prototype.updateByState
}

