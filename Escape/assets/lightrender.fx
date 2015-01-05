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
  gl_FragColor = vec4(diffusecolor,1.0);
}

[END]
