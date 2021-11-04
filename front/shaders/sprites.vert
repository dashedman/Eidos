#define PI 3.141592

uniform vec2 u_textureResolution;
uniform mat4 u_viewMatrix;

attribute vec3 a_position;
attribute vec2 a_texture;

varying vec2 v_texture;

void main(){
    v_texture = a_texture / u_textureResolution;
    gl_Position = u_viewMatrix * vec4(a_position, 1.0);
}
