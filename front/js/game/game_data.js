import TextureManager from '../engine/graphics/textures/manager';


/**
 * @param { TextureManager } textureManager 
 */
function loadGameTextures(textureManager) {
    let metaData = getTexturesMetaData()
    for(let texture_data of metaData) {
        textureManager.createTexture(
            texture_data.name,
            texture_data.src,
            texture_data.frameNumber,
            texture_data.frameOffset,
        )
    }
}

function getTexturesMetaData() {
    return [
        {name: 'player_staying', src: 'resources/animations/characters/player/idleMC.png', frameNumber: 3, frameOffset: 50},
        {name: 'player_moving', src: 'resources/animations/characters/player/runMC.png', frameNumber: 12, frameOffset: 50},
    ]
}