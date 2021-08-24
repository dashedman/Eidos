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

function Renderer( state, canvas_el )
{
    this.state = state
    this.frameId = -1;

	this.canvas = canvas_el;
	this.canvas.renderer = this;
	this.canvas.width = canvas.clientWidth;
	this.canvas.height = canvas.clientHeight;

	// Initialise WebGL
	this.gl = canvas.getContext( "webgl2" );
	if(!this.gl) throw "Your browser doesn't support WebGL!";

	this.gl.viewportWidth = canvas.width;
	this.gl.viewportHeight = canvas.height;
	
	this.gl.clearColor( 0.62, 0.81, 1.0, 1.0 );
	this.gl.enable( gl.DEPTH_TEST );
	//this.gl.enable( gl.CULL_FACE );
	//this.gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

    this.camera = new Camera();
}


Renderer.prototype.as_prepare = async function(){
    // Load shaders
	await this.loadShaders();
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
	this.framrId = requestAnimationFrame(renderFrame)
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

Renderer.prototype.as_loadShaders = async function()
{
	var gl = this.gl;
	
	// Create shader program
	var program = this.program = gl.createProgram();
	
	// Compile vertex shader
	var vertexShader = gl.createShader( gl.VERTEX_SHADER );
	gl.shaderSource( vertexShader, vertexSource );
	gl.compileShader( vertexShader );
	gl.attachShader( program, vertexShader );
	
	if ( !gl.getShaderParameter( vertexShader, gl.COMPILE_STATUS ) )
		throw "Could not compile vertex shader!\n" + gl.getShaderInfoLog( vertexShader );
	
	// Compile fragment shader
	var fragmentShader = gl.createShader( gl.FRAGMENT_SHADER );
	gl.shaderSource( fragmentShader, fragmentSource );
	gl.compileShader( fragmentShader );
	gl.attachShader( program, fragmentShader );
	
	if ( !gl.getShaderParameter( fragmentShader, gl.COMPILE_STATUS ) )
		throw "Could not compile fragment shader!\n" + gl.getShaderInfoLog( fragmentShader );
	
	// Finish program
	gl.linkProgram( program );
	
	if ( !gl.getProgramParameter( program, gl.LINK_STATUS ) )
		throw "Could not link the shader program!";
	
	gl.useProgram( program );
	
	// Store variable locations
	this.uProjMat = gl.getUniformLocation( program, "uProjMatrix" );
	this.uViewMat= gl.getUniformLocation( program, "uViewMatrix" );
	this.uModelMat= gl.getUniformLocation( program, "uModelMatrix" );
	this.uSampler = gl.getUniformLocation( program, "uSampler" );
	this.aPos = gl.getAttribLocation( program, "aPos" );
	this.aColor = gl.getAttribLocation( program, "aColor" );
	this.aTexCoord = gl.getAttribLocation( program, "aTexCoord" );
	
	// Enable input
	gl.enableVertexAttribArray( this.aPos );
	gl.enableVertexAttribArray( this.aColor );
	gl.enableVertexAttribArray( this.aTexCoord );
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
	
	this.camPos = this.state.camera.position;
    this.camDir = this.state.camera.direction;
	
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
