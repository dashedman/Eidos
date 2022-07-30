"use strict"
import TextureManager from './textures/manager.js';
import {SpriteManager, SortingSpriteManager} from './sprites/sprites.js';

import Statement from "../statement.js";
import { autils, Camera } from "../utils/utils.js";
import { DRAW_GROUND_PLAN } from './constants.js';
import LineManager from './shapes/manager.js';
import { NotImplementedError } from '../exceptions.js';
import TextManager from './text/manager.js';
import Dispatcher from './../interactions/interactions';

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
	constructor(canvas_el, debugMode=false) {
		/**
		 * @type {Statement}
		 */
		this._state = null
		this.debugMode = debugMode
		
        if(this.debugMode) {
            this.debugShapes = new Map()
        }

		this.frameId = -1
		this.prevTimeStamp = 0

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

		this.varLocals = {
			sprites: null,
			colors: null,
			fixed_sprites: null,
		};
		this.programs = {
			sprites: null,
			colors: null,
			fixed_sprites: null,
		};

		this.backgroundSpriteManager = new SortingSpriteManager(this);
		this.mainSpriteManager = new SpriteManager(this);
		this.foregroundSpriteManager = new SortingSpriteManager(this);
		this.fixedSpriteManager = new SpriteManager(this);

		this.debugLineManager = new LineManager(this);
		this.textureManager = new TextureManager(this);
		this.textManager = new TextManager(this, true)

		/** @type {Map<number, Texture>} */
		this.textureGIDRegistry = new Map()

		this._prepeared = false
	}

	/**
	 * prepare()
	 * 
	 * Prepare renderer to run. Load some weight things. Must be overrided with super()
	 */
	async prepare({tilesets, glyphInfo}) {
		// Load shaders
		console.debug('Preparing Renderer...')
		await this.textureManager.prepare();
		for(let tileset of tilesets){
			let textureRegistry = await this.textureManager.fromTileset(tileset)
			for(let [GID, texture] of Object.entries(textureRegistry))
				this.textureGIDRegistry.set(Number.parseInt(GID), texture)
		}
		await this.textManager.prepare(glyphInfo)
		await this.loadShaders();

		this._prepeared = true
        console.debug('Renderer prepeared.')
	}

    async getPrepareIndicator() {
        while(!this._prepeared) {
            await autils.waitTick()
        }
    }

	/**
	 * run()
	 * 
	 * Start a render loop.
	 * Return loop id.
	 */
	run() {
		// loop body
		let renderFrame = (timeStamp) => {
			// calc timeDelta in seconds
			const timeDelta = (timeStamp - this.prevTimeStamp) / 1000
			// Draw world
			this.update(timeDelta)
			// TODO: rework animations
			this.updateAnimations()
			this.draw();
			// call next frame
			this.frameId = requestAnimationFrame(renderFrame);
			this.prevTimeStamp = timeStamp
		};
		this.frameId = requestAnimationFrame(renderFrame);
		this.prevTimeStamp = performance.now()
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
		throw new NotImplementedError()
	}

	/**
	 * updateAnimations()
	 * 
	 * update all animations for animated sprites.
	 */
	updateAnimations(timeDelta){
		for(const sprite of this.backgroundSpriteManager.animatedSprites){
			sprite.doAnimation(timeDelta)
		}
		for(const sprite of this.mainSpriteManager.animatedSprites){
			sprite.doAnimation(timeDelta)
		}
		for(const sprite of this.foregroundSpriteManager.animatedSprites){
			sprite.doAnimation(timeDelta)
		}
	}

	/**
	 * draw()
	 * 
	 * Render one frame of the world to the canvas.
	 */
	draw() {
		const gl = this.gl

		// Initialise view
		this.checkViewport()
		gl.clear(gl.COLOR_BUFFER_BIT) // | gl.DEPTH_BUFFER_BIT

		// sprites render
		let locals = this.varLocals.sprites
		gl.useProgram(this.programs.sprites)
		// uniforms
		gl.uniformMatrix4fv(locals.u_viewMatrix, false, this._state.camera.VP)
		// textures
		this.textureManager.draw(locals)
		
		this.backgroundSpriteManager.draw(gl.STATIC_DRAW, locals)
		this.mainSpriteManager.draw(gl.DYNAMIC_DRAW, locals)
		this.foregroundSpriteManager.draw(gl.STATIC_DRAW, locals)

		// effects
		//gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.framebuffer)
		//gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null)
		// postFX
		// gl.useProgram(this.programs.post);

		
		if(this.debugMode) {
			locals = this.varLocals.colors
			gl.useProgram(this.programs.colors)
			gl.uniformMatrix4fv(locals.u_viewMatrix, false, this._state.camera.VP)
			this.debugLineManager.draw(gl.STREAM_DRAW, locals)
		}

		
		locals = this.varLocals.fixed_sprites
		gl.useProgram(this.programs.fixed_sprites)
		this.fixedSpriteManager.draw(gl.STATIC_DRAW, locals)
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

		let getProgram = async (name, debugMode) => {
			console.debug(`Load '${name}' shader programm...`)

			let getShader = async (name, shader_type) => {
				console.debug(`Load "${name}" shader source...`)
				let shaderSource = await autils.loadTextResources(`shaders/${name}`);

				console.debug(`Create "${name}" shader...`)
				let shader = gl.createShader(shader_type);
				gl.shaderSource(shader, shaderSource);
				gl.compileShader(shader);
				gl.attachShader(program, shader);

				if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
					throw "Could not compile vertex shader!\n" + gl.getShaderInfoLog(shader);
			}

			let program = gl.createProgram();

			const fragmenShaderName = debugMode ? name + 'Debug' : name
			await Promise.all([
				getShader(name + '.vert', gl.VERTEX_SHADER),
				getShader(fragmenShaderName + '.frag', gl.FRAGMENT_SHADER) // Compile fragment shader
			]);
			// Finish program
			gl.linkProgram(program);

			if (!gl.getProgramParameter(program, gl.LINK_STATUS))
				throw "Could not link the shader program!";

			// bind program to renderer
			console.debug(`Programm '${name}' ready.`)
			this.programs[name] = program;
			return program;
		}

		// COULD BE EDITED TO LOAD NEW PROGRAMS
		let spritesPr = getProgram('sprites', this.debugMode).then((program) => {
			gl.useProgram(program);

			this.varLocals.sprites = {
				a_position: gl.getAttribLocation(program, "a_position"),
				a_texture: gl.getAttribLocation(program, "a_texture"),
				u_texture_src: gl.getUniformLocation(program, "u_texture_src"),
				u_texture_resolution: gl.getUniformLocation(program, "u_textureResolution"),
				u_viewMatrix: gl.getUniformLocation(program, "u_viewMatrix")
			};
		});
		let colorPr = getProgram('colors').then((program) => {
			gl.useProgram(program);

			this.varLocals.colors = {
				a_position: gl.getAttribLocation(program, "a_position"),
				a_color: gl.getAttribLocation(program, "a_color"),
				u_viewMatrix: gl.getUniformLocation(program, "u_viewMatrix")
			};
		});
		let fixedPr = getProgram('fixed_sprites').then((program) => {
			gl.useProgram(program);

			this.varLocals.fixed_sprites = {
				a_position: gl.getAttribLocation(program, "a_position"),
				a_color: gl.getAttribLocation(program, "a_color"),
			};
		});

		await Promise.all([
			spritesPr,
			colorPr,
			fixedPr
		]);
		console.log('Shaders loaded.')
	}
	
	/**
	 * Load texture to manager, by source.
	 * 
	 * @param {String} name - name.
	 * @param {String} src - source link to downloading by Image().
	 * @param {Number} frameNumber - Integer number of frames if texture represent the animation.
	 * @param {Number} frameOffset - Integer number of frame width if texture represent the animation.
	 * @returns {Texture} - loaded texture.
	 */
	createTexture(name, src, frameNumber, frameOffset){
		return this.textureManager.createTexture(name, src, frameNumber, frameOffset)
	}

	/**
	 * Load texture to manager, by color.
	 * Colors specified in `colors` fill the texture in rotated.
	 * 
	 * @param {String} name - name.
	 * @param {Array} colors - Array of colors in 8bit RGBA format. 
	 * 	Example [255, 0, 0, 255]  - red pixel.
	 *  Example [255, 0, 0, 255, 0, 255, 0, 255]  - red and green rotated pixels.
	 * @param {Number} w - width of texture in pixels.
	 * @param {Number} h - height of texture in pixels.
	 * @returns {Texture} - loaded texture.
	 */
	createColorTexture(name, colors, w, h){
		return this.textureManager.createColorTexture(name, colors, w, h)
	}

	/**
	 * Create new sprite.
	 * 
	 * @param {Object} settings - settings for sprite creation.
	 * @param {Texture} settings.texture - texture that must be used in sprite.
	 * @param {Array} settings.mixins - array of sprite mixins. Can be taked from SpriteMixins.
	 * @param {DRAW_GROUND_PLAN} role - role of sprite on scene. From enum DRAW_GROUND_PLAN.
	 * @returns {Sprite} - created sprite.
	 */
	createSprite({texture, isAnimated=false}, role=DRAW_GROUND_PLAN.MAIN){
		switch (role) {
			case DRAW_GROUND_PLAN.BACK:
				return this.backgroundSpriteManager.createSprite({texture, isAnimated})
			case DRAW_GROUND_PLAN.MAIN:
				return this.mainSpriteManager.createSprite({texture, isAnimated})
			case DRAW_GROUND_PLAN.FRONT:
				return this.foregroundSpriteManager.createSprite({texture, isAnimated})
			default:
				throw 'Undefined render type of sprite'
		}
	}

	addToHighlight(obj, color=[1, 1, 1]) {
		if(this.debugMode){
			let rect = this.debugLineManager.createRect(color)
			this.debugShapes.set(obj, rect)
		}
	}
}










