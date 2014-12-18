[NAME]
picker
[END]

[INCLUDE renderstates]

[COMMON]
uniform sampler2D heightmap; // mag NEAREST, min NEAREST, wrapu CLAMP_TO_EDGE, wrapv CLAMP_TO_EDGE
uniform sampler2D watermap; // mag NEAREST, min NEAREST, wrapu CLAMP_TO_EDGE, wrapv CLAMP_TO_EDGE

varying vec2 vTextureCoord;
[END]

[APPLY]
plain
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
  vTextureCoord = aTextureCoord;
  vec4 vPosition = vec4(aVertexPosition, 1.0);
  vPosition.y = texture2D(heightmap, aTextureCoord).x + texture2D(watermap, aTextureCoord).x;
  gl_Position = projection * view * uWorld * localTransform * vPosition;
}
[END]

[PIXEL]

void main(void) 
{ 
  gl_FragColor = vec4(vTextureCoord.x, vTextureCoord.y, 0.0, 1.0);
}

[END]
