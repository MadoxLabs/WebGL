[PARTNAME]
Sphere
[END]

[PIXEL]

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

[END]
