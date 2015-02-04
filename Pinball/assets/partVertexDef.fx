[PARTNAME]
vertexDefinition
[END]

[COMMON]
varying vec2 vTextureCoord;
varying vec4 vPosition;
varying vec3 vNormal;
[END]

[VERTEX]

attribute vec3 aVertexPosition;  // POS
attribute vec2 aTextureCoord;    // TEX0
attribute vec3 aVertexNormal;    // NORM

uniform mat4 projection;         // group camera
uniform mat4 view;               // group camera

uniform mat4 uWorld;             // group perobject

uniform mat4 localTransform;     // group perpart

[END]
