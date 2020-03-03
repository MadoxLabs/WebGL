[PARTNAME]
Plane
[END]

[PIXEL]

void plane_intersect(in int index, in Ray ray)
{
  if (abs(ray.direction.y) < epsilon) return;

  float d = (-ray.origin.y / ray.direction.y);
  if (objects.data[index].extra1 >= 1.0)
  {
    vec4 p = ray.direction * d + ray.origin;
    if (p.x > objects.data[index].extra2.y) return;
    if (p.x < objects.data[index].extra2.x) return;
    if (p.z > objects.data[index].extra2.w) return;
    if (p.z < objects.data[index].extra2.z) return;
  }

  addIntersect(d, index);
}

vec4 plane_normal(vec4 p)
{
  return vec4(0.0, 1.0, 0.0, 0.0);
}

[END]
