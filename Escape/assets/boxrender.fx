[NAME]
boxrender
[END]

[INCLUDE renderstates]

[COMMON]
varying vec4 vPosition;
[END]

[APPLY]
plain
[END]

[VERTEX]

attribute vec3 aVertexPosition;  // POS

uniform mat4 projection;         // group camera
uniform mat4 view;               // group camera

uniform mat4 uWorld;          // group perobject
uniform vec3 minBB;           // group perobject
uniform vec3 maxBB;           // group perobject

uniform mat4 localTransform;     // group perpart

void main(void) 
{
  vec3 pos = aVertexPosition;
  vec3 pos2 =  vec3((1.0-pos.x) * minBB.x, (1.0-pos.y) * minBB.y, (1.0-pos.z) * minBB.z) + vec3(pos.x * maxBB.x, pos.y * maxBB.y, pos.z * maxBB.z);

  gl_Position = projection * view * uWorld * localTransform * vec4(pos2, 1.0);
}
[END]

[PIXEL]

void main(void) 
{
  gl_FragColor = vec4(0.0,1.0,0.0,1.0);
}

[END]
