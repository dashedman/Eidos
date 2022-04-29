import { Entity } from "./base.js";
import ph from "../physics/physics.js"

export class BackgroundBlock extends Entity {
    constructor(sprite, {x, y, z=1}) {
        super()

        this.sprite = sprite

        this.sprite.sx = x
        this.sprite.sy = y
        this.sprite.sz = z

        this.sprite.sw = 1
        this.sprite.sh = 1
    }
}

export class Block extends BackgroundBlock {
    constructor(sprite, {x, y, z=1}) {
        super(sprite, {x, y, z})

        this.pb = new ph.colliders.PhBox(x, y, 1, 1)
    }
}

export class Decoration extends BackgroundBlock {
    constructor(sprite, {x, y, z=1, width, height}) {
        super(sprite, {x, y, z})

        this.sprite.sw = width,
        this.sprite.sh = height
    }
}