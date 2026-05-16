[PARTNAME]
plainVS
[END]

[VERTEX]

void main(void) 
{
  vPosition = uWorld * localTransform * vec4(aVertexPosition, 1.0);
  gl_Position = projection * view * vPosition;

  vTextureCoord = aTextureCoord;

  vNormal = mat3(uWorld) * mat3(localTransform) *  aVertexNormal;
}
[END]