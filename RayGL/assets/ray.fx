[NAME]
Ray
[END]

[INCLUDE Common]
[INCLUDE NoBlend]
[INCLUDE FSQHandler]
[INCLUDE DataDef]
[INCLUDE Camera]
[INCLUDE Sphere]
[INCLUDE Plane]
[INCLUDE Cube]
[INCLUDE Cylinder]
[INCLUDE Cone]
[INCLUDE Lighting]
[INCLUDE Casting]

[PIXEL]

in vec2 vTextureCoord;
out vec4 outColor;

void main(void) 
{
  initCamera(perScene.camera);

  int depth = int(perScene.maxReflections);
  Ray ray = getRayAt(vTextureCoord.x, vTextureCoord.y, 0.5, 0.5);
  colourStack[stackI] = ray;
  multStack[stackI] = 1.0;
  stackI++;
  
  // pop rays and add them up until none left
  vec4 finalColour = vec4(0.0,0.0,0.0,1.0);
  while(stackI > 0) 
  {
    stackI--;
    Ray ray = colourStack[stackI];
    float mult = multStack[stackI];

    vec4 c = castRay(ray, depth--);
    finalColour = finalColour + (c * mult);
  }
  outColor = finalColour;
}

[END]
