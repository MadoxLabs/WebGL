[NAME]
shadowcastobject
[END]

[INCLUDE renderstates]

[COMMON]
varying float vDepth;
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
uniform mat4 uWorld;             // group perobject
uniform mat4 localTransform;     // group perpart

void main(void) 
{
  vec2 crap = aTextureCoord;
  vec3 crap2 = aVertexNormal;

  gl_Position = projection * view * uWorld * localTransform * vec4(aVertexPosition, 1.0);
  vDepth = gl_Position.z / gl_Position.w;
}
[END]

[PIXEL]

void main(void) 
{
  gl_FragColor = vec4(vDepth, 0.0, 0.0, 1.0);
}

[END]
