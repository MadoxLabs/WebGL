[PARTNAME]
pixelDefinition
[END]

[PIXEL]
uniform vec3 partcolor;         // group perpart

uniform mat4 uWorldToLight;      // group scene
uniform vec3 uLightPosition;     // group scene

uniform vec3 camera;             // group camera

// material options are: x: texture y/n   y: specular exponant  z: n/a   w: n/a
uniform vec4 materialoptions;    // group material
uniform vec3 ambientcolor;       // group material
uniform vec3 diffusecolor;       // group material
uniform vec3 specularcolor;      // group material
uniform vec3 emissivecolor;      // group material

uniform sampler2D uTexture; // mag LINEAR, min LINEAR_MIPMAP_LINEAR

[END]
