[PARTNAME]
DataDef
[END]

[PIXEL]

struct CameraData
{
  float height;
  float width;
  float fov;
  float focalLength;
  vec4 from;
  vec4 to;
  vec4 up;
};

struct ObjectData
{
  float id;
  float type;
  float material;
  float extra1;
  vec4 extra2;
  mat4  transform;
};

struct Material
{
  float ambient;
  float diffuse;
  float specular;
  float shininess;
  vec4 colour;
};

struct LightData
{
  vec4 position;
  vec4 colour;
  vec4 attenuation;
  float intensityAmbient;
  float intensityDiffuse;
  float intensitySpecular;
};

layout(std140) uniform Lights  // materials
{
  float numLights;
  LightData data[-NUM-LIGHTS-];
} lights;

layout(std140) uniform Materials  // materials
{
  float numMaterials;
  Material data[-NUM-MATERIALS-];
} materials;

layout(std140) uniform PerScene  // perscene
{
  CameraData camera;
} perScene;

layout(std140) uniform Objects // objects
{
  float numObjects;
  ObjectData data[-NUM-OBJECTS-];
} objects;

struct Intersect
{
  float length;
  int object;
};

Intersect hitlist[20];
int hitsize;
Intersect hit;

struct Ray
{
  vec4 origin;
  vec4 direction;
};

float epsilon = 0.00001;
float Infinity = 3.402823466e+38;

[END]
