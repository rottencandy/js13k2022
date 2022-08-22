#version 300 es
precision mediump float;

layout(location=0)in vec4 aPos;

uniform mat4 uMat;
uniform vec3 uPos;

out vec2 vTex;

void main() {
    gl_Position = uMat * (aPos + vec4(uPos, 0.));
    vTex = aPos.xy;
    // flip y coordinate
    vTex.y = 1. - vTex.y;
}
