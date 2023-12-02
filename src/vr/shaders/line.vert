#version 300 es
precision highp float;

layout(location=0) in vec4 a_position;

uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;

void main() {
    gl_Position = u_projectionMatrix * u_viewMatrix * a_position;
}
