#version 300 es
precision mediump float;

in vec2 vUV;

uniform vec2 uSize;

out vec4 outColor;

void main() {
    vec2 uv = fract(vUV * uSize);
    vec2 border = step(.05, uv);
    outColor = vec4(vec3(.6, .6, .5) * (border.x * border.y), 1.);
}
