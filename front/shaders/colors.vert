#define PI 3.141592

uniform mat4 u_viewMatrix;

attribute vec3 a_position;
attribute vec4 a_color;

varying vec4 v_color;

void main(){
    v_color = a_color;
    gl_Position = u_viewMatrix * vec4(a_position, 1.0);
    // gl_PointSize = 32.0 * u_viewMatrix[3][3];
}
