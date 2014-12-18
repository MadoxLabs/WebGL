[NAME]
waterFlowOut
[END]

[COMMON]
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 vTextureCoord;
uniform float regionsize; // group perobject

[END]

[RENDERSTATE]
name noblend
depth true
depthfunc LESS
[END]

[APPLY]
noblend
[END]

[VERTEX]

attribute vec2 aVertexPosition;  // POS
attribute vec2 aTextureCoord;    // TEX0

void main(void) 
{
  gl_Position = vec4(aVertexPosition, 0.0, 1.0 );
  vTextureCoord = aTextureCoord;
}
[END]

[PIXEL]

uniform sampler2D height; // mag LINEAR, min LINEAR, wrapu CLAMP_TO_EDGE, wrapv CLAMP_TO_EDGE
uniform sampler2D water; // mag LINEAR, min LINEAR, wrapu CLAMP_TO_EDGE, wrapv CLAMP_TO_EDGE
uniform sampler2D flows; // mag LINEAR, min LINEAR, wrapu CLAMP_TO_EDGE, wrapv CLAMP_TO_EDGE

void main(void) 
{
  float waterC = texture2D(water, vTextureCoord).x;
  float heightC = texture2D(height, vTextureCoord).x;
  float totalHC = waterC + heightC;

  float tex = 1.0 / regionsize;
  vec2 px = vec2(tex, 0);
  vec2 py = vec2(0, tex);

  vec4 heightN = vec4(0., 0., 0., 0.);
  heightN.x = texture2D(height, vTextureCoord - px).x; //Game.height[(x - 1) + 400 * y];
  heightN.y = texture2D(height, vTextureCoord + px).x; //Game.height[(x + 1) + 400 * y];
  heightN.z = texture2D(height, vTextureCoord - py).x; //Game.height[x + 400 * (y - 1)];
  heightN.w = texture2D(height, vTextureCoord + py).x; //Game.height[x + 400 * (y + 1)];

  vec4 totalH = vec4(0., 0., 0., 0.);
  totalH.x = texture2D(water, vTextureCoord - px).x + heightN.x;
  totalH.y = texture2D(water, vTextureCoord + px).x + heightN.y;
  totalH.z = texture2D(water, vTextureCoord - py).x + heightN.z;
  totalH.w = texture2D(water, vTextureCoord + py).x + heightN.w;

  vec4 heightDif = totalHC - totalH; 

  vec4 f = texture2D(flows, vTextureCoord); 
  vec4 outflow = f * 0.9 + heightDif * 0.1 ;

  if (outflow.x < 0.) outflow.x = 0.;
  if (outflow.y < 0.) outflow.y = 0.;
  if (outflow.z < 0.) outflow.z = 0.;
  if (outflow.w < 0.) outflow.w = 0.;

  float maxWater = waterC;
  float waterOut = (outflow.x + outflow.y + outflow.z + outflow.w) * 0.001;
  if (maxWater == 0. || waterOut == 0. || vTextureCoord.x == 0. || vTextureCoord.x == 1.|| vTextureCoord.y == 0. || vTextureCoord.y == 1.) {
    gl_FragColor = vec4(0.,0.,0.,0.);
  }
  else
  {
    if (waterOut > maxWater) {
      float scale = maxWater / waterOut;
      if (scale > 1.) scale = 1.;
      outflow *= scale;
    }
    gl_FragColor = outflow;
  }
}

[END]
