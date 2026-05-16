[NAME]
sprite
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
name sprite
blend true
blendfunc SRC_ALPHA ONE_MINUS_SRC_ALPHA
depth false
[END]

[APPLY]
sprite
[END]

[VERTEX]

attribute vec2 aVertexPosition;  // POS
attribute vec2 aTextureCoord;    // TEX0

uniform vec2 location;
uniform vec2 size;
uniform vec2 screensize;

void main(void) 
{
  vec2 vert = ((location + aVertexPosition * size) / screensize) * 2.0 - 1.0;
  vert.y *= -1.0;
  gl_Position = vec4(vert, 0.0, 1.0 );
  vTextureCoord = aTextureCoord;
  vTextureCoord.y = 1.0 - vTextureCoord.y;
}
[END]

[PIXEL]

uniform sampler2D uSpriteTex; // mag LINEAR, min LINEAR, wrapu CLAMP_TO_EDGE, wrapv CLAMP_TO_EDGE

void main(void) 
{
  gl_FragColor = texture2D(uSpriteTex, vTextureCoord);
}

[END]

