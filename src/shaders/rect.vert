#version 300 es
precision mediump float;

layout(location=0)in vec4 aPos;

uniform mat4 uMat;
uniform float uSize;
uniform vec3 uPos;

out vec2 vUV;

void main() {
    gl_Position = uMat * (vec4(aPos.xy * uSize, aPos.zw) + vec4(uPos, 0.));
    vUV = aPos.xy;
}
