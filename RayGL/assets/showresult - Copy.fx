[NAME]
ShowResult
[END]

[INCLUDE Common]

[RENDERSTATE]
name test
depth false
blend true
blendfunc ONE ZERO
[END]

[APPLY]
test
[END]

[INCLUDE FSQHandler]

[PIXEL]

in vec2 vTextureCoord;
out vec4 outColor;

uniform sampler2D result; // mag LINEAR, min LINEAR_MIPMAP_LINEAR


void main(void)
{
  vec4 c = texture(result, vec2(vTextureCoord.x, vTextureCoord.y));
  c.w = 1.0;
  outColor = c;
}

[END]
