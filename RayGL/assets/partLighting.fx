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


// no recursion - this will be fun
int resolveNextPattern(int curIndex, vec4 pp)
{
  float val = 0.0;
  if (patterns.data[curIndex].type == 2.0) // stripe
  {
    val = pp.x;
  }
  else if (patterns.data[curIndex].type == 4.0) // ring
  {
    val = sqrt(pp.x * pp.x + pp.z * pp.z);
  }
  else if (patterns.data[curIndex].type == 5.0) // checker
  {
    float x = float(int(pp.x));
    if (x < 0.0) x += 1.0;
    float y = float(int(pp.y));
    if (y < 0.0) y += 1.0;
    float z = float(int(pp.z));
    if (z < 0.0) z += 1.0;
    val = x + y + z;
  }

  int i = int(abs(floor(val))) % int(patterns.data[curIndex].numColour);
  if (i == 0)      return int(patterns.data[curIndex].colour.x);
  else if (i == 1) return int(patterns.data[curIndex].colour.y);
  else if (i == 2) return int(patterns.data[curIndex].colour.z);
  else if (i == 3) return int(patterns.data[curIndex].colour.w);
  return 0;
}

vec4 getPatternColour2(int pIndex, vec4 p)
{
  int curIndex = pIndex;
  vec4 pp = p;

  for (int loop = 0; loop < 5; ++loop)
  {
    if (patterns.data[curIndex].type == 1.0)
    {
      return patterns.data[curIndex].colour;
    }

    else
    {
      pp = inverse(patterns.data[curIndex].transform) * pp;
      curIndex = resolveNextPattern(curIndex, pp);
    }
  }

  return vec4(0.0, 0.0, 0.0, 1.0);
}

vec4 getPatternColour(int pIndex, vec4 p)
{
  int curIndex = pIndex;
  vec4 pp = p;

  for (int loop = 0; loop < 5; ++loop)
  {
    if (patterns.data[curIndex].type == 1.0)
    {
      return patterns.data[curIndex].colour;
    }

    pp = inverse(patterns.data[curIndex].transform) * pp;

    if (patterns.data[curIndex].type == 3.0) // gradiant
    {
      float u = pp.x - floor(pp.x);
      float v = 1.0 - u;
      return getPatternColour2(int(patterns.data[curIndex].colour.x),pp) * v + getPatternColour2(int(patterns.data[curIndex].colour.y),pp) * u;
    }

    else if (patterns.data[curIndex].type == 6.0) // blend
    {
      return (getPatternColour2(int(patterns.data[curIndex].colour.x),pp) + getPatternColour2(int(patterns.data[curIndex].colour.y),pp)) *0.5;
    }

    else
    {
      curIndex = resolveNextPattern(curIndex, pp);
    }
  }

  return vec4(0.0,0.0,0.0,1.0);
}

vec4 getMaterialColour(int mIndex, int oIndex, vec4 p)
{
  if (materials.data[mIndex].colour.w == 1.0)
    return materials.data[mIndex].colour;
  else
  {
    vec4 pp = inverse(objects.data[oIndex].transform) * p;
    return getPatternColour(int(materials.data[mIndex].colour.x), pp);
  }
}

vec4 lighting(int mIndex, int oIndex, int lIndex, vec4 p, vec4 eye, vec4 n, float shadow)
{
  vec4 colour = getMaterialColour(mIndex, oIndex, p);
  vec4 effectiveColour = colour * lights.data[lIndex].colour;
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

float schlick(HitData comp)
{
  float cos = dot(comp.eye, comp.normal);
  if (comp.n1 > comp.n2)
  {
    float n = comp.n1 / comp.n2;
    float sin = n * n * (1.0 - cos * cos);
    if (sin > 1.0)
      return 1.0;
    cos = sqrt(1.0 - sin);
  }
  float r0 = ((comp.n1 - comp.n2) / (comp.n1 + comp.n2));
  r0 = r0 * r0;
  return r0 + (1.0 - r0) * pow((1.0 - cos), 5.0);
}

vec4 getColourFor(HitData comp, int depth)
{
  vec4 ret = vec4(0.0);
  
  float reflect = materials.data[int(objects.data[comp.object].material)].reflective;
  float transp = materials.data[int(objects.data[comp.object].material)].transparency;

  // compute schlick
  if (reflect > 0.0 && transp > 0.0)
  {
    float schlickFactor = schlick(comp);
    reflect *= schlickFactor;
    transp *= (1.0 - schlickFactor);
  }

  // set up a call for the reflection - ray.fx will pick up this ray and cast it
  if (depth > 0 && reflect > 0.0)
  {
    Ray ray;
    ray.origin = comp.overPoint;
    ray.direction = comp.reflect;

    colourStack[stackI] = ray;
    multStack[stackI] = reflect;
    stackI++;
  }

  // set up a call for refraction
  if (depth > 0 && transp > 0.0)
  {
    Ray ray;
    if (getRefractedRay(comp, ray))
    {
      colourStack[stackI] = ray;
      multStack[stackI] = transp;
      stackI++;
    }
  }

  // resolve the colour for this ray
  for (int i = 0; i < int(lights.numLights); ++i)
  {
    float shadow =  isShadowed(comp.overPoint, i, int(perScene.shadowDepth));
    ret += lighting(int(objects.data[comp.object].material), comp.object, i, comp.position, comp.eye, comp.normal, shadow);
  }
  return ret;
}


[END]
