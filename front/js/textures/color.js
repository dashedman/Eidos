class ColorTexture extends Texture{
    loadData(colors, w, h) {
        // render color pixels to image
        let canvas = utils.supportCanvas(w, h)
        let ctx = canvas.getContext('2d')
        let pixels = ctx.createImageData(w, h)
        for (let i = 0; i < pixels.data.length; i++) {
            // Modify pixel data
            pixels.data[i] = colors[i%colors.length]
        }
        ctx.putImageData(pixels, 0, 0)

        this.image = new Image()
        this.image.src = canvas.toDataURL()
        this.loadState = new Promise((resolve, reject) => {
            this.image.onload = resolve
            this.image.onerror = reject
        })
    }
}




