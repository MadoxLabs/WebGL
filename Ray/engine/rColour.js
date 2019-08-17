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

  class rLightPoint
  {
    constructor(p, c)
    {
      this.position = p;
      this.colour = c;
      this.intensityDiffuse = 1.0;
      this.intensityAmbient = 1.0;
      this.attenuation = [1.0, 0.0, 0.0];
      this.isLight = true;
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
      this.refraction = 1.0;
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
      if (null != def.refraction) this.refraction = def.refraction;
      if (null != def.specular)  this.specular  = def.specular;
      if (null != def.colour)    this.colour    = makeColour(def.colour[0], def.colour[1], def.colour[2]);
      if (def.pattern && ray.World.patterns[def.pattern]) this.pattern = ray.World.patterns[def.pattern];
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
      let point = p;
      if (obj && obj.isObject)
      {
        if (obj.dirty) obj.clean();
        point = obj.inverse.times(p);
      }
      if (this.dirty) this.clean();
      if (this.inverse) point = this.inverse.times(point);
      return this.resolve(point);
    }

    fromJSON(def)
    {
      if (def.transform && ray.World.transforms[def.transform]) { this.transform = ray.World.transforms[def.transform]; this.dirty = true; }
    }
  }

  class rPatternSolid extends rPattern
  {
    constructor(c)
    {
      super();
      this.colour = c ? c : ray.White;
    }

    resolve(p, o)
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
    if (ray.usePool) return pool.getColour(r,g,b);
    return new rColour(r,g,b);
  }

  ray.classlist.push(rColour);
  ray.classlist.push(rLightPoint);
  ray.classlist.push(rMaterial);
  ray.classlist.push(rPatternStripe);
  ray.classlist.push(rPatternGradient);
  ray.classlist.push(rPatternRing);
  ray.classlist.push(rPatternChecker);
  ray.Material = rMaterial;
  ray.LightPoint = rLightPoint;
  ray.RGBColour = function (r, g, b) { return makeColour(r, g, b); }
  ray.Colour = rColour;
  ray.PatternSolid = rPatternSolid;
  ray.PatternStripe = rPatternStripe;
  ray.PatternGradient = rPatternGradient;
  ray.PatternRing = rPatternRing;
  ray.PatternChecker = rPatternChecker;
  ray.PatternBlend = rPatternBlend;
  ray.PatternPerlin = rPatternPerlin;

  ray.White = new rColour(1, 1, 1);
  ray.White.plus = null;
  ray.White.minus = null;
  ray.White.times = null;
  ray.Black = new rColour(0, 0, 0);
  ray.Black.plus = null;
  ray.Black.minus = null;
  ray.Black.times = null;

})();
