#version 300 es
precision mediump float;

in vec2 vTex;

uniform sampler2D uTex;

out vec4 outColor;

void main() {
    outColor = texture(uTex, vTex);
}
