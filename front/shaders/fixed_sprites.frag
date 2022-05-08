//CONSTANTS
#define INF 			1e27
#define PI			3.1415926535
#define SQRT2 		1.41421356237
#define INVSQRT2 	0.70710678118
#define SMOOTH_KOEF 1.0


precision mediump float;

uniform sampler2D u_texture_src;

varying vec2 v_texture;

//MAIN
void main(){
	vec4 texture_col = texture2D(u_texture_src, v_texture);
	gl_FragColor = texture_col;
}
