[NAME]
sky
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
name sky
depth false
depthfunc LESS
[END]

[APPLY]
sky
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
uniform mat3 orient;           // group sky
uniform mat3 sunorient;           // group sky

void main(void) 
{
  // VERSION 1
  //   just render a fixed gradient in the sky
  //gl_FragColor = vec4(0., vTextureCoord, 1.);

  // VERSION 2
  //  render a gradient focused around vector 0, 0, 1
  //  use texture coord as the camera->pixel vector
  //vec3 sun = vec3(0., 0.5, 1.);
  //vec3 pixel = vec3(vTextureCoord, 1.) * 2. - 1.;
  //float nDotL = dot(normalize(pixel), normalize(sun));
  //vec4 suncolor = vec4(1., 1., 0., 1.);
  //vec4 skycolor = vec4(0., 0., 1., 1.);
  //float factor = pow(nDotL, 5.);
  //gl_FragColor = skycolor * (1. - factor) + suncolor * factor;

  // VERSION 4
  // add in the actual camera's direction 
  //vec3 sun = vec3(1.0, 0., 0.);
  //vec3 pixel = vec3(vTextureCoord, 1.) * 2. - 1.;
  //float nDotL = dot(normalize(pixel * orient), normalize(sun));
  //vec4 suncolor = vec4(1., 1., 0., 1.);
  //vec4 skycolor = vec4(0., 0., 1., 1.);
  //float factor = pow(nDotL, 8.);
  //gl_FragColor = skycolor * (1. - factor) + suncolor * factor;

  // VERSION 4
  // add in the suns direction 
  vec3 sun = vec3(0.0, 1.0, 0.);
  vec3 pixel = vec3(vTextureCoord, 1.) * 2. - 1.;
  float nDotL = dot(normalize(pixel * orient), normalize(sun * sunorient));
  vec4 suncolor = vec4(1., 1., 0., 1.);
  vec4 skycolor = vec4(0., 0., 1., 1.);
  float factor = pow(nDotL, 8.);
  gl_FragColor = skycolor * (1. - factor) + suncolor * factor;


  // RANDOM TEST
//  float color = fract(sin(dot(vTextureCoord,vec2(12.9898, 78.233)))*43758.5453);
//  gl_FragColor = vec4(0., color, 0., 1.);
}

[END]
