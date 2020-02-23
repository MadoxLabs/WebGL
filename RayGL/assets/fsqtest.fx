[NAME]
fsqtest
[END]

[TYPE]
ES3.0
[END]

[COMMON]
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
[END]

[RENDERSTATE]
name noblend
depth true
depthfunc LESS
[END]

[APPLY]
noblend
[END]

[VERTEX]

in vec2 aVertexPosition;  // POS
in vec2 aTextureCoord;    // TEX0

out vec2 vTextureCoord;

void main(void) 
{
  gl_Position = vec4(aVertexPosition, 0.0, 1.0 );
  vTextureCoord = aTextureCoord;
}
[END]

[PIXEL]

in vec2 vTextureCoord;
out vec4 outColor;

struct CameraData
{
  float height;
  float width;
  float fov;
  float focalLength;
  vec3 from;
  vec3 to;
  vec3 up;
};

struct ObjectData
{
  float id;
  float type;
  float material;
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
  vec3 attenuation;
  float intensityAmbient;
  float intensityDiffuse;
  float intensitySpecular;
};

layout(std140) uniform Lights  // materials
{
  LightData data[2];
} lights;

layout(std140) uniform Materials  // materials
{
  Material data[1];
} materials;

layout(std140) uniform PerScene  // perscene
{
  CameraData camera;
} perScene;

layout(std140) uniform Objects // objects
{
  float numObjects;
  ObjectData data[1];
} objects;

struct Camera
{
  float height;
  float width;
  float fov;
  float focalLength;
  mat4 transform;
  mat4 inverse;
  float halfWidth;
  float halfHeight;
  float pixelSize;
} camera;

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

void initCamera(CameraData data)
{
  vec3 forward = normalize(data.to - data.from);
  vec3 left = cross(forward, vec3(normalize(data.up)));
  vec3 up = cross(left, forward);
  mat4 translate = mat4(1.0, 0.0, 0.0, 0.0,
                        0.0, 1.0, 0.0, 0.0,
                        0.0, 0.0, 1.0, 0.0,
                        -data.from.x, -data.from.y, -data.from.z, 1.0);
  mat4 transform = mat4(left.x, up.x, -forward.x, 0.0, 
                        left.y, up.y, -forward.y, 0.0,
                        left.z, up.z, -forward.z, 0.0, 
                        0.0, 0.0, 0.0, 1.0);

  camera.transform = transform * translate;
  camera.inverse = inverse(camera.transform);

  camera.height = data.height;
  camera.width = data.width;
  camera.fov = data.fov;
  camera.focalLength = data.focalLength;

  float halfView = tan(data.fov / 2.0f);
  float ratio = data.width / data.height;

  camera.halfWidth = 0.0f;
  camera.halfHeight = 0.0f;
  if (ratio >= 1.0f)
  {
    camera.halfWidth = halfView;
    camera.halfHeight = halfView / ratio;
  }
  else
  {
    camera.halfHeight = halfView;
    camera.halfWidth = halfView * ratio;
  }

  camera.pixelSize = camera.halfWidth * 2.0f / camera.width;
}

Ray getRayAt(float u, float v, float ox, float oy)
{
  float x = u * camera.width + ox;
  float y = v * camera.height + oy;
  float xoffset = x * camera.pixelSize;
  float yoffset = y * camera.pixelSize;
  float xworld = camera.halfWidth - xoffset;
  float yworld = camera.halfHeight - yoffset;
  vec4 pixel = camera.inverse * vec4(xworld, yworld, -camera.focalLength, 1.0);
  vec4 origin = camera.inverse * vec4(0.0, 0.0, 0.0, 1.0);
  vec4 direction = normalize(pixel - origin);

  Ray ray;
  ray.origin = origin;
  ray.direction = direction;
  return ray;
}

