(function (){

  class rColour
  {
    constructor(r, g, b)
    {
      this.red = r;
      this.green = g;
      this.blue = b;
      this.isColour = true;
      this.makeByte();
    }

    copy()
    {
      let ret = makeColour(this.red, this.green, this.blue);
      ret.makeByte();
      return ret;
    }


    equals(t)
    {
      if (!t) return false;
      if (!ray.isEqual(this.red, t.red)) return false;
      if (!ray.isEqual(this.green, t.green)) return false;
      if (!ray.isEqual(this.blue, t.blue)) return false;
      return true;
    }

    makeByte()
    {
      this.redByte = this.red * 255;
      this.greenByte = this.green * 255;
      this.blueByte = this.blue * 255;
    }

    plus(c)
    {
      this.red += c.red;
      this.blue += c.blue;
      this.green += c.green;
      this.makeByte();
      return this;
    }

    minus(c)
    {
      this.red  -= c.red;
      this.blue -= c.blue;
      this.green -= c.green;
      this.makeByte();
      return this;
    }

    times(s)
    {
      if (s.red != null)
      {
        this.red   *= s.red;
        this.blue  *= s.blue;
        this.green *= s.green;
        this.makeByte();
      }
      else
      {
        this.red *= s;
        this.blue *= s;
        this.green *= s;
        this.makeByte();
      }
      return this;
    }

    static add(c1, c2)
    {
      return makeColour(c1.red + c2.red, c1.green + c2.green, c1.blue + c2.blue);
    }

    static subtract(c1, c2)
    {
      let ret = makeColour(c1.red, c1.green, c1.blue);
      return ret.minus(c2);
    }

    static multiply(c1, s)
    {
      let ret = makeColour(c1.red, c1.green, c1.blue);
      return ret.times(s);
    }

    // tests
    static test1()
    {
      return {
        name: "Check that colours work",
        test: function ()
        {
          let c = ray.RGBColour(-0.5, 0.4, 1.7);
          if (!ray.isEqual(c.red,  -0.5)) return false;
          if (!ray.isEqual(c.green, 0.4)) return false;
          if (!ray.isEqual(c.blue,  1.7)) return false;
          return true;
        }
      };
    }

    static test2()
    {
      return {
        name: "Check that adding colours works",
        test: function ()
        {
          let t1 = ray.RGBColour(0.9, 0.6, 0.75);
          let t2 = ray.RGBColour(0.7, 0.1, 0.25);
          let t3 = ray.Colour.add(t1, t2);
          t1.plus(t2);
          if (!ray.isEqual(t3.red,   1.6)) return false;
          if (!ray.isEqual(t3.green, 0.7)) return false;
          if (!ray.isEqual(t3.blue,  1.0)) return false;
          if (!ray.isEqual(t1.red,   1.6)) return false;
          if (!ray.isEqual(t1.green, 0.7)) return false;
          if (!ray.isEqual(t1.blue,  1.0)) return false;
          return true;
        }
      };
    }

    static test3()
    {
      return {
        name: "Check that subtracting colours works",
        test: function ()
        {
          let t1 = ray.RGBColour(0.9, 0.6, 0.75);
          let t2 = ray.RGBColour(0.7, 0.1, 0.25);
          let t3 = ray.Colour.subtract(t1, t2);
          t1.minus(t2);
          if (!ray.isEqual(t3.red,   0.2)) return false;
          if (!ray.isEqual(t3.green, 0.5)) return false;
          if (!ray.isEqual(t3.blue,  0.5)) return false;
          if (!ray.isEqual(t1.red,   0.2)) return false;
          if (!ray.isEqual(t1.green, 0.5)) return false;
          if (!ray.isEqual(t1.blue,  0.5)) return false;
          return true;
        }
      };
    }

    static test4()
    {
      return {
        name: "Check that colours can be scaled",
        test: function ()
        {
          let t1 = ray.RGBColour(0.2, 0.3, 0.4);
          let t2 = ray.Colour.multiply(t1, 2);
          t1.times(2);
          if (!ray.isEqual(t2.red, 0.4)) return false;
          if (!ray.isEqual(t2.green, 0.6)) return false;
          if (!ray.isEqual(t2.blue, 0.8)) return false;
          if (!ray.isEqual(t1.red, 0.4)) return false;
          if (!ray.isEqual(t1.green, 0.6)) return false;
          if (!ray.isEqual(t1.blue, 0.8)) return false;
          return true;
        }
      };
    }

    static test5()
    {
      return {
        name: "Check that colours can be combined",
        test: function ()
        {
          let t1 = ray.RGBColour(1.0, 0.2, 0.4);
          let t2 = ray.RGBColour(0.9, 1.0, 0.1);
          let t3 = ray.Colour.multiply(t1, t2);
          t1.times(t2);
          if (!ray.isEqual(t3.red, 0.9)) return false;
          if (!ray.isEqual(t3.green, 0.2)) return false;
          if (!ray.isEqual(t3.blue, 0.04)) return false;
          if (!ray.isEqual(t1.red, 0.9)) return false;
          if (!ray.isEqual(t1.green, 0.2)) return false;
          if (!ray.isEqual(t1.blue, 0.04)) return false;
          return true;
        }
      };
    }
  }

  class rLightAmbient
  {
    constructor(c)
    {
      this.colour = c;
      this.intensityAmbient = 1.0;
      this.isLight = true;
      this.attenuation = [1.0, 0.0, 0.0];
    }

    fromJSON(def)
    {
      if (null != def.colour) this.colour = ray.RGBColour(def.colour[0], def.colour[1], def.colour[2]);
      if (null != def.intensityAmbient) this.intensityAmbient = def.intensityAmbient;
    }

    equals(l)
    {
      if (!l) return false;
      if (this.colour.equals(l.colour) == false) return false;
      return true;
    }
  }

  class rLightPoint
  {
    constructor(p, c)
    {
      this.position = p.copy();
      this.colour = c;
      this.intensityDiffuse = 1.0;
      this.intensityAmbient = 1.0;
      this.attenuation = [1.0, 0.0, 0.0];
      this.isLight = true;
      this.usteps = 1;
      this.vsteps = 1;
      this.samples = 1;
    }

    fromJSON(def)
    {
      if (null != def.position) this.position = ray.Point(def.position[0], def.position[1], def.position[2]);
      if (null != def.colour) this.colour = ray.RGBColour(def.colour[0], def.colour[1], def.colour[2]);
      if (null != def.intensityDiffuse) this.intensityDiffuse = def.intensityDiffuse;
      if (null != def.intensityAmbient) this.intensityAmbient = def.intensityAmbient;
      if (null != def.attenuation) this.attenuation = def.attenuation;
    }

    equals(l)
    {
      if (!l) return false;
      if (this.colour.equals(l.colour) == false) return false;
      if (this.position.equals(l.position) == false) return false;
      return true;
    }

    pointOnLight(u, v)
    {
      return this.position;
    }

    static test1()
    {
      return {
        name: "Check that point light ctor works",
        test: function ()
        {
          let c = ray.RGBColour(1, 1, 1);
          let p = ray.Point(0, 0, 0);
          let light = new rLightPoint(p, c);
          if (light.position.equals(p) == false) return false;
          if (light.colour.equals(c) == false) return false;
          return true;
        }
      };
    }

  }

  class rLightArea extends rLightPoint
  {
    constructor(p, c)
    {
      super(p, c);
      this.uvec = ray.Vector(1.0,0,0);
      this.vvec = ray.Vector(0,0,1.0);
      this.usteps = 1;
      this.vsteps = 1;

      this.isAreaLight = true;
    }

    fromJSON(def)
    {
      super.fromJSON(def);
      if (null != def.jitter) this.jitter = def.jitter;
      if (null != def.usteps) this.usteps = def.usteps;
      if (null != def.vsteps) this.vsteps = def.vsteps;
      this.samples = this.vsteps * this.usteps;
      if (null != def.uvec) this.uvec = ray.Vector(def.uvec[0]/this.usteps, def.uvec[1]/this.usteps, def.uvec[2]/this.usteps);
      if (null != def.vvec) this.vvec = ray.Vector(def.vvec[0]/this.vsteps, def.vvec[1]/this.vsteps, def.vvec[2]/this.vsteps);      

      this.corner = this.position.copy();
      this.position.plus( this.uvec.copy().times(this.usteps/2.0) );
      this.position.plus( this.vvec.copy().times(this.vsteps/2.0) );
    }

    pointOnLight(u, v)
    {
      let upos = this.jitter? Math.random() : 0.5;
      let vpos = this.jitter? Math.random() : 0.5;
      return this.corner.copy().plus(this.uvec.copy().times(u+upos)).plus(this.vvec.copy().times(v+vpos));
    }
  }

  class rMaterial
  {
    constructor()
    {
      this.ambient = 0.1;
      this.diffuse = 0.9;
      this.specular = 0.9;
      this.shininess = 200.0;
      this.colour = makeColour(1, 1, 1);
      this.pattern = null;
      this.reflective = 0.0;
      this.transparency = 0.0;
      this.transmit = 0.0;
      this.refraction = 1.0;
    }

    clone(m)
    {
      this.ambient      = m.ambient     
      this.diffuse      = m.diffuse     
      this.specular     = m.specular    
      this.shininess    = m.shininess   
      this.colour = makeColour(m.colour.red, m.colour.green, m.colour.blue);      
      this.pattern      = null     
      this.reflective   = m.reflective  
      this.transparency = m.transparency
      this.transmit     = m.transmit    
      this.refraction   = m.refraction                      
    }

    colourAt(p, obj)
    {
      if (this.pattern) return this.pattern.colourAt(p, obj);
      return this.colour;
    }

    fromJSON(def)
    {
      if (null != def.shininess) this.shininess = def.shininess;
      if (null != def.ambient)   this.ambient   = def.ambient;
      if (null != def.diffuse) this.diffuse = def.diffuse;
      if (null != def.reflective) this.reflective = def.reflective;
      if (null != def.transparency) this.transparency = def.transparency;
      if (null != def.transmit) this.transmit = def.transmit;
      if (null != def.refraction) this.refraction = def.refraction;
      if (null != def.specular)  this.specular  = def.specular;
      if (null != def.colour) this.colour = makeColour(def.colour[0], def.colour[1], def.colour[2]);

      if (def.pattern)
      {
        if (typeof def.pattern == "string" && ray.World.patterns[def.pattern]) this.pattern = ray.World.patterns[def.pattern];
        if (typeof def.pattern == "object") this.pattern = ray.World.parsePattern(def.pattern);
      }
    }

    equals(m)
    {
      if (!m) return false;
      if (this.colour.equals(m.colour) == false) return false;
      if (ray.isEqual(this.ambient, m.ambient) == false) return false;
      if (ray.isEqual(this.diffuse, m.diffuse) == false) return false;
      if (ray.isEqual(this.specular, m.specular) == false) return false;
      if (ray.isEqual(this.shininess, m.shininess) == false) return false;
      return true;
    }

    static test1()
    {
      return {
        name: "Check that material ctor works",
        test: function ()
        {
          let m = new ray.Material();
          if (ray.isEqual(m.ambient, 0.1) == false) return false;
          if (ray.isEqual(m.diffuse, 0.9) == false) return false;
          if (ray.isEqual(m.specular, 0.9) == false) return false;
          if (ray.isEqual(m.shininess, 200.0) == false) return false;
          if (m.colour.equals(ray.RGBColour(1,1,1)) == false) return false;
          return true;
        }
      };
    }

    static test2()
    {
      return {
        name: "Check that material has reflective value",
        test: function ()
        {
          let m = new ray.Material();
          if (m.reflective == null || m.reflective != 0) return false;
          return true;
        }
      };
    }

    static test3()
    {
      return {
        name: "Check that material has transparent, refraction values",
        test: function ()
        {
          let m = new ray.Material();
          if (m.transparency == null || m.transparency != 0) return false;
          if (m.refraction == null || m.refraction != 1) return false;
          return true;
        }
      };
    }

  }

  class ColourPool
  {
    constructor()
    {
      this.pool = new Array(100);
      this.next = 0;
      for (let i = 0; i < 100; ++i) this.pool[i] = new rColour(0, 0, 0);
    }

    getColour(r,g,b)
    {
      let ret = this.pool[this.next++];
      if (this.next >= 100) this.next = 0;
      ret.red = r;
      ret.green = g;
      ret.blue = b;
      return ret;
    }
  }

  class rTexture
  {
    constructor()
    {
      this.isTexture = true;
    }

    fromJSON(def)
    {
    }

    colourAt(u, v)
    {
      return ray.Colour.Black;
    }
  }

  class rTextureChecker extends rTexture
  {
    constructor()
    {
      super();
      this.colours = [];
      for (let i = 0; i < arguments.length; ++i)
        this.colours.push(arguments[i]);
      this.width = this.colours.length;
      this.height = this.colours.length;
    }

    fromJSON(def)
    {
      super.fromJSON(def);

      if (null != def.width) this.width = def.width;
      if (null != def.height) this.height = def.height;

      if (def.colours && def.colours.length) 
      {
        for (let i = 0; i < def.colours.length; ++i)
        {
          if (typeof def.colours[i] == "string") this.colours.push(ray.World.patterns[def.colours[i]]);
          else this.colours.push(makeColour(def.colours[i][0], def.colours[i][1], def.colours[i][2]));
        }
      }
    }
    
    colourAt(u, v)
    {
      let val = Math.abs(Math.floor(u * this.width) + Math.floor(v * this.height));
      let ret = this.colours[(Math.floor(val)) % this.colours.length];
      return ret.copy();
    }
  }
  
  class rTextureCube extends rTexture
  {
    constructor()
    {
      super();
      this.faces = {};
    }

    getTexture(data)
    {
      if (data)
      {
        if (typeof data == "string" && ray.World.textures[data]) return ray.World.textures[data];
        if (typeof data == "object") return ray.World.parseTexture(data);
      }
      return null; 
    }

    fromJSON(def)
    {
      super.fromJSON(def);
      if (def.up    ) this.faces[2] = this.getTexture(def.up    );
      if (def.down  ) this.faces[3] = this.getTexture(def.down  );
      if (def.left  ) this.faces[1] = this.getTexture(def.left  );
      if (def.right ) this.faces[0] = this.getTexture(def.right );
      if (def.front ) this.faces[4] = this.getTexture(def.front );
      if (def.back  ) this.faces[5] = this.getTexture(def.back  );
    }
    
    colourAt(u, v, face)
    {
      return this.faces[face].colourAt(u, 1-v);
    }
  }

  class rTextureTest extends rTexture
  {
    constructor()
    {
      super();
      this.ul = ray.RGBColour(1,0,0);
      this.ur = ray.RGBColour(1,1,0);
      this.bl = ray.RGBColour(0,1,0);
      this.br = ray.RGBColour(0,1,1);
      this.main = ray.RGBColour(1,1,1);
    }

    fromJSON(def)
    {
      super.fromJSON(def);
      if (def.main) this.main = ray.RGBColour(def.main[0], def.main[1], def.main[2]);
      if (def.ul) this.ul = ray.RGBColour(def.ul[0], def.ul[1], def.ul[2]);
      if (def.ur) this.ur = ray.RGBColour(def.ur[0], def.ur[1], def.ur[2]);
      if (def.bl) this.bl = ray.RGBColour(def.bl[0], def.bl[1], def.bl[2]);
      if (def.br) this.br = ray.RGBColour(def.br[0], def.br[1], def.br[2]);
    }
    
    colourAt(u, v)
    {
      if (v > 0.8)
      {
        if (u < 0.2) return this.ul;
        if (u > 0.8) return this.ur;
      }
      else if (v < 0.2)
      {
        if (u < 0.2) return this.bl;
        if (u > 0.8) return this.br;
      }
      return this.main;
    }
  }

  class rTextureImage extends rTexture
  {
    constructor()
    {
      super();
    }

    fromJSON(def)
    {
      super.fromJSON(def);
      if (def.image)
      {
        if (typeof def.image == "string" && ray.World.images[def.image]) this.image = ray.World.images[def.image];
      }
    }
    
    colourAt(u, v)
    {
      let x = Math.floor(u * this.image.width);
      let y = Math.floor(v * this.image.height);
      return this.image.sample(x, y);
    }
  }

  class rMapping
  {
    constructor()
    {
      this.isMapping = true;
    }

    fromJSON(def)
    {
    }

    getUV(p)
    {
      let u = 0, v = 0;
      return { u, v };
    }
  }

  class rSphericalMap extends rMapping
  {
    constructor()
    {
      super();
    }

    fromJSON(def)
    {
      super.fromJSON(def);
    }
    
    getUV(p)
    {
      let theta = Math.atan2(p.x, p.z);
      let vec = ray.Vector(p.x, p.y, p.z);
      let radius = vec.magnitude();
      let phi = Math.acos(p.y / radius);
      let raw_u = theta / (2 * Math.PI);
      let u = 1 - (raw_u + 0.5);
      let v =  phi / Math.PI;

      return { u, v };
    }
  }

  class rPlanarMap extends rMapping
  {
    constructor()
    {
      super();
    }

    fromJSON(def)
    {
      super.fromJSON(def);
    }
    
    getUV(p)
    {
      let u = p.x%1;
      let v = (1-p.z)%1;
      if (u < 0) u = 1.0 + u;
      if (v < 0) v = 1.0 + v;
      
      return { u, v };
    }
  }

  class rCylindricalMap extends rMapping
  {
    constructor()
    {
      super();
    }

    fromJSON(def)
    {
      super.fromJSON(def);
    }
    
    getUV(p)
    {
      let theta = Math.atan2(p.x, p.z);
      let raw_u = theta / (2 * Math.PI);
      let u = 1 - (raw_u + 0.5);
      let v = (1 - p.y)%1;    
      return { u, v };
    }
  }

  class rBakedMap extends rMapping
  {
    constructor()
    {
      super();
    }

    fromJSON(def)
    {
      super.fromJSON(def);
    }
    
    getUV(p, obj)
    {
      // compute barycentric coords
      let u = 0; 
      let v = 0;
      if (!obj.isTriangle) return;
      if (obj.uvs.length != 3) return;

       // calculate vectors from point f to vertices p1, p2 and p3:
      var f1 = ray.Touple.subtract(obj.points[0], p);
      var f2 = ray.Touple.subtract(obj.points[1], p);
      var f3 = ray.Touple.subtract(obj.points[2], p);
      // calculate the areas and factors (order of parameters doesn't matter):
      var a  = ray.Touple.cross(ray.Touple.subtract(obj.points[0], obj.points[1]), ray.Touple.subtract(obj.points[0], obj.points[2])).magnitude(); // main triangle area a
      var a1 = ray.Touple.cross(f2, f3).magnitude() / a; // p1's triangle area / a
      var a2 = ray.Touple.cross(f3, f1).magnitude() / a; // p2's triangle area / a 
      var a3 = ray.Touple.cross(f1, f2).magnitude() / a; // p3's triangle area / a
      // find the uv corresponding to point f (uv1/uv2/uv3 are associated to p1/p2/p3):
      u = obj.uvs[0].x * a1
        + obj.uvs[1].x * a2
        + obj.uvs[2].x * a3;
      v = obj.uvs[0].y * a1
        + obj.uvs[1].y * a2
        + obj.uvs[2].y * a3;
      v = 1-v;

      return { u, v };
    }
  }


  class rCubeMap extends rMapping
  {
    constructor()
    {
      super();
    }

    fromJSON(def)
    {
      super.fromJSON(def);
    }
    
    determineFace(p)
    {
      let x = Math.abs(p.x);
      let y = Math.abs(p.y);
      let z = Math.abs(p.z);
      let coord = Math.max(x,y,z);
      if (coord == p.x) return 0; // right
      if (coord == -p.x) return 1; // left
      if (coord == p.y) return 2; // up
      if (coord == -p.y) return 3; // down
      if (coord == p.z) return 4; // front
      return 5; // back
    }

    getUV(p)
    {
      let face = this.determineFace(p);
      if (face == 0) { // right
        let u = ((1 - p.z) % 2.0) / 2.0
        let v = ((p.y + 1) % 2.0) / 2.0
        return { u, v, face };
      }
      if (face == 1) { // left
        let u = ((p.z + 1) % 2.0) / 2.0
        let v = ((p.y + 1) % 2.0) / 2.0
        return { u, v, face };
      }
      if (face == 2) { // up
        let u = ((p.x + 1) % 2.0) / 2.0
        let v = ((1 - p.z) % 2.0) / 2.0
        return { u, v, face };
      }
      if (face == 3) { // down
        let u = ((p.x + 1) % 2.0) / 2.0
        let v = ((p.z + 1) % 2.0) / 2.0
        return { u, v, face };
      }
      else if (face == 4) { // front
        let u = ((p.x + 1) % 2.0) / 2.0
        let v = ((p.y + 1) % 2.0) / 2.0
        return { u, v, face };
      }
      else { // back
        let u = ((1 - p.x) % 2.0) / 2.0
        let v = ((p.y + 1) % 2.0) / 2.0
        return { u, v, face };
      }
    }
  }

  class rPattern 
  {
    constructor()
    {
      this.transform = null;
      this.dirty = false;
      this.isPattern = true;
    }

    setTransform(t)
    {
      this.transform = t;
      this.inverse = null;
      this.dirty = true;
    }

    clean()
    {
      this.dirty = false;
      this.inverse = ray.Matrix.inverse(this.transform);
    }

    colourAt(p, obj)
    {
      let point = p.copy();
      if (obj && obj.isObject) 
      {
        point.worldToObject(obj);
      }
      if (this.dirty) this.clean();

      if (this.inverse) point = this.inverse.times(point);
      return this.resolve(point, obj);
    }

    fromJSON(def)
    {
      if (def.transform)
      {
        if (typeof def.transform == "string" && ray.World.transforms[def.transform]) { this.transform = ray.World.transforms[def.transform]; this.dirty = true; }
        if (typeof def.transform == "object") { this.transform = ray.World.parseTransform(def.transform); this.dirty = true; }
      }
    }
  }

  class rPatternTest extends rPattern
  {
    constructor(c)
    {
      super();
    }

    resolve(p)
    {
      return ray.RGBColour(p.x, p.y, p.z);
    }
  }

  class rPatternSolid extends rPattern
  {
    constructor(c)
    {
      super();
      this.colour = c ? c : ray.White;
    }

    resolve(p)
    {
      return this.colour.copy();
    }

    fromJSON(def)
    {
      super.fromJSON(def);
      if (def.colours && def.colours.length == 3) 
      {
        this.colour = makeColour(def.colours[0], def.colours[1], def.colours[2]);
      }
    }
  }

  class rPatternMapped extends rPattern
  {
    constructor(c)
    {
      super();
    }

    resolve(p, obj)
    {
      let {u, v, face} = this.mapping.getUV(p, obj);
      return this.texture.colourAt(u, v, face);
    }

    fromJSON(def)
    {
      super.fromJSON(def);
      if (def.mapping == "spherical") this.mapping = new ray.SphericalMap();
      else if (def.mapping == "planar") this.mapping = new ray.PlanarMap();
      else if (def.mapping == "cylindrical") this.mapping = new ray.CylindricalMap();
      else if (def.mapping == "cube") this.mapping = new ray.CubeMap();
      else if (def.mapping == "baked") this.mapping = new ray.BakedMap();
      if (def.texture)
      {
        if (typeof def.texture == "string" && ray.World.textures[def.texture]) this.texture = ray.World.textures[def.texture];
        if (typeof def.texture == "object") this.texture = ray.World.parseTexture(def.texture); 
      }
    }
  }

  class rPatternStripe extends rPattern
  {
    constructor()
    {
      super();
      this.colours = [];
      for (let i = 0; i < arguments.length; ++i)
        this.colours.push(arguments[i]);
    }

    resolve(p)
    {
      let ret = this.colours[Math.abs(Math.floor(p.x)) % this.colours.length];
      if (ret.isPattern) return ret.colourAt(p);
      return ret.copy();
    }

    fromJSON(def)
    {
      super.fromJSON(def);
      if (def.colours && def.colours.length) 
      {
        for (let i = 0; i < def.colours.length; ++i)
        {
          if (typeof def.colours[i] == "string") this.colours.push(ray.World.patterns[def.colours[i]]);
          else this.colours.push(makeColour(def.colours[i][0], def.colours[i][1], def.colours[i][2]));
        }
      }
    }

    static test1()
    {
      return {
        name: "Check that pattern ctor works",
        test: function ()
        {
          let p = new ray.PatternStripe(ray.Black, ray.White);
          if (p.colours[0].equals(ray.Black) == false) return false;
          if (p.colours[1].equals(ray.White) == false) return false;
          return true;
        }
      };
    }

    static test2()
    {
      return {
        name: "Check that pattern is constant in y",
        test: function ()
        {
          let p = new ray.PatternStripe(ray.Black, ray.White);
          if (p.colourAt(ray.Point(0, 0, 0)).equals(ray.Black) == false) return false;
          if (p.colourAt(ray.Point(0, 1, 0)).equals(ray.Black) == false) return false;
          if (p.colourAt(ray.Point(0, 2, 0)).equals(ray.Black) == false) return false;
          return true;
        }
      };
    }

    static test3()
    {
      return {
        name: "Check that pattern is constant in z",
        test: function ()
        {
          let p = new ray.PatternStripe(ray.Black, ray.White);
          if (p.colourAt(ray.Point(0, 0, 0)).equals(ray.Black) == false) return false;
          if (p.colourAt(ray.Point(0, 0, 1)).equals(ray.Black) == false) return false;
          if (p.colourAt(ray.Point(0, 0, 2)).equals(ray.Black) == false) return false;
          return true;
        }
      };
    }

    static test4()
    {
      return {
        name: "Check that pattern is changes in x",
        test: function ()
        {
          let p = new ray.PatternStripe(ray.Black, ray.White);
          if (p.colourAt(ray.Point(0, 0, 0)).equals(ray.Black) == false) return false;
          if (p.colourAt(ray.Point(0.9, 0, 0)).equals(ray.Black) == false) return false;
          if (p.colourAt(ray.Point(1, 0, 0)).equals(ray.White) == false) return false;
          if (p.colourAt(ray.Point(-0.1, 0, 0)).equals(ray.White) == false) return false;
          if (p.colourAt(ray.Point(-1, 0, 0)).equals(ray.White) == false) return false;
          if (p.colourAt(ray.Point(-1.1, 0, 0)).equals(ray.Black) == false) return false;
          return true;
        }
      };
    }

    static test5()
    {
      return {
        name: "Check that lighting uses patterns",
        test: function ()
        {
          let s = new ray.Sphere();
          let p = new ray.PatternStripe(ray.White, ray.Black);
          let m = new ray.Material();
          m.ambient = 1;
          m.pattern = p;
          m.diffuse = 0;
          m.specular = 0;
          let eye = ray.Vector(0, 0, -1);
          let normal = ray.Vector(0, 0, -1);
          let light = new ray.LightPoint(ray.Point(0, 0, -10), ray.White);
          let c1 = ray.Render.lighting(m, s, light, ray.Point(0.9, 0, 0), eye, normal, false);
          let c2 = ray.Render.lighting(m, s, light, ray.Point(1.1, 0, 0), eye, normal, false);
          if (c1.equals(ray.White) == false) return false;
          if (c2.equals(ray.Black) == false) return false;
          return true;
        }
      };
    }

    static test6()
    {
      return {
        name: "Check that patterns use object transforms",
        test: function ()
        {
          let obj = new ray.Sphere();
          obj.setTransform(ray.Matrix.scale(2, 2, 2));
          let p = new ray.PatternStripe(ray.White, ray.Black);
          let c = p.colourAt(ray.Point(1.5, 0, 0), obj);
          if (c.equals(ray.White) == false) return false;
          return true;
        }
      };
    }

    static test7()
    {
      return {
        name: "Check that patterns use pattern transforms",
        test: function ()
        {
          let obj = new ray.Sphere();
          let p = new ray.PatternStripe(ray.White, ray.Black);
          p.setTransform(ray.Matrix.scale(2, 2, 2));
          let c = p.colourAt(ray.Point(1.5, 0, 0), obj);
          if (c.equals(ray.White) == false) return false;
          return true;
        }
      };
    }

    static test8()
    {
      return {
        name: "Check that patterns use object and pattern transforms",
        test: function ()
        {
          let obj = new ray.Sphere();
          obj.setTransform(ray.Matrix.scale(2, 2, 2));
          let p = new ray.PatternStripe(ray.White, ray.Black);
          p.setTransform(ray.Matrix.translation(0.5, 0, 0));
          let c = p.colourAt(ray.Point(2.5, 0, 0), obj);
          if (c.equals(ray.White) == false) return false;
          return true;
        }
      };
    }

  }
  
  class rPatternGradient extends rPattern
  {
    constructor(c1, c2)
    {
      super();
      this.colour1 = c1 ? c1 : ray.White;
      this.colour2 = c2 ? c2 : ray.Black;
    }

    resolve(p)
    {
      // c1 * fraction + c2 * (1-fraction)
      let u = p.x - Math.floor(p.x);
      let v = 1.0 - u;

      let c1 = this.colour1.isPattern ? this.colour1.colourAt(p) : this.colour1.copy();
      let c2 = this.colour2.isPattern ? this.colour2.colourAt(p) : this.colour2.copy();
      return c1.times(v).plus(c2.times(u));
    }

    fromJSON(def)
    {
      super.fromJSON(def);
      if (def.colour1)
      {
        if (typeof def.colour1 == "string") this.colour1 =ray.World.patterns[def.colour1];
        else this.colour1 = makeColour(def.colour1[0], def.colour1[1], def.colour1[2]);
      }
      if (def.colour2)
      {
        if (typeof def.colour2 == "string") this.colour2 = ray.World.patterns[def.colour2];
        else this.colour2 = makeColour(def.colour2[0], def.colour2[1], def.colour2[2]);
      }
    }

    static test1()
    {
      return {
        name: "Check that gradient pattern works",
        test: function ()
        {
          let p = new ray.PatternGradient(ray.White, ray.Black);
          if (p.colourAt(ray.Point(0, 0, 0)).equals(ray.White) == false) return false;
          if (p.colourAt(ray.Point(0.25, 0, 0)).equals(ray.RGBColour(0.75,0.75,0.75)) == false) return false;
          if (p.colourAt(ray.Point(0.5, 0, 0)).equals(ray.RGBColour(0.5,0.5,0.5)) == false) return false;
          if (p.colourAt(ray.Point(0.75, 0, 0)).equals(ray.RGBColour(0.25,0.25,0.25)) == false) return false;
          return true;
        }
      };
    }
  }

  class rPatternRing extends rPattern
  {
    constructor()
    {
      super();
      this.colours = [];
      for (let i = 0; i < arguments.length; ++i)
        this.colours.push(arguments[i]);
    }

    resolve(p)
    {
      let val = Math.sqrt(p.x * p.x + p.z * p.z);
      let ret = this.colours[(Math.floor(val)) % this.colours.length];
      if (ret.isPattern) return ret.colourAt(p);
      return ret.copy();
    }

    fromJSON(def)
    {
      super.fromJSON(def);
      if (def.colours && def.colours.length) 
      {
        for (let i = 0; i < def.colours.length; ++i)
        {
          if (typeof def.colours[i] == "string") this.colours.push(ray.World.patterns[def.colours[i]]);
          else this.colours.push(makeColour(def.colours[i][0], def.colours[i][1], def.colours[i][2]));
        }
      }
    }

    static test1()
    {
      return {
        name: "Check that ring pattern works",
        test: function ()
        {
          let p = new ray.PatternRing(ray.White, ray.Black);
          if (p.colourAt(ray.Point(0, 0, 0)).equals(ray.White) == false) return false;
          if (p.colourAt(ray.Point(1, 0, 0)).equals(ray.Black) == false) return false;
          if (p.colourAt(ray.Point(0, 0, 1)).equals(ray.Black) == false) return false;
          if (p.colourAt(ray.Point(0.708, 0, 0.708)).equals(ray.Black) == false) return false;
          return true;
        }
      };
    }
  }

  class rPatternChecker extends rPattern
  {
    constructor()
    {
      super();
      this.colours = [];
      for (let i = 0; i < arguments.length; ++i)
        this.colours.push(arguments[i]);
    }

    resolve(p)
    {
      let val = Math.abs(Math.floor(p.x) + Math.floor(p.y) + Math.floor(p.z));
      let ret = this.colours[(Math.floor(val)) % this.colours.length];
      if (ret.isPattern) return ret.colourAt(p);
      return ret.copy();
    }

    fromJSON(def)
    {
      super.fromJSON(def);
      if (def.colours && def.colours.length) 
      {
        for (let i = 0; i < def.colours.length; ++i)
        {
          if (typeof def.colours[i] == "string") this.colours.push(ray.World.patterns[def.colours[i]]);
          else this.colours.push(makeColour(def.colours[i][0], def.colours[i][1], def.colours[i][2]));
        }
      }
    }

    static test1()
    {
      return {
        name: "Check that checker pattern works in X",
        test: function ()
        {
          let p = new ray.PatternChecker(ray.White, ray.Black);
          if (p.colourAt(ray.Point(0, 0, 0)).equals(ray.White) == false) return false;
          if (p.colourAt(ray.Point(0.99, 0, 0)).equals(ray.White) == false) return false;
          if (p.colourAt(ray.Point(1.01, 0, 0)).equals(ray.Black) == false) return false;
          return true;
        }
      };
    }

    static test2()
    {
      return {
        name: "Check that checker pattern works in Y",
        test: function ()
        {
          let p = new ray.PatternChecker(ray.White, ray.Black);
          if (p.colourAt(ray.Point(0, 0, 0)).equals(ray.White) == false) return false;
          if (p.colourAt(ray.Point(0, 0.99, 0)).equals(ray.White) == false) return false;
          if (p.colourAt(ray.Point(0, 1.01, 0)).equals(ray.Black) == false) return false;
          return true;
        }
      };
    }

    static test3()
    {
      return {
        name: "Check that checker pattern works in Z",
        test: function ()
        {
          let p = new ray.PatternChecker(ray.White, ray.Black);
          if (p.colourAt(ray.Point(0, 0, 0)).equals(ray.White) == false) return false;
          if (p.colourAt(ray.Point(0, 0, 0.99)).equals(ray.White) == false) return false;
          if (p.colourAt(ray.Point(0, 0, 1.01)).equals(ray.Black) == false) return false;
          return true;
        }
      };
    }

  }
  
  class rPatternBlend extends rPattern
  {
    constructor(c1, c2)
    {
      super();
      this.colour1 = c1 ? c1 : ray.White;
      this.colour2 = c2 ? c2 : ray.Black;
    }

    resolve(p)
    {
      let c1 = this.colour1.isPattern ? this.colour1.colourAt(p) : this.colour1.copy();
      let c2 = this.colour2.isPattern ? this.colour2.colourAt(p) : this.colour2.copy();
      return c1.plus(c2).times(0.5);
    }

    fromJSON(def)
    {
      super.fromJSON(def);
      if (def.colour1)
      {
        if (typeof def.colour1 == "string") this.colour1 = ray.World.patterns[def.colour1];
        else this.colour1 = makeColour(def.colour1[0], def.colour1[1], def.colour1[2]);
      }
      if (def.colour2)
      {
        if (typeof def.colour2 == "string") this.colour2 = ray.World.patterns[def.colour2];
        else this.colour2 = makeColour(def.colour2[0], def.colour2[1], def.colour2[2]);
      }
    }
  }

  class rPatternPerlin extends rPattern
  {
    constructor(c1, seed)
    {
      super();
      this.colour = c1 ? c1 : new rPatternSolid();

      this.perlin = new LibNoise.FastPerlin();
      this.perlin.Frequency = 0.5;
      this.perlin.Octaves = 4;
      this.perlin.Seed = seed;
    }

    resolve(p)
    {
      var xDistort = p.x + (this.perlin.GetValue(p.x, p.y, p.z));
      var yDistort = p.y + (this.perlin.GetValue(p.y, p.z, p.x));
      var zDistort = p.z + (this.perlin.GetValue(p.z, p.x, p.y));

      let perlinp = p.copy();
      perlinp.x += xDistort;
      perlinp.y += yDistort;
      perlinp.z += zDistort;
      return this.colour.colourAt(perlinp);
    }

    fromJSON(def)
    {
      super.fromJSON(def);
      if (def.colour)
      {
        if (typeof def.colour == "string") this.colour = ray.World.patterns[def.colour];
        if (def.seed)
        {
          console.log("seed: " + def.seed);
          this.perlin.Seed = def.seed;
        }
      }
    }
  }

  var pool = new ColourPool();
  function makeColour(r,g,b)
  {
    ray.counts.colour += 1;
    if (ray.usePool) return pool.getColour(r,g,b);
    return new rColour(r,g,b);
  }

  ray.classlist.push(rColour);
  ray.classlist.push(rLightPoint);
  ray.classlist.push(rLightAmbient);
  ray.classlist.push(rMaterial);
  ray.classlist.push(rPatternStripe);
  ray.classlist.push(rPatternGradient);
  ray.classlist.push(rPatternRing);
  ray.classlist.push(rPatternChecker);
  
  ray.Material = rMaterial;
  
  ray.LightPoint = rLightPoint;
  ray.LightArea = rLightArea;
  ray.LightAmbient = rLightAmbient;
  
  ray.RGBColour = function (r, g, b) { return makeColour(r, g, b); }
  ray.Colour = rColour;
  
  ray.PatternSolid = rPatternSolid;
  ray.PatternStripe = rPatternStripe;
  ray.PatternGradient = rPatternGradient;
  ray.PatternRing = rPatternRing;
  ray.PatternChecker = rPatternChecker;
  ray.PatternBlend = rPatternBlend;
  ray.PatternPerlin = rPatternPerlin;
  ray.PatternTest = rPatternTest;
  ray.PatternMapped = rPatternMapped;

  ray.TextureChecker = rTextureChecker;
  ray.TextureTest = rTextureTest;
  ray.TextureCube = rTextureCube;
  ray.TextureImage = rTextureImage;
  ray.SphericalMap = rSphericalMap;
  ray.PlanarMap = rPlanarMap;
  ray.CylindricalMap = rCylindricalMap;
  ray.CubeMap = rCubeMap;
  ray.BakedMap = rBakedMap;

  ray.White = new rColour(1, 1, 1);
  ray.White.plus = null;
  ray.White.minus = null;
  ray.White.times = null;
  ray.Black = new rColour(0, 0, 0);
  ray.Black.plus = null;
  ray.Black.minus = null;
  ray.Black.times = null;

})();
