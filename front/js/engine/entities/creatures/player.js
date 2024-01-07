"use strict"

import User from "./user.js";
import Commander from "./character/commander/base.js";
import CharacterSkinsList from "./../skins/character_skins_list.js";
import Statement from "../../statement.js";
import { DRAW_GROUND_PLAN } from "../../graphics/constants.js";
import { BaseCharacterState, StayingState } from "./character/states/states.js";
import { EngineError } from "../../exceptions.js";


export class Player extends User {
    /**
     * 
     * @param { Statement } state
     * @param {*} prepareParams
     * @param {{x: number, y: number, z:number, w: number, h:number}} param2 
     */
    constructor(state, prepareParams, {x, y, z=1, w=1, h=1}, dispatcher) {
        super(state, prepareParams, {x, y, z, w, h})
        /** @type { CharacterSkinsList } */
        this.skinsSources = this.prepareSkinsSources(state)

        /** @type { BaseCharacterState } */
        this.state = new StayingState(this)
        /** @type { Commander } */
        this.commander = new Commander(this, dispatcher)
        /** @type { Boolean[] } */
        this.commandsFlags = this.cf = new Array(16)
        this.commandsFlags.fill(false)

        this.changeState(StayingState)
        this.ACCELERATION = 15
        this.MAX_SPEED = 10
        this.JUMP_START_SPEED = 18
        this.JUMP_ACCELERATION = this.ACCELERATION
    }

    /**
     * @param { Statement } state 
     * @param {*} param1 
     */
    prepare(state, {role=DRAW_GROUND_PLAN.MAIN}) {
        let texture = state.render.textureManager.plug

        this.sprite = state.render.createSprite({
            texture: texture,
            isAnimated: true,
        }, role)

        this.pbox = this.getPhysBox(state)
    }

    do(command) {
        this.commandsFlags[command] = true
    }

    undo(command) {
        this.commandsFlags[command] = false
    }

    /**
     * @param { typeof BaseCharacterState } state_cls
     * @param { ?(-1 | 1) } direction
     * @param { boolean } continueAnimation
     */
    changeState(state_cls, direction=null, continueAnimation=false) {
        if(direction !== null) {
            this.direction = direction
        }
        console.log(state_cls.name, this.direction > 0 ? 'right' : 'left')

        this.state.onFinish()
        this.state = new state_cls(this)
        this.state.onStart()

        if(this.state.constructor == state_cls) {

            let state_skin = this.skinsSources.get(state_cls.name)
            if (!state_skin) throw new EngineError(`StateSkin not found for ${state_cls.name}!`)

            state_skin.adaptPhysicBox(this.pbox)

            const {loop_mode: loopMode, animation_duration: animationDuration} = state_skin.getSpriteMeta()
            const reversed = this.direction < 0

            this.sprite.setFrameRateFromDuration(animationDuration)
            this.sprite.setLoopMode(loopMode)

            this.sprite.setTexture(
                state_skin.getTexture(),
                reversed
            ).then(() => {
                const prevAnimFrame = this.sprite.currentFrame
                this.sprite.initAnimation()
                if(continueAnimation){
                    this.sprite.currentFrame = prevAnimFrame
                }
                    
            })
            if(!continueAnimation) this.sprite.currentFrame = 0

            this.syncSpriteWithBox()
        }
    }

    update(timedelta) {
        this.state.update(timedelta)
    }

    /**
     * @param { Statement } state
     * @returns { CharacterSkinsList }
     */
    prepareSkinsSources(state) {
        return state.storage.skinsList.get('player')
    }
}
