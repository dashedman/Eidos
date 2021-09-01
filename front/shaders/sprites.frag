#version 300 es

//CONSTANTS
#define INF 			1e27
#define PI			3.1415926535
#define SQRT2 		1.41421356237
#define INVSQRT2 	0.70710678118
#define SMOOTH_KOEF 1.f


precision mediump float;

uniform sampler2D u_texture_src;

in vec2 v_texture;
out vec4 out_fragColor;

//MAIN
void main(){
	vec4 texture_col = texture(u_texture_src, v_texture);
	out_fragColor = texture_col;
}
