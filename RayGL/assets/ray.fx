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
  Ray ray = getRayAt(vTextureCoord.x, vTextureCoord.y, 0.5, 0.5);
  outColor = castRay(ray);
}

[END]
