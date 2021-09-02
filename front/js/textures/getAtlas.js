if(this.document === undefined){
    // FOR WORKER
    onmessage = function(event){
    
        let textures = event.data.textures
        // calc optimal positions
        let [size, tiling] = generateTiling(textures)
    
        // draw atlas
        let canvas = new OffscreenCanvas(size.w, size.h)
        let ctx = canvas.getContext('2d')
        for(let tile of tiling){
            ctx.drawImage(
                textures[tile.index].image, 
                tile.x, tile.y, tile.w, tile.h
            )
        }
    
        // send answer
        postMessage({tiling: tiling, atlas: canvas.toDataUrl('png')})
    }
}else{
    var atlas = {
        syncCompiling: function (data){
            let textures = data.textures
            // calc optimal positions
            let {size, tiling} = generateTiling(textures)

            // draw atlas
            let canvas = utils.supportCanvas(size.w, size.h)
            let ctx = canvas.getContext('2d')
            for(let tile of tiling){
                ctx.drawImage(
                    textures[tile.index].image, 
                    tile.x, tile.y, tile.w, tile.h
                )
            }

            // send answer
            return {tiling: tiling, atlas: canvas.toDataURL()}
        }
    }
}





function generateTiling(textures){
    /*
    Floor Сeiling No Rotation algorithm
    https://habr.com/ru/post/136225/
    */

    // get sorted rectangles
    let rectangles = textures.map(
        (tex, index) => ({
            index: index, 
            name: tex.name,
            w: tex.image.naturalWidth, 
            h: tex.image.naturalHeight,
            x: 0,
            y: 0
        })
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
            floorIndex = index - 1;
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