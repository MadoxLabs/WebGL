[NAME]
ShowResult
[END]

[COMMON]
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 vTextureCoord;
[END]

[RENDERSTATE]
name test
depth false
blend true
blendfunc ONE ZERO
[END]

[APPLY]
test
[END]

[VERTEX]

attribute vec2 aVertexPosition;  // POS
attribute vec2 aTextureCoord;    // TEX0

void main(void)
{
  gl_Position = vec4(aVertexPosition, 0.0, 1.0);
  vTextureCoord = aTextureCoord;
}
[END]

[PIXEL]
uniform float curslice; // group params
uniform float barsize; // group params
uniform sampler2D result; // mag LINEAR, min LINEAR, wrapu CLAMP_TO_EDGE, wrapv CLAMP_TO_EDGE

void main(void)
{
  vec4 ret = texture2D(result, vTextureCoord);

  if (vTextureCoord.y > barsize && vTextureCoord.x < curslice)
    ret = vec4(0.0,1.0,0.0,1.0);

  gl_FragColor = ret;
}


[END]
