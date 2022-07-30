//CONSTANTS
#define INF 			1e27
#define PI			3.1415926535
#define SQRT2 		1.41421356237
#define INVSQRT2 	0.70710678118
#define SMOOTH_KOEF 1.0


precision mediump float;

varying vec4 v_color;

//MAIN
void main(){
	gl_FragColor = v_color;
}
