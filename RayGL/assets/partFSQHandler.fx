[PARTNAME]
FSQHandler
[END]

[VERTEX]

in vec2 aVertexPosition;  // POS
in vec2 aTextureCoord;    // TEX0

out vec2 vTextureCoord;

void main(void) 
{
  gl_Position = vec4(aVertexPosition, 0.0, 1.0 );
  vTextureCoord = aTextureCoord;
}

[END]
