// ==========================================
// Renderer
//
// This class contains the code that takes care of visualising the
// elements in the specified world.
// ==========================================

// Constructor( id )
//
// Creates a new renderer with the specified canvas as target.
//
// id - Identifier of the HTML canvas element to render to.

function Renderer(state, canvas_el)
{
	this._state = state
    this.frameId = -1;

	this.canvas = canvas_el;
	this.canvas.renderer = this;
	this.canvas.width = canvas_el.clientWidth;
	this.canvas.height = canvas_el.clientHeight;

	// Initialise WebGL
	this.gl = canvas_el.getContext( "webgl2" );
	let gl = this.gl
	if(!gl) throw "Your browser doesn't support WebGL!";

	gl.viewportWidth = canvas_el.width;
	gl.viewportHeight = canvas_el.height;
	
	gl.clearColor( 0.62, 0.81, 1.0, 1.0 );
	gl.enable( gl.DEPTH_TEST );
	//gl.enable( gl.CULL_FACE );
	//gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
}


Renderer.prototype.as_prepare = async function(){
    // Load shaders
	this.spriteManager = new SpriteManager (this._state)
	this.textureManager = new TextureManager (this._state)
	this.buffers = {};
	this.varLocals = {};

	//await this.loadShaders();
	await this.textureManager.waitInit;
}

// run()
//
// Start a render loop.
// Return loop id.

Renderer.prototype.run = function()
{
	// Some start actions...
	// ...

	// loop body
	let renderFrame = function(){
		// Draw world
		this.setCamera();
		this.draw();

		// call next frame
		this.frameId = requestAnimationFrame(renderFrame)
	}
	this.frameId = requestAnimationFrame(renderFrame)
}

// stop()
//
// Stop a render loop.

Renderer.prototype.close = function()
{
	cancelAnimationFrame(this.loopId)
}

// draw()
//
// Render one frame of the world to the canvas.

Renderer.prototype.draw = function()
{
	let gl = this.gl;
	
	// Initialise view
	this.checkViewport();
	gl.viewport( 0, 0, gl.viewportWidth, gl.viewportHeight );
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

	// sprites render
	gl.useProgram(this.programs.sprite);

	// buffers
	let sprites = this.spriteManager.static
	let locals = this.varLocals.sprites
	gl.enableVertexAttribArray( locals.a_position );
	gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.static.vert)
	if(sprites.updateFlags.v) gl.bufferData(gl.ARRAY_BUFFER, sprites.verticles, gl.STATIC_DRAW);
	gl.vertexAttribPointer(locals.a_position, 3, gl.FLOAT, false, 0, 0)

	gl.enableVertexAttribArray( locals.a_texture );
	gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.static.tex)
	if(sprites.updateFlags.t) gl.bufferData(gl.ARRAY_BUFFER, sprites.textures, gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(locals.a_texture, 2, gl.FLOAT, false, 0, 0)

	// uniforms
	
	// textures
	let texture = this.textureManager.getTexture()
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(sprites.varLocals.u_texture_src, 0);

	// отрисовка геометрии
	gl.drawArrays(gl.TRIANGLES, 0, sprites.usedIndexes.length*6);

	// effects
	// gl.useProgram(this.programs.effects);

	// postFX
	// gl.useProgram(this.programs.post);
}

// updateViewport()
//
// Check if the viewport is still the same size and update
// the render configuration if required.

Renderer.prototype.checkViewport = function()
{
	let gl = this.gl;
	let canvas = this.canvas;
	
	if ( canvas.clientWidth != gl.viewportWidth || canvas.clientHeight != gl.viewportHeight )
	{
		gl.viewportWidth = canvas.clientWidth;
		gl.viewportHeight = canvas.clientHeight;
		
		canvas.width = canvas.clientWidth;
		canvas.height = canvas.clientHeight;
		
		// Update perspective projection based on new w/h ratio
		this.setPerspective( this.fov, this.min, this.max );
	}
}

