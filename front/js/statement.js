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
    this.time = new TimeManager()

    this.dispatcher = new Dispatcher(this, canvas_el)
    this.render = new Renderer(this, canvas_el)
    this.network = new Network(this)
    this.physics = new Physics(this)

    // Set up entities and location
    this.player = new Player()
    this.entities = [this.player] // array of entities
    this.location = new Location()
}


Statement.prototype.run = function() {
    // Start a Render loops	
    let gameIteraction = () => {
        // calc time
        this.time.calc()

        // Simulate world
        logic(this)

        // call next iteraction
        this.loop.id = setTimeout( 
            gameIteraction, 
            this.time.toNext(this.loop.interval) 
        );
    }
    this.loop.id = setTimeout( gameIteraction, 0 );

    // start render loop
    this.render.run()
}

Statement.prototype.stop = function() {
    clearTimeout(this.loop.id)
}