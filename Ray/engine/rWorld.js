(function (){

  class rWorld
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
        lighting: true,
        shadowing: true,
        jigglePoints: false,
        maxReflections: 5
      }
    }

    setCamera(c, name)
    {
      this.cameras[name] = c;
    }

    render(name)
    {
      let c = this.cameras[name];
      if (!c) return;
      if (!c.canvas) return;

      for (let y = 0; y < c.height; ++y)
      {
        for (let x = 0; x < c.width; ++x)
        {
          let colour = this.renderPixel(x,y, c);
          c.canvas.set(colour, x, y);
        }
      }
    }

    renderPixel(x, y, c)
    {
      ray.counts = {
        touple: 0,
        matrix: 0,
        colour: 0,
        ray: 0,
        intersection: 0,
        intersections: 0
      };

      let colour = ray.Black;
      let factor = 1.0;
      if (this.options.antialias > 1)
      {
        let ray1 = c.getRayAt(x, y, 0.25, 0.25);
        let ray4 = c.getRayAt(x, y, 0.75, 0.75);
        let colour1 = this.cast(ray1);
        let colour4 = this.cast(ray4);
        colour = colour4.copy().plus(colour1);
        factor = 0.5;
        if (this.options.antialias > 2)
        {
          let ray2 = c.getRayAt(x, y, 0.25, 0.75);
          let ray3 = c.getRayAt(x, y, 0.75, 0.25);
          let colour2 = this.cast(ray2);
          let colour3 = this.cast(ray3);
          colour.plus(colour2).plus(colour3);
          factor = 0.25;
        }
        colour.times(factor);
      }
      else
      {
        let ray = c.getRayAt(x, y);
        colour = this.cast(ray);
      }
      return colour;
    }

    renderRowToBuffer(name, y, buffer)
    {
      let c = this.cameras[name];
      if (!c) return;

      let index = 0;
      for (let x = 0; x < c.width; ++x)
      {
        let colour = this.renderPixel(x, y, c);
        buffer[index++] = colour.redByte;
        buffer[index++] = colour.greenByte;
        buffer[index++] = colour.blueByte;
        buffer[index++] = 255;
      }
    }

    setToDefault()
    {
      this.materials = {}; // just a cache
      this.transforms = {}; // just a cache
      this.objects = [];
      this.lights = [];
      this.lights.push(new ray.LightPoint(ray.Point(-10, 10, -10), ray.RGBColour(1, 1, 1)));

      let m = new ray.Material();
      m.colour = ray.RGBColour(0.8, 1.0, 0.6);
      m.diffuse = 0.7;
      m.specular = 0.2;
      this.materials["default"] = m;

      let sphere1 = new ray.Sphere();
      sphere1.material = m;
      this.objects.push(sphere1);

      let sphere2 = new ray.Sphere();
      sphere2.setTransform(ray.Matrix.scale(0.5, 0.5, 0.5));
      this.objects.push(sphere2);
    }

    intersect(r)
    {
      let ret = ray.Intersections();
      for (let i = 0; i < this.objects.length; ++i)
      {
        // TODO intersect lights
        ret.add(this.objects[i].intersect(r));
      }
      ret.sort();
      return ret;
    }

    getReflectionFor(comp, depth)
    {
      if (depth <= 0) return ray.Black.copy();
      if (comp.object.material.reflective == 0) return ray.Black.copy();
      let r = ray.Ray(comp.overPoint.copy(), comp.reflect.copy());
      let c = this.cast(r, depth-1);
      return c.times(comp.object.material.reflective);
    }

    getRefractionFor(comp, depth)
    {
      if (depth <= 0) return ray.Black.copy();
      if (comp.object.material.transparency == 0) return ray.Black.copy();

      let nRatio = comp.n1 / comp.n2;
      let cosThetaI = comp.eye.dot(comp.normal);
      let sin2ThetaT = nRatio * nRatio * (1.0 - (cosThetaI * cosThetaI));
      if (sin2ThetaT > 1)
      {
        // total internal refraction case
        return ray.Black.copy();
      }
      let cosThetaT = Math.sqrt(1.0 - sin2ThetaT);
      let dir = comp.normal.copy().times(nRatio * cosThetaI - cosThetaT).minus(comp.eye.copy().times(nRatio));
      let r = ray.Ray(comp.underPoint.copy(), dir);
      let c = this.cast(r, depth - 1);
      return c.times(comp.object.material.transparency);
    }

    getRefractedRay(comp)
    {
      let nRatio = comp.n1 / comp.n2;
      let cosThetaI = comp.eye.dot(comp.normal);
      let sin2ThetaT = nRatio * nRatio * (1.0 - (cosThetaI * cosThetaI));
      if (sin2ThetaT > 1)
      {
        // total internal refraction case
        return null;
      }
      let cosThetaT = Math.sqrt(1.0 - sin2ThetaT);
      let dir = comp.normal.copy().times(nRatio * cosThetaI - cosThetaT).minus(comp.eye.copy().times(nRatio));
      return ray.Ray(comp.underPoint.copy(), dir);
    }

    getColourFor(comp, depth)
    {
      if (this.options.lighting)
      {
        let reflect = this.getReflectionFor(comp, depth);
        let refract = this.getRefractionFor(comp, depth);

        let shadow = this.options.shadowing ? this.isShadowed(comp.overPoint, 0, 5) : 0;
        let colour = ray.Render.lighting(comp.object.material, comp.object, this.lights[0], comp.overPoint, comp.eye, comp.normal, shadow);
        for (let l = 1; l < this.lights.length; ++l)
        {
          let shadow = this.options.shadowing ? this.isShadowed(comp.overPoint, l, 5) : 0;
          colour.plus(ray.Render.lighting(comp.object.material, comp.object, this.lights[l], comp.overPoint, comp.eye, comp.normal, shadow));
        }

        let schlick = 0;
        {
          let cos = comp.eye.dot(comp.normal);
          if (comp.n1 > comp.n2)
          {
            let n = comp.n1 / comp.n2;
            let sin = n * n * (1.0 - cos * cos);
            if (sin > 1.0)
              schlick = 1.0;
            else
            {
              cos = Math.sqrt(1.0 - sin);
            }
          }
          if (!schlick)
          {
            let r0 = ((comp.n1 - comp.n2) / (comp.n1 + comp.n2));
            r0 = r0 * r0;
            schlick = r0 + (1 - r0) * Math.pow((1 - cos), 5);
          }
        }
        if (comp.object.material.reflective > 0 && comp.object.material.transparency > 0)
        {
          reflect.times(schlick);
          refract.times(1 - schlick);
        }

        colour.plus(reflect).plus(refract);
        return colour;
      }
      else
      {
        return comp.object.material.colour;
      }
    }

    cast(r, depth)
    {
      if (depth == null) depth = this.options.maxReflections;

      let points = this.intersect(r);
      let hit = points.hit();
      if (!hit) return ray.Black.copy();
      let comp = hit.precompute(r, points);
      return this.getColourFor(comp, depth);
    }

    isShadowed(p, lightIndex, depth)
    {
      if (depth == null) depth = 5;
      if (!depth) return 0;

      let light = this.lights[lightIndex];
      let direction = ray.Touple.subtract(light.position, p);
      let distance = direction.magnitude();
      direction.normalize();
      let r = ray.Ray(p, direction);
      let points = this.intersect(r);
      let hit = points.hitSkipNoShadow();
      if (hit && hit.length < distance)
      {
        if (hit.object.material.transmit)
        {
          let comp = hit.precompute(r, points);
          let r2 = this.getRefractedRay(comp);
          if (r2)
          {
            let points2 = this.intersect(r2);
            let hit2 = points2.hitSkipNoShadow();
            if (hit2)
            {
              let comp2 = hit2.precompute(r2, points2);
              return this.isShadowed(comp2.overPoint, lightIndex, depth-1) * (1 - hit.object.material.transmit); 
            }
          }
        }
        return 1;
      }

      return 0;
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
        let c = new ray.Camera(data[i].width, data[i].height, data[i].fov);
        c.fromJSON(data[i]);
        this.cameras[data[i].name] = c;
      }
    }

    parseRenderOptions(data)
    {
      if (data.lighting != null) this.options.lighting = data.lighting;
      if (data.antialias != null) this.options.antialias = data.antialias;
      if (data.shadowing != null) this.options.shadowing = data.shadowing;
      if (data.jigglePoints != null) this.options.jigglePoints = data.jigglePoints;
      if (data.maxReflections != null) this.options.maxReflections = data.maxReflections;      
    }

    parseTransforms(data)
    {
      for (let i in data)
      {
        if (!data[i].name) continue;
        let transform = data[i]
        let trans = ray.Identity4x4.copy();
        for (let j in transform.series)
        {
          let obj = transform.series[j];
          let M = null;
          if      (obj.type == "T") M = ray.Matrix.translation(obj.value[0], obj.value[1], obj.value[2]);
          else if (obj.type == "S") M = ray.Matrix.scale(obj.value[0], obj.value[1], obj.value[2]);
          else if (obj.type == "Rx") M = ray.Matrix.xRotation(obj.value);
          else if (obj.type == "Ry") M = ray.Matrix.yRotation(obj.value);
          else if (obj.type == "Rz") M = ray.Matrix.zRotation(obj.value);
          else if (obj.type == "SH") M = ray.Matrix.shearing(obj.value[0], obj.value[1], obj.value[2], obj.value[3], obj.value[4], obj.value[5]);
          if (M) trans.times(M);
        }
        this.transforms[data[i].name] = trans;
      }
    }

    parseMaterials(data)
    {
      for (let i in data)
      {
        if (!data[i].name) continue;
        let mat = new ray.Material();
        mat.fromJSON(data[i]);
        this.materials[data[i].name] = mat;
      }
    }

    parsePatterns(data)
    {
      for (let i in data)
      {
        if (!data[i].name) continue;
        if (data[i].type == "solid")
        {
          let p = new ray.PatternSolid();
          p.fromJSON(data[i]);
          this.patterns[data[i].name] = p;
        }
        if (data[i].type == "stripe")
        {
          let p = new ray.PatternStripe();
          p.fromJSON(data[i]);
          this.patterns[data[i].name] = p;
        }
        if (data[i].type == "gradient")
        {
          let p = new ray.PatternGradient();
          p.fromJSON(data[i]);
          this.patterns[data[i].name] = p;
        }
        if (data[i].type == "ring")
        {
          let p = new ray.PatternRing();
          p.fromJSON(data[i]);
          this.patterns[data[i].name] = p;
        }
        if (data[i].type == "checker")
        {
          let p = new ray.PatternChecker();
          p.fromJSON(data[i]);
          this.patterns[data[i].name] = p;
        }
        if (data[i].type == "blend")
        {
          let p = new ray.PatternBlend();
          p.fromJSON(data[i]);
          this.patterns[data[i].name] = p;
        }
        if (data[i].type == "perlin")
        {
          let p = new ray.PatternPerlin();
          p.fromJSON(data[i]);
          this.patterns[data[i].name] = p;
        }
      
      }
    }

    parseLights(data)
    {
      for (let i in data)
      {
        if (data[i].type == "pointlight")
        {
          let p = ray.Origin;
          let c = ray.White;
          if (null != data[i].position) p = ray.Point(data[i].position[0], data[i].position[1], data[i].position[2]);
          if (null != data[i].colour) c = ray.RGBColour(data[i].colour[0], data[i].colour[1], data[i].colour[2]);
          let obj = new ray.LightPoint(p, c);
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
          let obj = new ray.Sphere();
          obj.fromJSON(data[i]);
          this.objects.push(obj);
        }
        else if (data[i].type == "plane")
        {
          let obj = new ray.Plane();
          obj.fromJSON(data[i]);
          this.objects.push(obj);
        }
      }
    }

    static test1()
    {
      return {
        name: "Check that world can be created",
        test: function ()
        {
          let w = new rWorld();
          if (w.objects.length != 0) return false;
          if (w.lights.length != 0) return false;
          return true;
        }
      };
    }

    static test2()
    {
      return {
        name: "Check that default world can be created",
        test: function ()
        {
          let w = new rWorld();
          w.setToDefault();
          if (w.objects.length != 2) return false;
          if (w.lights.length != 1) return false;
          if (w.lights[0].position.x != -10) return false;
          if (w.objects[0].material.specular != 0.2) return false;
          if (w.objects[1].transform.equals(ray.Matrix.scale(0.5, 0.5, 0.5)) == false) return false;
          return true;
        }
      };
    }

    static test3()
    {
      return {
        name: "Check that a ray can intersect the default world",
        test: function ()
        {
          let w = new rWorld();
          w.setToDefault();
          let r = ray.Ray(ray.Point(0, 0, -5), ray.Vector(0, 0, 1));
          let points = w.intersect(r);
          if (points.num != 4) return false;
          if (points.list[0].length != 4) return false;
          if (points.list[1].length != 4.5) return false;
          if (points.list[2].length != 5.5) return false;
          if (points.list[3].length != 6) return false;
          return true;
        }
      };
    }

    static test4()
    {
      return {
        name: "Check shading an intersection",
        test: function ()
        {
          let w = new rWorld();
          w.setToDefault();
          let r = ray.Ray(ray.Point(0, 0, -5), ray.Vector(0, 0, 1));
          let s = w.objects[0];
          let i = new ray.Intersection(4, s);
          let comp = i.precompute(r);
          let c = w.getColourFor(comp);
          if (c.equals(ray.RGBColour(0.38066, 0.47583, 0.2855)) == false) return false;
          return true;
        }
      };
    }

    static test5()
    {
      return {
        name: "Check shading an intersection on the inside",
        test: function ()
        {
          let w = new rWorld();
          w.setToDefault();
          w.lights[0] = new ray.LightPoint(ray.Point(0, 0.25, 0), ray.White);
          let r = ray.Ray(ray.Point(0, 0, 0), ray.Vector(0, 0, 1));
          let s = w.objects[1];
          let i = new ray.Intersection(0.5, s);
          w.options.shadowing = false;
          let comp = i.precompute(r);
          let c = w.getColourFor(comp);
          if (c.equals(ray.RGBColour(0.90498, 0.90498, 0.90498)) == false) return false;
          return true;
        }
      };
    }

    static test6()
    {
      return {
        name: "Check casting a ray that missed",
        test: function ()
        {
          let w = new rWorld();
          w.setToDefault();
          let r = ray.Ray(ray.Point(0, 0, -5), ray.Vector(0, 1, 0));
          let c = w.cast(r);
          if (c.equals(ray.Black) == false) return false;
          return true;
        }
      };
    }

    static test7()
    {
      return {
        name: "Check casting a ray that hits",
        test: function ()
        {
          let w = new rWorld();
          w.setToDefault();
          let r = ray.Ray(ray.Point(0, 0, -5), ray.Vector(0, 0, 1));
          let c = w.cast(r);
          if (c.equals(ray.RGBColour(0.38066, 0.47583, 0.2855)) == false) return false;
          return true;
        }
      };
    }

    static test8()
    {
      return {
        name: "Check casting a ray that hits behind",
        test: function ()
        {
          let w = new rWorld();
          w.setToDefault();
          w.objects[0].material.ambient = 1;
          w.objects[1].material.ambient = 1;
          let r = ray.Ray(ray.Point(0, 0, 0.75), ray.Vector(0, 0, -1));
          let c = w.cast(r);
          if (c.equals(w.objects[1].material.colour) == false) return false;
          return true;
        }
      };
    }

    static test9()
    {
      return {
        name: "Check there is no shadow when nothing is colinear",
        test: function ()
        {
          let w = new rWorld();
          w.setToDefault();
          let p = ray.Point(0, 10, 0);
          if (w.isShadowed(p,0) == true) return false;
          return true;
        }
      };
    }

    static test10()
    {
      return {
        name: "Check there is shadow when object between point and light",
        test: function ()
        {
          let w = new rWorld();
          w.setToDefault();
          let p = ray.Point(10, -10, 10);
          if (w.isShadowed(p,0) == 0) return false;
          return true;
        }
      };
    }

    static test11()
    {
      return {
        name: "Check there is no shadow when object behind light",
        test: function ()
        {
          let w = new rWorld();
          w.setToDefault();
          let p = ray.Point(-20, -20, -20);
          if (w.isShadowed(p,0) == 1) return false;
          return true;
        }
      };
    }

    static test12()
    {
      return {
        name: "Check there is no shadow when object behind point",
        test: function ()
        {
          let w = new rWorld();
          w.setToDefault();
          let p = ray.Point(-2, 2, -2);
          if (w.isShadowed(p,0) == 1) return false;
          return true;
        }
      };
    }

    static test13()
    {
      return {
        name: "Check colouring a point in shadow",
        test: function ()
        {
          let w = new rWorld();
          let def = {
            transforms: [
              {
                name: "ball",
                series: [{ type: "T", value: [0, 0, 10] }]
              }
            ],
            lights: [
              {
                type: "pointlight",
                position: [0, 0, -10],
                colour: [1, 1, 1],
              }
            ],
            objects: [
              {
                type: "sphere",
              },
              {
                type: "sphere",
                transform: "ball"
              }
            ]
          };
          w.loadFromJSON(def);
          let r = ray.Ray(ray.Point(0, 0, 5), ray.Vector(0, 0, 1));
          let i = new ray.Intersection(4, w.objects[0]);
          let comp = i.precompute(r);
          let c = w.getColourFor(comp);
          if (c.equals(ray.RGBColour(0.1, 0.1, 0.1)) == false) return false;
          return true;
        }
      };
    }

    static test13()
    {
      return {
        name: "Check reflected colour for reflective material",
        test: function ()
        {
          let w = new rWorld();
          w.setToDefault();
          let s = new ray.Plane();
          s.material = new ray.Material();
          s.material.reflective = 0.5;
          s.transform = ray.Matrix.translation(0, -1, 0);
          w.objects.push(s);
          let r = ray.Ray(ray.Point(0, 0, -3), ray.Vector(0, -Math.sqrt(2) / 2, Math.sqrt(2) / 2));
          let i = new ray.Intersection(Math.sqrt(2), s);
          let comp = i.precompute(r);
          let c = w.getReflectionFor(comp);
          ray.lowrez();
          if (c.equals(ray.RGBColour(0.19032, 0.2379, 0.14274)) == false) return false;
          ray.hirez();
          return true;
        }
      };
    }

    static test14()
    {
      return {
        name: "Check reflected colour for nonreflective material",
        test: function ()
        {
          let w = new rWorld();
          w.setToDefault();
          let r = ray.Ray(ray.Point(0, 0, 0), ray.Vector(0, 0, 1));
          let s = w.objects[1];
          s.material.ambient = 1;
          let i = new ray.Intersection(Math.sqrt(2), s);
          let comp = i.precompute(r);
          let c = w.getReflectionFor(comp);
          if (c.equals(ray.Black) == false) return false;
          return true;
        }
      };
    }

    static test15()
    {
      return {
        name: "Check getColourAt() with a reflective material",
        test: function ()
        {
          let w = new rWorld();
          w.setToDefault();
          let s = new ray.Plane();
          s.material = new ray.Material();
          s.material.reflective = 0.5;
          s.transform = ray.Matrix.translation(0, -1, 0);
          w.objects.push(s);
          let r = ray.Ray(ray.Point(0, 0, -3), ray.Vector(0, -Math.sqrt(2) / 2, Math.sqrt(2) / 2));
          let i = new ray.Intersection(Math.sqrt(2), s);
          let comp = i.precompute(r);
          let c = w.getColourFor(comp);
          ray.lowrez();
          if (c.equals(ray.RGBColour(0.87677, 0.92436, 0.82918)) == false) return false;
          ray.hirez();
          return true;
        }
      };
    }

    static test16()
    {
      return {
        name: "Check getColourAt() with a mutually reflective surfaces",
        test: function ()
        {
          let w = new rWorld();
          let oldW = ray.World;
          ray.World = w;
          let def = {
            transforms: [
              {
                name: "lower",
                series: [{ type: "T", value: [0, -1, 0] }]
              },
              {
                name: "upper",
                series: [{ type: "T", value: [0, 1, 0] }, { type: "Rx", value: Math.PI }]
              }
            ],
            materials: [
              {
                name: "mirror",
                reflective: 1
              }
            ],
            lights: [
              {
                type: "pointlight",
                position: [0, 0, 0],
                colour: [1, 1, 1],
              }
            ],
            objects: [
              {
                type: "plane",
                material: "mirror",
                transform: "lower"
              },
              {
                type: "plane",
                material: "mirror",
                transform: "upper"
              }
            ]
          };
          w.loadFromJSON(def);
          let r = ray.Ray(ray.Point(0, 0, 0), ray.Vector(0, 1, 0));
          let c = w.cast(r);
          ray.World = oldW;
          return true;
        }
      };
    }

    static test17()
    {
      return {
        name: "Check getColourAt() with a reflective material has a call depth limit",
        test: function ()
        {
          let w = new rWorld();
          w.setToDefault();
          let s = new ray.Plane();
          s.material = new ray.Material();
          s.material.reflective = 0.5;
          s.transform = ray.Matrix.translation(0, -1, 0);
          w.objects.push(s);
          let r = ray.Ray(ray.Point(0, 0, -3), ray.Vector(0, -Math.sqrt(2) / 2, Math.sqrt(2) / 2));
          let i = new ray.Intersection(Math.sqrt(2), s);
          let comp = i.precompute(r);
          let c = w.getReflectionFor(comp, 0);
          if (c.equals(ray.Black) == false) return false;
          return true;
        }
      };
    }

    static test18()
    {
      return {
        name: "Check refracted colour of opaque surface",
        test: function ()
        {
          let w = new rWorld();
          w.setToDefault();
          let s = w.objects[0];
          let r = ray.Ray(ray.Point(0, 0, -5), ray.Vector(0, 0, 1));
          let points = new ray.Intersections();
          points.add(new ray.Intersection(4, s));
          points.add(new ray.Intersection(6, s));
          let comp = points.list[0].precompute(r, points);
          let c = w.getRefractionFor(comp, 5);
          if (c.equals(ray.Black) == false) return false;
          return true;
        }
      };
    }

    static test19()
    {
      return {
        name: "Check refracted colour at maximum recursion is black",
        test: function ()
        {
          let w = new rWorld();
          w.setToDefault();
          let s = w.objects[0];
          s.material.transparency = 1.0;
          s.material.refraction = 1.5;
          let r = ray.Ray(ray.Point(0, 0, -5), ray.Vector(0, 0, 1));
          let points = new ray.Intersections();
          points.add(new ray.Intersection(4, s));
          points.add(new ray.Intersection(6, s));
          let comp = points.list[0].precompute(r, points);
          let c = w.getRefractionFor(comp, 0);
          if (c.equals(ray.Black) == false) return false;
          return true;
        }
      };
    }

    static test20()
    {
      return {
        name: "Check refracted colour at total internal refraction is black",
        test: function ()
        {
          let w = new rWorld();
          w.setToDefault();
          let s = w.objects[0];
          s.material.transparency = 1.0;
          s.material.refraction = 1.5;
          let r = ray.Ray(ray.Point(0, 0, Math.sqrt(2)/2), ray.Vector(0, 1, 0));
          let points = new ray.Intersections();
          points.add(new ray.Intersection(-Math.sqrt(2) / 2, s));
          points.add(new ray.Intersection(Math.sqrt(2) / 2, s));
          let comp = points.list[1].precompute(r, points);
          let c = w.getRefractionFor(comp, 5);
          if (c.equals(ray.Black) == false) return false;
          return true;
        }
      };
    }

    static test21()
    {
      return {

        name: "Check refracted colour is correct",
        test: function ()
        {
          let w = new rWorld();
          w.setToDefault();
          let oldW = ray.World;
          ray.World = w;
          let A = w.objects[0];
          A.material = new ray.Material();
          A.material.ambient = 1.0;
          A.material.pattern = new ray.PatternTest();
          let B = w.objects[1];
          B.material = new ray.Material();
          B.material.transparency = 1.0;
          B.material.refraction = 1.5;
          let r = ray.Ray(ray.Point(0, 0, 0.1), ray.Vector(0, 1, 0));
          let points = new ray.Intersections();
          points.add(new ray.Intersection(-0.9899, A));
          points.add(new ray.Intersection(-0.4899, B));
          points.add(new ray.Intersection(0.4899, B));
          points.add(new ray.Intersection(0.9899, A));
          let comp = points.list[2].precompute(r, points);
          let c = w.getRefractionFor(comp, 5);
          ray.World = oldW;
          ray.lowrez();
          if (c.equals(ray.RGBColour(0, 0.99888, 0.04725)) == false) return false;
          ray.hirez();
          return true;
        }
      };
    }

    static test22()
    {
      return {

        name: "Check casting computes refracted colour",
        test: function ()
        {
          let w = new rWorld();
          w.setToDefault();
          let oldW = ray.World;
          ray.World = w;

          let floor = new ray.Plane();
          floor.setTransform(ray.Matrix.translation(0, -1, 0));
          floor.material = new ray.Material();
          floor.material.transparency = 0.5;
          floor.material.refraction = 1.5;
          w.objects.push(floor);
          let ball = new ray.Sphere();
          ball.setTransform(ray.Matrix.translation(0, -3.5, -0.5));
          ball.material = new ray.Material();
          ball.material.colour = ray.RGBColour(1, 0, 0);
          ball.material.ambient = 0.5;
          w.objects.push(ball);

          let r = ray.Ray(ray.Point(0, 0, -3), ray.Vector(0, -Math.sqrt(2) / 2, Math.sqrt(2) / 2));
          let points = new ray.Intersections();
          points.add(new ray.Intersection(Math.sqrt(2), floor));
          let comp = points.list[0].precompute(r, points);
          let c = w.getColourFor(comp, 5);
          ray.World = oldW;
          ray.lowrez();
          if (c.equals(ray.RGBColour(0.93642, 0.68642, 0.68642)) == false) return false;
          ray.hirez();
          return true;
        }
      };
    }
  }

  class rCamera
  {
    constructor(w,h,fov)
    {
      this.height = h;
      this.width = w;
      this.fov = fov;
      this.transform = ray.Identity4x4;
      this.inverse = ray.Matrix.inverse(this.transform);

      let halfView = Math.tan(fov / 2.0);
      let ratio = w / h;
      this.halfWidth = 0;
      this.halfHeight = 0;
      if (ratio >= 1)
      {
        this.halfWidth = halfView;
        this.halfHeight = halfView / ratio;
      }
      else
      {
        this.halfHeight = halfView;
        this.halfWidth = halfView * ratio;
      }

      this.pixelSize = this.halfWidth * 2.0 / this.width;
      this.focalLength = 1.0;
    }

    fromJSON(def)
    {
      if (null == def.from) return;
      if (null == def.to) return;
      if (null == def.up) return;
      this.createView(ray.Point(def.from[0], def.from[1], def.from[2]), ray.Point(def.to[0], def.to[1], def.to[2]), ray.Vector(def.up[0], def.up[1], def.up[2]));
    }

    initCanvas(elem)
    {
      this.canvas = new ray.Canvas();
      if (elem == null)
        this.canvas.fromMemory(this.width, this.height);
      else
        this.canvas.fromElement(elem);
      this.canvas.tvstatic();
    }

    setTransform(t)
    {
      this.transform = t;
      this.inverse = ray.Matrix.inverse(this.transform);
    }

    createView(from, to, up)
    {
      this.forward = ray.Touple.subtract(to, from).normalize();
      this.left = ray.Touple.cross(this.forward, ray.Touple.normalize(up));
      this.up = ray.Touple.cross(this.left, this.forward);
      this.translate = ray.Matrix.translation(-from.x, -from.y, -from.z);
      this.transform = new ray.Matrix4x4([this.left.x,     this.left.y,     this.left.z, 0,
                                     this.up.x,       this.up.y,       this.up.z,   0,
                                    -this.forward.x, -this.forward.y, -this.forward.z, 0,
                                     0, 0, 0, 1]);
      this.transform.times(this.translate);    
      this.inverse = ray.Matrix.inverse(this.transform);
      return this.transform;
    }

    getRayAt(x, y, ox, oy)
    {
      let subX = ox ? ox : 0.5;
      let subY = oy ? oy : 0.5;
      if (ray.World.options.jigglePoints)
      {
        subX = Math.random();
        subY = Math.random();
      }
      let xoffset = (x + subX) * this.pixelSize;
      let yoffset = (y + subY) * this.pixelSize;
      let xworld = this.halfWidth - xoffset;
      let yworld = this.halfHeight - yoffset;
      let pixel = this.inverse.times(ray.Point(xworld, yworld, -this.focalLength));
      let origin = this.inverse.times(ray.Origin);
      let direction = pixel.minus(origin).normalize();
      return ray.Ray(origin, direction);
    }

    static test1()
    {
      return {
        name: "Check that view transforms can be made",
        test: function ()
        {
          let c = new rCamera();
          let v = c.createView(ray.Point(0, 0, 0), ray.Point(0, 0, -1), ray.Vector(0, 1, 0));
          if (v.equals(ray.Identity4x4) == false) return false;
          return true;
        }
      };
    }

    static test2()
    {
      return {
        name: "Check that view transforms can be made in +Z direction",
        test: function ()
        {
          let c = new rCamera();
          let v = c.createView(ray.Point(0, 0, 0), ray.Point(0, 0, 1), ray.Vector(0, 1, 0));
          if (v.equals(ray.Matrix.scale(-1,1,-1)) == false) return false;
          return true;
        }
      };
    }

    static test3()
    {
      return {
        name: "Check that view transform moves the world",
        test: function ()
        {
          let c = new rCamera();
          let v = c.createView(ray.Point(0, 0, 8), ray.Point(0, 0, 0), ray.Vector(0, 1, 0));
          if (v.equals(ray.Matrix.translation(0, 0, -8)) == false) return false;
          return true;
        }
      };
    }

    static test4()
    {
      return {
        name: "Check that view transform works in any direction",
        test: function ()
        {
          let c = new rCamera();
          let v = c.createView(ray.Point(1, 3, 2), ray.Point(4, -2, 8), ray.Vector(1, 1, 0));
          let check = new ray.Matrix4x4([-0.50709, 0.50709, 0.67612, -2.36643, 0.76772, 0.60609, 0.12122, -2.82843, -0.35857, 0.59761, -0.71714, 0.0, 0.0, 0.0, 0.0, 1.0]);
          if (v.equals(check) == false) return false;
          return true;
        }
      };
    }

    static test5()
    {
      return {
        name: "Check that camera ctor works",
        test: function ()
        {
          let c = new rCamera(160, 120, Math.PI / 2.0);
          if (c.height != 120) return false;
          if (c.width != 160) return false;
          if (c.fov != Math.PI / 2.0) return false;
          if (c.transform.equals(ray.Identity4x4) == false) return false;
          return true;
        }
      };
    }

    static test6()
    {
      return {
        name: "Check that camera knows the pixel size for horizontal canvas",
        test: function ()
        {
          let c = new rCamera(200, 125, Math.PI / 2.0);
          if (ray.isEqual(c.pixelSize, 0.01) == false) return false;
          return true;
        }
      };
    }

    static test7()
    {
      return {
        name: "Check that camera knows the pixel size for vertical canvas",
        test: function ()
        {
          let c = new rCamera(125, 200, Math.PI / 2.0);
          if (ray.isEqual(c.pixelSize, 0.01) == false) return false;
          return true;
        }
      };
    }

    static test8()
    {
      return {
        name: "Check getting a ray through the camera center",
        test: function ()
        {
          let c = new rCamera(201, 101, Math.PI / 2.0);
          let r = c.getRayAt(100, 50);
          if (r.origin.equals(ray.Origin) == false) return false;
          if (r.direction.equals(ray.Vector(0,0,-1)) == false) return false;
          return true;
        }
      };
    }

    static test9()
    {
      return {
        name: "Check getting a ray through the camera corner",
        test: function ()
        {
          let c = new rCamera(201, 101, Math.PI / 2.0);
          let r = c.getRayAt(0, 0);
          if (r.origin.equals(ray.Origin) == false) return false;
          if (r.direction.equals(ray.Vector(0.66519, 0.33259, -0.66851)) == false) return false;
          return true;
        }
      };
    }

    static test10()
    {
      return {
        name: "Check getting a ray through the camera with a trandform",
        test: function ()
        {
          let c = new rCamera(201, 101, Math.PI / 2.0);
          c.setTransform(ray.Matrix.yRotation(Math.PI / 4).times(ray.Matrix.translation(0, -2, 5)));
          let r = c.getRayAt(100, 50);
          if (r.origin.equals(ray.Point(0, 2, -5)) == false) return false;
          if (r.direction.equals(ray.Vector(Math.sqrt(2) / 2, 0, -Math.sqrt(2) / 2)) == false) return false;
          return true;
        }
      };
    }

    static test11()
    {
      return {
        name: "Check that the camera renders a scene",
        test: function ()
        {
          let c = new rCamera(11, 11, Math.PI / 2.0);
          c.createView(ray.Point(0, 0, -5), ray.Origin, ray.Vector(0, 1, 0));
          c.initCanvas();

          let w = new rWorld();
          w.setToDefault();
          w.setCamera(c, "main");
          w.render("main");

          let colour = ray.White.copy();
          c.canvas.get(colour, 5, 5);
          ray.lowrez();
          if (colour.equals(new ray.RGBColour(0.38066, 0.47583, 0.2855)) == false) return false;
          ray.hirez();
          return true;
        }
      };
    }
  }

  ray.classlist.push(rWorld);
  ray.classlist.push(rCamera);
  ray.Camera = rCamera;
  ray.World = new rWorld();

})();
