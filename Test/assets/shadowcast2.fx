[NAME]
shadowcast2
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

uniform mat4 projection;         // group camera
uniform mat4 view;               // group camera
uniform mat4 uWorld;             // group perobject
uniform mat4 localTransform;     // group perpart

void main(void) 
{
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
