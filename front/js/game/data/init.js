'use strict'

import TextureManager from '../../engine/graphics/textures/manager';
import GlobalSkinsList from './../../engine/entities/skins/global_skins_list';
import CharacterSkinsList from './../../engine/entities/skins/character_skins_list';
import StateSkin, { AlignInfo, ChangeBoxData } from './../../engine/entities/skins/state_skin';
import ModeSkinsList from './../../engine/entities/skins/mode_skins_list';
import Statement from './../../engine/statement';
import { getPlayerSkinsMeta, getPlayerTexturesData } from './character_data';


/**
 * 
 * @param { Statement } state 
 * @returns 
 */
export function loadGame(state) {
    loadTextures(state.render.textureManager)
    return loadSkins(state)
}

/**
 * 
 * @param { Statement } state 
 * @returns 
 */
function loadSkins(state) {
    let skinsList = new GlobalSkinsList(state)

    const skinsMeta = getSkinsMeta()
    for(let skin of skinsMeta) {
        let character_skins = new CharacterSkinsList(state)
        
        for(let mode of skin.modesMeta) {
            let mode_skins = new ModeSkinsList()

            for(let char_state of mode.statesMeta) {
                const [pw, ph] = char_state.pixel_box
                const [w, h] = [pw / state.PIXELS_MEASURE, ph / state.PIXELS_MEASURE]
                let box_data = new ChangeBoxData(
                    w, h, 0, 0, 
                    new AlignInfo(StateSkin.alignMode.CENTER, StateSkin.alignMode.BOTTOM)
                )

                mode_skins.set(
                    char_state.cls, 
                    new StateSkin({
                        texture_name: char_state.texture_name, 
                        box: box_data
                    })
                )
            }

            character_skins.set(mode.cls, mode_skins)  
        }

        skinsList.set(skin.cls, character_skins)
    }

    return skinsList
}

function getSkinsMeta() {
    return [
        getPlayerSkinsMeta(),
    ]
}


/**
 * @param { TextureManager } textureManager 
 */
function loadTextures(textureManager) {
    let metaData = getPlayerTexturesData()

    for(let texture_data of metaData) {
        textureManager.createTexture(
            texture_data.name,
            texture_data.src,
            texture_data.frameNumber,
            texture_data.frameOffset,
        )
    }
}
