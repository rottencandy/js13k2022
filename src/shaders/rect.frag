#version 300 es
precision mediump float;

in vec2 vUV;

uniform sampler2D uTex;

out vec4 outColor;

void main() {
    outColor = vec4(vUV, 0., 1.);
}
