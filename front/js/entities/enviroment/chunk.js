class Chunk {
    constructor(x, y, width, height){
        this.x = x
        this.y = y
        this.width = width
        this.height = height

        this.grid = new Array(width)
        for(let x = 0; x < width; x++){
            this.grid[x] = new Array(height)
        }
    }
}