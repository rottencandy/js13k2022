#version 300 es
precision mediump float;

in vec2 vTex;

uniform sampler2D uTex;
uniform float uZoom;
uniform float uOpacity;
uniform float uBri;

out vec4 outColor;

void main() {
    vec2 texP = vTex * (2. - uZoom) - ((1. - uZoom) / 2.);
    outColor = texture(uTex, texP);
    outColor.xyz *= uBri;
    outColor.a *= uOpacity;
}
