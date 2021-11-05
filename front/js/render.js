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

class Renderer {
	/**
	 * Constructor of render module
	 * 
	 * @param {Statement} state 
	 * @param {HTMLCanvasElement} canvas_el 
	 */
	constructor(state, canvas_el) {
		this._state = state
		this.frameId = -1

		this.canvas = canvas_el
		this.canvas.renderer = this
		this.canvas.width = canvas_el.clientWidth
		this.canvas.height = canvas_el.clientHeight

		// Initialise WebGL
		this.gl = canvas_el.getContext("webgl")
		const gl = this.gl
		if (!gl)
			throw "Your browser doesn't support WebGL!"

		if (!gl.getExtension('WEBGL_depth_texture'))
			throw "Your browser doesn't support WEBGL_depth_texture extension!"

		gl.viewportWidth = canvas_el.width
		gl.viewportHeight = canvas_el.height

		gl.clearColor(0.2, 0.31, 0.4, 1.0)
		//gl.enable(gl.DEPTH_TEST);
		//gl.enable( gl.CULL_FACE );
		gl.enable(gl.BLEND)
		gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA )

		this.depth = {
			framebuffer: gl.createFramebuffer(),
			texture: gl.createTexture()
		}

		this.waitInit = this.async_constructor()
	}

	/**
	 * Asyncronious part of constructor
	 */
	async async_constructor() {
		// Load shaders
		this.buffers = {};
		this.varLocals = {};
		this.programs = {
			sprites: null,
		};
		await this.loadShaders();
		
		this.staticSpriteManager = new SpriteManager(this._state);
		this.dynamicSpriteManager = new SpriteManager(this._state);
		this.streamSpriteManager = new SpriteManager(this._state);

		this.textureManager = new TextureManager(this._state);
		await this.textureManager.waitInit;

		this.camera = new Camera()
	}

	/**
	 * run()
	 * 
	 * Start a render loop.
	 * Return loop id.
	 */
	async run() {
		await this.waitInit
		// Some start actions...
		// ...
		// loop body
		let renderFrame = () => {
			// Draw world
			//this.setCamera();
			this.updateAnimations()
			this.draw();

			// call next frame
			this.frameId = requestAnimationFrame(renderFrame);
		};
		this.frameId = requestAnimationFrame(renderFrame);
	}

	/**
	 * stop()
	 * 
	 * Stop a render loop.
	 */
	close() {
		cancelAnimationFrame(this.loopId);
	}

	/**
	 * updateAnimations()
	 * 
	 * update all animations for animated sprites.
	 */
	updateAnimations(){
		const time = performance.now()
		for(const sprite of this.staticSpriteManager.sprites){
			if(sprite.iAnimated){
				sprite.doAnimation(time)
			}
		}
		for(const sprite of this.dynamicSpriteManager.sprites){
			if(sprite.iAnimated){
				sprite.doAnimation(time)
			}
		}
		for(const sprite of this.streamSpriteManager.sprites){
			if(sprite.iAnimated){
				sprite.doAnimation(time)
			}
		}
	}

	/**
	 * draw()
	 * 
	 * Render one frame of the world to the canvas.
	 */
	draw() {
		const gl = this.gl
		const locals = this.varLocals.sprites

		// Initialise view
		this.checkViewport()
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight)
		gl.clear(gl.COLOR_BUFFER_BIT) // | gl.DEPTH_BUFFER_BIT

		// sprites render
		gl.useProgram(this.programs.sprites)
		//gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.framebuffer)

		// uniforms
		if(this._state.camera.needUpdate){
			gl.uniformMatrix4fv(locals.u_viewMatrix, false, this._state.camera.viewMatrix)
			this._state.camera.needUpdate = false
		}
		

		/**
		 * 
		 * @param {SpriteManager} spriteManager - sprite manager that contains data about sprites
		 * @param {WebGL2RenderingContext.GLenum} usage - a GLenum specifying the intended usage pattern of the data store for optimization purposes. 
		 * Possible values:
		 * - gl.STATIC_DRAW: The contents are intended to be specified once by the application, and used many times as the source for WebGL drawing and image specification commands.
    	 * - gl.DYNAMIC_DRAW: The contents are intended to be respecified repeatedly by the application, and used many times as the source for WebGL drawing and image specification commands.
    	 * - gl.STREAM_DRAW: The contents are intended to be specified once by the application, and used at most a few times as the source for WebGL drawing and image specification commands. 
		 * @param {Object} buffers - contaner for gl.buffers verticle position and texture
		 * @param {Object} locals - container for varables with shader locations
		 */
		function drawSprites(spriteManager, usage, buffers, locals){
			// buffers

			// positions
			gl.enableVertexAttribArray(locals.a_position);
			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.pos);
			// update buffer
			if (spriteManager.positionHandler.needUpdate) {
				gl.bufferData(gl.ARRAY_BUFFER, spriteManager.positionHandler.data, usage);
				spriteManager.positionHandler.needUpdate = false
			}
			gl.vertexAttribPointer(locals.a_position, 3, gl.FLOAT, false, 0, 0);

			// textures
			gl.enableVertexAttribArray(locals.a_texture);
			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.tex);
			// update buffer
			if (spriteManager.textureHandler.needUpdate) {
				gl.bufferData(gl.ARRAY_BUFFER, spriteManager.textureHandler.data, usage);
				spriteManager.textureHandler.needUpdate = false
			}
			gl.vertexAttribPointer(locals.a_texture, 2, gl.FLOAT, false, 0, 0);

			// draw
			gl.drawArrays(gl.TRIANGLES, 0, spriteManager.vertCount);
		}

		//drawSprites(this.staticSpriteManager, gl.STATIC_DRAW, this.buffers.static, locals)
		drawSprites(this.dynamicSpriteManager, gl.DYNAMIC_DRAW, this.buffers.dynamic, locals)
		//drawSprites(this.streamSpriteManager, gl.STREAM_DRAW, this.buffers.stream, locals)

		
		// textures
		// let texture = this.textureManager.getTexture();
		// gl.activeTexture(gl.TEXTURE0);
		// gl.bindTexture(gl.TEXTURE_2D, texture);
		// gl.uniform1i(locals.u_texture_src, 0);


		// effects
		//gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.framebuffer)
		//gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null)
		gl.useProgram(this.programs.post);
		// postFX
		// gl.useProgram(this.programs.post);
	}

	/**
	 * checkViewport()
	 * 
	 * Check if the viewport is still the same size and update
	 * the render configuration if required.
	 */
	checkViewport() {
		const gl = this.gl
		const canvas = this.canvas

		if (canvas.clientWidth != gl.viewportWidth || canvas.clientHeight != gl.viewportHeight) {
			gl.viewportWidth = canvas.clientWidth
			gl.viewportHeight = canvas.clientHeight

			canvas.width = canvas.clientWidth
			canvas.height = canvas.clientHeight

			// update camera
			const ratio = canvas.width/canvas.height
			this._state.camera.setRatio(ratio)

			// update viewport
			gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight)

			// update frame buffers
			gl.bindTexture(gl.TEXTURE_2D, this.depth.texture)
			gl.texImage2D(
				gl.TEXTURE_2D, 0,
				gl.DEPTH_COMPONENT,
				canvas.width, canvas.height,
				0,
				gl.DEPTH_COMPONENT,
				gl.UNSIGNED_INT,
				null
			)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}
	}

	/**
	 * loadShaders()
	 * 
	 * Takes care of loading the shaders.
	 */
	async loadShaders() {
		let gl = this.gl

		let getProgram = async (name) => {
			console.log(`Load '${name}' programm`)

			let getShader = async (name, shader_type) => {
				let shaderSource = await utils.loadTextResources(`shaders/${name}`);

				let shader = gl.createShader(shader_type);
				gl.shaderSource(shader, shaderSource);
				gl.compileShader(shader);
				gl.attachShader(program, shader);

				if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
					throw "Could not compile vertex shader!\n" + gl.getShaderInfoLog(shader);
			}

			let program = gl.createProgram();

			await Promise.all([
				getShader(name + '.vert', gl.VERTEX_SHADER),
				getShader(name + '.frag', gl.FRAGMENT_SHADER) // Compile fragment shader
			]);
			// Finish program
			gl.linkProgram(program);

			if (!gl.getProgramParameter(program, gl.LINK_STATUS))
				throw "Could not link the shader program!";

			// bind program to renderer
			console.log(`Programm '${name}' ready.`)
			this.programs[name] = program;
			return program;
		}

		// COULD BE EDITED TO LOAD NEW PROGRAMS
		let spritesPr = getProgram('sprites').then((program) => {
			gl.useProgram(program);
			this.buffers.static = {
				pos: gl.createBuffer(),
				tex: gl.createBuffer(),
			};
			this.buffers.dynamic = {
				pos: gl.createBuffer(),
				tex: gl.createBuffer(),
			};
			this.buffers.stream = {
				pos: gl.createBuffer(),
				tex: gl.createBuffer(),
			};

			this.varLocals.sprites = {
				a_position: gl.getAttribLocation(program, "a_position"),
				a_texture: gl.getAttribLocation(program, "a_texture"),
				u_texture_src: gl.getUniformLocation(program, "u_texture_src"),
				u_texture_resolution: gl.getUniformLocation(program, "u_textureResolution"),
				u_viewMatrix: gl.getUniformLocation(program, "u_viewMatrix")
			};
		});

		await Promise.all([
			spritesPr
		]);
		console.log('Shaders loaded.')
	}
	
	/**
	 * Load texture to manager, by source.
	 * 
	 * @param {Number} id - unique id of texture.
	 * @param {String} name - name.
	 * @param {String} src - source link to downloading by Image().
	 * @param {Number} frameNumber - Integer number of frames if texture represent the animation.
	 * @param {Number} frameOffset - Integer number of frame width if texture represent the animation.
	 * @returns {Texture} - loaded texture.
	 */
	createTexture(id, name, src, frameNumber, frameOffset){
		return this.textureManager.createTexture(id, name, src, frameNumber, frameOffset)
	}

	/**
	 * Load texture to manager, by color.
	 * Colors specified in `colors` fill the texture in rotated.
	 * 
	 * @param {Number} id - unique id of texture.
	 * @param {String} name - name.
	 * @param {Array} colors - Array of colors in 8bit RGBA format. 
	 * 	Example [255, 0, 0, 255]  - red pixel.
	 *  Example [255, 0, 0, 255, 0, 255, 0, 255]  - red and green rotated pixels.
	 * @param {Number} w - width of texture in pixels.
	 * @param {Number} h - height of texture in pixels.
	 * @returns {Texture} - loaded texture.
	 */
	createColorTexture(id, name, colors, w, h){
		return this.textureManager.createColorTexture(id, name, colors, w, h)
	}

	/**
	 * Create new sprite.
	 * 
	 * @param {Object} settings - settings for sprite creation.
	 * @param {Texture} settings.texture - texture that must be used in sprite.
	 * @param {Array} settings.mixins - array of sprite mixins. Can be taked from SpriteMixins.
	 * @param {String} renderType - type of render strategy for sprite. From enum {'STATIC', 'DYNAMIC', 'STREAM'}.
	 * @returns {Sprite} - created sprite.
	 */
	createSprite({texture, mixins=[]}, renderType='DYNAMIC'){
		switch (renderType) {
			case 'DYNAMIC':
				return this.dynamicSpriteManager.createSprite({texture, mixins})
			case 'STATIC':
				return this.staticSpriteManager.createSprite({texture, mixins})
			case 'STREAM':
				return this.streamSpriteManager.createSprite({texture, mixins})
			default:
				throw 'Undefined render type of sprite'
		}
	}
}










