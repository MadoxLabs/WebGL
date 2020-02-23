[PARTNAME]
Camera
[END]

[PIXEL]

struct Camera
{
  float height;
  float width;
  float fov;
  float focalLength;
  mat4 transform;
  mat4 inverse;
  float halfWidth;
  float halfHeight;
  float pixelSize;
} camera;

void initCamera(CameraData data)
{
  vec3 forward = normalize(data.to - data.from);
  vec3 left = cross(forward, vec3(normalize(data.up)));
  vec3 up = cross(left, forward);
  mat4 translate = mat4(1.0, 0.0, 0.0, 0.0,
                        0.0, 1.0, 0.0, 0.0,
                        0.0, 0.0, 1.0, 0.0,
                        -data.from.x, -data.from.y, -data.from.z, 1.0);
  mat4 transform = mat4(left.x, up.x, -forward.x, 0.0, 
                        left.y, up.y, -forward.y, 0.0,
                        left.z, up.z, -forward.z, 0.0, 
                        0.0, 0.0, 0.0, 1.0);

  camera.transform = transform * translate;
  camera.inverse = inverse(camera.transform);

  camera.height = data.height;
  camera.width = data.width;
  camera.fov = data.fov;
  camera.focalLength = data.focalLength;

  float halfView = tan(data.fov / 2.0f);
  float ratio = data.width / data.height;

  camera.halfWidth = 0.0f;
  camera.halfHeight = 0.0f;
  if (ratio >= 1.0f)
  {
    camera.halfWidth = halfView;
    camera.halfHeight = halfView / ratio;
  }
  else
  {
    camera.halfHeight = halfView;
    camera.halfWidth = halfView * ratio;
  }

  camera.pixelSize = camera.halfWidth * 2.0f / camera.width;
}

[END]
