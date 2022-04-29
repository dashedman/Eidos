import { TextureManager } from './textures/manager.js';
import { SpriteManager, SortingSpriteManager } from './sprites/manager.js';

import Statement from "../statement.js";
import { autils } from "../utils/utils.js";

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

export class Renderer {
	/**
	 * Constructor of render module
	 * 
	 * @param {HTMLCanvasElement} canvas_el 
	 */
	constructor(canvas_el) {
		/**
		 * @type {Statement}
		 */
		this._state = null

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

		this.varLocals = {};
		this.programs = {
			sprites: null,
		};

		this.backgroundSpriteManager = new SortingSpriteManager(this, gl);
		this.mainSpriteManager = new SpriteManager(this, gl);
		this.foregroundSpriteManager = new SortingSpriteManager(this, gl);

		this.textureManager = new TextureManager(this);
	}

	/**
	 * prepare()
	 * 
	 * Prepare renderer to run. Load some weight things. Must be overrided with super()
	 */
	async prepare() {
		// Load shaders
		console.debug('Preparing Renderer...')
		await this.loadShaders();
		await this.textureManager.prepare();
        console.debug('Renderer prepeared.')
	}

	/**
	 * run()
	 * 
	 * Start a render loop.
	 * Return loop id.
	 */
	run() {
		// loop body
		let renderFrame = () => {
			// Draw world
			this.update()
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
	stop() {
		cancelAnimationFrame(this.loopId);
	}

	/**
	 * update()
	 * 
	 * User update sprites. Must be overrided
	 */
	update() {
		// TODO: remove dummie
		this._state.debugger.dummie.sprite.sx = this._state.debugger.dummie.pb.x
		this._state.debugger.dummie.sprite.sy = this._state.debugger.dummie.pb.y
		this._state.camera.calculatePositionByTargets()
	}

	/**
	 * updateAnimations()
	 * 
	 * update all animations for animated sprites.
	 */
	updateAnimations(){
		const time = performance.now()
		for(const sprite of this.backgroundSpriteManager.sprites){
			if(sprite.iAnimated){
				sprite.doAnimation(time)
			}
		}
		for(const sprite of this.mainSpriteManager.sprites){
			if(sprite.iAnimated){
				sprite.doAnimation(time)
			}
		}
		for(const sprite of this.foregroundSpriteManager.sprites){
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
		gl.clear(gl.COLOR_BUFFER_BIT) // | gl.DEPTH_BUFFER_BIT

		// sprites render
		gl.useProgram(this.programs.sprites)
		//gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.framebuffer)

		// uniforms
		if(this._state.camera.needUpdate){
			gl.uniformMatrix4fv(locals.u_viewMatrix, false, this._state.camera.viewMatrix)
			this._state.camera.needUpdate = false
		}

		// textures
		this.textureManager.draw(locals)
		
		this.backgroundSpriteManager.draw(gl.STATIC_DRAW, locals)
		this.mainSpriteManager.draw(gl.DYNAMIC_DRAW, locals)
		this.foregroundSpriteManager.draw(gl.STATIC_DRAW, locals)

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

			// // update frame buffers
			// gl.bindTexture(gl.TEXTURE_2D, this.depth.texture)
			// gl.texImage2D(
			// 	gl.TEXTURE_2D, 0,
			// 	gl.DEPTH_COMPONENT,
			// 	canvas.width, canvas.height,
			// 	0,
			// 	gl.DEPTH_COMPONENT,
			// 	gl.UNSIGNED_INT,
			// 	null
			// )
			// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
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
				let shaderSource = await autils.loadTextResources(`shaders/${name}`);

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
	 * @param {String} role - role of sprite on scene. From enum {'BACK', 'MAIN', 'FRONT'}.
	 * @returns {Sprite} - created sprite.
	 */
	createSprite({texture, mixins=[]}, role='MAIN'){
		switch (role) {
			case 'BACK':
				return this.backgroundSpriteManager.createSprite({texture, mixins})
			case 'MAIN':
				return this.mainSpriteManager.createSprite({texture, mixins})
			case 'FRONT':
				return this.foregroundSpriteManager.createSprite({texture, mixins})
			default:
				throw 'Undefined render type of sprite'
		}
	}
}










