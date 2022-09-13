#version 300 es
precision mediump float;

in vec2 vUV;

uniform vec2 uSize;
uniform float uTime;

out vec4 outColor;

// https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
float rand(vec2 n) {
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p){
	vec2 ip = floor(p);
	vec2 u = fract(p);
	u = u*u*(3.0-2.0*u);

	float res = mix(
		mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
		mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
	return res*res;
}

// https://thebookofshaders.com/edit.php#11/2d-gnoise.frag
vec3 fog() {
    vec2 pos = vUV * 10. + vec2(uTime * .005, uTime * .001);
    return vec3(noise(pos)*.5 + .5);
}

void main() {
    vec2 uv = fract(vUV * uSize);
    vec2 border = step(.03, uv);
    outColor = vec4(mix(vec3(.4, .4, .4), vec3(.5, .7, .8), (border.x * border.y)) * fog(), 1.);
}
