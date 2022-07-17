'use strict'

import { JumpingState, MovingLeftState, StayingState } from "../../engine/entities/creatures/character/states/states"
import { MovingRightState, FallingState } from './../../engine/entities/creatures/character/states/states';
import { TravelMode } from './../../engine/entities/creatures/character/states/modes';
import { Player } from './../../engine/entities/creatures/player';


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
                        pixel_box: [50, 50]
                    }, 
                    {
                        cls: MovingRightState,
                        texture_name: 'player_moving',
                        pixel_box: [50, 50]
                    }, 
                    {
                        cls: MovingLeftState,
                        texture_name: 'player_moving',
                        pixel_box: [50, 50]
                    }, 
                    {
                        cls: FallingState,
                        texture_name: 'player_staying',
                        pixel_box: [50, 50]
                    }, 
                    {
                        cls: JumpingState,
                        texture_name: 'player_jumping',
                        pixel_box: [50, 50]
                    }, 
                ]
            }
        ]
    }
}

export function getPlayerTexturesData() {
    return [
        {name: 'player_staying', src: 'resources/animations/characters/player/idleMC.png', frameNumber: 3, frameOffset: 50, animationType: },
        {name: 'player_moving', src: 'resources/animations/characters/player/runMC.png', frameNumber: 12, frameOffset: 50},
        {name: 'player_jumping', src: 'resources/animations/characters/player/jmpMC1.png', frameNumber: 19, frameOffset: 50},
    ]
}
