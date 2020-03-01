class Colour
{
  constructor(r, g, b)
  {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  copy()
  {
    return new Colour(this.r, this.g, this.b);
  }
}

var White = new Colour(1, 1, 1);

class Touple
{
  constructor(x, y, z, w)
  {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  copy()
  {
    return new Touple(this.x, this.y, this.z, this.w);
  }
}

function Point(x, y, z) { return new Touple(x, y, z, 1.0); }
function Vector(x, y, z) { return new Touple(x, y, z, 0.0); }

class Animate
{
  constructor()
  {
    this.item = [];
    this.min = 0;
    this.max = 0;
    this.step = 0;
    this.cur = 0;
  }

  fromJSON(def)
  {
    if (def.item) this.item = def.item.split(".");
    if (def.range)
    {
      this.min = def.range[0];
      this.max = def.range[1];
      this.step = def.range[2];
      this.cur = this.min;
    }
  }

  animateStep()
  {
    this.cur = this.cur + this.step;
    if (this.cur > this.max || this.cur < this.min) this.step *= -1;

    let val = Game.World;
    let i = 0;
    for (i = 0; i < this.item.length - 1; ++i)
    {
      if (val[this.item[i]]) val = val[this.item[i]];
    }
    val[this.item[i]] = this.cur;
  }
}

class Camera
{
  constructor(w,h,fov)
  {
    this.height = h;
    this.width = w;
    this.fov = fov;
    this.focalLength = 1.0;
    this.from = Point(0, 0, -5);
    this.to = Point(0,0,0);
    this.up = Vector(0,1,0);
  }

  fromJSON(def)
  {
    if (null == def.from) return;
    if (null == def.to) return;
    if (null == def.up) return;
    this.from = Point(def.from[0], def.from[1], def.from[2]);
    this.to = Point(def.to[0], def.to[1], def.to[2])
    this.up = Vector(def.up[0], def.up[1], def.up[2]);
  }
}

class Material
{
  constructor()
  {
    this.ambient = 0.1;
    this.diffuse = 0.9;
    this.specular = 0.9;
    this.reflective = 0.0;
    this.transparency = 0.0;
    this.refraction = 1.0;
    this.shininess = 200.0;
    this.colour = [1.0, 1.0, 1.0, 1.0];
    this.pattern = null;
  }

  fromJSON(def)
  {
    if (null != def.reflective) this.reflective = def.reflective;
    if (null != def.transparency) this.transparency = def.transparency;
    if (null != def.refraction) this.refraction = def.refraction;
    if (null != def.shininess) this.shininess = def.shininess;
    if (null != def.ambient) this.ambient = def.ambient;
    if (null != def.diffuse) this.diffuse = def.diffuse;
    if (null != def.colour) this.colour = [def.colour[0], def.colour[1], def.colour[2], 1.0];
    if (def.pattern)
    {
      if (Game.World.patterns[def.pattern]) this.pattern = def.pattern;
    }
  }
}

class LightPoint
{
  constructor(p, c)
  {
    this.position = p.copy();
    this.colour = c;
    this.intensityDiffuse = 1.0;
    this.intensityAmbient = 1.0;
    this.intensitySpecular = 1.0;
    this.attenuation = [1.0, 0.0, 0.0];
  }

  fromJSON(def)
  {
//    if (null != def.position) this.position = new Point(def.position[0], def.position[1], def.position[2]);
//    if (null != def.colour) this.colour = [def.colour[0], def.colour[1], def.colour[2], 1.0];
    if (null != def.intensityDiffuse) this.intensityDiffuse = def.intensityDiffuse;
    if (null != def.intensityAmbient) this.intensityAmbient = def.intensityAmbient;
    if (null != def.intensitySpecular) this.intensitySpecular = def.intensitySpecular;
    if (null != def.attenuation) this.attenuation = def.attenuation;
  }
}

var startingID = 0;
function getUUID()
{
  return startingID++;
}

class Shape
{
  constructor()
  {
    this.id = getUUID();
    this.type = 0;
    this.transform = Identity4x4;
    this.material = "default";
    this.shadow = true;
  }

  fromJSON(def)
  {
    if (def.shadow != null) { this.shadow = def.shadow; }
    if (def.material && Game.World.materials[def.material]) this.material = def.material;
    if (def.transform)
    {
      if (typeof def.transform == "string" && Game.World.transforms[def.transform]) { this.transform = Game.World.transforms[def.transform]; }
      if (typeof def.transform == "object") { this.transform = Game.World.parseTransform(def.transform); }
    }
  }
}

class Pattern 
{
  constructor()
  {
    this.transform = Identity4x4;
    this.type = 0;
  }

  fromJSON(def)
  {
    if (def.transform)
    {
      if (typeof def.transform == "string" && Game.World.transforms[def.transform]) { this.transform = Game.World.transforms[def.transform]; }
      if (typeof def.transform == "object") { this.transform = Game.World.parseTransform(def.transform); }
    }
  }
}

class PatternSolid extends Pattern
{
  constructor(c)
  {
    super();
    this.colour = c ? c : White;
    this.type = 1;
  }

  fromJSON(def)
  {
    super.fromJSON(def);
    if (def.colour && def.colour.length == 3)
    {
      this.colour = new Colour(def.colour[0], def.colour[1], def.colour[2]);
    }
  }
}

class PatternBase extends Pattern
{
  constructor(type)
  {
    super();
    this.type = type;
    this.num = 0;
    this.colours = [];
  }

  fromJSON(def)
  {
    super.fromJSON(def);
    if (def.colours && def.colours.length) 
    {
      this.num = def.colours.length;
      for (let i = 0; i < def.colours.length; ++i)
      {
        if (Game.World.patterns[def.colours[i]]) this.colours.push(def.colours[i]);
      }
    }
  }
}

class PatternStripe   extends PatternBase { constructor(type) { super(2); } }
class PatternGradient extends PatternBase { constructor(type) { super(3); } }
class PatternRing     extends PatternBase { constructor(type) { super(4); } }
class PatternChecker  extends PatternBase { constructor(type) { super(5); } }
class PatternBlend    extends PatternBase { constructor(type) { super(6); } }

class Sphere extends Shape
{
  constructor()
  {
    super();
    this.type = 1;
  }
}

class Cube extends Shape
{
  constructor()
  {
    super();
    this.type = 3;
  }
}

class Cylinder extends Shape
{
  constructor()
  {
    super();
    this.type = 4;
    this.min = -Infinity;
    this.max = Infinity;
    this.closed = false;
  }

  fromJSON(def)
  {
    super.fromJSON(def);
    if (def.min != null) { this.limits = true; this.min = def.min; }
    if (def.max != null) { this.limits = true; this.max = def.max; }
    if (def.closed != null) { this.closed = def.closed ? true : false; }
  }
}

class Cone extends Shape
{
  constructor()
  {
    super();
    this.type = 5;
    this.min = -Infinity;
    this.max = Infinity;
    this.closed = false;
  }

  fromJSON(def)
  {
    super.fromJSON(def);
    if (def.min != null) { this.limits = true; this.min = def.min; }
    if (def.max != null) { this.limits = true; this.max = def.max; }
    if (def.closed != null) { this.closed = def.closed ? true : false; }
  }
}

class Plane extends Shape
{
  constructor()
  {
    super();
    this.type = 2;
    this.limits = false;
    this.xMin = 0;
    this.xMax = 0;
    this.yMin = 0;
    this.yMax = 0;
  }

  fromJSON(def)
  {
    super.fromJSON(def);
    if (def.xMin != null) { this.limits = true; this.xMin = def.xMin; }
    if (def.xMax != null) { this.limits = true; this.xMax = def.xMax; }
    if (def.yMin != null) { this.limits = true; this.yMin = def.yMin; }
    if (def.yMax != null) { this.limits = true; this.yMax = def.yMax; }
  }
}

class World
{
  constructor()
  {
    this.reset();
  }

  reset()
  {
    this.animate = [];
    this.patterns = {}; // just a cache
    this.materials = {}; // just a cache
    this.transforms = {}; // just a cache
    this.objects = [];
    this.lights = [];
    this.cameras = {};
    this.options = {
      antialias: 0,
      shadowDepth: 5,
      maxReflections: 5
    }

    let white = new PatternSolid();
    white.colour = White.copy();
    this.patterns["white"] = white;
    this.materials["default"] = new Material();
  }

  getCameraBuffer(n)
  {
    let datasize = 20;
    let data = new Float32Array(datasize);

    let index = 0;
    let c = this.cameras[n];
    if (!c) return null;
    data[index++] = c.height;
    data[index++] = c.width;
    data[index++] = c.fov;
    data[index++] = c.focalLength;
    data[index++] = c.from.x;
    data[index++] = c.from.y;
    data[index++] = c.from.z;
    data[index++] = c.from.w;
    data[index++] = c.to.x;
    data[index++] = c.to.y;
    data[index++] = c.to.z;
    data[index++] = c.to.w;
    data[index++] = c.up.x;
    data[index++] = c.up.y;
    data[index++] = c.up.z;
    data[index++] = c.up.w;
    data[index++] = this.options.shadowDepth;
    data[index++] = this.options.maxReflections;
    data[index++] = 0.0; // pad
    data[index++] = 0.0; 
    return data;
  }

  numLights()
  {
    return this.lights.length;
  }

  numObjects()
  {
    return this.objects.length;
  }

  numMaterials()
  {
    return Object.keys(this.materials).length;
  }

  numPatterns()
  {
    return Object.keys(this.patterns).length;
  }

  getPatternBuffer()
  {
    let header = 4;
    let datasize = 24;
    let num = this.numPatterns();
    let data = new Float32Array(num * datasize + header);

    let index = 0;
    data[index++] = num;
    data[index++] = 0.0;
    data[index++] = 0.0;
    data[index++] = 0.0;

    for (let i in this.patterns)
    {
      let pat = this.patterns[i];
      data[index++] = pat.type;
      if (pat.type == 1.0)
      {
        data[index++] = 0.0; // pad
        data[index++] = 0.0;// pad
        data[index++] = 0.0;// pad

        data[index++] = pat.colour.r;
        data[index++] = pat.colour.g;
        data[index++] = pat.colour.b;
        data[index++] = 1.0;
      }
      else
      {
        data[index++] = pat.num > 3 ? 3 : pat.num;
        data[index++] = 0.0;// pad
        data[index++] = 0.0;// pad

        data[index++] = this.getPatternNumber(pat.colours[0]);
        data[index++] = this.getPatternNumber(pat.colours[1]);
        data[index++] = this.getPatternNumber(pat.colours[2]);
        data[index++] = this.getPatternNumber(pat.colours[3]);
      }

      data[index++] = pat.transform.data[0];
      data[index++] = pat.transform.data[4];
      data[index++] = pat.transform.data[8];
      data[index++] = pat.transform.data[12];

      data[index++] = pat.transform.data[1];
      data[index++] = pat.transform.data[5];
      data[index++] = pat.transform.data[9];
      data[index++] = pat.transform.data[13];

      data[index++] = pat.transform.data[2];
      data[index++] = pat.transform.data[6];
      data[index++] = pat.transform.data[10];
      data[index++] = pat.transform.data[14];

      data[index++] = pat.transform.data[3];
      data[index++] = pat.transform.data[7];
      data[index++] = pat.transform.data[11];
      data[index++] = pat.transform.data[15];
    }
    return data;
  }

  getMaterialNumber(n)
  {
    let index = 0;
    for (let i in this.materials)
    {
      if (i == n) return index;
      index++;
    }
    return -1;
  }

  getPatternNumber(n)
  {
    let index = 0;
    for (let i in this.patterns)
    {
      if (i == n) return index;
      index++;
    }
    return -1;
  }

  getMaterialBuffer()
  {
    let header = 4;
    let datasize = 12;
    let num = this.numMaterials();
    let data = new Float32Array(num * datasize + header);

    let index = 0;
    data[index++] = num;
    data[index++] = 0.0;
    data[index++] = 0.0;
    data[index++] = 0.0;

    for (let i in this.materials)
    {
      let mat = this.materials[i];
      data[index++] = mat.ambient;
      data[index++] = mat.diffuse;
      data[index++] = mat.specular;
      data[index++] = mat.shininess;
      data[index++] = mat.reflective;
      data[index++] = mat.transparency;
      data[index++] = mat.refraction;
      data[index++] = 0.0;
      if (mat.pattern)
      {
        data[index++] = this.getPatternNumber(mat.pattern);
        data[index++] = 0.0;
        data[index++] = 0.0;
        data[index++] = 0.0;
      }
      else
      {
        data[index++] = mat.colour[0];
        data[index++] = mat.colour[1];
        data[index++] = mat.colour[2];
        data[index++] = mat.colour[3];
      }
    }
    return data;
  }

  getObjectBuffer()
  {
    let header = 4;
    let datasize = 24;
    let num = this.objects.length;
    let data = new Float32Array(num * datasize + header);

    let index = 0;
    data[index++] = num;
    data[index++] = 0.0;
    data[index++] = 0.0;
    data[index++] = 0.0;

    for (let i = 0; i < num; ++i)
    {
      let obj = this.objects[i];
      data[index++] = obj.shadow;
      data[index++] = obj.type;
      data[index++] = this.getMaterialNumber(obj.material);
      switch (obj.type)
      {
        case 0:
        case 1:
        case 3:
          data[index++] = 0.0;
          data[index++] = 0.0;
          data[index++] = 0.0;
          data[index++] = 0.0;
          data[index++] = 0.0;
          break;
        case 2:
          data[index++] = obj.limits ? 1.0 : 0.0;
          data[index++] = obj.xMin;
          data[index++] = obj.xMax;
          data[index++] = obj.yMin;
          data[index++] = obj.yMax;
          break;
        case 4:
        case 5:
          data[index++] = obj.closed ? 1.0 : 0.0;
          data[index++] = obj.min;
          data[index++] = obj.max;
          data[index++] = 0.0;
          data[index++] = 0.0;
          break;
      }

      data[index++] = obj.transform.data[0];
      data[index++] = obj.transform.data[4];
      data[index++] = obj.transform.data[8];
      data[index++] = obj.transform.data[12];

      data[index++] = obj.transform.data[1];
      data[index++] = obj.transform.data[5];
      data[index++] = obj.transform.data[9];
      data[index++] = obj.transform.data[13];

      data[index++] = obj.transform.data[2];
      data[index++] = obj.transform.data[6];
      data[index++] = obj.transform.data[10];
      data[index++] = obj.transform.data[14];

      data[index++] = obj.transform.data[3];
      data[index++] = obj.transform.data[7];
      data[index++] = obj.transform.data[11];
      data[index++] = obj.transform.data[15];
    }
    return data;
  }

  getLightBuffer()
  {
    let header = 4;
    let datasize = 16;
    let num = this.lights.length;
    let data = new Float32Array(num * datasize + header);

    let index = 0;
    data[index++] = num;
    data[index++] = 0.0;
    data[index++] = 0.0;
    data[index++] = 0.0;

    for (let i = 0; i < num; ++i)
    {
      let light = this.lights[i];
      data[index++] = light.position.x;
      data[index++] = light.position.y;
      data[index++] = light.position.z;
      data[index++] = light.position.w;
      data[index++] = light.colour[0];
      data[index++] = light.colour[1];
      data[index++] = light.colour[2];
      data[index++] = light.colour[3];
      data[index++] = light.attenuation[0];
      data[index++] = light.attenuation[1];
      data[index++] = light.attenuation[2];
      data[index++] = 0.0;
      data[index++] = light.intensityAmbient;
      data[index++] = light.intensityDiffuse;
      data[index++] = light.intensitySpecular;
      data[index++] = 0.0;
    }
    return data;
  }

  loadFromJSON(json)
  {
    this.reset();
    if (json.renderOptions) this.parseRenderOptions(json.renderOptions);
    if (json.transforms) this.parseTransforms(json.transforms);
    if (json.patterns) this.parsePatterns(json.patterns);
    if (json.materials) this.parseMaterials(json.materials);
    if (json.lights) this.parseLights(json.lights);
    if (json.objects) this.parseObjects(json.objects);
    if (json.cameras) this.parseCameras(json.cameras);
    if (json.animate) this.parseAnimates(json.animate);
  }

  parseAnimates(data)
  {
    for (let i in data)
    {
      if (!data[i].item) continue;
      if (!data[i].range) continue;
      let c = new Animate();
      c.fromJSON(data[i]);
      this.animate.push(c);
    }
  }

  animateStep()
  {
    for (let i in this.animate)
    {
      this.animate[i].animateStep();
    }
  }

  parseCameras(data)
  {
    for (let i in data)
    {
      if (!data[i].name) continue;
      if (!data[i].width) continue;
      if (!data[i].height) continue;
      if (!data[i].fov) continue;
      let c = new Camera(data[i].width, data[i].height, data[i].fov);
      c.fromJSON(data[i]);
      this.cameras[data[i].name] = c;
    }
  }

  parseRenderOptions(data)
  {
    if (data.shadowDepth != null) this.options.shadowDepth = ((data.shadowDepth < 1) ? 1 : data.shadowDepth);
    if (data.lighting != null) this.options.lighting = data.lighting;
    if (data.antialias != null) this.options.antialias = data.antialias;
    if (data.shadowing != null) this.options.shadowing = data.shadowing;
    if (data.maxReflections != null) this.options.maxReflections = data.maxReflections;
  }

  parseTransforms(data)
  {
    for (let i in data)
    {
      if (!data[i].name) continue;
      this.transforms[data[i].name] = this.parseTransform(data[i]);
    }
  }

  parseTransform(transform)
  {
    let trans = Identity4x4.copy();
    for (let j in transform.series)
    {
      let obj = transform.series[j];
      let M = null;
      if (obj.type == "T") M = Matrix.translation(obj.value[0], obj.value[1], obj.value[2]);
      else if (obj.type == "S") M = Matrix.scale(obj.value[0], obj.value[1], obj.value[2]);
      else if (obj.type == "Rx") M = Matrix.xRotation(obj.value);
      else if (obj.type == "Ry") M = Matrix.yRotation(obj.value);
      else if (obj.type == "Rz") M = Matrix.zRotation(obj.value);
      else if (obj.type == "SH") M = Matrix.shearing(obj.value[0], obj.value[1], obj.value[2], obj.value[3], obj.value[4], obj.value[5]);
      if (M) trans.times(M);
    }
    return trans;
  }

  parseMaterials(data)
  {
    for (let i in data)
    {
      if (!data[i].name) continue;
      this.materials[data[i].name] = this.parseMaterial(data[i]);
    }
  }

  parseMaterial(data)
  {
    let mat = new Material();
    mat.fromJSON(data);
    return mat;
  }

  parsePatterns(data)
  {
    for (let i in data)
    {
      if (!data[i].name) continue;
      this.patterns[data[i].name] = this.parsePattern(data[i]);
    }
  }

  parsePattern(data)
  {
    let p = null;
    if (data.type == "solid") p = new PatternSolid();
    else if (data.type == "stripe") p = new PatternStripe();
    else if (data.type == "gradient") p = new PatternGradient();
    else if (data.type == "ring") p = new PatternRing();
    else if (data.type == "checker") p = new PatternChecker();
    else if (data.type == "blend") p = new PatternBlend();
    if (p) p.fromJSON(data);
    return p;
  }

  parseLights(data)
  {
    for (let i in data)
    {
      if (data[i].type == "pointlight")
      {
        let p = Point(0,0,0);
        let c = [1,1,1,1];
        if (null != data[i].position) p = Point(data[i].position[0], data[i].position[1], data[i].position[2]);
        if (null != data[i].colour) c = [data[i].colour[0], data[i].colour[1], data[i].colour[2], 1.0];
        let obj = new LightPoint(p, c);
        obj.fromJSON(data[i]);
        this.lights.push(obj);
      }
    }
  }

  parseObjects(data)
  {
    for (let i in data)
    {
      if (data[i].skip) continue;
      if (data[i].type == "sphere")
      {
        let obj = new Sphere();
        obj.fromJSON(data[i]);
        this.objects.push(obj);
      }
      else if (data[i].type == "plane")
      {
        let obj = new Plane();
        obj.fromJSON(data[i]);
        this.objects.push(obj);
      }
      else if (data[i].type == "cube")
      {
        let obj = new Cube();
        obj.fromJSON(data[i]);
        this.objects.push(obj);
      }
      else if (data[i].type == "cylinder")
      {
        let obj = new Cylinder();
        obj.fromJSON(data[i]);
        this.objects.push(obj);
      }
      else if (data[i].type == "cone")
      {
        let obj = new Cone();
        obj.fromJSON(data[i]);
        this.objects.push(obj);
      }
    }
  }
}
