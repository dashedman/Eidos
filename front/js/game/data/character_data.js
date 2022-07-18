'use strict'

import { FallingRightState, JumpingLeftState, JumpingState, LandingLeftState, LandingState, MovingLeftState, StayingState } from "../../engine/entities/creatures/character/states/states"
import { MovingRightState, FallingState, JumpingRightState, FallingLeftState, LandingRightState } from './../../engine/entities/creatures/character/states/states';
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
                        cls: MovingRightState,
                        texture_name: 'player_moving',
                        pixel_box: [50, 50],
                        sprite_meta: {
                            reversed: false,
                            loopMode: AnimatedSprite.LOOP_MODE.CYCLE,
                            frameRate: 140
                        }
                    }, 
                    {
                        cls: MovingLeftState,
                        texture_name: 'player_moving',
                        pixel_box: [50, 50],
                        sprite_meta: {
                            reversed: true,
                            loopMode: AnimatedSprite.LOOP_MODE.CYCLE,
                            frameRate: 140
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
                        cls: FallingRightState,
                        texture_name: 'player_falling',
                        pixel_box: [50, 50],
                        sprite_meta: {
                            reversed: false,
                            loopMode: AnimatedSprite.LOOP_MODE.ONCE
                        }
                    }, 
                    {
                        cls: FallingLeftState,
                        texture_name: 'player_falling',
                        pixel_box: [50, 50],
                        sprite_meta: {
                            reversed: true,
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
                        cls: JumpingRightState,
                        texture_name: 'player_jumping',
                        pixel_box: [50, 50],
                        sprite_meta: {
                            reversed: false,
                            loopMode: AnimatedSprite.LOOP_MODE.ONCE
                        }
                    }, 
                    {
                        cls: JumpingLeftState,
                        texture_name: 'player_jumping',
                        pixel_box: [50, 50],
                        sprite_meta: {
                            reversed: true,
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
                        cls: LandingRightState,
                        texture_name: 'player_directed_landing',
                        pixel_box: [50, 50],
                        sprite_meta: {
                            reversed: false,
                            loopMode: AnimatedSprite.LOOP_MODE.ONCE
                        }
                    },
                    {
                        cls: LandingLeftState,
                        texture_name: 'player_directed_landing',
                        pixel_box: [50, 50],
                        sprite_meta: {
                            reversed: true,
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
        {name: 'player_jumping', src: 'resources/animations/characters/player/upMC.png', frameNumber: 9, frameOffset: 50},
        {name: 'player_falling', src: 'resources/animations/characters/player/MCfall2.png', frameNumber: 5, frameOffset: 50},
        {name: 'player_landing', src: 'resources/animations/characters/player/MCprizemlenie.png', frameNumber: 9, frameOffset: 50},
        {name: 'player_directed_landing', src: 'resources/animations/characters/player/prizbegMC.png', frameNumber: 3, frameOffset: 50},
    ]
}
