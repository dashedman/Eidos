"use strict"

import { Physics as EnginePhysics } from "../engine/engine.js"
import World from "../engine/entities/enviroment/world.js"
import PhInertiaBox from "../engine/physics/colliders/inertia_box.js"
import GeometryTools from "../engine/utils/geometry.js";
import GMath from "../engine/utils/glsl_math.js";
import PhBox from './../engine/physics/colliders/box.js';

export default class Physics extends EnginePhysics {
    static G_FORCE = 9.8
    /**
     * 
     * @param {World} world 
     * @param  {...any} args 
     */
    constructor(world, debugMode=false){
        super(debugMode)

        this.world = world
    }

    /**
     * @param {Number} deltaTime - time difference between previous and current ticks in milliseconds
     */
    update(deltaTime) {
        const deltaTimeSec = deltaTime / 1000
        // add moves
        // calc collision
        for(let collider of this.inertedColliders) {
            proccesVelocity(collider, deltaTimeSec)
            if(collider.vx == 0 && collider.vy == 0) continue
            // check grid
            const [minX, minY, maxX, maxY] = collider.getBoundingCoords()
            // chunk coords
            const [chX, chY, optX, optY] = [
                minX / this.world.settings.chunkSize, 
                minY / this.world.settings.chunkSize, 
                maxX / this.world.settings.chunkSize, 
                maxY / this.world.settings.chunkSize
            ]

            // get grid from chunck
            const chunk = this.world.mainLayer.chunks.get(chX, chY)

            for(let gridX = Math.floor(minX); gridX <= maxX; gridX++)
                for(let gridY = Math.floor(minY); gridY <= maxY; gridY++) {
                    const ceil = chunk.grid[gridX][gridY]
                    if(ceil !== null && collider.isCollideWith(ceil.pbox)) {
                        proccesWithCeil(collider, ceil.pbox)
                    }
                }
        }
        // correcting
    }

    /**
     * 
     * @param {PhInertiaBox} obj 
     * @param {number} deltaTimeSec
     */
    proccesVelocity(obj, deltaTimeSec) {
        collider.vx += (obj.ax) * deltaTimeSec
        collider.vy += (obj.ay - this.G_FORCE) * deltaTimeSec
        collider.x += collider.vx
        collider.y += collider.vy
    }

    /**
     * 
     * @param {PhInertiaBox} collider 
     * @param {PhBox} ceil_box
     */
    proccesWithCeil(collider, ceil_box) {
        // coordinates of velocity vector 
        const [pX, pY] = GMath.normalize([collider.vx, collider.vy])
        // corner coords of ceil
        let nearestCornerX, nearestCornerY;
        if(collider.vx > 0) {
            nearestCornerX = ceil_box.x
            if(collider.vy > 0){
                nearestCornerY = ceil_box.y
                const angleOrientation = GeometryTools.pointLineOrientation(
                    collider.x, collider.y, 
                    collider.vx, collider.vy,
                    nearestCornerX, nearestCornerY
                )
                if(angleOrientation > 0) {
                    // collision with left edge
                    collider.x = ceil_box.x
                    collider.vx = 0
                } else {
                    // collision with bottom edge
                    collider.y = ceil_box.y
                    collider.vy = 0
                }
            } else {
                nearestCornerY = ceil_box.y + ceil_box.h
                const angleOrientation = GeometryTools.pointLineOrientation(
                    collider.x, collider.y, 
                    collider.vx, collider.vy,
                    nearestCornerX, nearestCornerY
                )
                if(angleOrientation > 0) {
                    // collision with top edge
                    collider.y = ceil_box.y + ceil_box.h
                    collider.vy = 0
                } else {
                    // collision with left edge
                    collider.x = ceil_box.x
                    collider.vx = 0
                }

            }
        } else {
            nearestCornerX = ceil_box.x + ceil_box.w
            if(collider.vy > 0){
                nearestCornerY = ceil_box.y
                const angleOrientation = GeometryTools.pointLineOrientation(
                    collider.x, collider.y, 
                    collider.vx, collider.vy,
                    nearestCornerX, nearestCornerY
                )
                if(angleOrientation > 0) {
                    // collision with bottom edge
                    collider.y = ceil_box.y
                    collider.vy = 0
                } else {
                    // collision with right edge
                    collider.x = ceil_box.x + ceil_box.w
                    collider.vx = 0
                }
            } else {
                nearestCornerY = ceil_box.y + ceil_box.h
                const angleOrientation = GeometryTools.pointLineOrientation(
                    collider.x, collider.y, 
                    collider.vx, collider.vy,
                    nearestCornerX, nearestCornerY
                )
                if(angleOrientation > 0) {
                    // collision with right edge
                    collider.x = ceil_box.x + ceil_box.w
                    collider.vx = 0
                } else {
                    // collision with top edge
                    collider.y = ceil_box.y + ceil_box.h
                    collider.vy = 0
                }
            }
        }
    }
}
