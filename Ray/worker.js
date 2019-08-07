var ray = { classlist: [], stages: {} };

importScripts("rMath.js",
              "rColour.js",
              "rCanvas.js",
              "rMatrix.js",
              "rRay.js");

let buffer = null;

class Renderer
{
  constructor(id)
  {
    this.id = id;
    this.lighting = false;
  }

  setup(def)
  {
    if (def.lighting) this.lighting = def.lighting;
    this.eye = ray.Point(def.eye[0], def.eye[1], def.eye[2]);
    this.wallDepth = def.wallDepth;
    this.wallSize = def.wallSize;
    this.pixelSize = this.wallSize / 400.0;
    this.half = this.wallSize / 2.0;
    this.ray = new ray.Ray(this.eye, ray.Vector(0, 0, 1));

    let T = ray.Matrix.translation(def.translate[0], def.translate[1], def.translate[2]);
    let S = ray.Matrix.scale(def.scale[0], def.scale[1], def.scale[2]);
    let trans = T.times(S);

    this.objects = [];
    this.lights = [];
    this.materials = {};
    for (let i in def.materials)
    {
      if (!def.materials[i].name) continue;
      let mat = new ray.Material();
      if (null != def.materials[i].shininess) mat.shininess = def.materials[i].shininess;
      if (null != def.materials[i].ambient)   mat.ambient = def.materials[i].ambient;
      if (null != def.materials[i].diffuse)   mat.diffuse = def.materials[i].diffuse;
      if (null != def.materials[i].specular)  mat.specular = def.materials[i].specular;
      if (null != def.materials[i].colour)    mat.colour = new ray.Colour(def.materials[i].colour[0], def.materials[i].colour[1], def.materials[i].colour[2]);
      this.materials[def.materials[i].name] = mat;
    }
    for (let i in def.objects)
    {
      if (def.objects[i].type == "sphere")
      {
        let obj = new ray.Sphere();
        if (def.objects[i].material && this.materials[def.objects[i].material])
          obj.material = this.materials[def.objects[i].material];
        obj.setTransform(trans);
        this.objects.push(obj);
      }
      else if (def.objects[i].type == "pointlight")
      {
        let p = ray.Origin;
        let c = ray.White;
        if (null != def.objects[i].position) p = ray.Point(def.objects[i].position[0], def.objects[i].position[1], def.objects[i].position[2]);
        if (null != def.objects[i].colour)   c = new ray.Colour(def.objects[i].colour[0], def.objects[i].colour[1], def.objects[i].colour[2]);
        let obj = new ray.LightPoint(p, c);
        if (null != def.objects[i].intensityDiffuse) obj.intensityDiffuse = def.objects[i].intensityDiffuse;
        if (null != def.objects[i].intensityAmbient) obj.intensityAmbient = def.objects[i].intensityAmbient;
        if (null != def.objects[i].attenuation) obj.attenuation = def.objects[i].attenuation;
        this.lights.push(obj);
      }

    }
  }

  // perform a render of row Y
  render(y, buffer)
  {
    ray.usePool = true;

    let worldY = this.half - this.pixelSize * y;
    let index = 0;
    let object = this.objects[0];
    for (let renderX = 0; renderX < 400; ++renderX)
    {
      let worldX = -this.half + this.pixelSize * renderX;
      let pos = ray.Point(worldX, worldY, this.wallDepth);
      this.ray.direction = pos.minus(this.eye).normalize();
      let points = object.intersect(this.ray);
      let hit = points.hit();
      if (hit)
      {
        if (this.lighting)
        {
          let point = this.ray.position(hit.length);
          let normal = hit.object.normalAt(point);
          let toEye = this.ray.direction.negate();
          let colour = ray.Render.lighting(hit.object.material, this.lights[0], point, toEye, normal);
          for (let l = 1; l < this.lights.length; ++l)
          {
            colour.plus(ray.Render.lighting(hit.object.material, this.lights[l], point, toEye, normal));
          }
          buffer[index++] = colour.redByte;
          buffer[index++] = colour.greenByte;
          buffer[index++] = colour.blueByte;
          buffer[index++] = 255;
        }
        else
        {
          buffer[index++] = 255;
          buffer[index++] = 0;
          buffer[index++] = 0;
          buffer[index++] = 255;
        }
      }
      else
      {
        buffer[index++] = ray.Black.redByte;
        buffer[index++] = ray.Black.greenByte;
        buffer[index++] = ray.Black.blueByte;
        buffer[index++] = 255;
      }
    }

    ray.usePool = false;
  }
}

var renderer = null;

function messagehandler(e)
{
  var data = e.data;
  switch (data.cmd)
  {
    case 'setup':
      renderer = new Renderer(data.id);
      renderer.setup(data.definition);
      break;
    case 'render':
      renderer.render(data.y, data.buffer);
      postMessage({ id: renderer.id, y: data.y, buffer: data.buffer }, [data.buffer.buffer]);
      break;
  }
}

addEventListener('message', messagehandler, false);

