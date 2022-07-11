"use strict"
import enviroment from "./enviroment/enviroment.js";
import { SpriteMixins } from "../graphics/sprites/mixins.js";
import { Entity } from './base.js';
import { BackgroundBlock, Block, Decoration } from './block.js';
import { Location } from './location.js';
import { Player } from './creatures/player';
import Statement from "../statement.js";
import Texture from './../graphics/textures/base.js';
import { DRAW_GROUND_PLAN } from "../graphics/constants.js";
import u from "../utils/async_utils.js"
import Creature from "./creatures/base.js";
import TextBox from './../graphics/text/text.js';


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
    create(ClassOfEntity=Entity, texture, role=DRAW_GROUND_PLAN.MAIN, boxParams, prepareParams={}){
        if(u.extendsfrom(ClassOfEntity, BackgroundBlock)){
            prepareParams.texture = texture
            prepareParams.role = role
        }

        return new ClassOfEntity(this._state, prepareParams, boxParams)
    }
    
    /**
     * 
     * @param {String} text 
     * @param {{x: number, y: number, z: number, width: number, height: number}} param1 
     * @param {DRAW_GROUND_PLAN} role 
     * @returns 
     */
    createText(text, {x, y, z, width=null, height=null}, role=DRAW_GROUND_PLAN.MAIN){
        let signWidth, signHeight;
        if(width !== null || height !== null){
            let line_breaks_count = 0
            let max_line_length = 0
            let line_length = 0
            for(const char of text){
                if(char === '\n') {
                    line_breaks_count++
                    max_line_length = Math.max(line_length, max_line_length)
                    line_length = 0
                } else {
                    line_length++
                }
            }

            if(line_breaks_count == 0) line_breaks_count = 1;
            if (width !== null && max_line_length != 0) signWidth = width / max_line_length
            if (height !== null) signHeight = height / line_breaks_count
        }
        return this._state.render.textManager.createTextBox(text, x, y, z, signWidth, signHeight)
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
