[NAME]
oculus
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

uniform sampler2D uFrontbuffer; // mag LINEAR, min LINEAR, wrapu CLAMP_TO_EDGE, wrapv CLAMP_TO_EDGE

uniform vec2 LensCenter;       // oculus
uniform vec2 ScreenCenter;     // oculus
uniform float distortionscale; // oculus
uniform float aspect;          // oculus

vec2 HmdWarp(vec2 in01)
{
  vec2 Scale = vec2(1.0/2.0 * distortionscale, 1.0/2.0 * distortionscale * aspect);
  vec2 ScaleIn = vec2(2.0, 2.0 * aspect);
  vec4 HmdWarpParam = vec4(1.0, 0.22, 0.24, 0.0);

  vec2 theta = (in01 - LensCenter) * ScaleIn;
  float rSq = theta.x * theta.x + theta.y * theta.y;
  vec2 rvector = theta * (HmdWarpParam.x + HmdWarpParam.y * rSq + HmdWarpParam.z * rSq * rSq + HmdWarpParam.w * rSq * rSq * rSq);
  return LensCenter + Scale * rvector;
}

void main(void) 
{
//  gl_FragColor = texture2D(uFrontbuffer, vTextureCoord);

  vec2 tex = HmdWarp(vTextureCoord);
  vec2 tex2 = clamp(tex, ScreenCenter-vec2(0.25,0.5), ScreenCenter+vec2(0.25, 0.5));
  vec2 diff = tex - tex2;
  if (diff.x != 0.0 || diff.y != 0.0 )
    gl_FragColor = vec4(0,0,0,1);
  else 
    gl_FragColor = texture2D(uFrontbuffer, tex);

}

[END]

rift distortion numbers:  1 0.22 0.24 0