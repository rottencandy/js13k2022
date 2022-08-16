#version 300 es
precision mediump float;

layout(location=0)in vec4 aPos;

uniform mat4 uMat;
uniform vec3 uPos;

out vec2 vTex;

void main() {
    gl_Position = uMat * (aPos + vec4(uPos, 0.));
    // flip coordinates
    vTex = 1. - aPos.xy;
}