void sphere_intersect(in int index, in Ray ray)
{
  vec4 sphereToRay = ray.origin - vec4(0.0, 0.0, 0.0, 1.0);
  float a = dot(ray.direction, ray.direction);
  float b = 2.0 * dot(ray.direction, sphereToRay);
  float c = dot(sphereToRay, sphereToRay) - 1.0;
  float aa = a + a;
  float discr = b * b - 2.0 * aa * c;
  if (discr < 0.0) return;

  float rootDiscr = sqrt(discr);
  if (hitsize < 20) {
    hitlist[hitsize] = Intersect((-b - rootDiscr) / aa, index);
    hitsize++;
  }
  if (hitsize < 20) {
    hitlist[hitsize] = Intersect((-b + rootDiscr) / aa, index);
    hitsize++;
  }
}

vec4 sphere_normal(vec4 p)
{
  return p - vec4(0.0, 0.0, 0.0, 1.0);
}

void sortIntersections()
{
  bool changed = false;

  for (int loop = 0; loop < 101; ++loop)
  {
    for (int i = 0; i < hitsize-1; ++i)
    {
      if (hitlist[i].length > hitlist[i + 1].length)
      {
        changed = true;
        float l = hitlist[i].length;
        int o = hitlist[i].object;
        hitlist[i].length = hitlist[i+1].length;
        hitlist[i].object = hitlist[i+1].object;
        hitlist[i + 1].length = l;
        hitlist[i + 1].object = o;
      }
    }
    if (!changed) break;
  }
}

bool getHit()
{
  for (int i = 0; i < hitsize; i += 1)
  {
    if (hitlist[i].length >= 0.0)
    {
      hit = hitlist[i];
      return true;
    }
  }
  return false;
}

vec4 getNormal(int oIndex, vec4 p)
{
  vec4 n = sphere_normal(inverse(objects.data[oIndex].transform) * p);
  vec4 w = transpose(objects.data[oIndex].transform) * n;
  w.w = 0.0;
  return normalize(w);
}

void intersect(in Ray ray)
{
  for (int i = 0; float(i) < objects.numObjects; ++i)
  {
    // transform to object space
    Ray r2;
    r2.origin = inverse(objects.data[i].transform) * ray.origin;
    r2.direction = inverse(objects.data[i].transform) * ray.direction;
    // hit?
    sphere_intersect(i, r2);
  }
  sortIntersections();
}

vec4 lighting(int mIndex, int lIndex, vec4 p, vec4 eye, vec4 n)
{
  vec4 effectiveColour = materials.data[mIndex].colour * lights.data[lIndex].colour;
  vec4 ambient = effectiveColour * lights.data[lIndex].intensityAmbient * materials.data[mIndex].ambient;
  vec4 toLight = lights.data[lIndex].position - p;
  float distance = length(toLight);
  float attenuation = lights.data[lIndex].attenuation[0] + lights.data[lIndex].attenuation[1] * distance + lights.data[lIndex].attenuation[2] * distance * distance;

  vec4 diffuse = vec4(0.0, 0.0, 0.0, 1.0);
  vec4 specular = vec4(0.0, 0.0, 0.0, 1.0);

  toLight = normalize(toLight);
  float lightDotNormal = dot(toLight, n);
  if (lightDotNormal >= 0.0)
  {
    diffuse = effectiveColour * lights.data[lIndex].intensityDiffuse * materials.data[mIndex].diffuse * lightDotNormal;
    vec4 reflect = reflect(-toLight, n); // iffy
    float reflectDotEye = dot(reflect, eye);
    if (reflectDotEye > 0.0)
    {
      float factor = pow(reflectDotEye, materials.data[mIndex].shininess);
      specular = lights.data[lIndex].colour * materials.data[mIndex].specular * factor;
    }
  }
  return (ambient + diffuse + specular) * (1.0 / attenuation);
}

vec4 castRay(Ray ray)
{
  intersect(ray);
  if (getHit() == false)
    return vec4(0.05, 0.05, 0.05, 1.0);

  // two lights
  vec4 p = ray.origin + (ray.direction * hit.length);
  vec4 ret = lighting(int(objects.data[hit.object].material), 0, p, -ray.direction, getNormal(hit.object, p));
  return ret + lighting(int(objects.data[hit.object].material), 1, p, -ray.direction, getNormal(hit.object, p));
}

void main(void) 
{
  initCamera(perScene.camera);
  Ray ray = getRayAt(vTextureCoord.x, vTextureCoord.y, 0.5, 0.5);
  outColor = castRay(ray);
}

[END]
