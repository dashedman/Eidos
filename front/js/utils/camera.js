class Camera {
    constructor(target) {
        this.setting = {
            fovy: Math.radians(60),        // 	Vertical field of view in radians
            aspect: 1,      // 	Aspect ratio. typically viewport width/height
            near: 1,      //  Near bound of the frustum
            far: 50, //Infinity,  //  Far bound of the frustum, can be null or Infinity
        }
        this.position = [0, 0, 0];
        this.direction = [0, 0, 1]; // need to be normalize
        this.upAxis = [0, 1, 0]; //  orientation, do not to be changed

        this._projMatrix = mat4.perspective(
            mat4.create(),
            this.setting.fovy,
            this.setting.aspect,
            this.setting.near,
            this.setting.far,
        )
        this.viewMatrix = mat4.create();
        this.needUpdate = false;
        this.recalcMatrix()
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
    recalcMatrix(){
        this.viewMatrix = mat4.mul(
            this.viewMatrix,
            this._projMatrix,
            mat4.translate(
                this.viewMatrix,
                mat4.identity(this.viewMatrix),
                this.position, 
            )
        )
        this.needUpdate = true;
    }

    // high level methods
    setTarget(target){

    }
    setMovingMode(mode){

    }
    targetPositionListener(){

    }
}



