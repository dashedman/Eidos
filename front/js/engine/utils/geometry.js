"use strict"
/**
 * https://habr.com/ru/post/148325/
 */
export default class GeometryTools {
    /**
     * 
     * @param {number} lx - X coord of point on line
     * @param {number} ly - Y coord of point on line
     * @param {number} dx - X coord of direction vector for line
     * @param {number} dy - Y coord of direction vector for line
     * @param {number} px - X coord of point
     * @param {number} py - X coord of point
     * @returns {number} - 0 if point on line, -1 if lefthand, 1 if righthand
     */
    static pointLineOrientation(lx, ly, dx, dy, px, py) {
        return Math.sign((px - lx) * dy - (py - ly) * dx)
    }
}