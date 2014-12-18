[NAME]
shadowcast
[END]

[INCLUDE renderstates]

[COMMON]
uniform sampler2D heightmap; // mag NEAREST, min NEAREST, wrapu CLAMP_TO_EDGE, wrapv CLAMP_TO_EDGE
varying float vDepth;
[END]

[APPLY]
noblend
[END]

[VERTEX]

attribute vec3 aVertexPosition;  // POS
attribute vec2 aTextureCoord;    // TEX0

uniform mat4 projection;         // group camera
uniform mat4 view;               // group camera
uniform mat4 uWorld;             // group perobject
uniform mat4 localTransform;     // group perpart

void main(void) 
{
  vec2 crap = aTextureCoord;

  vec4 vPosition = vec4(aVertexPosition, 1.0);
  vPosition.y = texture2D(heightmap, aTextureCoord).x;
  gl_Position = projection * view * uWorld * localTransform * vPosition;

  vDepth = gl_Position.z / gl_Position.w;
}
[END]

[PIXEL]

void main(void) 
{
  gl_FragColor = vec4(vDepth, 0.0, 0.0, 1.0);
}

[END]
