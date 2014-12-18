[PARTNAME]
renderstates
[END]

[RENDERSTATE]
name colorlines
depth true
cull false
[END]

[RENDERSTATE]
name plain
depth true
depthfunc LESS
[END]

[RENDERSTATE]
name blend
blend true
blendfunc SRC_ALPHA ONE_MINUS_SRC_ALPHA
depth true
depthfunc LESS
[END]

[COMMON]
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
[END]