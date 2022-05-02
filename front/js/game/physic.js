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
    update(deltaTimeSec) {
        const chunkSize = this.world.settings.chunkSize
        // add moves
        // calc collision
        for(let collider of this.inertedColliders) {
            this.processingVelocity(collider, deltaTimeSec)
            if(collider.vx == 0 && collider.vy == 0) continue
            const [pX, pY] = GMath.normalize([collider.vx, collider.vy])
            // check grid
            const [minX, minY, maxX, maxY] = collider.getBoundingCoords()
            // chunk coords
            let localGridGen = this.world.sliceGridGenDirected(
                minX, minY, maxX, maxY, 
                Math.sign(pX) || 1, Math.sign(pY) || 1
            )
            for(let ceil of localGridGen){
                if(ceil !== null && collider.isCollideWith(ceil.pbox)) {
                    this.processingWithCeil(collider, ceil.pbox)
                }
            }
        }
    }

    /**
     * 
     * @param {PhInertiaBox} obj 
     * @param {number} deltaTimeSec
     */
     processingVelocity(obj, deltaTimeSec) {
        obj.vx += (obj.ax) * deltaTimeSec
        obj.vy += (obj.ay) * deltaTimeSec //  - Physics.G_FORCE
        obj.x += obj.vx * deltaTimeSec
        obj.y += obj.vy * deltaTimeSec
    }

    /**
     * 
     * @param {PhInertiaBox} collider 
     * @param {PhBox} ceil_box
     */
     processingWithCeil(collider, ceil_box) {
        // coordinates of velocity vector 
        // corner coords of ceil
        let nearestCornerX, nearestCornerY;
        if(collider.vx > 0) {
            nearestCornerX = ceil_box.x
            if(collider.vy > 0){
                nearestCornerY = ceil_box.y
                const angleOrientation = GeometryTools.pointLineOrientation(
                    collider.x + collider.w, collider.y + collider.h, 
                    collider.vx, collider.vy,
                    nearestCornerX, nearestCornerY
                )
                if(angleOrientation > 0) {
                    // collision with left edge
                    collider.x = ceil_box.x - collider.w
                    collider.vx = 0
                } else {
                    // collision with bottom edge
                    collider.y = ceil_box.y - collider.h
                    collider.vy = 0
                }
            } else if (collider.vy < 0) {
                nearestCornerY = ceil_box.y + ceil_box.h
                const angleOrientation = GeometryTools.pointLineOrientation(
                    collider.x + collider.w, collider.y, 
                    collider.vx, collider.vy,
                    nearestCornerX, nearestCornerY
                )
                if(angleOrientation > 0) {
                    // collision with top edge
                    collider.y = ceil_box.y + ceil_box.h
                    collider.vy = 0
                } else {
                    // collision with left edge
                    collider.x = ceil_box.x - collider.w
                    collider.vx = 0
                }

            } else {
                const nonSoftYCollision = (
                    collider.y + collider.h > ceil_box.y && collider.y + collider.h <= ceil_box.y + ceil_box.h
                    || collider.y < ceil_box.y + ceil_box.h && collider.y >= ceil_box.y
                )
                if(nonSoftYCollision && ceil_box.x < collider.x + collider.w){
                    // horisontal right move
                    // only less! not equal
                    collider.x = ceil_box.x - collider.w
                    collider.vx = 0
                }
            }
        } else if (collider.vx < 0) {
            nearestCornerX = ceil_box.x + ceil_box.w
            if(collider.vy > 0){
                nearestCornerY = ceil_box.y
                const angleOrientation = GeometryTools.pointLineOrientation(
                    collider.x, collider.y + collider.h, 
                    collider.vx, collider.vy,
                    nearestCornerX, nearestCornerY
                )
                if(angleOrientation > 0) {
                    // collision with bottom edge
                    collider.y = ceil_box.y - collider.h
                    collider.vy = 0
                } else {
                    // collision with right edge
                    collider.x = ceil_box.x + ceil_box.w
                    collider.vx = 0
                }
            } else if(collider.vy < 0) {
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
            } else {
                const nonSoftYCollision = (
                    collider.y + collider.h > ceil_box.y && collider.y + collider.h <= ceil_box.y + ceil_box.h
                    || collider.y < ceil_box.y + ceil_box.h && collider.y >= ceil_box.y
                )
                if(nonSoftYCollision && ceil_box.x + ceil_box.w > collider.x){
                    // horisontal left move
                    // only greater! not equal
                    collider.x = ceil_box.x + ceil_box.w
                    collider.vx = 0
                }
            }
        } else {
            // vertical move
            // check non soft collision for x
            const nonSoftXCollision = (
                collider.x + collider.w > ceil_box.x && collider.x + collider.w <= ceil_box.x + ceil_box.w
                || collider.x < ceil_box.x + ceil_box.w && collider.x >= ceil_box.x
            )
            if (nonSoftXCollision) {
                if (collider.vy > 0 && ceil_box.y < collider.y + collider.h) {
                    // horisontal up move
                    // only less! not equal
                    collider.y = ceil_box.y - collider.h
                    collider.vy = 0
                } else if(collider.vy < 0 && ceil_box.y + ceil_box.h > collider.y) {
                    // horisontal down move
                    // only greater! not equal
                    collider.y = ceil_box.y + ceil_box.h
                    collider.vy = 0
                }
            }
        }
    }
}
