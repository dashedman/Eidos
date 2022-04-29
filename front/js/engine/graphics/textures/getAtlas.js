import { autils } from "../../utils/utils.js"
export { atlas }



var atlas = {
    syncCompiling: function (data){
        let textures = data.textures
        let extrude = data.extrude || false
        // calc optimal positions
        let {size, tiling} = generateTiling(textures, extrude)

        // draw atlas
        let canvas = autils.supportCanvas(size.w, size.h)
        let ctx = canvas.getContext('2d')
        for(let tile of tiling){
            drawTile(ctx, tile, textures[tile.index].image, extrude)
        }

        // send answer
        return {tiling: tiling, atlas: canvas.toDataURL()}
    }
}

// if(this !== undefined && this.document === undefined){
//     // FOR WORKER
//     onmessage = function(event){
    
//         let textures = event.data.textures
//         let extrude = event.data.extrude || false
//         // calc optimal positions
//         let {size, tiling} = generateTiling(textures, extrude)
    
//         // draw atlas
//         let canvas = new OffscreenCanvas(size.w, size.h)
//         let ctx = canvas.getContext('2d')
//         for(let tile of tiling){
//             ctx.drawImage(
//                 textures[tile.index].image, 
//                 tile.x, tile.y, tile.w, tile.h
//             )
//         }
    
//         // send answer
//         postMessage({tiling: tiling, atlas: canvas.toDataUrl('png')})
//     }
// }



function generateTiling(textures, extrude=false){
    /*
    Floor Сeiling No Rotation algorithm
    https://habr.com/ru/post/136225/
    */

    // get sorted rectangles
    let getRectangle;
    if(extrude){
        getRectangle = (tex, index) => ({
            index: index, 
            id: tex.id,
            w: tex.image.naturalWidth+2, 
            h: tex.image.naturalHeight+2,
            x: 0,
            y: 0
        })
    } else {
        getRectangle = (tex, index) => ({
            index: index, 
            id: tex.id,
            w: tex.image.naturalWidth, 
            h: tex.image.naturalHeight,
            x: 0,
            y: 0
        })
    }

    let rectangles = textures.map(
        getRectangle
    ).sort(
        (rect_1, rect_2) => rect_2.h - rect_1.h
    )

    // calc sum of rects areas
    let summaryArea = rectangles.reduce( (acumulator, rect) => acumulator + rect.w*rect.h, 0 )
    let maxWidth = rectangles.reduce( (acumulator, rect) => Math.max(acumulator, rect.w), 0 )
    // estimating width by square area
    // with golden cut
    let estimateWidth = Math.max(Math.sqrt(summaryArea), maxWidth)

    // algorithm
    let levels = []
    let lastLevelHeight = 0;
    for(let i = 0; i < rectangles.length; i++){
        let rect = rectangles[i]
        let newLevel = true
        for(const level of levels){
            // seek place on floor
            let tmpWidth = 0;
            let index = 0;
            // while floor rects
            while(index < level.rects.length && level.rects[index].y == level.floor){
                tmpWidth += level.rects[index].w
                index++
            }
            if(tmpWidth <= estimateWidth - rect.w){
                // if can to set in level
                rect.x = tmpWidth
                rect.y = level.floor
                level.rects.push(rect)

                newLevel = false;
                break;
            }

            // seek place on ceil
            tmpWidth = 0;
            let floorIndex = index - 1;
            while(index < level.rects.length){
                tmpWidth += level.rects[index].w
                index++
            }
            if(tmpWidth <= estimateWidth - rect.w){
                // check on intersect with floor rects
                rect.x = estimateWidth - tmpWidth - rect.w
                rect.y = level.ceil - rect.h
                while(floorIndex >= 0 && level.rects[floorIndex].x + level.rects[floorIndex].w >= rect.x){
                    floorIndex--;
                }
                floorIndex++; // indexof the higer rect on floor, that may be intersect with newRect

                // if intersect - skip
                if(level.rects[floorIndex].y + level.rects[floorIndex].h >= rect.y) continue;
                
                // if can to set in level
                level.rects.push(rect)
                newLevel = false;
                break;
            }
        }

        if(newLevel){
            // create new level
            const lastLevel = {
                floor: lastLevelHeight,
                ceil: lastLevelHeight + rect.h,
                rects: []
            }
            levels.push(lastLevel)
            lastLevelHeight = lastLevel.ceil

            rect.y = lastLevel.floor
            rect.x = 0
            lastLevel.rects.push(rect)
        }
    }

    return {
        size: {w: estimateWidth, h: lastLevelHeight},
        tiling: rectangles
    };
}


function drawTile(ctx, tile, texture_src, extrude=false){
    if(extrude){
        // return real width and height
        tile.w -= 2;
        tile.h -= 2;

        // draw extrude framing
        // top
        ctx.drawImage(
            texture_src, 
            0, 0, tile.w, 1, // copy top line of image
            tile.x + 1, tile.y, tile.w, 1
        )
        // right
        ctx.drawImage(
            texture_src, 
            tile.w - 1, 0, 1, tile.h, // copy right line of image
            tile.x + (tile.w + 1), tile.y + 1, 1, tile.h
        )
        // bottom
        ctx.drawImage(
            texture_src, 
            0, tile.h - 1, tile.w, 1, // copy bottom line of image
            tile.x + 1, tile.y + (tile.h + 1), tile.w, 1,
        )
        // left
        ctx.drawImage(
            texture_src, 
            0, 0, 1, tile.h, // copy left line of image
            tile.x, tile.y + 1, 1, tile.h
        )

        // return real x and y
        tile.x++;
        tile.y++;

        // draw main texture
        ctx.drawImage(
            texture_src, 
            tile.x, tile.y
        )
    }else{
        ctx.drawImage(
            texture_src, 
            tile.x, tile.y
        )
    }
    
}
