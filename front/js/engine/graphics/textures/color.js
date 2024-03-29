"use strict"
import { autils } from "../../utils/utils.js";
import Texture from "./base.js";

export default class ColorTexture extends Texture{
    loadData({colors, w, h}) {
        // render color pixels to image
        let canvas = autils.supportCanvas(w, h)
        let ctx = canvas.getContext('2d')
        let pixels = ctx.createImageData(w, h)
        for (let i = 0; i < pixels.data.length; i++) {
            // Modify pixel data
            pixels.data[i] = colors[i%colors.length]
        }
        ctx.putImageData(pixels, 0, 0)

        super.loadData({src: canvas.toDataURL()})
    }
}




