[NAME]
meshViewer
[END]

[COMMON]

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 vTextureCoord;
varying vec4 vPosition;
varying vec3 vNormal;

// options from viewer app are: x: explode y/n  y: 1 uv view, 2 x seams, 3 y seams  z: n/a  w: n/a
uniform vec4 options;            // group perobject

[END]

[RENDERSTATE]
name noblend
depth true
depthfunc LESS
[END]

[APPLY]
noblend
[END]

[VERTEX]

attribute vec3 aVertexPosition;  // POS
attribute vec2 aTextureCoord;    // TEX0
attribute vec3 aVertexNormal;    // NORM

uniform mat4 projection;         // group camera
uniform mat4 view;               // group camera

uniform mat4 uWorld;          // group perobject

uniform mat4 localTransform;     // group perpart

void main(void) 
{
  vec3 pos = aVertexPosition;

  vPosition = uWorld * localTransform * vec4(pos, 1.0);
  if (options.x > 0.0) vPosition += vec4( mat3(localTransform) * aVertexNormal * 0.25, 0.0);

  gl_Position = projection * view * vPosition;

  vTextureCoord = aTextureCoord;

  vNormal = mat3(uWorld) * mat3(localTransform) *  aVertexNormal;
}
[END]

[PIXEL]

uniform vec3 partcolor;         // group perpart

uniform vec3 camera;             // group camera

struct LightDefinition 
{
  vec3 Color;                // group light
  float Intensity;           // group light
  float Attenuation;         // group light
  float AttenuationPower;    // group light
  vec3 Position;             // group light
  mat4 WorldToLight;         // group light
};

uniform int uLightCount;             // group light
uniform float AmbientFactor;         // group light
uniform vec3 AmbientColor;           // group light
uniform LightDefinition uLights[10]; // group light

// material options are: x: texture y/n   y: specular exponant  z: specular override   w: n/a
uniform vec4 materialoptions;    // group material
uniform vec3 ambientcolor;       // group material
uniform vec3 diffusecolor;       // group material
uniform vec3 specularcolor;      // group material
uniform vec3 emissivecolor;      // group material

uniform sampler2D uTexture; // mag LINEAR, min LINEAR_MIPMAP_LINEAR
uniform sampler2D shadow; // mag LINEAR, min LINEAR

bool IsShadow(vec4 position, vec3 normal, LightDefinition light)
{
  vec4 positionFromLight =  light.WorldToLight * position;

  // if face is away from light - shadowed
  vec3 lightDir = light.Position - vec3(position);
 // if (dot(normal, lightDir) < 0.0) return true;

  // convert light POV location to a spot on the shadow map
  vec2 shadowLookup = 0.5 + 0.5 * (positionFromLight.xy / positionFromLight.w);
  vec4 depth = texture2D(shadow, shadowLookup);
  float depthFromLight = positionFromLight.z / positionFromLight.w;
  if (depth.x + 0.00001 < depthFromLight) return true;
  return false;
}

float maxSpecular = 0.0;

vec3 CalculateLight(LightDefinition light)
{
  // work out the lighting
  float d = distance(light.Position, vec3(vPosition));
  vec3 pointToLight = normalize(light.Position - vec3(vPosition));
  float attenuation = 1.0 / (light.Attenuation * pow(d, light.AttenuationPower));

  float diffuseFactor = max(0.0, dot(vNormal, pointToLight)) * light.Intensity;
  vec3 diffuse = diffusecolor * light.Color * diffuseFactor;

  vec3 specular = vec3(0.0, 0.0, 0.0);
  float specfactor;
  if (diffuseFactor > 0.0) 
  {
    vec3 cameradir = normalize(camera - vec3(vPosition));
    vec3 reflection = normalize(reflect(-pointToLight, vNormal));
    specfactor = max(0.0, dot(cameradir, reflection));
    specfactor = pow(specfactor, materialoptions.y);
    specular =  specularcolor * light.Color * specfactor;

    if (specfactor > maxSpecular) maxSpecular = specfactor;
  }

//  if (IsShadow(vPosition, vNormal, light))  
//    return vec3(0.0, 0.0, 0.0);
//  else   
  if (specfactor > 0.5 && materialoptions.z > 0.0)
    return min((specular * attenuation) + emissivecolor, 1.0);
  else 
    return  min(((diffuse + specular) * attenuation) + emissivecolor, 1.0);
}

void main(void) 
{
  vec4 tex = vec4(1.0, 1.0, 1.0, 1.0);
  vec3 light = vec3(0.0,0.0,0.0);

  vec3 ambient = (AmbientColor) * AmbientFactor;

  if (uLightCount > 0) light = max(light, CalculateLight(uLights[0]));
  if (uLightCount > 1) light = max(light, CalculateLight(uLights[1]));
  if (uLightCount > 2) light = max(light, CalculateLight(uLights[2]));
  if (uLightCount > 3) light = max(light, CalculateLight(uLights[3]));
  if (uLightCount > 4) light = max(light, CalculateLight(uLights[4]));
  if (uLightCount > 5) light = max(light, CalculateLight(uLights[5]));
  if (uLightCount > 6) light = max(light, CalculateLight(uLights[6]));
  if (uLightCount > 7) light = max(light, CalculateLight(uLights[7]));
  if (uLightCount > 8) light = max(light, CalculateLight(uLights[8]));
  if (uLightCount > 9) light = max(light, CalculateLight(uLights[9]));

  // work out the texture color
  if (maxSpecular > 0.5 && materialoptions.z > 0.0)
  {

  }
  else if (materialoptions.x > 0.0)
  {
    // has a texture
    tex = texture2D(uTexture, vec2(vTextureCoord.x, vTextureCoord.y));
  }

  gl_FragColor =  vec4(min(light + ambient, 1.0), 1.0) * tex;
}

[END]
 