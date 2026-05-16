[PARTNAME]
Cube
[END]

[PIXEL]

// return as vec2 as { x: min , y : max }
vec2 checkAxis(float origin, float dir)
{
  float minNumerator = -1.0 - origin;
  float maxNumerator = 1.0 - origin;
  float minv = 0.0;
  float maxv = 0.0;
  if (abs(dir) >= epsilon)
  {
    minv = minNumerator / dir;
    maxv = maxNumerator / dir;
  }
  else
  {
    minv = minNumerator * Infinity;
    maxv = maxNumerator * Infinity;
  }
  if (minv > maxv)
    return vec2(maxv, minv);
  else
    return vec2(minv, maxv);
}

void cube_intersect(in int index, in Ray ray)
{
  vec2 x = checkAxis(ray.origin.x, ray.direction.x);
  vec2 y = checkAxis(ray.origin.y, ray.direction.y);
  vec2 z = checkAxis(ray.origin.z, ray.direction.z);
  float minv = max(x.x, max(y.x, z.x)); // max of the mins
  float maxv = min(x.y, min(y.y, z.y)); // min of the maxs

  if (minv <= maxv)
  {
    addIntersect(minv, index);
    addIntersect(maxv, index);
  }
}

vec4 cube_normal(vec4 p)
{
  float maxv = max(abs(p.x), max(abs(p.y), abs(p.z)));
  if (maxv == abs(p.x)) return vec4(p.x, 0.0, 0.0, 0.0);
  else if (maxv == abs(p.y)) return vec4(0.0, p.y, 0.0, 0.0);
  else return vec4(0.0, 0.0, p.z, 0.0);
}

[END]
