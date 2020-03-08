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
      hitlist[i] = hitlist[i - 1];
    }
  }
  hitlist[i].length = val;
  hitlist[i].object = index;
  hitlist[i].id = hituuid++;
  hitsize++;
}

void intersect(in Ray ray)
{
  hitsize = 0;
  for (int i = 0; float(i) < objects.numObjects; ++i)
  {
    // transform to object space
    Ray r2;
    r2.origin = inverse(objects.data[i].transform) * ray.origin;        // TODO SPEED UP
    r2.direction = inverse(objects.data[i].transform) * ray.direction;
    // hit?
    if (objects.data[i].type == 1.0) sphere_intersect(i, r2);
    else if (objects.data[i].type == 2.0) plane_intersect(i, r2);
    else if (objects.data[i].type == 3.0) cube_intersect(i, r2);
    else if (objects.data[i].type == 4.0) cylinder_intersect(i, r2);
    else if (objects.data[i].type == 5.0) cone_intersect(i, r2);
  }
}

//--------------
int RefractList[40]; // list of object indexs, keeping track up material enter and exits
int RefractSize = 0;

bool RefractListContainsId(int id, out int index) // check if an object id is in list
{
  for (int i = 0; i < RefractSize; ++i)
  {
    if (RefractList[i] == id)
    {
      index = i;
      return true;
    }
  }
  return false;
}

void RefractListAdd(int id) // append an object index
{
  RefractList[RefractSize] = id;
  RefractSize++;
}

void RefractListRemove(int index) // remove an object index, bump all rest down
{
  for (int i = index; i < RefractSize-1; ++i)
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

  RefractSize = 0;
  for (int i = 0; i < hitsize; ++i)
  {
    int hitlistid = hitlist[i].id;
    if (hitlistid == hit.id)
    {
      if (RefractSize == 0) ret.n1 = 1.0;
      else ret.n1 = materials.data[int(objects.data[RefractList[RefractSize-1]].material)].refraction;
    }

    int index;
    if (RefractListContainsId(hitlist[i].object, index))
      RefractListRemove(index);
    else
      RefractListAdd(hitlist[i].object);

    if (hitlistid == hit.id)
    {
      if (RefractSize == 0) ret.n2 = 1.0;
      else ret.n2 = materials.data[int(objects.data[RefractList[RefractSize-1]].material)].refraction;
      break;
    }
  }
  return ret;
}

vec4 castRay(float myMult, Ray ray, int depth)
{
  intersect(ray);
  if (getHit() == false) return vec4(0.0, 0.0, 0.0, 1.0);
  return getColourFor(myMult, precompute(ray), depth);
}



[END]
