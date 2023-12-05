// Author:HY
// Title:Hate
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0; //data/MonaLisa.jpg
//uniform sampler2D u_tex1;

void main() {
    vec2 mouse=u_mouse.xy/u_resolution.xy;
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    //st.x *= u_resolution.x/u_resolution.y;
    float paraX = (mouse.x*0.8+0.2)*45.;
    float paraY = (mouse.y)*15.;
    vec2 brickSize=vec2(paraX, paraY*0.5+35.-paraX) ; //n_mouse*60.0
    vec2 uv=st; //[0~1]
    vec2 uvs=uv*brickSize;//[0~6]
    vec2 ipos = floor(uvs);  // get the integer coords
    vec2 fpos = fract(uvs);  // get the fractional coords
    vec2 nuv=ipos/brickSize;

    vec3 color = vec3(0.);
    color = texture2D(u_tex0, nuv).rgb;    
    gl_FragColor = vec4(vec3(color),1.0);
}