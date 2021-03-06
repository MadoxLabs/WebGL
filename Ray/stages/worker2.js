var ray = { classlist: [], stages: {} };
ray.counts = {
  touple: 0,
  matrix: 0,
  colour: 0,
  ray: 0,
  intersection: 0,
  intersections: 0
};
var LibNoise = {};

importScripts("../NoiseLib/math.js",
              "../NoiseLib/mxrandom.js",
              "../NoiseLib/noise.js",
              "../NoiseLib/FastMath.js",
              "../NoiseLib/FastPerlin.js",
              "../engine/sort.js",
              "../engine/rMath.js",
              "../engine/rShape.js",
              "../engine/rColour.js",
              "../engine/rCanvas.js",
              "../engine/rMatrix.js",
              "../engine/rWorld.js",
              "../engine/rRay.js");

let buffer = null;

class Renderer
{
  constructor(id)
  {
    this.id = id;
  }

  setup(def)
  {
    ray.World.loadFromJSON(def);
  }

  // perform a render of row Y
  render(y, buffer)
  {
    ray.usePool = false;
    ray.World.renderRowToBuffer("main", y, buffer);
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

