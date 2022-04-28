import { SpriteMixins } from "../sprites/mixins.js";

export class Entities{

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