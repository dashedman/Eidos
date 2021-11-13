export class MultiLine {
    constructor(_manager, points, color){
        this.color = color || [255, 255, 255]
        this.points = new Float32Array(points.length * 3)
        for(let [index, point] of points.entries()){
            this.points[index*3] = point.x
            this.points[index*3 + 1] = point.y
            this.points[index*3 + 2] = point.z
        }
    }
}