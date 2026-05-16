[NAME]
transparentrender
[END]

[INCLUDE renderstates]
[INCLUDE shadowrecieve]
[INCLUDE vertexDefinition]
[INCLUDE plainVS]
[INCLUDE pixelDefinition]

[APPLY]
blend
[END]

[PIXEL]

void main(void) 
{
  float nDotL = dot(normalize(vNormal), normalize(uLightPosition - vec3(vPosition)));
  
  float shadow = 1.0;
  if (lighton.x > 0.5) shadow = IsShadow(vPosition, vNormal, uWorldToLight, uLightPosition);

  vec3 ac = vec3(0.1, 0.1, 0.1);
  vec3 color = ac + lighton.x * diffusecolor * nDotL * shadow;

  vec4 tex = vec4(1.0, 1.0, 1.0, 1.0);
  if (materialoptions.x > 0.0)    // has a texture
  {
    tex = texture2D(uTexture, vec2(vTextureCoord.x, vTextureCoord.y));
    gl_FragColor = tex;
  }
  else
    gl_FragColor = vec4(color, 0.2);
}

[END]
