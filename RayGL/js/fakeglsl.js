// MATH Objects
epsilon = 0.0005;
isEqual = function (a, b)
{
  return Math.abs(a - b) < epsilon;
}

class Touple
{
  constructor(x, y, z, w)
  {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    this.isTouple = true;
  }

  copy()
  {
    return new Touple(this.x, this.y, this.z, this.w);
  }

  isVector()
  {
    return (this.w == 0) ? true : false;
  }

  isPoint()
  {
    return (this.w == 1) ? true : false;
  }

  equals(t)
  {
    if (!t) return false;
    if (!isEqual(this.x, t.x)) return false;
    if (!isEqual(this.y, t.y)) return false;
    if (!isEqual(this.z, t.z)) return false;
    if (!isEqual(this.w, t.w)) return false;
    return true;
  }

  plus(t)
  {
    this.x += t.x;
    this.y += t.y;
    this.z += t.z;
    this.w += t.w;
    return this;
  }

  minus(t)
  {
    if (t.isPoint() && this.isVector())
      return null;//throw "subtracting point from a vector";
    this.x -= t.x;
    this.y -= t.y;
    this.z -= t.z;
    this.w -= t.w;
    return this;
  }

  negate()
  {
    this.x *= -1;
    this.y *= -1;
    this.z *= -1;
    this.w *= -1;
    return this;
  }

  times(s)
  {
    if (s.x)
    {
      this.x *= s.x;
      this.y *= s.y;
      this.z *= s.z;
      this.w *= s.w;
      return this;
    }
    this.x *= s;
    this.y *= s;
    this.z *= s;
    this.w *= s;
    return this;
  }

  magnitude()
  {
    if (this.isPoint()) return null;//throw "getting magnitude of a point";
    let sum = this.x * this.x;
    sum += this.y * this.y;
    sum += this.z * this.z;
    return Math.sqrt(sum);
  }

  normalize()
  {
    let m = this.magnitude();
    if (m)
    {
      this.x = this.x / m;
      this.z = this.z / m;
      this.y = this.y / m;
      this.w = this.w / m;
    }
    return this;
  }

  dot(t)
  {
    if (!t)
      return 0;
    let ret = this.x * t.x;
    ret += this.y * t.y;
    ret += this.z * t.z;
    ret += this.w * t.w;
    return ret;
  }

  static cross(v, t)
  {
    return new Touple(v.y * t.z - v.z * t.y,
      v.z * t.x - v.x * t.z,
      v.x * t.y - v.y * t.x);
  }

  static reflect(v, n)
  {
    let scaleN = n.copy().times(2.0 * v.dot(n));
    return v.copy().minus(scaleN);
  }

  static add(t1, t2)
  {
    return new Touple(t1.x + t2.x, t1.y + t2.y, t1.z + t2.z, t1.w + t2.w);
  }

  static subtract(t1, t2)
  {
    let ret = new Touple(t1.x, t1.y, t1.z, t1.w);
    return ret.minus(t2);
  }

  static negate(t1)
  {
    let ret = new Touple(t1.x, t1.y, t1.z, t1.w);
    return ret.negate();
  }

  static multiply(t1, s)
  {
    let ret = new Touple(t1.x, t1.y, t1.z, t1.w);
    return ret.times(s);
  }

  static normalize(t1)
  {
    let ret = new Touple(t1.x, t1.y, t1.z, t1.w);
    return ret.normalize();
  }  
}

var Point = function (x, y, z) { return new Touple(x, y, z, 1.0); }
var Vector = function (x, y, z) { return new Touple(x, y, z, 0.0); }

class Matrix
{
  constructor(w, h, d)
  {
    this.width = w;
    this.height = h;
    this.size = w * h;
    this.data = d;
    this.isMatrix = true;
  }

  copy()
  {
    return new Matrix(this.width, this.height, this.data.slice(0));
  }

  get(r, c)
  {
    return this.data[this.width * r + c];
  }

  set(r, c, n)
  {
    this.data[this.width * r + c] = n;
    return this;
  }

  equals(m)
  {
    if (!m) return false;
    if (this.size != m.size) return false;
    for (let i = 0; i < this.size; ++i)
      if (!isEqual(this.data[i], m.data[i])) return false;
    return true;
  }

  _times(m)
  {
    let tmpMatrix = tmps[this.width];
    let index = 0;

    let rstride = 0;
    for (let r = 0; r < this.height; ++r)
    {
      for (let c = 0; c < this.width; ++c)
      {
        let v = this.data[rstride] * m.data[c]
          + this.data[rstride + 1] * m.data[this.width + c]
          + this.data[rstride + 2] * m.data[this.width + this.width + c]
          + this.data[rstride + 3] * m.data[this.width + this.width + this.width + c];
        tmpMatrix.data[index++] = v;
      }
      rstride += this.width;
    }
    let tmp = this.data;
    this.data = tmpMatrix.data;
    tmpMatrix.data = tmp;
    return this;
  }

