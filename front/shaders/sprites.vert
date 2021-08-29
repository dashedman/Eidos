#version 300 es

#define PI 3.141592

in vec3 a_position;
in vec2 a_texture;

out vec2 v_texture;

void main(){
    v_texture = a_texture;
    gl_Position = vec4(a_position, 0.f);
}
