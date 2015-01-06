[NAME]
lightrender
[END]

[INCLUDE renderstates]
[INCLUDE vertexDefinition]
[INCLUDE plainVS]
[INCLUDE pixelDefinition]

[APPLY]
plain
[END]

[PIXEL]

void main(void) 
{
  vec4 tex = vec4(1.0, 1.0, 1.0, 1.0);
  if (materialoptions.x > 0.0)    // has a texture
    tex = texture2D(uTexture, vec2(vTextureCoord.x, vTextureCoord.y));

  gl_FragColor = vec4(diffusecolor,1.0) * tex;
}

[END]
