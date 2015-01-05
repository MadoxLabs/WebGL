[NAME]
fanrender
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
uniform vec4 uCode;              // group perobject

void main(void) 
{
  vPosition = uWorld * localTransform * vec4(aVertexPosition, 1.0);
  gl_Position = projection * view * vPosition;

  // fiddle texcoords
  vTextureCoord.x = aTextureCoord.x;
  vTextureCoord.y = 1.0 - aTextureCoord.y;  // y is flipped normally, unflip it to make the math easier to visualize

  float num = -1.0;
  float offset = 0.0;
  if      (vTextureCoord.y <= 0.125)     { offset = 0.0; num = uCode.x; }           // determine which code digit this blade is showing
  else if (vTextureCoord.y <= 0.125*2.0) { offset = 0.125 * 1.0; num = uCode.y; }   //   if its a blade
  else if (vTextureCoord.y <= 0.125*3.0) { offset = 0.125 * 2.0; num = uCode.z; }
  else if (vTextureCoord.y <= 0.125*4.0) { offset = 0.125 * 3.0; num = uCode.w; }

  if (num > 7.0) vTextureCoord.x += 0.625;          // its a second column number
  else if (num >= 0.0) vTextureCoord.x += 0.375;    // its a first column number
  // else its not a part of the blade

  // move down the column to the right number
  if      (num == 0.0 || num == 8.0) vTextureCoord.y  = vTextureCoord.y - offset;// + 0.125*0.0;
  else if (num == 1.0 || num == 9.0) vTextureCoord.y  = vTextureCoord.y - offset + 0.125;//*1.0;
  else if (num == 2.0 || num == 10.0) vTextureCoord.y = vTextureCoord.y - offset + 0.125*2.0;
  else if (num == 3.0 || num == 11.0) vTextureCoord.y = vTextureCoord.y - offset + 0.125*3.0;
  else if (num == 4.0 || num == 12.0) vTextureCoord.y = vTextureCoord.y - offset + 0.125*4.0;
  else if (num == 5.0 || num == 13.0) vTextureCoord.y = vTextureCoord.y - offset + 0.125*5.0;
  else if (num == 6.0 || num == 14.0) vTextureCoord.y = vTextureCoord.y - offset + 0.125*6.0;
  else if (num == 7.0 || num == 15.0) vTextureCoord.y = vTextureCoord.y - offset + 0.125*7.0;

  vTextureCoord.y = 1.0 - vTextureCoord.y;  // flip the y back to normal 

  vNormal = mat3(uWorld) * mat3(localTransform) *  aVertexNormal;
}
[END]
