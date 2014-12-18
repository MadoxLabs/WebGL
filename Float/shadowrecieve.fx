[PARTNAME]
shadowrecieve
[END]

[PIXEL]
uniform sampler2D shadow; // mag LINEAR, min LINEAR, wrapu CLAMP_TO_EDGE, wrapv CLAMP_TO_EDGE

float IsShadow(vec4 position, vec3 normal, mat4 WorldToLight, vec3 lightpos)
{
  vec4 positionFromLight =  WorldToLight * position;
  float weight = 0.4;

  // if face is away from light - shadowed
  vec3 lightDir = vec3(position) - lightpos;
  if (dot(normal, lightDir) >= 0.0) return 0.0;

  // convert light POV location to a spot on the shadow map
  float p = 1.0/2048.0;

  vec2 shadowLookup = 0.5 + 0.5 * (positionFromLight.xy / positionFromLight.w);
  if (shadowLookup.x < 0.0 || shadowLookup.y < 0.0 || shadowLookup.x > 1.0 || shadowLookup.y > 1.0) return 1.0;
  vec4 depth = texture2D(shadow, shadowLookup);
  vec4 depthl = texture2D(shadow, shadowLookup + vec2(-p, 0.0));
  vec4 depthr = texture2D(shadow, shadowLookup + vec2(p, 0.0));
  vec4 deptht = texture2D(shadow, shadowLookup + vec2(0.0, -p));
  vec4 depthb = texture2D(shadow, shadowLookup + vec2(0.0, p));

//  return depth.x * 2.0;

  float depthFromLight = positionFromLight.z / positionFromLight.w - 0.000005;
  float ret = 1.0;
  if (depth.x < depthFromLight)  ret -= 0.2;
  if (depthr.x < depthFromLight) ret -= 0.2;
  if (depthl.x < depthFromLight) ret -= 0.2;
  if (deptht.x < depthFromLight) ret -= 0.2;
  if (depthb.x < depthFromLight) ret -= 0.2;
  if (ret < 1.0) ret *= weight;
  return ret;
}
[END]
