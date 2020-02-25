[PARTNAME]
Lighting
[END]

[PIXEL]

vec4 getNormal(int oIndex, vec4 p)
{
  mat4 inv = inverse(objects.data[oIndex].transform);
  vec4 at = inv * p;
  vec4 n;

  if (objects.data[oIndex].type == 1.0) n = sphere_normal(at);
  else if (objects.data[oIndex].type == 2.0) n = plane_normal(at);
  else if (objects.data[oIndex].type == 3.0) n = cube_normal(at);
  else if (objects.data[oIndex].type == 4.0) n = cylinder_normal(oIndex, at);
  else if (objects.data[oIndex].type == 5.0) n = cone_normal(oIndex, at);

  vec4 w = transpose(inv) * n;
  w.w = 0.0;
  return normalize(w);
}

vec4 lighting(int mIndex, int lIndex, vec4 p, vec4 eye, vec4 n, float shadow)
{
  vec4 effectiveColour = materials.data[mIndex].colour * lights.data[lIndex].colour;
  vec4 ambient = effectiveColour * lights.data[lIndex].intensityAmbient *materials.data[mIndex].ambient;
  vec4 toLight = lights.data[lIndex].position - p;
  float distance = length(toLight);
  float attenuation = lights.data[lIndex].attenuation[0] + lights.data[lIndex].attenuation[1] * distance + lights.data[lIndex].attenuation[2] * distance * distance;

  if (shadow >= 1.0) return ambient * (1.0 / attenuation);

  vec4 diffuse = vec4(0.0, 0.0, 0.0, 1.0);
  vec4 specular = vec4(0.0, 0.0, 0.0, 1.0);

  toLight = normalize(toLight);
  float lightDotNormal = dot(toLight, n);
  if (lightDotNormal >= 0.0)
  {
    diffuse = effectiveColour * lights.data[lIndex].intensityDiffuse * materials.data[mIndex].diffuse * lightDotNormal * (1.0 - shadow);
    vec4 reflect = reflect(-toLight, n); // iffy
    float reflectDotEye = dot(reflect, eye);
    if (reflectDotEye > 0.0)
    {
      float factor = pow(reflectDotEye, materials.data[mIndex].shininess);
      specular = lights.data[lIndex].colour * materials.data[mIndex].specular * factor  * (1.0 - shadow);
    }
  }
  return (ambient + diffuse + specular) * (1.0 / attenuation );
}

float isShadowed(vec4 p, int lIndex, int depth)
{
  if (depth == 0) return 0.0;

  vec4 direction = lights.data[lIndex].position - p;
  float distance = length(direction);
  direction = normalize(direction);

  Ray ray;
  ray.origin = p;
  ray.direction = direction;

  intersect(ray);
  if (getHitSkipNoShadow() && hit.length < distance)
  {
    return 1.0;
  }

  return 0.0;
}

vec4 getColourFor(HitData comp, int depth)
{
  vec4 ret = vec4(0.0);
  for (int i = 0; i < int(lights.numLights); ++i)
  {
    float shadow =  isShadowed(comp.overPoint, i, int(perScene.shadowDepth));
    ret += lighting(int(objects.data[comp.object].material), i, comp.position, comp.eye, comp.normal, shadow);
  }
  return ret;
}


[END]
