[PARTNAME]
Cone
[END]

[PIXEL]

bool check_cap(Ray r, float t, float val)
{
  float x = r.origin.x + t * r.direction.x;
  float z = r.origin.z + t * r.direction.z;
  return (x * x + z * z) <= (val * val);
}

void cone_intersect(in int index, in Ray r)
{
  float a = r.direction.x * r.direction.x - r.direction.y * r.direction.y + r.direction.z * r.direction.z;
  float b = 2.0 * r.origin.x * r.direction.x - 2.0 * r.origin.y * r.direction.y + 2.0 * r.origin.z * r.direction.z;

  if (abs(a) <= epsilon && abs(b) <= epsilon) // missed
    return;

  if (abs(a) <= epsilon && abs(b) > epsilon) // parallel to a cone
  {
    float c = r.origin.x * r.origin.x - r.origin.y * r.origin.y + r.origin.z * r.origin.z;
    float t = -c / (2.0 * b);
    float y = r.origin.y + t * r.direction.y;
    if (objects.data[index].extra2.x < y && y < objects.data[index].extra2.y) addIntersect(t, index);
  }
  else if (abs(a) > epsilon)
  {
    float c = r.origin.x * r.origin.x - r.origin.y * r.origin.y + r.origin.z * r.origin.z;
    float disc = b * b - 4.0 * a * c;
    if (disc < 0.0) return;

    float aa = 2.0 * a;
    float rootdisc = sqrt(disc);
    float t0 = (-b - rootdisc) / aa;
    float t1 = (-b + rootdisc) / aa;

    if (t0 > t1) { float t = t0; t0 = t1; t1 = t; } // swap

    float y = r.origin.y + t0 * r.direction.y;
    if (objects.data[index].extra2.x < y && y < objects.data[index].extra2.y) addIntersect(t0, index);

    y = r.origin.y + t1 * r.direction.y;
    if (objects.data[index].extra2.x < y && y < objects.data[index].extra2.y)  addIntersect(t1, index);
  }

  if (objects.data[index].extra1 > 0.0) // hit the ends?
  {
    float t = (objects.data[index].extra2.x - r.origin.y) / r.direction.y;
    if (check_cap(r, t, objects.data[index].extra2.x)) addIntersect(t, index);
    t = (objects.data[index].extra2.y - r.origin.y) / r.direction.y;
    if (check_cap(r, t, objects.data[index].extra2.y)) addIntersect(t, index);
  }
}

vec4 cone_normal(in int index, vec4 p)
{
  float d = p.x * p.x + p.z * p.z;
  if (d < (objects.data[index].extra2.y * objects.data[index].extra2.y) && p.y >= (objects.data[index].extra2.y - epsilon)) return vec4(0.0, 1.0, 0.0, 0.0);
  else if (d < (objects.data[index].extra2.x * objects.data[index].extra2.x) && p.y <= (objects.data[index].extra2.x + epsilon)) return vec4(0.0, -1.0, 0.0, 0.0);
  else {
    float y = sqrt(d);
    y *= (p.y > 0.0) ? -1.0 : 1.0;
    return vec4(p.x, y, p.z, 0.0);
  }
}

[END]
