[NAME]
plainobject
[END]

[INCLUDE renderstates]
[INCLUDE shadowrecieve]

[COMMON]
varying vec2 vTextureCoord;
varying vec4 vPosition;
varying vec3 vNormal;
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
  vPosition = uWorld * localTransform * vec4(aVertexPosition, 1.0);
  gl_Position = projection * view * vPosition;

  vTextureCoord = aTextureCoord;

  vNormal = mat3(uWorld) * mat3(localTransform) *  aVertexNormal;
}
[END]

[PIXEL]
uniform vec3 partcolor;         // group perpart

uniform vec3 options;            // group scene
uniform mat4 uWorldToLight;      // group scene
uniform vec3 uLightPosition;     // group scene

uniform vec3 camera;             // group camera

// material options are: x: texture y/n   y: specular exponant  z: n/a   w: n/a
uniform vec4 materialoptions;    // group material
uniform vec3 ambientcolor;       // group material
uniform vec3 diffusecolor;       // group material
uniform vec3 specularcolor;      // group material
uniform vec3 emissivecolor;      // group material

// uniform sampler2D uTexture; // mag LINEAR, min LINEAR_MIPMAP_LINEAR

void main(void) 
{
  vec4 color = vec4(partcolor, 1.0);
  vec4 tex = vec4(1.0, 1.0, 1.0, 1.0);

  // lighting
  float nDotL = dot(normalize(vNormal), normalize(uLightPosition - vec3(vPosition)));

  // apply user options
  float a = color.a;
  if (options.x > 0.0) color = color * (nDotL + 0.1);
  if (options.z > 0.0)  color = color *  IsShadow(vPosition, vNormal, uWorldToLight, uLightPosition);
  color.a = a;

//  if (materialoptions.x > 0.0) // has a texture
//  {    
//    tex = texture2D(uTexture, vec2(vTextureCoord.x, vTextureCoord.y));
//  }

  gl_FragColor = tex * color;
}

[END]
