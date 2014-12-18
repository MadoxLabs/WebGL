[NAME]
ground
[END]

[INCLUDE renderstates]
[INCLUDE shadowrecieve]

[COMMON]
uniform sampler2D heightmap; // mag NEAREST, min NEAREST, wrapu CLAMP_TO_EDGE, wrapv CLAMP_TO_EDGE
uniform sampler2D aomap; // mag LINEAR, min LINEAR, wrapu CLAMP_TO_EDGE, wrapv CLAMP_TO_EDGE

uniform float regionsize; // group scene

varying vec2 vTextureCoord;
varying vec4 vPosition;
varying float vAOFactor;
varying vec3 vNormal;
[END]

[APPLY]
plain
[END]

[VERTEX]

attribute vec3 aVertexPosition;  // POS
attribute vec2 aTextureCoord;    // TEX0

uniform mat4 projection;         // group camera
uniform mat4 view;               // group camera

uniform mat4 localTransform;     // group perpart

uniform mat4 uWorld;             // group perobject

void main(void) 
{
  vTextureCoord = aTextureCoord;
  vAOFactor = texture2D(aomap, aTextureCoord).x;

  vPosition = vec4(aVertexPosition, 1.0);
  vPosition.y = texture2D(heightmap, aTextureCoord).x;

  gl_Position = projection * view * uWorld * localTransform * vPosition;

  float tex = 1.0 / regionsize;
  vec2 px = vec2(tex, 0);
  vec2 py = vec2(0, tex);
  float top    = texture2D(heightmap, vTextureCoord - py).x;
  float bottom = texture2D(heightmap, vTextureCoord + py).x;
  float left   = texture2D(heightmap, vTextureCoord - px).x;
  float right  = texture2D(heightmap, vTextureCoord + px).x;
  vNormal = normalize( cross( vec3(2, right-left, 0), vec3(0, top-bottom, -2) ) );
}
[END]

[PIXEL]

uniform vec3 options;            // group scene
uniform mat4 uWorldToLight;      // group scene
uniform vec3 uLightPosition;     // group scene

uniform vec3 camera;             // group camera

uniform vec4 materialoptions;    // group material
uniform vec3 ambientcolor;       // group material
uniform vec3 diffusecolor;       // group material
uniform vec3 specularcolor;      // group material
uniform vec3 emissivecolor;      // group material

uniform sampler2D wang; // mag LINEAR, min LINEAR, wrapu CLAMP_TO_EDGE, wrapv CLAMP_TO_EDGE
uniform sampler2D grass; // mag LINEAR, min LINEAR_MIPMAP_LINEAR
uniform sampler2D dirt; // mag LINEAR, min LINEAR_MIPMAP_LINEAR
uniform sampler2D sand; // mag LINEAR, min LINEAR_MIPMAP_LINEAR

void main(void) 
{ 
  float wangsize = 64.0;
  vec4 color = vec4(1.0,1.0,1.0,1.0);

  // wang tiles
  vec2 mappingScale = vec2(wangsize, wangsize);                 // we are hardcoding the fact that each ground segment is made up of 100x100 tiles
  vec2 mappingAddress = vTextureCoord * mappingScale;  // convert the 0:1 uvs to 0:100 tile index
  vec4 whichTile = texture2D(wang, (floor(mappingAddress) + 0.5) / mappingScale ); // floor the tile index to get the interger array indexes into the index
                                                                                               // then convert backto 0:1 range for reading
  vec2 tileScale = vec2(4.0, 4.0);                     // we know the tile textures is always 4x4
  vec2 tileScaledTex = vTextureCoord * vec2(wangsize/4.0, wangsize/4.0);

  float f = abs(vNormal.x) + abs(vNormal.z);
  vec4 texColorA = texture2D(grass, whichTile.xw + fract(mappingAddress)/tileScale);
  vec4 texColorB = texture2D(dirt, whichTile.xw + fract(mappingAddress)/tileScale);
  vec4 texColorC = texture2D(sand, whichTile.xw + fract(mappingAddress)/tileScale);

  // lerp between dirt and grass based on terrain slope
  if (f > 0.9) color = texColorB;
  else if (f > 0.7) 
  {
    f = ((f - 0.7) * 5.0) * 0.7 + 0.3;  // scale to 0 to 1, then bias towards dirt by 30%
    color = texColorB * f + texColorA * (1.0-f);
  }
  else color = texColorA;

  // below a certain height lerp with sand
  float wHeight = vPosition.y;
  if (wHeight <= 1.0) {
    color = texColorC;
  } else
  if (wHeight < 3.0) {
    f = (wHeight - 1.0)/2.0;
    color = color * f + texColorC * (1.0-f);
  }

  // lighting
  float nDotL = dot(normalize(vNormal), normalize(uLightPosition - vec3(vPosition)));

  // apply user options
  float a = color.a;
  if (options.x > 0.0) color = color * (nDotL + 0.1);
  if (options.y > 0.0) color = color * min(1.0,vAOFactor+0.5);
  if (options.z > 0.0)  color = color * IsShadow(vPosition, vNormal, uWorldToLight, uLightPosition);

  color.a = a;

  // out
  gl_FragColor = color;
}

[END]
