import enviroment from "./enviroment/enviroment.js";
import { SpriteMixins } from "../graphics/sprites/mixins.js";
import { Entity } from './base.js';
import { BackgroundBlock, Block, Decoration } from './block.js';
import { Location } from './location.js';
import { Player } from './player.js';


export default class Entities{

    constructor(){
        this._state = null
    }

    create(ClassOfEntity=Entity, texture, role='MAIN', entityParams){
        let mixins = []
        if(texture.frameNumber > 1) mixins.push(SpriteMixins.iAnimated)
    
        let sprite = this._state.render.createSprite({
            texture: texture, 
            mixins: mixins
        }, role)
        return new ClassOfEntity(sprite, entityParams)
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