  times(m)
  {
    if (this.size == m.size)
    {
      return this._times(m);
    }
    else if (m.isTouple && 4 == this.width)
    {
      let index = 0;
      tmpTouple0 = this.data[0] * m.x
        + this.data[1] * m.y
        + this.data[2] * m.z
        + this.data[3] * m.w;
      tmpTouple1 = this.data[4] * m.x
        + this.data[5] * m.y
        + this.data[6] * m.z
        + this.data[7] * m.w;
      tmpTouple2 = this.data[8] * m.x
        + this.data[9] * m.y
        + this.data[10] * m.z
        + this.data[11] * m.w;
      tmpTouple3 = this.data[12] * m.x
        + this.data[13] * m.y
        + this.data[14] * m.z
        + this.data[15] * m.w;
      return new Touple(tmpTouple0, tmpTouple1, tmpTouple2, tmpTouple3);
    }
  }

  transpose()
  {
    let tmpMatrix = tmps[this.width];
    let index = 0;

    for (let c = 0; c < this.width; ++c)
    {
      let rstride = 0;
      for (let r = 0; r < this.height; ++r)
      {
        tmpMatrix.data[index++] = this.data[rstride + c];
        rstride += this.width;
      }
    }
    let tmp = this.data;
    this.data = tmpMatrix.data;
    tmpMatrix.data = tmp;
    return this;
  }

  determinant()
  {
    if (this.size == 4) 
    {
      return this.data[0] * this.data[3] - this.data[1] * this.data[2];
    }

    let det = 0;
    for (let c = 0; c < this.height; ++c)
      det += this.data[c] * this.cofactor(0, c);
    return det;
  }

  submatrix(badr, badc)
  {
    let tmpMatrix = tmps[this.width - 1];
    let index = 0;
    let rstride = 0;
    for (let r = 0; r < this.height; ++r) 
    {
      for (let c = 0; c < this.width; ++c) 
      {
        if (r == badr) continue;
        if (c == badc) continue;
        tmpMatrix.data[index++] = this.data[rstride + c];
      }
      rstride += this.width;
    }
    let ret = tmpMatrix.copy();
    let tmp = ret.data;
    ret.data = tmpMatrix.data;
    tmpMatrix.data = tmp;
    return ret;
  }

  invertible()
  {
    return (this.determinant() != 0);
  }

  minor(r, c)
  {
    let sub = this.submatrix(r, c);
    return sub.determinant();
  }

  cofactor(r, c)
  {
    let m = this.minor(r, c);
    if ((r + c) % 2 == 1) m *= -1;
    return m;
  }

  invert()
  {
    if (!this.invertible()) return null; //throw "not invertible";

    let tmpMatrix = tmps[this.width];
    let index = 0;
    let det = this.determinant();

    for (let c = 0; c < this.width; ++c)
      for (let r = 0; r < this.height; ++r)
      {
        let val = this.cofactor(r, c);
        tmpMatrix.data[index++] = (val / det);
      }

    let tmp = this.data;
    this.data = tmpMatrix.data;
    tmpMatrix.data = tmp;
    return this;
  }

  static multiply(m1, m2)
  {
    if (m2.isTouple) return m1.times(m2);

    let ret = new Matrix(m1.width, m1.height, m1.data.slice());
    return ret.times(m2);
  }

  static transpose(m1)
  {
    let ret = new Matrix(m1.width, m1.height, m1.data.slice());
    return ret.transpose();
  }

  static inverse(m)
  {
    let ret = new Matrix(m.width, m.height, m.data.slice());
    return ret.invert();
  }

  static submatrix(m, badr, badc)
  {
    return m.submatrix(badr, badc);
  }

  static translation(x, y, z)
  {
    let ret = Identity4x4.copy();
    ret.data[3] = x;
    ret.data[7] = y;
    ret.data[11] = z;
    return ret;
  }

  static scale(x, y, z)
  {
    let ret = Identity4x4.copy();
    ret.data[0] = x;
    ret.data[5] = y;
    ret.data[10] = z;
    return ret;
  }

  static xRotation(r)
  {
    let c = Math.cos(r);
    let s = Math.sin(r);
    let ret = Identity4x4.copy();
    ret.data[5] = c;
    ret.data[6] = -s;
    ret.data[9] = s;
    ret.data[10] = c;
    return ret;
  }

