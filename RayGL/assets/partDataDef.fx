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
  float shadow;
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
  vec4 colour; // r,g,b,1 or pattern,x,x,0
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

struct Pattern
{
  float type;
  float numColour;
  vec4 colour;
  mat4  transform;
};

layout(std140) uniform Patterns  // patterns
{
  float numPatterns;
  Pattern data[-NUM-PATTERNS-];
} patterns;

layout(std140) uniform Lights  // lights
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
  float shadowDepth;
  float maxReflections;
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

struct HitData
{
  float length;
  int object;
  vec4 position;
  vec4 normal;
  vec4 eye;
  bool inside;
  vec4 reflect;
  vec4 overPoint;
  vec4 underPoint;
};

float epsilon = 0.0005;
float Infinity = 3.402823466e+38;

void intersect(in Ray ray);
bool getHitSkipNoShadow();

[END]
