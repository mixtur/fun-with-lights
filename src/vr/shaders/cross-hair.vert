#version 300 es
precision highp float;

void main() {
    switch (gl_VertexID) {
        case 0: gl_Position = vec4(-1.0,  0.0, 0.0, 1.); break;
        case 1: gl_Position = vec4( 1.0,  0.0, 0.0, 1.); break;
        case 2: gl_Position = vec4( 0.0, -1.0, 0.0, 1.); break;
        case 3: gl_Position = vec4( 0.0,  1.0, 0.0, 1.); break;
    }
    gl_PointSize = 10.;
}
