[PARTNAME]
plainPS
[END]

[PIXEL]
void main(void) 
{
  vec3 lightdist = uLightPosition - vec3(vPosition);
  float nDotL = dot(normalize(vNormal), normalize(lightdist));
  
  float shadow = IsShadow(vPosition, vNormal, uWorldToLight, uLightPosition);

  vec3 ac = vec3(0.1, 0.1, 0.1);
  vec3 color = ac + diffusecolor * nDotL * shadow;

  // textureing
  vec4 tex = vec4(1.0, 1.0, 1.0, 1.0);
//  if (materialoptions.x > 0.0)    // has a texture
  //  tex = texture2D(uTexture, vec2(vTextureCoord.x, vTextureCoord.y));

  gl_FragColor = tex * vec4(color, 1.0);
}

[END]
