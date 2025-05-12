"use strict"

import GMath from "./glsl_math.js";
import { mat4 } from "./gl_matrix/index.js"

export default class Camera {
    constructor() {
        this.settings = {
            fovy: GMath.radians(60),        // 	Vertical field of view in radians
            aspect: 1,      // 	Aspect ratio. typically viewport width/height
            near: 1,      //  Near bound of the frustum
            far: 50,  //  Far bound of the frustum, can be null or Infinity
        }
        this.position = [0, 0, 0];
        this.direction = [0, 0, -1]; // need to be normalize
        this.upAxis = [0, 1, 0]; //  orientation, do not to be changed
        this.rightAxis = [1, 0, 0]; //  orientation, do not to be changed

        this.projectionMatrix = mat4.create()
        this.invertedProjectionMatrix = mat4.create()
        this.viewMatrix = mat4.create()
        this.invertedViewMatrix = mat4.create()
        this.VP = mat4.create()

        this.needUpdate = false
        this.recalcProjectionMatrix()
        this.recalcVPMatrix()

        this.targets = []
        this.movingMode = null
        this._movingFunction = null
        this.speed = 1

        this.setMovingMode(Camera.MOVING_MODES.STATIC)
    }

    setPosition(x, y, z){
        this.position[0] = x
        this.position[1] = y
        this.position[2] = z
        this.recalcVPMatrix()
    }

    setPositionZ(z){
        this.position[2] = z
        this.recalcVPMatrix()
    }

    setDirection(x, y, z){
        let raw_vector = GMath.normalize([x, y, z])
        this.direction[0] = raw_vector[0]
        this.direction[1] = raw_vector[1]
        this.direction[2] = raw_vector[2]

        // recalc ortogonal up and right axises
        this.rightAxis = GMath.normalize(GMath.cross(this.direction, this.upAxis))
        this.upAxis = GMath.normalize(GMath.cross(this.rightAxis, this.direction))

        this.recalcVPMatrix()
    }

    setFovy(fovy){
        this.settings.fovy = fovy
        this.recalcProjectionMatrix()
        this.recalcMatrix()
    }

    setRatio(ratio){
        this.settings.aspect = ratio
         this.recalcProjectionMatrix()
        this.recalcVPMatrix()
    }

    recalcProjectionMatrix() {
        mat4.perspective(
            this.projectionMatrix,
            this.settings.fovy,
            this.settings.aspect,
            this.settings.near,
            this.settings.far,
        )

        mat4.invert(
            this.invertedProjectionMatrix,
            this.projectionMatrix
        )
    }

    recalcViewMatrix() {
        //https://www.3dgep.com/understanding-the-view-matrix/
        let ivm = this.invertedViewMatrix

        ivm[0] = this.rightAxis[0]
        ivm[1] = this.rightAxis[1]
        ivm[2] = this.rightAxis[2]

        ivm[4] = this.upAxis[0]
        ivm[5] = this.upAxis[1]
        ivm[6] = this.upAxis[2]

        ivm[8]  = this.direction[0]
        ivm[9]  = this.direction[1]
        ivm[10] = this.direction[2]

        ivm[12]  = this.position[0]
        ivm[13]  = this.position[1]
        ivm[14] = this.position[2]

        ivm[3] = ivm[7] = ivm[11] = 0
        ivm[15] = 1
        
        mat4.invert(this.viewMatrix, ivm)
    }

    recalcVPMatrix(){
        this.recalcViewMatrix()
        this.VP = mat4.mul(
            this.VP,
            this.projectionMatrix,
            this.viewMatrix
        )
    }

    // high level methods
    addTarget(target) {
        this.targets.push(target)
    }

    delTarget(target) {
        const indexOfTarget = this.targets.indexOf(target)
        if(indexOfTarget > -1){
            this.targets.splice(indexOfTarget, 1)
            return true
        }
        return false
    }

    clearTargets() {
        this.targets.length = 0
    }

    calculatePositionByTargets(timeDelta){
        const destinationPos = new Float32Array(2)
        destinationPos[0] = 0
        destinationPos[1] = 0

        if(this.targets.length == 0){
            return
        }

        for(const target of this.targets){
            const targetCenter = target.getCenter()

            destinationPos[0] += targetCenter.x
            destinationPos[1] += targetCenter.y
        }

        destinationPos[0] /= this.targets.length
        destinationPos[1] /= this.targets.length
        
        this._movingFunction(destinationPos, timeDelta)
    }

