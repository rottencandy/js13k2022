#version 300 es
precision mediump float;

in vec2 vUV;

out vec4 outColor;

// https://thebookofshaders.com/07/
float rect(vec2 st, float size) {
    // bottom-left
    vec2 bl = smoothstep(vec2(size), vec2(size)+0.002,st);
    float pct = bl.x * bl.y;

    // top-right
    vec2 tr = smoothstep(vec2(size), vec2(size)+0.002,1.0-st);
    pct *= tr.x * tr.y;

    return pct;
}

void main() {
    float r = rect(vUV, 0.01);
    vec3 col1 = vec3(.0 + vUV.x * .5, .2 + vUV.y * .4, .7);
    vec3 col2 = vec3(.2);
    outColor = vec4(mix(col1, col2, r), 1.);
}
