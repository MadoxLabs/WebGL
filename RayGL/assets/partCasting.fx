[PARTNAME]
Casting
[END]

[PIXEL]

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

void intersect(in Ray ray)
{
  for (int i = 0; float(i) < objects.numObjects; ++i)
  {
    // transform to object space
    Ray r2;
    r2.origin = inverse(objects.data[i].transform) * ray.origin;
    r2.direction = inverse(objects.data[i].transform) * ray.direction;
    // hit?
    if (objects.data[i].type == 1.0) sphere_intersect(i, r2);
    else if (objects.data[i].type == 2.0) plane_intersect(i, r2);
    else if (objects.data[i].type == 3.0) cube_intersect(i, r2);
    else if (objects.data[i].type == 4.0) cylinder_intersect(i, r2);
    else if (objects.data[i].type == 5.0) cone_intersect(i, r2);
  }
  sortIntersections();
}

vec4 castRay(Ray ray)
{
  intersect(ray);
  if (getHit() == false) return vec4(0.05, 0.05, 0.05, 1.0);

  // two lights
  vec4 p = ray.origin + (ray.direction * hit.length);
  vec4 ret = vec4(0.0);
  for (int i = 0; float(i) < lights.numLights; ++i)
  {
    ret += lighting(int(objects.data[hit.object].material), i, p, -ray.direction, getNormal(hit.object, p));
  }
    return ret;
}

[END]
