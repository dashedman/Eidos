"use strict"
import { mat4 } from "./gl_matrix/index.js"

export default class Camera {
    constructor(target) {
        this.settings = {
            fovy: Math.radians(60),        // 	Vertical field of view in radians
            aspect: 1,      // 	Aspect ratio. typically viewport width/height
            near: 1,      //  Near bound of the frustum
            far: Infinity,  //  Far bound of the frustum, can be null or Infinity
        }
        this.position = [0, 0, 0];
        this.direction = [0, 0, 1]; // need to be normalize
        this.upAxis = [0, 1, 0]; //  orientation, do not to be changed

        this._projMatrix = this.calcProjMatrix()
        this.viewMatrix = mat4.create();
        this.needUpdate = false;
        this.recalcMatrix()

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

        this.recalcMatrix()
    }
    setDirection(x, y, z){
        let raw_vector = Math.normalize([x, y, z])
        this.direction[0] = raw_vector[0]
        this.direction[1] = raw_vector[1]
        this.direction[2] = raw_vector[2]

        this.recalcMatrix()
    }
    setFovy(fovy){
        this.settings.fovy = fovy
        this._projMatrix = this.calcProjMatrix()
        this.recalcMatrix()
    }
    setRatio(ratio){
        this.settings.aspect = ratio
        this._projMatrix = this.calcProjMatrix()
        this.recalcMatrix()
    }
    calcProjMatrix(){
        return mat4.perspective(
            mat4.create(),
            this.settings.fovy,
            this.settings.aspect,
            this.settings.near,
            this.settings.far,
        )
    }
    recalcMatrix(){
        const invertedPos = [
            -this.position[0],
            -this.position[1],
            this.position[2]
        ]
        
        this.viewMatrix = mat4.mul(
            this.viewMatrix,
            this._projMatrix,
            mat4.translate(
                this.viewMatrix,
                mat4.identity(this.viewMatrix),
                invertedPos, 
            )
        )
        this.needUpdate = true;
    }

    // high level methods
    addTarget(target){
        this.targets.push(target)
    }
    delTarget(target){
        const indexOfTarget = this.targets.indexOf(target)
        if(indexOfTarget > -1){
            this.targets.splice(indexOfTarget, 1)
            return true
        }
        return false
    }
    calculatePositionByTargets(){
        const destinationPos = new Float32Array(2)
        destinationPos[0] = 0
        destinationPos[1] = 0

        if(this.targets.length == 0){
            this._movingFunction(destinationPos)
            return
        }

        for(const target of this.targets){
            const targetCenter = target.getCenter()

            destinationPos[0] += targetCenter.x
            destinationPos[1] += targetCenter.y
        }

        destinationPos[0] /= this.targets.length
        destinationPos[1] /= this.targets.length
        
        this._movingFunction(destinationPos)
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
        function(destinationPos){
            const position2D = this.position.slice(0, 2)

            const distance = Math.distance(destinationPos, position2D)
            const moveDirection = Math.normalize(Math.vecsub(destinationPos, position2D))
            const stepLength = Math.min(this.speed, distance)
            if(stepLength == 0) return

            const x = this.position[0] + moveDirection[0]*stepLength
            const y = this.position[1] + moveDirection[1]*stepLength
            const z = this.position[2]

            this.setPosition(x, y, z)
        },
        // LINEAR
        function(destinationPos){
            const position2D = this.position.slice(0, 2)

            const distance = Math.distance(destinationPos, position2D)
            const moveDirection = Math.normalize(Math.vecsub(destinationPos, position2D))
            const stepLength = Math.min(this.speed * distance, distance)
            if(stepLength == 0) return

            const x = this.position[0] + moveDirection[0]*stepLength
            const y = this.position[1] + moveDirection[1]*stepLength
            const z = this.position[2]

            this.setPosition(x, y, z)
        },
        // QUADRATIC
        function(destinationPos){
            const position2D = this.position.slice(0, 2)

            const distance = Math.distance(destinationPos, position2D)
            const moveDirection = Math.normalize(Math.vecsub(destinationPos, position2D))
            const stepLength = Math.min(this.speed * distance * distance, distance)
            if(stepLength == 0) return

            const x = this.position[0] + moveDirection[0]*stepLength
            const y = this.position[1] + moveDirection[1]*stepLength
            const z = this.position[2]

            this.setPosition(x, y, z)
        },
        // EXPANENTIAL
        function(destinationPos){
            const position2D = this.position.slice(0, 2)

            const distance = Math.distance(destinationPos, position2D)
            const moveDirection = Math.normalize(Math.vecsub(destinationPos, position2D))
            const stepLength = Math.min(this.speed * Math.exp(distance), distance)
            if(stepLength == 0) return

            const x = this.position[0] + moveDirection[0]*stepLength
            const y = this.position[1] + moveDirection[1]*stepLength
            const z = this.position[2]

            this.setPosition(x, y, z)
        },
    ]
}
