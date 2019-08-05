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
  }

  setup(def)
  {
    this.eye = ray.Point(def.eye[0], def.eye[1], def.eye[2]);
    this.wallDepth = def.wallDepth;
    this.wallSize = def.wallSize;
    this.pixelSize = this.wallSize / 400.0;
    this.half = this.wallSize / 2.0;
    this.redDot = new ray.Colour(1, 0, 0);
    this.blackDot = new ray.Colour(0, 0, 0);
    this.ray = new ray.Ray(this.eye, ray.Vector(0, 0, 1));

    let T = ray.Matrix.translation(def.translate[0], def.translate[1], def.translate[2]);
    let S = ray.Matrix.scale(def.scale[0], def.scale[1], def.scale[2]);
    let trans = T.times(S);

    this.objects = [];
    for (let i in def.objects)
    {
      if (def.objects[i].type == "sphere")
      {
        let obj = new ray.Sphere();
        obj.setTransform(trans);
        this.objects.push(obj);
      }
    }
  }

  // perform a render of row Y
  render(y, buffer)
  {
    let worldY = this.half - this.pixelSize * y;
    let index = 0;
    let object = this.objects[0];
    for (let renderX = 0; renderX < 400; ++renderX)
    {
      let worldX = -this.half + this.pixelSize * renderX;
      let pos = ray.Point(worldX, worldY, this.wallDepth);
      this.ray.direction = pos.minus(this.eye).normalize();
      let points = object.intersect(this.ray);
      if (points.hit())
      {
        buffer[index++] = this.redDot.redByte;
        buffer[index++] = this.redDot.greenByte;
        buffer[index++] = this.redDot.blueByte;
        buffer[index++] = 255;
      }
      else
      {
        buffer[index++] = this.blackDot.redByte;
        buffer[index++] = this.blackDot.greenByte;
        buffer[index++] = this.blackDot.blueByte;
        buffer[index++] = 255;
      }
    }
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

