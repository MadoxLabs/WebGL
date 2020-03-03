[PARTNAME]
Casting
[END]

[PIXEL]

bool getRefractedRay(HitData comp, out Ray ray)
{
  float nRatio = comp.n1 / comp.n2;
  float cosThetaI = dot(comp.eye, comp.normal);
  float sin2ThetaT = nRatio * nRatio * (1.0 - (cosThetaI * cosThetaI));
  if (sin2ThetaT > 1.0)
  {
    // total internal refraction case
    return false;
  }
  float cosThetaT = sqrt(1.0 - sin2ThetaT);
  vec4 dir = comp.normal * (nRatio * cosThetaI - cosThetaT) - comp.eye * nRatio;

  ray.origin = comp.underPoint;
  ray.direction = dir;

  return true;
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

void sortIntersections()
{
  bool changed = false;
  float l = 0.0;
  int o = 0;
  for (int loop = 0; loop < 101; ++loop)
  {
    int ii = 1;
    for (int i = 0; i < hitsize-1; ++i)
    {
      if (hitlist[i].length > hitlist[ii].length)
      {
        changed = true;
        l = hitlist[i].length;
        o = hitlist[i].object;
        hitlist[i].length = hitlist[ii].length;
        hitlist[i].object = hitlist[ii].object;
        hitlist[ii].length = l;
        hitlist[ii].object = o;
      }
      ii++;
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

bool getHitSkipNoShadow()
{
  for (int i = 0; i < hitsize; i += 1)
  {
    if (hitlist[i].length >= 0.0 && objects.data[hitlist[i].object].shadow >= 1.0)
    {
      hit = hitlist[i];
      return true;
    }
  }
  return false;
}

void addIntersect(float val, int index)
{
  if (hitsize >= 20) return;

  int i = 0;
  if (hitsize > 0)
  {
    for (i = hitsize; i > 0; --i)
    {
      if (val > hitlist[i - 1].length) break;
      hitlist[i].length = hitlist[i - 1].length;
      hitlist[i].object = hitlist[i - 1].object;
    }
  }
  hitlist[i].length = val;
  hitlist[i].object = index;
  hitsize++;
}

/*
void addIntersect(float val, int index)
{
if (hitsize < 20) {
hitlist[hitsize].length = val;
hitlist[hitsize].object = index;
hitsize++;
}
}
*/

void intersect(in Ray ray)
{
  hitsize = 0;
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
//  sortIntersections();
}

//--------------
int RefractList[40]; // lsit of object indexs, keeping track up material enter and exits
int RefractSize = 0;

bool RefractListContainsId(float id, out int index) // check if an object id is in list
{
  for (int i = 0; i < RefractSize; ++i)
  {
    if (objects.data[RefractList[i]].id == id)
    {
      index = i;
      return true;
    }
  }
  return false;
}

void RefractListAdd(int index) // append an object index
{
  RefractList[RefractSize] = index;
  RefractSize++;
}

void RefractListRemove(int index) // remove an object index, bump all rest down
{
  for (int i = index + 1; i < RefractSize; ++i)
  {
    RefractList[i] = RefractList[i + 1];
  }
  RefractSize--;
}
//-------------

HitData precompute(Ray ray)
{
  if (hitsize == 0) {
    hitsize = 1;
    hitlist[0] = hit;
  }

  HitData ret;
  ret.length = hit.length;
  ret.object = hit.object;
  ret.position = ray.direction * hit.length + ray.origin;
  ret.normal = getNormal(hit.object, ret.position);
  ret.eye = -ray.direction;
  if (dot(ret.normal, ret.eye) < 0.0)
  {
    ret.inside = true;
    ret.normal *= -1.0;
  }
  else
  {
    ret.inside = false;
  }
  vec4 scaleNormal = ret.normal * epsilon;
  ret.reflect = reflect(ray.direction, ret.normal);
  ret.overPoint = ret.position + scaleNormal;
  ret.underPoint = ret.position - scaleNormal;

  for (int i = 0; i < hitsize; ++i)
  {
    if (hitlist[i].length == hit.length)
    {
      if (RefractSize == 0) ret.n1 = 1.0;
      else ret.n1 = materials.data[int(objects.data[RefractList[RefractSize]].material)].refraction;
    }

    int index;
    if (RefractListContainsId(objects.data[hitlist[i].object].id, index))
      RefractListRemove(index);
    else
      RefractListAdd(hitlist[i].object);

    if (hitlist[i].length == hit.length)
    {
      if (RefractSize == 0) ret.n2 = 1.0;
      else ret.n2 = materials.data[int(objects.data[RefractList[RefractSize]].material)].refraction;
      break;
    }
  }
  return ret;
}

vec4 castRay(Ray ray, int depth)
{
  intersect(ray);
  if (getHit() == false) return vec4(0.0, 0.0, 0.0, 1.0);
  return getColourFor(precompute(ray), depth);
}



[END]
