class Entities{
    static _staticEntities = [Block, BackgroundBlock, Decoration]
    static _streamEntities = []

    constructor(state){
        this.state = state
    }

    create(ClassOfEntity=Entity, texture, ...entityArgs){
        let mixins = []
        if(texture.frameNumber > 1) mixins.push(SpriteMixins.iAnimated)

        // get type of entity
        let renderType;
        if(Entities._staticEntities.indexOf(ClassOfEntity) !== -1){
            renderType = 'STATIC';
        }else if(Entities._streamEntities.indexOf(ClassOfEntity) !== -1){
            renderType = 'STREAM';
        }else{
            renderType = 'DYNAMIC';
        }
    
        let sprite = this.state.render.createSprite({
            texture: texture, 
            mixins: mixins
        }, renderType)
        return new ClassOfEntity(sprite, ...entityArgs)
    }
}