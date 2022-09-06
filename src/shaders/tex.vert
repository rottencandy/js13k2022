#version 300 es
precision mediump float;

layout(location=0)in vec4 aPos;

uniform mat4 uMat;
uniform vec3 uPos;
uniform float uAng;

out vec2 vTex;

vec2 HALF = vec2(.5);

vec2 rotate(vec2 v, float a) {
    vec2 tv = v - HALF;
    tv *= mat2(
            cos(a),  sin(a),
            -sin(a), cos(a));
    tv += HALF;
    return tv;
}

void main() {
    gl_Position = uMat * (aPos + vec4(uPos, 0.));
    vTex = aPos.xy;
    // flip y coordinate
    vTex.y = 1. - vTex.y;
    vTex = rotate(vTex, uAng);
}
