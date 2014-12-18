[NAME]
water
[END]

[INCLUDE renderstates]
[INCLUDE shadowrecieve]

[COMMON]
uniform sampler2D watermap; // mag NEAREST, min NEAREST, wrapu CLAMP_TO_EDGE, wrapv CLAMP_TO_EDGE
uniform sampler2D heightmap; // mag NEAREST, min NEAREST, wrapu CLAMP_TO_EDGE, wrapv CLAMP_TO_EDGE
uniform float regionsize; // group scene

varying vec2 vTextureCoord;
varying vec4 vPosition;
varying vec3 vNormal;
varying float vHeight;
varying float vFlow;
[END]


[APPLY]
blend
[END]

[VERTEX]

attribute vec3 aVertexPosition;  // POS
attribute vec2 aTextureCoord;    // TEX0

uniform mat4 projection;         // group camera
uniform mat4 view;               // group camera
uniform mat4 uWorld;             // group perobject
uniform mat4 localTransform;     // group perpart

float getHeight(vec2 tex)
{
  float ground = texture2D(heightmap, tex).x;
  float ret = texture2D(watermap, tex).x;
  if (ret > 0.0) ret += ground;
  return ret;
}

void main(void) 
{
  vTextureCoord = aTextureCoord;

  vHeight = texture2D(heightmap, vTextureCoord).x;
  vec2 water = texture2D(watermap, vTextureCoord).xy;
  vFlow = water.y;

  vPosition = vec4(aVertexPosition, 1.0);
  if (water.x == 0.0) vPosition.y = 0.0;
  else 
    vPosition.y = water.x + vHeight;
  gl_Position = projection * view * uWorld * localTransform * vPosition;

  float tex = 1.0 / regionsize;
  vec2 px = vec2(tex, 0);
  vec2 py = vec2(0, tex);
  float top    = getHeight(vTextureCoord - py);
  float bottom = getHeight(vTextureCoord + py);
  float left   = getHeight(vTextureCoord - px);
  float right  = getHeight(vTextureCoord + px);
  vNormal = normalize( cross( vec3(0.05, right-left, 0), vec3(0, top-bottom, -0.05) ) );
}
[END]

[PIXEL]

uniform vec3 options;            // group scene
uniform mat4 uWorldToLight;      // group scene
uniform vec3 uLightPosition   ;  // group scene

uniform vec3 camera;             // group camera

uniform vec4 materialoptions;    // group material
uniform vec3 ambientcolor;       // group material
uniform vec3 diffusecolor;       // group material
uniform vec3 specularcolor;      // group material
uniform vec3 emissivecolor;      // group material

void main(void) 
{ 
  float depth = max(0.0, vPosition.y - vHeight);
  vec3 color = vec3(0.0,0.0,1.0);
  vec3 shadow = vec3(1.0, 1.0, 0.0);
  float alpha = min (0.8, 0.5 + depth * 0.05);

  // lighting
  float nDotL = dot(normalize(vNormal), normalize(uLightPosition - vec3(vPosition)));

  // visualization test
//  if (vFlow > 0.0005) color = vec3(0.39, 0.58, 0.92);
  float flow = min(0.1, max(0.0, vFlow)) * 10.0;
  color = color * (1. - flow) + vec3(0.39, 0.58, 0.92) * flow*3.;

  // apply user options
  float diffuse = (0.2 + 0.7 * nDotL);
  if (options.z > 0.0)  diffuse = diffuse *  IsShadow(vPosition, vNormal, uWorldToLight, uLightPosition);
  color = color * diffuse;

  // out
  gl_FragColor = vec4(color,alpha);
}

[END]
