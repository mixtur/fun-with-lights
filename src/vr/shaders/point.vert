#version 300 es
precision highp float;

layout(location=0) in vec3 a_position;

uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;
uniform vec3 u_position;

void main() {
    gl_Position = u_projectionMatrix * u_viewMatrix * vec4(u_position + a_position, 1.0);
}
