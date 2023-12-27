import easy_vector


class PhysicsEngine:
    G_FORCE = 30

    def __init__(self, debug_mode: bool = False):
        self.debug_mode = debug_mode
        self.innertedColliders = set()

    def tick(self, time_delta: float):
        for collider in self.innertedColliders:
            self.processingVelocity(collider, time_delta)

            if collider.vx == 0 and collider.vy == 0:
                continue


            p = easy_vector.Vector([collider.vx, collider.vy]).normal
            // check grid
            // chunk coords
            localGridGen = self.world.sliceGridGenDirected(
                minX, minY, maxX, maxY,
                Math.sign(pX) | | 1, Math.sign(pY) | | 1
            )
            for (let ceil of localGridGen){
            if (ceil !== null & & collider.isCollideWith(ceil.pbox)) {
            this.processingWithCeil(collider, ceil.pbox)
            }
            }

    }

    def processingVelocity(self, obj, deltaTimeSec):
        obj.vx += (obj.ax) * deltaTimeSec
        obj.vy += (obj.ay - self.G_FORCE) * deltaTimeSec
        obj.x += obj.vx * deltaTimeSec
        obj.y += obj.vy * deltaTimeSec
