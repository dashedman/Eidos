// ==========================================
// State of the game
//
// To store and manage game elements
// ==========================================

function Statement(canvas_el) {
    // id of the game loop to handle
	this.loop = {
        id: -1, 
        interval: 0
    }

    // Date.now() better to use than new Date().getTime()
    // to prevent instantiating unnecessary Date objects. 
    //
    // But performance.now() better)))
    this.lastTime = null
    this.time = performance.now()
    this.deltaTime = null

    // Set up entities and location
    this.entities = new Array() // array of entities
    this.location = new Location()
 
     // Set up renderer
    this.render = new Renderer( this, canvas_el );
 
     // Create physics simulator
    this.physics = new Physics( this );
    this.physics.setWorld( world );
 
     // Create new local player
    this.logic = new Logic();
}

Statement.prototype.calcTime = function() {
    // time difference between iterations 
    this.lastTime = this.time
    this.time = performance.now()
    this.deltaTime = this.time - this.lastTime
}

Statement.prototype.timeToNext = function() {
    // remaining time until the start of the next iteraction
    return Math.max(0, this.loop.interval - (performance.now() - this.time))
}

Statement.prototype.run = function() {
    // Start a Render loops	
    let gameIteraction = () => {
        // calc time
        this.calcTime()

        // Simulate world
        this.logic.update(this)

        // call next iteraction
        this.loop.id = setTimeout( gameIteraction, this.timeToNext() );
    }
    this.loop.id = setTimeout( gameIteraction, 0 );

    // start render loop
    this.render.run()
}

Statement.prototype.stop = function() {
    clearTimeout(this.loop.id)
}