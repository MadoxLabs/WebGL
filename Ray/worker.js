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
  
    this.objects = [];
    for (let i in def.objects)
    {
      if (def.objects[i].type == "sphere") this.objects.push(new ray.Sphere());
    }
  }

  // perform a render of row Y
  render(y)
  {
    buffer = new Uint8ClampedArray(400 * 4);

    let worldY = this.half - this.pixelSize * y;
    let index = 0;
    for (let renderX = 0; renderX < 400; ++renderX)
    {
      let worldX = -this.half + this.pixelSize * renderX;
      let pos = ray.Point(worldX, worldY, this.wallDepth);
      this.ray.direction = pos.minus(this.eye).normalize();
      let points = this.objects[0].intersect(this.ray);
      if (points.hit())
      {
        buffer[index++] = this.redDot.red * 255;
        buffer[index++] = this.redDot.green * 255;
        buffer[index++] = this.redDot.blue * 255;
        buffer[index++] = 255;
      }
      else
      {
        buffer[index++] = this.blackDot.red * 255;
        buffer[index++] = this.blackDot.green * 255;
        buffer[index++] = this.blackDot.blue * 255;
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
      renderer.render(data.y);
      postMessage({ id: renderer.id, y: data.y, buffer: buffer }, [buffer.buffer]);
      break;
  }
}

addEventListener('message', messagehandler, false);

