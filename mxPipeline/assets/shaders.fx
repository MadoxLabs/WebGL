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
  vec3 AmbientRGB;           // group light
  vec3 DiffuseRGB;           // group light
  vec3 SpecularRGB;          // group light
  vec3 Attenuation;          // group light
  vec3 Position;             // group light
  mat4 WorldToLight;         // group light
};

uniform int uLightCount;             // group light
uniform LightDefinition uLights[10]; // group light

// material options are: x: texture y/n   y: specular exponant  z: n/a   w: n/a
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

vec3 CalculateLight(LightDefinition light)
{
  // work out the lighting
  float d = distance(light.Position, vec3(vPosition));
  float attenuation = 1.0 / (1.0 + light.Attenuation[1] * pow(d, 2.0)); //1.0 / dot (vec3(1, d, d*d), light.Attenuation);

  vec3 ambient = ambientcolor * light.AmbientRGB;

  vec3 diffuse = diffusecolor * light.DiffuseRGB * dot(vNormal, light.Position - vec3(vPosition));

  vec3 cameradir = normalize(camera - vec3(vPosition));
  vec3 reflection = normalize(reflect(vec3(vPosition) - light.Position, vNormal));
  float specfactor = dot(cameradir, reflection);
  specfactor = pow(specfactor, 6.0);
  if (specfactor < 0.0) specfactor = 0.0;
  vec3 specular =  specularcolor * light.SpecularRGB * specfactor;

//  if (IsShadow(vPosition, vNormal, light))  
//    return vec3(0.0, 0.0, 0.0);
//  else   
    return  min(ambient + ((diffuse + specular) * attenuation) + emissivecolor, 1.0);
}

void main(void) 
{
  vec4 tex = vec4(1.0, 1.0, 1.0, 1.0);
  vec3 light = vec3(0.0,0.0,0.0);

  light += CalculateLight(uLights[0]);
  light += CalculateLight(uLights[1]);

  // work out the texture color

  if (options.y == 1.0)
  {
    // try to draw a checkboard to expose the uv mapping
    float color = 0.2;
    float u = floor(vTextureCoord.x * 10.0);
    float v = floor(vTextureCoord.y * 10.0);
    color = mod((mod(u,2.0) + mod(v,2.0)),2.0) + 0.2;
    tex = vec4(partcolor * color, 1.0);
  }
  else if (options.y == 2.0)
  {
    // just draw the U values
    tex = vec4(0.0, vTextureCoord.x, 0.0, 1.0);
  }
  else if (options.y == 3.0)
  {
    // just draw the V values
    tex = vec4(0.0, vTextureCoord.y, 0.0, 1.0);
  }
  else if (materialoptions.x > 0.0)
  {
    // has a texture
    tex = texture2D(uTexture, vec2(vTextureCoord.x, vTextureCoord.y));
  }

  if (options.x > 0.0)  gl_FragColor = vec4(0.8, 0.8, 0.8, 1.0);
  else
    gl_FragColor = tex * vec4(light, 1.0);
}

[END]
 