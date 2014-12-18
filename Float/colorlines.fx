[NAME]
colorlines
[END]

[INCLUDE renderstates]

[COMMON]
varying vec4 pColor;
[END]

[APPLY]
colorlines
[END]

[VERTEX]

attribute vec3 vPosition;  // POS
attribute vec4 vColor;  // COLOR

uniform mat4 projection;         // group camera
uniform mat4 view;               // group camera
uniform mat4 localTransform;     // group perpart

void main(void) 
{
  pColor = vColor;
  gl_Position = projection * view * localTransform * vec4(vPosition, 1.0);
}
[END]

[PIXEL]

void main(void) 
{
  gl_FragColor = pColor;
}

[END]
