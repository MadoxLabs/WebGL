[NAME]
objectrender
[END]

[INCLUDE renderstates]
[INCLUDE shadowrecieve]

[COMMON]
varying vec2 vTextureCoord;
varying vec4 vPosition;
varying vec3 vNormal;
[END]

[APPLY]
plain
[END]

[VERTEX]

attribute vec3 aVertexPosition;  // POS
attribute vec2 aTextureCoord;    // TEX0
attribute vec3 aVertexNormal;    // NORM

uniform mat4 projection;         // group camera
uniform mat4 view;               // group camera

uniform mat4 uWorld;             // group perobject

uniform mat4 localTransform;     // group perpart

void main(void) 
{
  vPosition = uWorld * localTransform * vec4(aVertexPosition, 1.0);
  gl_Position = projection * view * vPosition;

  vTextureCoord = aTextureCoord;

  vNormal = mat3(uWorld) * mat3(localTransform) *  aVertexNormal;
}
[END]

[PIXEL]
uniform vec3 partcolor;         // group perpart

uniform mat4 uWorldToLight;      // group scene
uniform vec3 uLightPosition;     // group scene
uniform vec3 uLight2Position;     // group scene
uniform vec3 lighton;            // group scene - x: light is on/off y: flashlight is on off
uniform vec3 spotlightDir;       // group scene
uniform vec3 spotlightPos;       // group scene

uniform vec3 camera;             // group camera

// material options are: x: texture y/n   y: specular exponant  z: n/a   w: n/a
uniform vec4 materialoptions;    // group material
uniform vec3 ambientcolor;       // group material
uniform vec3 diffusecolor;       // group material
uniform vec3 specularcolor;      // group material
uniform vec3 emissivecolor;      // group material

uniform sampler2D uTexture; // mag LINEAR, min LINEAR_MIPMAP_LINEAR

void main(void) 
{
  vec3 lightdist = uLightPosition - vec3(vPosition);
  vec3 light2dist = uLight2Position - vec3(vPosition);
  float nDotL = dot(normalize(vNormal), normalize(lightdist));
  
  float shadow = 1.0;
  if (lighton.x > 0.5) shadow = IsShadow(vPosition, vNormal, uWorldToLight, uLightPosition);

  vec3 ac = vec3(0.1, 0.1, 0.1);
  vec3 color = ac + diffusecolor * nDotL * shadow;
  vec3 spotlight = vec3(0.0, 0.0, 0.0);

  // spotlight section
    float intensity = 0.0;
    vec4 spec = vec4(0.0);
 
    vec3 ld = normalize(spotlightPos - vec3(vPosition));
    vec3 sd = normalize(spotlightDir);  
 
    // inside the cone?
    if (dot(sd,ld) > 0.9)   // 30ish degrees
    {
        vec3 n = normalize(normalize(vNormal));
        intensity = max(dot(n,ld), 0.0);
 
        // specular
//        if (intensity > 0.0) {
//            vec3 eye = normalize(DataIn.eye);
//            vec3 h = normalize(ld + eye);
//            float intSpec = max(dot(h,n), 0.0);
//            spec = specular * pow(intSpec, shininess);
//        }

        spotlight = lighton.y * intensity * diffusecolor * 0.5;
    }
  // end spotlight

  // textureing
  vec4 tex = vec4(1.0, 1.0, 1.0, 1.0);
  if (materialoptions.x > 0.0)    // has a texture
    tex = texture2D(uTexture, vec2(vTextureCoord.x, vTextureCoord.y));

  if (lighton.x < 0.5 && length(light2dist) < 1.0)
  {
    if (length(light2dist) < 0.8) { color.r = 0.0; color.b = 0.0; color.g = color.g * 0.1; }
    else if (length(light2dist) < 0.85) { color.r = 0.0; color.b = 0.0; color.g = color.g * 0.09; }
    else if (length(light2dist) < 0.9) { color.r = 0.0; color.b = 0.0; color.g = color.g * 0.08; }
    else if (length(light2dist) < 1.0) { color.r = 0.0; color.b = 0.0; color.g = color.g * 0.04; }
  }
  else color = color * lighton.x;
  gl_FragColor = tex * vec4(color + spotlight, 1.0);
}

[END]