    setMovingMode(modeId){
        let movingModeIsExist = false;
        for(const modeName in Camera.MOVING_MODES){
            if(Camera.MOVING_MODES[modeName] == modeId){
                movingModeIsExist = true
                break
            }
        }

        if(movingModeIsExist){
            this.movingMode = modeId

            this._movingFunction = Camera.MOVING_FUNCTIONS[modeId].bind(this)
        }else{
            console.error(`[Camera] Mode '${modeId}' doesn't found`)
        }
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} zTarget 
     * @returns {{
     *  x: number,
     *  y: number
     * }}
     */
    getIntersectMouseWithZPlane(x, y, zTarget=0) {
        let ray = this.getMouseRay(x, y)
        // [2] - is z
        const t = (zTarget - ray.origin[2]) / ray.direction[2]
        return {
            x: ray.origin[0] + t * ray.direction[0],
            y: ray.origin[1] + t * ray.direction[1],
        }
    }

    /**
     * @param {number} x - mouse coord in NDC
     * @param {number} y - mouse coord in NDC
     * @return {{origin: [numper, number, number], direction: [numper, number, number]}}
     */
    getMouseRay(x, y) {
        let clipCoords = [x, y, -1, 1]
        
        let rayEye = GMath.mat4vec4multiply(
            this.invertedProjectionMatrix,
            clipCoords
        )
        let rayWorld = GMath.mat4vec4multiply(
            this.invertedViewMatrix,
            [rayEye[0], rayEye[1], -1, 0]
        )
        
        return {
            origin: [...this.position],
            direction: GMath.normalize([rayWorld[0], rayWorld[1], rayWorld[2]])
        }
    }


    static MOVING_MODES = {
        STATIC: 0,
        CONSTANT: 1,
        LINEAR: 2,
        QUADRATIC: 3,
        EXPANENTIAL: 4,
    }
    static MOVING_FUNCTIONS = [
        // STATIC
        function(destinationPos){
            this.setPosition(
                destinationPos[0],
                destinationPos[1],
                this.position[2],
            )
        },
        // CONSTANT
        function(destinationPos, timeDelta){
            const position2D = this.position.slice(0, 2)

            const distance = GMath.distance(destinationPos, position2D)
            const moveDirection = GMath.normalize(GMath.vecsub(destinationPos, position2D))
            const stepLength = Math.min(this.speed * timeDelta, distance)
            if(stepLength == 0) return
            if(stepLength < 1e-5) {
                return this.setPosition(
                    destinationPos[0],
                    destinationPos[1],
                    this.position[2],
                )
            }

            const x = this.position[0] + moveDirection[0]*stepLength
            const y = this.position[1] + moveDirection[1]*stepLength
            const z = this.position[2]

            this.setPosition(x, y, z)
        },
        // LINEAR
        function(destinationPos, timeDelta){
            const position2D = this.position.slice(0, 2)

            const distance = GMath.distance(destinationPos, position2D)
            const moveDirection = GMath.normalize(GMath.vecsub(destinationPos, position2D))
            const stepLength = Math.min(this.speed * distance * timeDelta, distance)
            if(stepLength == 0) return
            if(stepLength < 1e-5) {
                return this.setPosition(
                    destinationPos[0],
                    destinationPos[1],
                    this.position[2],
                )
            }

            const x = this.position[0] + moveDirection[0]*stepLength
            const y = this.position[1] + moveDirection[1]*stepLength
            const z = this.position[2]

            this.setPosition(x, y, z)
        },
        // QUADRATIC
        function(destinationPos, timeDelta){
            const position2D = this.position.slice(0, 2)

            const distance = GMath.distance(destinationPos, position2D)
            const moveDirection = GMath.normalize(GMath.vecsub(destinationPos, position2D))
            const stepLength = Math.min(this.speed * distance * distance * timeDelta, distance)
            if(stepLength == 0) return
            if(stepLength < 1e-5) {
                return this.setPosition(
                    destinationPos[0],
                    destinationPos[1],
                    this.position[2],
                )
            }

            const x = this.position[0] + moveDirection[0]*stepLength
            const y = this.position[1] + moveDirection[1]*stepLength
            const z = this.position[2]

            this.setPosition(x, y, z)
        },
        // EXPANENTIAL
        function(destinationPos, timeDelta){
            const position2D = this.position.slice(0, 2)

            const distance = GMath.distance(destinationPos, position2D)
            const moveDirection = GMath.normalize(GMath.vecsub(destinationPos, position2D))
            const stepLength = Math.min(this.speed * Math.exp(distance) * timeDelta, distance)
            if(stepLength == 0) return
            if(stepLength < 1e-5) {
                return this.setPosition(
                    destinationPos[0],
                    destinationPos[1],
                    this.position[2],
                )
            }

            const x = this.position[0] + moveDirection[0]*stepLength
            const y = this.position[1] + moveDirection[1]*stepLength
            const z = this.position[2]

            this.setPosition(x, y, z)
        },
    ]
}
