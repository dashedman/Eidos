import enviroment from "./enviroment/enviroment.js";
import { SpriteMixins } from "../graphics/sprites/mixins.js";
import { Entity } from './base';
import { BackgroundBlock, Block, Decoration } from './block';
import { Location } from './location';
import { Player } from './player';

export default {
    enviroment,
    Entity,
    BackgroundBlock,
    Block,
    Decoration,
    Location,
    Player,
    Entities
} 

class Entities{

    constructor(state){
        this.state = state
    }

    create(ClassOfEntity=Entity, texture, role='MAIN', entityParams){
        let mixins = []
        if(texture.frameNumber > 1) mixins.push(SpriteMixins.iAnimated)
    
        let sprite = this.state.render.createSprite({
            texture: texture, 
            mixins: mixins
        }, role)
        return new ClassOfEntity(sprite, entityParams)
    }
}
