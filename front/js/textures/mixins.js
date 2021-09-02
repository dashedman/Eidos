const TextureMixins = {
    iFramed: {
        iFramed: true,
        frameNumber = 1,
        frameOffset = 1, // frame width

        computeFrameOffset(){
            this.frameOffset = this.atlasCoords.w / frameNumber
        },
    },
}