// loadShaders()
//
// Takes care of loading the shaders.

Renderer.prototype.loadShaders = async function()
{
	let gl = this.gl;

	async function getProgram(name){

		async function getShader(name, shader_type){
			let shaderSource = await utils.loadTextResources(`shaders/${name}`);
	
			let shader = gl.createShader( shader_type );
			gl.shaderSource( shader, shaderSource );
			gl.compileShader( shader );
			gl.attachShader( program, shader );

			if ( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) )
				throw "Could not compile vertex shader!\n" + gl.getShaderInfoLog( shader );
		}

		let program = gl.createProgram();

		await Promise.all([
			getShader(name+'.vert', gl.VERTEX_SHADER),	// Compile vertex shader
			getShader(name+'.frag', gl.FRAGMENT_SHADER) // Compile fragment shader
		])
		// Finish program
		gl.linkProgram( program );
		
		if ( !gl.getProgramParameter( program, gl.LINK_STATUS ) )
			throw "Could not link the shader program!";

		// bind program to renderer
		this.programs[name] = await getProgram(name);
		return program
	}
	
	// COULD BE EDITED TO LOAD NEW PROGRAMS
	let spritesPr = getProgram('sprites').then((program)=>{
		gl.useProgram( program );
		this.buffers.static = {
			vert: gl.createBuffer(),
			tex: gl.createBuffer(),
		}
		this.buffers.dynamic = {
			vert: gl.createBuffer(),
			tex: gl.createBuffer(),
		}

		this.varLocals.sprites = {
			a_position: gl.getAttribLocation(program, "a_position"),
			a_texture: gl.getAttribLocation(program, "a_texture"),
			u_texture_src: gl.getAttribLocation(program, "u_texture_src"),
		}
	})

	await Promise.all([
		spritesPr
	])
}

// setPerspective( fov, min, max )
//
// Sets the properties of the perspective projection.

Renderer.prototype.setPerspective = function( fov, min, max )
{
	var gl = this.gl;
	
	this.fov = fov;
	this.min = min;
	this.max = max;
	
	mat4.perspective( fov, gl.viewportWidth / gl.viewportHeight, min, max, this.projMatrix );
	gl.uniformMatrix4fv( this.uProjMat, false, this.projMatrix );
}

// setCamera( pos, ang )
//
// Moves the camera to the specified orientation.
//
// pos - Position in world coordinates.
// ang - Pitch, yaw and roll.

Renderer.prototype.setCamera = function()
{
	var gl = this.gl;
	
	this.camPos = this._state.camera.position;
    this.camDir = this._state.camera.direction;
	
	mat4.identity( this.viewMatrix );
	
	mat4.rotate( this.viewMatrix, -ang[0] - Math.PI / 2, [ 1, 0, 0 ], this.viewMatrix );
	mat4.rotate( this.viewMatrix, ang[1], [ 0, 0, 1 ], this.viewMatrix );
	mat4.rotate( this.viewMatrix, -ang[2], [ 0, 1, 0 ], this.viewMatrix );
	
	mat4.translate( this.viewMatrix, [ -pos[0], -pos[1], -pos[2] ], this.viewMatrix );
	
	gl.uniformMatrix4fv( this.uViewMat, false, this.viewMatrix );
}

Renderer.prototype.drawBuffer = function( buffer )
{
	var gl = this.gl;
	
	gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
	
	gl.vertexAttribPointer( this.aPos, 3, gl.FLOAT, false, 9*4, 0 );
	gl.vertexAttribPointer( this.aColor, 4, gl.FLOAT, false, 9*4, 5*4 );
	gl.vertexAttribPointer( this.aTexCoord, 2, gl.FLOAT, false, 9*4, 3*4 );
	
	gl.drawArrays( gl.TRIANGLES, 0, buffer.vertices );
}