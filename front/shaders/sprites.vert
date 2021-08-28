#version 300 es

#define PI 3.141592

in vec3 a_position;
out vec3 a_texture;

void main(){
    v_texture = a_texture;

    gl_Position = a_position;
}