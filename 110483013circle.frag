#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float glow(float d, float str, float thickness){
    return thickness / pow(d, str);
}

vec2 hash2( vec2 x )            //亂數範圍 [-1,1]
{
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    x = x*k + k.yx;
    return -1.0 + 2.0*fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
}
float gnoise( in vec2 p )       //亂數範圍 [-1,1]
{
    vec2 i = floor( p );
    vec2 f = fract( p );
    
    vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( dot( hash2( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
                            dot( hash2( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                         mix( dot( hash2( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
                            dot( hash2( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}

float fbm(in vec2 uv)       //亂數範圍 [-1,1]
{
    float f;                                                //fbm - fractal noise (4 octaves)
    mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );
    f   = 0.5000*gnoise( uv ); uv = m*uv;          
    f += 0.2500*gnoise( uv ); uv = m*uv;
    f += 0.1250*gnoise( uv ); uv = m*uv;
    f += 0.0625*gnoise( uv ); uv = m*uv;
    return f;
}

//Gradient Noise 3D
vec3 hash( vec3 p ) // replace this by something better
{
    p = vec3( dot(p,vec3(127.1,311.7, 74.7)),
              dot(p,vec3(269.5,183.3,246.1)),
              dot(p,vec3(113.5,271.9,124.6)));

    return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}


float noise( in vec3 p )
{
    vec3 i = floor( p );
    vec3 f = fract( p );
    
    vec3 u = f*f*(3.0-2.0*f);

    return mix( mix( mix( dot( hash( i + vec3(0.0,0.0,0.0) ), f - vec3(0.0,0.0,0.0) ), 
                          dot( hash( i + vec3(1.0,0.0,0.0) ), f - vec3(1.0,0.0,0.0) ), u.x),
                     mix( dot( hash( i + vec3(0.0,1.0,0.0) ), f - vec3(0.0,1.0,0.0) ), 
                          dot( hash( i + vec3(1.0,1.0,0.0) ), f - vec3(1.0,1.0,0.0) ), u.x), u.y),
                mix( mix( dot( hash( i + vec3(0.0,0.0,1.0) ), f - vec3(0.0,0.0,1.0) ), 
                          dot( hash( i + vec3(1.0,0.0,1.0) ), f - vec3(1.0,0.0,1.0) ), u.x),
                     mix( dot( hash( i + vec3(0.0,1.0,1.0) ), f - vec3(0.0,1.0,1.0) ), 
                          dot( hash( i + vec3(1.0,1.0,1.0) ), f - vec3(1.0,1.0,1.0) ), u.x), u.y), u.z );
}


float circle(vec2 uv, float radius){
    float dist = length(uv);
    float circle_dist = abs(dist-radius);                                //光環大小
    return circle_dist;
}



void main() {
    
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.x *= u_resolution.x / u_resolution.y;
    uv = uv * 2.0 - 1.0;

    // 初始化变量
    float result = 0.0;
    float radius = 0.5;

    // 定义不规则形状的数量
    const int numShapes = 5;  // 使用常量来定义迭代次数

 

    
    
    for (int i = 0; i < numShapes; i++) {

        // 计算半径的噪音
        float radius_noise = gnoise(uv * 2.0);

        // 计算与不规则形状的距离，包括半径的噪音
        float dist = length(uv);
        float circle_dist = abs(dist - (radius + radius_noise));


        // 动态呼吸效果，与之前一样
        float breathing = sin(2.0 * u_time / 5.0) * 0.5 + 0.2;

        // 计算强度和厚度
        float strength = (0.2 * breathing + 0.180);
        float thickness = (0.1 * breathing + 0.084);

        // 计算当前形状的光環效果
        float glow_circle = glow(circle_dist, strength, thickness);

        // 将当前形状的效果添加到总效果
        result += glow_circle;

        // 调整下一个形状的半径
        radius += 0.1;  // 可以根据需要调整

          //亂數作用雲霧
    float fog= fbm(0.4*uv+vec2(0.964*u_time, 0.828*u_time))*0.4+0.012;

    //定義圓環
    float result;
    for(float index=-0.0;index<25.0;++index)
    {
    //float index=0.0;
    //float noise_position= smoothstep(-0.2, 0., -uv.y+-0.036);

    float radius_noise= noise(vec3(4.892*uv,index+u_time*0.388))*0.280;
    float radius=0.572+radius_noise;
    float circle_dist = circle(uv*0.9, radius*0.9);                                //光環大小
    
    //動態呼吸
    //float breathing=sin(2.0*u_time/5.0*pi)*0.5+0.2;                     //option1
    //float breathing=(exp(sin(u_time/2.0*pi)) - 0.36787944)*0.42545906412;         //option2 錯誤
    float breathing=(exp(sin(u_time/2.0*3.14)) - 0.36787944)*0.42545906412;                //option2 正確
    float strength =(0.18*breathing+0.31);          //[0.2~0.3]         //光暈強度加上動態時間營造呼吸感
    float thickness=(0.002*breathing+0.01);          //[0.1~0.2]         //光環厚度 營造呼吸感
    float glow_circle = glow(circle_dist, strength, thickness);
    result+=glow_circle;
        
    }
    gl_FragColor = vec4((vec3(result*0.7+fog*0.4)),1.080);
    }
    }