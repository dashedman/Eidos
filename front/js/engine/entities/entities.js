"use strict"
import enviroment from "./enviroment/enviroment.js";
import { SpriteMixins } from "../graphics/sprites/mixins.js";
import { Entity } from './base.js';
import { BackgroundBlock, Block, Decoration } from './block.js';
import { Location } from './location.js';
import { Player } from './player.js';
import Statement from "../statement.js";
import { Texture } from './../graphics/textures/base.js';
import { DRAW_GROUND_PLAN } from "../graphics/constants.js";
import u from "../utils/async_utils.js"
import Creature from "./creatures/base.js";


export default class Entities{

    constructor(){
        /** @type {Statement} */
        this._state = null
    }

    /**
     * 
     * @param {Entity} ClassOfEntity 
     * @param {Texture} texture 
     * @param {DRAW_GROUND_PLAN} role 
     * @param {Object} entityParams 
     * @returns 
     */
    create(ClassOfEntity=Entity, texture, role=DRAW_GROUND_PLAN.MAIN, entityParams){
        let mixins = []
        if(texture.frameNumber > 1) mixins.push(SpriteMixins.iAnimated)
    
        if(u.extendsfrom(ClassOfEntity, BackgroundBlock)){
            let sprite = this._state.render.createSprite({
                texture: texture, 
                mixins: mixins
            }, role)

            if(u.extendsfrom(ClassOfEntity, Block)) {
                let physBox;
                if(u.extendsfrom(ClassOfEntity, Creature)) {
                    physBox = this._state.physics.createInertedBox()
                } else {
                    physBox = this._state.physics.createPhysicBox()
                }
                return new ClassOfEntity(sprite, physBox, entityParams)
            }
            return new ClassOfEntity(sprite, entityParams)
        }
        return new ClassOfEntity(entityParams)
        
    }

    async prepare() {
        console.debug('Preparing Entities...')
        console.debug('Entities prepeared.')
    }
}

export {
    enviroment,
    Entity,
    BackgroundBlock,
    Block,
    Decoration,
    Location,
    Player,
    Entities
} 
