[NAME]
fanrender
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
uniform vec4 uCode;              // group perobject

uniform mat4 localTransform;     // group perpart

void main(void) 
{
  vPosition = uWorld * localTransform * vec4(aVertexPosition, 1.0);
  gl_Position = projection * view * vPosition;

  // fiddle texcoords
  vTextureCoord.x = aTextureCoord.x;
  vTextureCoord.y = 1.0 - aTextureCoord.y;  // y is flipped normally, unflip it to make the math easier to visualize

  float num = -1.0;
  float offset = 0.0;
  if      (vTextureCoord.y <= 0.125)     { offset = 0.0; num = uCode.x; }           // determine which code digit this blade is showing
  else if (vTextureCoord.y <= 0.125*2.0) { offset = 0.125 * 1.0; num = uCode.y; }   //   if its a blade
  else if (vTextureCoord.y <= 0.125*3.0) { offset = 0.125 * 2.0; num = uCode.z; }
  else if (vTextureCoord.y <= 0.125*4.0) { offset = 0.125 * 3.0; num = uCode.w; }

  if (num > 7.0) vTextureCoord.x += 0.625;          // its a second column number
  else if (num >= 0.0) vTextureCoord.x += 0.375;    // its a first column number
  // else its not a part of the blade

  // move down the column to the right number
  if      (num == 0.0 || num == 8.0) vTextureCoord.y  = vTextureCoord.y - offset;// + 0.125*0.0;
  else if (num == 1.0 || num == 9.0) vTextureCoord.y  = vTextureCoord.y - offset + 0.125;//*1.0;
  else if (num == 2.0 || num == 10.0) vTextureCoord.y = vTextureCoord.y - offset + 0.125*2.0;
  else if (num == 3.0 || num == 11.0) vTextureCoord.y = vTextureCoord.y - offset + 0.125*3.0;
  else if (num == 4.0 || num == 12.0) vTextureCoord.y = vTextureCoord.y - offset + 0.125*4.0;
  else if (num == 5.0 || num == 13.0) vTextureCoord.y = vTextureCoord.y - offset + 0.125*5.0;
  else if (num == 6.0 || num == 14.0) vTextureCoord.y = vTextureCoord.y - offset + 0.125*6.0;
  else if (num == 7.0 || num == 15.0) vTextureCoord.y = vTextureCoord.y - offset + 0.125*7.0;

  vTextureCoord.y = 1.0 - vTextureCoord.y;  // flip the y back to normal 

  vNormal = mat3(uWorld) * mat3(localTransform) *  aVertexNormal;
}
[END]

[PIXEL]
uniform vec3 partcolor;         // group perpart

uniform mat4 uWorldToLight;      // group scene
uniform vec3 uLightPosition;     // group scene
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
  float nDotL = dot(normalize(vNormal), normalize(uLightPosition - vec3(vPosition)));
  
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

  gl_FragColor = tex * vec4(color * lighton.x + spotlight, 1.0);
}

[END]