  static yRotation(r)
  {
    let c = Math.cos(r);
    let s = Math.sin(r);
    let ret = Identity4x4.copy();
    ret.data[0] = c;
    ret.data[2] = s;
    ret.data[8] = -s;
    ret.data[10] = c;
    return ret;
  }

  static zRotation(r)
  {
    let c = Math.cos(r);
    let s = Math.sin(r);
    let ret = Identity4x4.copy();
    ret.data[0] = c;
    ret.data[1] = -s;
    ret.data[4] = s;
    ret.data[5] = c;
    return ret;
  }

  static shearing(Xy, Xz, Yx, Yz, Zx, Zy)
  {
    let ret = Identity4x4.copy();
    ret.data[1] = Xy;
    ret.data[2] = Xz;
    ret.data[4] = Yx;
    ret.data[6] = Yz;
    ret.data[8] = Zx;
    ret.data[9] = Zy;
    return ret;
  }
}

var tmpTouple0 = 0;
var tmpTouple1 = 0;
var tmpTouple2 = 0;
var tmpTouple3 = 0;
var tmp2x2 = new Matrix(2, 2, [0, 0, 0, 0]);
var tmp3x3 = new Matrix(3, 3, [0, 0, 0, 0, 0, 0, 0, 0, 0]);
var tmp4x4 = new Matrix(4, 4, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
var tmps = [];
tmps[2] = tmp2x2;
tmps[3] = tmp3x3;
tmps[4] = tmp4x4;

var Matrix4x4 = function (d) { return new Matrix(4, 4, d); }
var Matrix3x3 = function (d) { return new Matrix(3, 3, d); }
var Matrix2x2 = function (d) { return new Matrix(2, 2, d); }

var Identity4x4 = new Matrix(4, 4, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
Identity4x4.set = null;
Identity4x4.multiply = null;
Identity4x4._times = null;

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

// WORLD Storage data objects
class Camera
{
  constructor(w, h, fov)
  {
    this.height = h;
    this.width = w;
    this.fov = fov;
    this.focalLength = 1.0;
    this.from = Point(0, 0, -5);
    this.to = Point(0, 0, 0);
    this.up = Vector(0, 1, 0);
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
    if (null != def.specular) this.specular = def.specular;
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

class PatternStripe extends PatternBase { constructor(type) { super(2); } }
class PatternGradient extends PatternBase { constructor(type) { super(3); } }
class PatternRing extends PatternBase { constructor(type) { super(4); } }
class PatternChecker extends PatternBase { constructor(type) { super(5); } }
class PatternBlend extends PatternBase { constructor(type) { super(6); } }

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

// JSON parser and world storage
class World
{
  constructor()
  {
    this.reset();
  }

  reset()
  {
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
        let p = Point(0, 0, 0);
        let c = [1, 1, 1, 1];
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

}


//------------------------------
// FAKE GLSL Part

// GL DATA
var perScene = {};
var objects = {};
var materials = {};
var patterns = {};
var lights = {};

var hituuid = 0;
var hitlist = [];
var hitsize;
var hit = null;

var camera = {};

var colourStack = [];
var multStack = [];
var stackI = 0;

var RefractList = []; // lsit of object indexs, keeping track up material enter and exits
var RefractSize = 0;

// GL DRIVER

let worlddef = `{
    "cameras": [
      {
        "name": "main",
        "width": 800,
        "height": 600,
        "fov": 1.57,
        "from": [0, 0, 0],
        "to": [0, 0, -1],
        "up": [0, 1, 0]
      }
    ],
    "materials": [
      {
        "name": "glassA",
        "transparency": 1.0,
        "refraction": 1.5
      },
      {
        "name": "glassB",
        "transparency": 1.0,
        "refraction": 2.0
      },
      {
        "name": "glassC",
        "transparency": 1.0,
        "refraction": 2.5
      }
    ],
    "transforms": [
      {
        "name": "A",
        "series": [{ "type": "S", "value": [2,2,2] }]
      },
      {
        "name": "B",
        "series": [{ "type": "T", "value": [0,0,-0.25] }]
      },
      {
        "name": "C",
        "series": [{ "type": "T", "value": [0,0,0.25] }]
      }
    ],
    "lights": [
      {
        "type": "pointlight",
        "position": [-10, 10, -10],
        "colour": [1, 1, 1]
      }
    ],
    "objects": [
      {
        "type": "sphere",
        "transform": "A",
        "material": "glassA"
      },
      {
        "type": "sphere",
        "transform": "B",
        "material": "glassB"
      },
      {
        "type": "sphere",
        "transform": "C",
        "material": "glassC"
      }
    ]
  }`;

var Game = null;

class FakeGLSL
{
  constructor()
  {
    Game = this;
    this.World = new World();
  }

  run()
  {
    let json = JSON.parse(worlddef);
    this.World.loadFromJSON(json);
    this.createData();
    this.main(0.5,0.5);
  }

  createData()
  {
    let c = this.World.cameras["main"];
    perScene.camera = {};
    perScene.camera.height = c.height;
    perScene.camera.width = c.width;
    perScene.camera.fov = c.fov;
    perScene.camera.focalLength = c.focalLength;
    perScene.camera.from = c.from.copy();
    perScene.camera.to = c.to.copy();
    perScene.camera.up = c.up.copy();
    perScene.shadowDepth = this.World.options.shadowDepth;
    perScene.maxReflections = this.World.options.maxReflections;

    objects.numObjects = this.World.objects.length;
    objects.data = [];
    for (let i = 0; i < this.World.objects.length; ++i)
    {
      let obj = this.World.objects[i];
      let d = {};
      d.id = obj.id;
      d.shadow = obj.shadow;
      d.type = obj.type;
      d.material = this.World.getMaterialNumber(obj.material);
      switch (obj.type)
      {
        case 0:
        case 1:
        case 3:
          d.extra1 = 0.0;
          d.extra2 = [0, 0, 0, 0];
          break;
        case 2:
          d.extra1 = obj.limits ? 1.0 : 0.0;
          d.extra2 = [obj.xMin, obj.xMax, obj.yMin, obj.yMax];
          break;
        case 4:
        case 5:
          d.extra1 = obj.closed ? 1.0 : 0.0;
          d.extra2 = [obj.min, obj.max, 0,0];
          break;
      }
      d.transform = obj.transform;
      objects.data.push(d);
    }

    materials.numMaterials = this.World.materials.length;
    materials.data = [];
    for (let i in this.World.materials)
    {
      let mat = this.World.materials[i];
      let d = {};
      d.ambient = mat.ambient;
      d.diffuse = mat.diffuse;
      d.specular = mat.specular;
      d.shininess = mat.shininess;
      d.reflective = mat.reflective;
      d.transparency = mat.transparency;
      d.refraction = mat.refraction;
      if (mat.pattern)
      {
        d.colour = [this.World.getPatternNumber(mat.pattern), 0, 0, 0];
      }
      else
      {
        d.colour = mat.colour;
      }
      materials.data.push(d);
    }

    lights.numLights = this.World.lights.length;
    lights.data = [];
    for (let i = 0; i < this.World.lights.length; ++i)
    {
      let light = this.World.lights[i];
      let d = {};
      d.position = light.position;
      d.colour = light.colour;
      d.attenuation = light.attenuation;
      d.intensityAmbient = light.intensityAmbient;
      d.intensityDiffuse = light.intensityDiffuse;
      d.intensitySpecular = light.intensitySpecular;
      lights.data.push(d);
    }

    patterns.numPatterns = this.World.patterns.length;
    patterns.data = [];
    for (let i in this.World.patterns)
    {
      let pat = this.World.patterns[i];
      let d = {};
      d.type = pat.type;
      if (pat.type == 1.0)
      {
        d.numColour = 0;
        d.colour = [pat.colour.r, pat.colour.g, pat.colour.b, 1];
      }
      else 
      {
        d.numColour = pat.num > 3 ? 3 : pat.num;
        d.colour = [this.World.getPatternNumber(pat.colours[0]), this.World.getPatternNumber(pat.colours[1]), this.World.getPatternNumber(pat.colours[2]), this.World.getPatternNumber(pat.colours[3])];
      }
      d.transform = pat.transform.copy();
      patterns.data.push(d);
    }
  }

  initCamera(data)
  {
    let forward = Touple.subtract(data.to, data.from).normalize();
    let left = Touple.cross(forward, Touple.normalize(data.up));
    let up = Touple.cross(forward, left);
    let translate = Matrix.translation(-data.from.x, -data.from.y, -data.from.z);
    let transform = new Matrix4x4([left.x, left.y, left.z, 0,
                                   up.x, up.y, up.z, 0,
                                   -forward.x, -forward.y, -forward.z, 0,
                                   0, 0, 0, 1]);
    
    camera.transform = transform.times(translate);
    camera.inverse = Matrix.inverse(camera.transform);

    camera.height = data.height;
    camera.width = data.width;
    camera.fov = data.fov;
    camera.focalLength = data.focalLength;

    let halfView = Math.tan(data.fov / 2.0);
    let ratio = data.width / data.height;

    camera.halfWidth = 0.0;
    camera.halfHeight = 0.0;
    if (ratio >= 1.0)
    {
      camera.halfWidth = halfView;
      camera.halfHeight = halfView / ratio;
    }
    else
    {
      camera.halfHeight = halfView;
      camera.halfWidth = halfView * ratio;
    }

    camera.pixelSize = camera.halfWidth * 2.0 / camera.width;
  }

  plane_intersect(index, ray)
  {
    if (Math.abs(ray.direction.y) < epsilon) return;
  
    let d = (-ray.origin.y / ray.direction.y);
    if (objects.data[index].extra1 >= 1.0)
    {
      let p = Touple.add(Touple.multiply(ray.direction,d), ray.origin);
      if (p.x > objects.data[index].extra2.y) return;
      if (p.x < objects.data[index].extra2.x) return;
      if (p.z > objects.data[index].extra2.w) return;
      if (p.z < objects.data[index].extra2.z) return;
    }
  
    this.addIntersect(d, index);
  }
  
  plane_normal(p)
  {
    return new Touple(0.0, 1.0, 0.0, 0.0);
  }

  sphere_intersect(index, ray)
  {
    let sphereToRay = Touple.subtract(ray.origin, new Touple(0.0, 0.0, 0.0, 1.0));
    let a = ray.direction.dot(ray.direction);
    let b = 2.0 * ray.direction.dot(sphereToRay);
    let c = sphereToRay.dot(sphereToRay) - 1.0;
    let aa = a + a;
    let discr = b * b - 2.0 * aa * c;
    if (discr < 0.0) return;
  
    let rootDiscr = Math.sqrt(discr);
    this.addIntersect((-b - rootDiscr) / aa, index);
    this.addIntersect((-b + rootDiscr) / aa, index);
  }
  
  sphere_normal(p)
  {
    return Touple.subtract(p, new Touple(0.0, 0.0, 0.0, 1.0));
  }

  getRayAt(u,v,ox,oy)
  {
    let x = u * camera.width + ox;
    let y = v * camera.height + oy;
    let xoffset = x * camera.pixelSize;
    let yoffset = y * camera.pixelSize;
    let xworld = camera.halfWidth - xoffset;
    let yworld = camera.halfHeight - yoffset;
    let pixel = camera.inverse.times(Point(xworld, yworld, -camera.focalLength));
    let origin = camera.inverse.times(Point(0.0,0.0,0.0,1.0));
    let direction = pixel.minus(origin).normalize();
  
    let ray = {};
    ray.origin = origin;
    ray.direction = direction;
    return ray;
  }

  addIntersect(val, index)
  {
    if (hitsize >= 20) return;

    let i = 0;
    if (hitsize > 0)
    {
      for (i = hitsize; i > 0; --i)
      {
        if (val > hitlist[i - 1].length) break;
        hitlist[i] = hitlist[i - 1];
      }
    }
    hitlist[i] = {};
    hitlist[i].length = val;
    hitlist[i].object = index;
    hitlist[i].id = hituuid++;
    hitsize++;
  }

  intersect(ray)
  {
    hitsize = 0;
    for (let i = 0; i < objects.numObjects; ++i)
    {
      // transform to object space
      let r2 = {};
      r2.origin = Matrix.inverse(objects.data[i].transform).times(ray.origin);        // TODO SPEED UP
      r2.direction = Matrix.inverse(objects.data[i].transform).times(ray.direction);
      // hit?
      if (objects.data[i].type == 1.0) this.sphere_intersect(i, r2);
      else if (objects.data[i].type == 2.0) this.plane_intersect(i, r2);
      else console.log("not implemented");
//      else if (objects.data[i].type == 3.0) this.cube_intersect(i, r2);
//      else if (objects.data[i].type == 4.0) this.cylinder_intersect(i, r2);
//      else if (objects.data[i].type == 5.0) this.cone_intersect(i, r2);
    }
  }

  getNormal(oIndex, p)
  {
      let inv = objects.data[oIndex].transform.copy().invert();
      let at = inv.times(p);
      let n = null;

      if (objects.data[oIndex].type == 1.0) n = this.sphere_normal(at);
      else if (objects.data[oIndex].type == 2.0) n = this.plane_normal(at);
//      else if (objects.data[oIndex].type == 3.0) n = this.cube_normal(at);
//      else if (objects.data[oIndex].type == 4.0) n = this.cylinder_normal(oIndex, at);
//      else if (objects.data[oIndex].type == 5.0) n = this.cone_normal(oIndex, at);

      let w = inv.copy().transpose().times(n);
      w.w = 0.0;
      return w.normalize();
  }

  // return ( bool success, int index)
  RefractListContainsId(id) // check if an object id is in list
  {
    let ret = { success: false, index: null };

    for (let i = 0; i < RefractSize; ++i)
    {
      if (RefractList[i] == id)
      {
        ret.index = i;
        ret.success = true;
        return ret;
      }
    }
    return ret;
  }
  
  RefractListAdd(id) // append an object index
  {
    RefractList[RefractSize] = id;
    RefractSize++;
  }
  
  RefractListRemove(index) // remove an object index, bump all rest down
  {
    for (let i = index; i < RefractSize - 1; ++i)
    {
      RefractList[i] = RefractList[i + 1];
    }
    RefractSize--;
  }
  
  precompute(ray)
  {
    if (hitsize == 0)
    {
      hitsize = 1;
      hitlist[0] = hit;
    }
  
    let ret = {};
    ret.length = hit.length;
    ret.object = hit.object;
    ret.position = Touple.add(Touple.multiply(ray.direction, hit.length), ray.origin);
    ret.normal = this.getNormal(hit.object, ret.position);
    ret.eye = ray.direction.copy().negate();
    if (ret.normal.dot(ret.eye) < 0.0)
    {
      ret.inside = true;
      ret.normal.times(-1.0);
    }
    else
    {
      ret.inside = false;
    }
    let scaleNormal = ret.normal.copy().times(epsilon);
    ret.reflect = Touple.reflect(ray.direction, ret.normal);
    ret.overPoint = ret.position.copy().plus(scaleNormal);
    ret.underPoint = ret.position.copy().minus(scaleNormal);

    RefractList = [];
    RefractSize = 0;
    for (let i = 0; i < hitsize; ++i)
    {
      let hitlistid = hitlist[i].id;
      if (hitlistid == hit.id)
      {
        if (RefractSize == 0) ret.n1 = 1.0;
        else ret.n1 = materials.data[objects.data[RefractList[RefractSize - 1]].material].refraction;
      }
  
      let result = this.RefractListContainsId(hitlist[i].object);
      if (result.success)
        this.RefractListRemove(result.index);
      else
        this.RefractListAdd(hitlist[i].object);
  
      if (hitlistid == hit.id)
      {
        if (RefractSize == 0) ret.n2 = 1.0;
        else ret.n2 = materials.data[objects.data[RefractList[RefractSize - 1]].material].refraction;
        break;
      }
    }
    return ret;
  }

  getHit()
  {
    for (let i = 0; i < hitsize; i += 1)
    {
      if (hitlist[i].length >= 0.0)
      {
        hit = hitlist[i];
        return true;
      }
    }
    return false;
  }
  
  castRay(myMult, ray, depth)
  {
    this.intersect(ray);
    if (this.getHit() == false) return new Point(0.0, 0.0, 0.0);
    return this.getColourFor(myMult, this.precompute(ray), depth);
  }

  schlick(comp)
  {
    let cos = comp.eye.dot(comp.normal);
    if (comp.n1 > comp.n2)
    {
      let n = comp.n1 / comp.n2;
      let sin = n * n * (1.0 - cos * cos);
      if (sin > 1.0)
        return 1.0;
      cos = Math.sqrt(1.0 - sin);
    }
    let r0 = ((comp.n1 - comp.n2) / (comp.n1 + comp.n2));
    r0 = r0 * r0;
    return r0 + (1.0 - r0) * Math.pow((1.0 - cos), 5.0);
  }

  getRefractedRay(comp)
  {
    let ret = { success: false, ray: {} };
    let nRatio = comp.n1 / comp.n2;
    let cosThetaI = comp.eye.dot(comp.normal);
    let sin2ThetaT = nRatio * nRatio * (1.0 - (cosThetaI * cosThetaI));
    if (sin2ThetaT > 1.0)
    {
      // total internal refraction case
      return ret;
    }
    let cosThetaT = Math.sqrt(1.0 - sin2ThetaT);
    let dir = comp.normal.copy().times( (nRatio * cosThetaI - cosThetaT) - comp.eye * nRatio );
  
    ret.ray.origin = comp.underPoint;
    ret.ray.direction = dir;
    ret.success = true;
  
    return ret;
  }

  getHitSkipNoShadow()
  {
    for (let i = 0; i < hitsize; i += 1)
    {
      if (hitlist[i].length >= 0.0 && objects.data[hitlist[i].object].shadow >= 1.0)
      {
        hit = hitlist[i];
        return true;
      }
    }
    return false;
  }

  isShadowed(p, lIndex, depth)
  {
      if (depth == 0) return 0.0;

      let direction = lights.data[lIndex].position.copy().minus(p);
      let distance = direction.magnitude();
      direction.normalize();

      let ray = {};
      ray.origin = p;
      ray.direction = direction;

      this.intersect(ray);
      if (this.getHitSkipNoShadow() && hit.length < distance)
      {
        return 1.0;
      }

      return 0.0;
  }

  resolveNextPattern(curIndex, pp)
  {
    let val = 0.0;
    if (patterns.data[curIndex].type == 2.0) // stripe
    {
      val = pp.x;
    }
    else if (patterns.data[curIndex].type == 4.0) // ring
    {
      val = Math.sqrt(pp.x * pp.x + pp.z * pp.z);
    }
    else if (patterns.data[curIndex].type == 5.0) // checker
    {
      var x = (pp.x + 1000.0) |0; // just to get away from negative numbers
      var y = (pp.y + 1000.0) |0;
      var z = (pp.z + 1000.0) |0;
      val = Math.abs(x) + Math.abs(y) + Math.abs(z);
    }
  
    var i = Math.abs(Math.floor(val)) % patterns.data[curIndex].numColour;
    if (i == 0)      return patterns.data[curIndex].colour[0];
    else if (i == 1) return patterns.data[curIndex].colour[1];
    else if (i == 2) return patterns.data[curIndex].colour[2];
    else if (i == 3) return patterns.data[curIndex].colour[3];
    return 0;
  }

  getPatternColour2(pIndex, p)
  {
    let curIndex = pIndex;
    let pp = p;

    for (let loop = 0; loop < 5; ++loop)
    {
      if (patterns.data[curIndex].type == 1.0)
      {
        return patterns.data[curIndex].colour;
      }

      pp = patterns.data[curIndex].transform.copy().invert().times(pp);
      curIndex = this.resolveNextPattern(curIndex, pp);
    }

    return [0.0, 0.0, 0.0, 1.0];
  }

  getPatternColour(pIndex, p)
  {
    let curIndex = pIndex;
    let pp = p;

    for (let loop = 0; loop < 5; ++loop)
    {
      if (patterns.data[curIndex].type == 1.0)
      {
        return patterns.data[curIndex].colour;
      }

      pp = patterns.data[curIndex].transform.copy().invert().times(pp);

      if (patterns.data[curIndex].type == 3.0) // gradiant
      {
        let u = pp.x - Math.floor(pp.x);
        let v = 1.0 - u;
        let c1 = this.getPatternColour2(patterns.data[curIndex].colour[0], pp);
        let c2 = this.getPatternColour2(patterns.data[curIndex].colour[1], pp);
        return [c1[0] * v + c2[0] * u,
                c1[1] * v + c2[1] * u,
                c1[2] * v + c2[2] * u,
                c1[3] * v + c2[3] * u];
      }

      else if (patterns.data[curIndex].type == 6.0) // blend
      {
        let c1 = this.getPatternColour2(patterns.data[curIndex].colour[0], pp);
        let c2 = this.getPatternColour2(patterns.data[curIndex].colour[1], pp);
        return [(c1[0] + c2[0]) * 0.5,
                (c1[1] + c2[1]) * 0.5,
                (c1[2] + c2[2]) * 0.5,
                (c1[3] + c2[3]) * 0.5];
      }

      else
      {
        curIndex = this.resolveNextPattern(curIndex, pp);
      }
    }

    return [0.0, 0.0, 0.0, 1.0];
  }

  getMaterialColour(mIndex, oIndex, p)
  {
    if (materials.data[mIndex].colour[3] == 1.0)
      return materials.data[mIndex].colour;
    else
    {
      let pp = objects.data[oIndex].transform.copy().invert().times(p);
      return this.getPatternColour(materials.data[mIndex].colour[0], pp);
    }
  }
  
  lighting(mIndex, oIndex, lIndex, p, eye, n, shadow)
  {
    let colour = this.getMaterialColour(mIndex, oIndex, p);
    let effectiveColour = [colour[0] * lights.data[lIndex].colour[0],
                           colour[1] * lights.data[lIndex].colour[1],
                           colour[2] * lights.data[lIndex].colour[2],
                           colour[3] * lights.data[lIndex].colour[3]];
    let ambient = new Touple(effectiveColour[0] * lights.data[lIndex].intensityAmbient * materials.data[mIndex].ambient,
                   effectiveColour[1] * lights.data[lIndex].intensityAmbient * materials.data[mIndex].ambient,
                   effectiveColour[2] * lights.data[lIndex].intensityAmbient * materials.data[mIndex].ambient,
                   effectiveColour[3] * lights.data[lIndex].intensityAmbient * materials.data[mIndex].ambient);
    let toLight = lights.data[lIndex].position.copy().minus(p);
    let distance = toLight.magnitude();
    let attenuation = lights.data[lIndex].attenuation[0] + lights.data[lIndex].attenuation[1] * distance + lights.data[lIndex].attenuation[2] * distance * distance;
  
    if (shadow >= 1.0) return ambient.times( (1.0 / attenuation) );
  
    let diffuse = new Touple(0.0, 0.0, 0.0, 1.0);
    let specular = new Touple(0.0, 0.0, 0.0, 1.0);
  
    toLight.normalize();
    let lightDotNormal = toLight.dot(n);
    if (lightDotNormal >= 0.0)
    {
      diffuse = new Touple(effectiveColour[0] * lights.data[lIndex].intensityDiffuse * materials.data[mIndex].diffuse * lightDotNormal * (1.0 - shadow) ,
                               effectiveColour[1] * lights.data[lIndex].intensityDiffuse * materials.data[mIndex].diffuse * lightDotNormal * (1.0 - shadow) ,
                               effectiveColour[2] * lights.data[lIndex].intensityDiffuse * materials.data[mIndex].diffuse * lightDotNormal * (1.0 - shadow) ,
                               effectiveColour[3] * lights.data[lIndex].intensityDiffuse * materials.data[mIndex].diffuse * lightDotNormal * (1.0 - shadow) );
      let reflect = Touple.reflect(toLight.copy().negate(), n); // iffy
      let reflectDotEye = reflect.dot(eye);
      if (reflectDotEye > 0.0)
      {
        let factor = Math.pow(reflectDotEye, materials.data[mIndex].shininess);
        specular = new Touple(lights.data[lIndex].colour[0] * materials.data[mIndex].specular * factor * (1.0 - shadow),
                              lights.data[lIndex].colour[1] * materials.data[mIndex].specular * factor * (1.0 - shadow),
                              lights.data[lIndex].colour[2] * materials.data[mIndex].specular * factor * (1.0 - shadow),
                              lights.data[lIndex].colour[3] * materials.data[mIndex].specular * factor * (1.0 - shadow));
      }
    }
    return ambient.plus(diffuse).plus(specular).times( (1.0 / attenuation) );
  }

  getColourFor(myMult, comp, depth)
  {
    let ret = new Touple(0, 0, 0, 0);

    let reflect = materials.data[objects.data[comp.object].material].reflective;
    let transp = materials.data[objects.data[comp.object].material].transparency;

    // compute schlick
    if (reflect > 0.0 && transp > 0.0)
    {
      let schlickFactor = this.schlick(comp);
      reflect *= schlickFactor;
      transp *= (1.0 - schlickFactor);
    }

    // set up a call for the reflection - ray.fx will pick up this ray and cast it
    if (depth > 0 && reflect > 0.0)
    {
      let ray = {};
      ray.origin = comp.overPoint;
      ray.direction = comp.reflect;

      colourStack[stackI] = ray;
      multStack[stackI] = reflect * myMult;
      stackI++;
      console.log("Queue reflect");
    }

    // set up a call for refraction
    if (depth > 0 && transp > 0.0)
    {
      let ret = this.getRefractedRay(comp);
      if (ret.success)
      {
        colourStack[stackI] = ret.ray;
        multStack[stackI] = transp * myMult;
        stackI++;
        console.log("Queue refract");
      }
    }

    // resolve the colour for this ray
    for (let i = 0; i < lights.numLights; ++i)
    {
      let shadow = this.isShadowed(comp.overPoint, i, perScene.shadowDepth);
      ret.plus( this.lighting(objects.data[comp.object].material, comp.object, i, comp.overPoint, comp.eye, comp.normal, shadow) );
    }
    ret.times(myMult);
    ret.w = 1.0;
    console.log("get color: ");
    console.log(ret);
    return ret;
  }

  main(vTextureCoord_x, vTextureCoord_y) 
  {
    this.initCamera(perScene.camera);

    let ray = this.getRayAt(vTextureCoord_x, vTextureCoord_y, 0.5, 0.5);
    colourStack[stackI] = ray;
    multStack[stackI] = 1.0;
    stackI++;

    Game.go()
  }

  go()
  {
    let depth = perScene.maxReflections;

    // pop rays and add them up until none left
    let finalColour = new Touple(0.0, 0.0, 0.0, 1.0);
    while (stackI > 0) 
    {
      stackI--;
      let ray = colourStack[stackI];
      let mult = multStack[stackI];

      let c = this.castRay(mult, ray, depth--);
      finalColour.plus(c);
    }
    finalColour.w = 1.0;
    console.log(finalColour);
  }
}