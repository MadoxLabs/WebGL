[NAME]
buttonrender
[END]

[INCLUDE renderstates]
[INCLUDE shadowrecieve]
[INCLUDE vertexDefinition]
[INCLUDE pixelDefinition]
[INCLUDE plainPS]

[APPLY]
plain
[END]

[VERTEX]
uniform vec2 uState;             // group perobject

void main(void) 
{
  vPosition = uWorld * localTransform * vec4(aVertexPosition, 1.0);
  gl_Position = projection * view * vPosition;

  // fiddle texcoords
  vTextureCoord.x = aTextureCoord.x;
  vTextureCoord.y = 1.0 - aTextureCoord.y;  // y is flipped normally, unflip it to make the math easier to visualize

  // move the button face coord to the right number
  if (vTextureCoord.x >= 0.48)
  {
    if      (uState.x == 1.0 || uState.x == 5.0 ||uState.x == 9.0 ||uState.x == 13.0) vTextureCoord.y += 0.125;
    else if (uState.x == 2.0 || uState.x == 6.0 ||uState.x == 10.0 ||uState.x == 14.0)  vTextureCoord.y += 0.125*2.0;
    else if (uState.x == 3.0 || uState.x == 7.0 ||uState.x == 11.0 ||uState.x == 15.0)  vTextureCoord.y += 0.125*3.0;

    if      (uState.x < 4.0) vTextureCoord.x += 0.0;
    else if (uState.x < 8.0) vTextureCoord.x += 0.125;
    else if (uState.x < 12.0) vTextureCoord.x += 0.125*2.0;
    else vTextureCoord.x += 0.125*3.0;
  }
  // move the frame coord to red or green as needed
  else
  {
    if (uState.y >= 1.0) vTextureCoord.y += 0.5;  // 1 or 2 means lit
    if (uState.y == 2.0) vTextureCoord.x += 0.5;  // 2 is green
  }

  vTextureCoord.y = 1.0 - vTextureCoord.y;  // flip the y back to normal 

  vNormal = mat3(uWorld) * mat3(localTransform) *  aVertexNormal;
}
[END]
