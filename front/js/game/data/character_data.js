'use strict'

import { FallingMoveState, JumpingMoveState, JumpingState, LandingMoveState, LandingState, StayingState, WindupState } from "../../engine/entities/creatures/character/states/states"
import { FallingState, MovingState } from './../../engine/entities/creatures/character/states/states';
import { TravelMode } from './../../engine/entities/creatures/character/states/modes';
import { Player } from './../../engine/entities/creatures/player';
import AnimatedSprite from "../../engine/graphics/sprites/animated";


export function getPlayerSkinsMeta() {
    return {
        cls: Player,
        modesMeta: [
            {
                cls: TravelMode,
                statesMeta: [
                    {
                        cls: StayingState,
                        texture_name: 'player_staying',
                        pixel_box: [50, 50],
                        sprite_meta: {
                            loopMode: AnimatedSprite.LOOP_MODE.CYCLE,
                            frameRate: 140,
                        }
                    }, 
                    {
                        cls: MovingState,
                        texture_name: 'player_moving',
                        pixel_box: [50, 50],
                        sprite_meta: {
                            loopMode: AnimatedSprite.LOOP_MODE.CYCLE,
                            frameRate: 120
                        }
                    },
                    {
                        cls: WindupState,
                        texture_name: 'player_windup',
                        pixel_box: [50, 50],
                        sprite_meta: {
                            loopMode: AnimatedSprite.LOOP_MODE.ONCE,
                            frameRate: 30
                        }
                    },
                    {
                        cls: FallingState,
                        texture_name: 'player_falling',
                        pixel_box: [50, 50],
                        sprite_meta: {
                            loopMode: AnimatedSprite.LOOP_MODE.ONCE
                        }
                    }, 
                    {
                        cls: FallingMoveState,
                        texture_name: 'player_falling',
                        pixel_box: [50, 50],
                        sprite_meta: {
                            loopMode: AnimatedSprite.LOOP_MODE.ONCE
                        }
                    },
                    {
                        cls: JumpingState,
                        texture_name: 'player_jumping',
                        pixel_box: [50, 50],
                        sprite_meta: {
                            loopMode: AnimatedSprite.LOOP_MODE.ONCE
                        }
                    }, 
                    {
                        cls: JumpingMoveState,
                        texture_name: 'player_jumping',
                        pixel_box: [50, 50],
                        sprite_meta: {
                            loopMode: AnimatedSprite.LOOP_MODE.ONCE
                        }
                    },
                    {
                        cls: LandingState,
                        texture_name: 'player_landing',
                        pixel_box: [50, 50],
                        sprite_meta: {
                            loopMode: AnimatedSprite.LOOP_MODE.ONCE
                        }
                    },
                    {
                        cls: LandingMoveState,
                        texture_name: 'player_directed_landing',
                        pixel_box: [50, 50],
                        sprite_meta: {
                            loopMode: AnimatedSprite.LOOP_MODE.ONCE
                        }
                    },
                ]
            }
        ]
    }
}

export function getPlayerTexturesData() {
    return [
        {name: 'player_staying', src: 'resources/animations/characters/player/idle.png', frameNumber: 3, frameOffset: 50},
        {name: 'player_moving', src: 'resources/animations/characters/player/runMC.png', frameNumber: 6, frameOffset: 50},
        {name: 'player_windup', src: 'resources/animations/characters/player/windup.png', frameNumber: 4, frameOffset: 50},
        {name: 'player_jumping', src: 'resources/animations/characters/player/upMC.png', frameNumber: 9, frameOffset: 50},
        {name: 'player_falling', src: 'resources/animations/characters/player/MCfall2.png', frameNumber: 5, frameOffset: 50},
        {name: 'player_landing', src: 'resources/animations/characters/player/MCprizemlenie.png', frameNumber: 9, frameOffset: 50},
        {name: 'player_directed_landing', src: 'resources/animations/characters/player/prizbegMC.png', frameNumber: 3, frameOffset: 50},
    ]
}
