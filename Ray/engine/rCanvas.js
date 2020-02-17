(function ()
{
  class rCanvas
  {
    constructor()
    {
    }

    fromMemory(w, h)
    {
      this.canvas = document.createElement('canvas');
      this.canvas.width = w;
      this.canvas.height = h;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.context = this.canvas.getContext("2d");

      this.clear();
    }

    fromElement(element)
    {
      this.elementName = element;
      this.canvas = document.getElementById(element);
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.context = this.canvas.getContext("2d");

      this.clear();
      this.map = this.context.getImageData(0, 0, this.width, this.height);
    }

    bltData(data, x, y)
    {
      let loc = Math.floor(y) * (this.width * 4) + Math.floor(x) * 4;
      this.map.data.set(data, loc);
    }

    set(color, x, y)
    {
      if (y >= this.height) return;
      if (x >= this.width) return;
      if (x < 0) return;
      if (y < 0) return;
      let red = Math.floor(y) * (this.width * 4) + Math.floor(x) * 4;
      this.map.data[red + 0] = (color.red * 255);
      this.map.data[red + 1] = (color.green * 255);
      this.map.data[red + 2] = (color.blue * 255);
      this.map.data[red + 3] = 255;
    }

    get(color, x, y)
    {
      if (y >= this.height) return;
      if (x >= this.width) return;
      if (x < 0) return;
      if (y < 0) return;
      let red = Math.floor(y) * (this.width * 4) + Math.floor(x) * 4;
      color.red = this.map.data[red + 0] / 255.0;
      color.green = this.map.data[red + 1] / 255.0;
      color.blue = this.map.data[red + 2] / 255.0; 
    }

    tvstatic()
    {
      let stride = this.width * 4;
      for (let x = 0; x < this.width; ++x) 
      {
        for (let y = 0; y < this.width; ++y) 
        {
          let shade = Math.random() * 128 + 128;
          let red = y * stride + x * 4;
          this.map.data[red + 0] = shade;
          this.map.data[red + 1] = shade;
          this.map.data[red + 2] = shade;
          this.map.data[red + 3] = 255;
        }
      }
    }

    clear()
    {
      this.context.fillStyle = "black";
      this.context.fillRect(0, 0, this.width, this.height);
      this.map = this.context.getImageData(0, 0, this.width, this.height);
    }

    draw()
    {
      this.context.putImageData(this.map, 0, 0);
    }

    // tests
    static test1()
    {
      return {
        name: "Check canvases are initialized to all black",
        test: function ()
        {
          let canvas = new ray.Canvas();
          canvas.fromMemory(10, 10);
          let c = ray.RGBColour(1,1,1);

          for (let i = 0; i < 10; ++i)
          {
            for (let j = 0; j < 10; ++j)
            {
              canvas.get(c, i, j);
              if (c.red != 0) return false;
              if (c.green != 0) return false;
              if (c.blue != 0) return false;
            }
          }
          return true;
        }
      };
    }

    static test2()
    {
      return {
        name: "Check canvas pixels can be written and read back",
        test: function ()
        {
          let canvas = new ray.Canvas();
          canvas.fromMemory(10, 10);
          let c1 = ray.RGBColour(1, 0.5, 0);
          canvas.set(c1, 5, 5);
          let c2 = ray.RGBColour(0, 0, 0);
          canvas.get(c2, 5, 5);
          if (c2.red != 1) return false;
          ray.epsilon = 0.01;
          if (!ray.isEqual(c2.green, 0.5)) return false;
          ray.epsilon = 0.00001;
          if (c2.blue != 0) return false;
          return true;
        }
      };
    }
  }

  class rRender
  {
    constructor()
    {
    }

    lighting(material, object, light, point, eye, normal, shadowed)
    {
      if (shadowed == null) shadowed = 0;
      let effectiveColour = ray.Colour.multiply(material.colourAt(point, object), light.colour);
      let ambient = ray.Colour.multiply(effectiveColour, light.intensityAmbient).times(material.ambient);
      let toLight = ray.Touple.subtract(light.position, point);
      let distance = toLight.magnitude();
      let attenuation = light.attenuation[0] + light.attenuation[1] * distance + light.attenuation[2] * distance * distance;

      if (shadowed == 1)
      {
        return ambient.times(1.0 / attenuation);
      }
      else
      {
        let diffuse = null;
        let specular = null;

        toLight.normalize();
        let lightDotNormal = toLight.dot(normal);
        if (lightDotNormal < 0)
        {
          diffuse = ray.Black;
          specular = ray.Black;
        }
        else
        {
          diffuse = ray.Colour.multiply(effectiveColour, light.intensityDiffuse).times(material.diffuse).times(lightDotNormal).times(1-shadowed);
          let reflect = ray.Touple.reflect(toLight.negate(), normal);
          let reflectDotEye = reflect.dot(eye);
          if (reflectDotEye <= 0)
            specular = ray.Black;
          else
          {
            let factor = Math.pow(reflectDotEye, material.shininess);
            specular = ray.Colour.multiply(light.colour, material.specular).times(factor).times(1-shadowed);
          }
        }
        return ambient.plus(diffuse).plus(specular).times(1.0 / attenuation);
      }
    }
    
    isShadowed(p, lightIndex, depth)
    {
      if (depth == null) depth = 5;
      if (!depth) return 0;

      let light = ray.World.lights[lightIndex];
      let direction = ray.Touple.subtract(light.position, p);
      let distance = direction.magnitude();
      direction.normalize();
      let r = ray.Ray(p, direction);
      let points = ray.World.intersect(r);
      let hit = points.hitSkipNoShadow();
      if (hit && hit.length < distance)
      {
        if (hit.object.material.transmit)
        {
          let comp = hit.precompute(r, points);
          let r2 = this.getRefractedRay(comp);
          if (r2)
          {
            let points2 = ray.World.intersect(r2);
            let hit2 = points2.hitSkipNoShadow();
            if (hit2)
            {
              let comp2 = hit2.precompute(r2, points2);
              return this.isShadowed(comp2.overPoint, lightIndex, depth - 1) * (1 - hit.object.material.transmit);
            }
          }
        }
        return 1;
      }

      return 0;
    }

    getReflectionFor(comp, depth)
    {
      if (depth <= 0) return ray.Black.copy();
      if (comp.object.material.reflective == 0) return ray.Black.copy();
      let r = ray.Ray(comp.overPoint.copy(), comp.reflect.copy());
      let c = ray.World.cast(r, depth - 1);
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
      let c = ray.World.cast(r, depth - 1);
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
      if (ray.World.options.lighting)
      {
        let reflect = this.getReflectionFor(comp, depth);
        let refract = this.getRefractionFor(comp, depth);

        let shadow = ray.World.options.shadowing ? this.isShadowed(comp.overPoint, 0, 5) : 0;
        let colour = ray.Render.lighting(comp.object.material, comp.object, ray.World.lights[0], comp.overPoint, comp.eye, comp.normal, shadow);
        for (let l = 1; l < ray.World.lights.length; ++l)
        {
          let shadow = ray.World.options.shadowing ? this.isShadowed(comp.overPoint, l, 5) : 0;
          colour.plus(ray.Render.lighting(comp.object.material, comp.object, ray.World.lights[l], comp.overPoint, comp.eye, comp.normal, shadow));
        }

        if (comp.object.material.reflective > 0 && comp.object.material.transparency > 0)
        {
          let schlick = this.schlick(comp);
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

    schlick(comp)
    {
      let cos = comp.eye.dot(comp.normal);
      if (comp.n1 > comp.n2)
      {
        let n = comp.n1 / comp.n2;
        let sin = n * n * (1.0 - cos * cos);
        if (sin > 1.0)
          return 1;
        cos = Math.sqrt(1.0 - sin);
      }
      let r0 = ((comp.n1 - comp.n2) / (comp.n1 + comp.n2));
      r0 = r0 * r0;
      return r0 + (1 - r0) * Math.pow((1 - cos), 5);
    }

    static test1()
    {
      return {
        name: "Lighting with the eye between light and surface",
        test: function ()
        {
          let s = new ray.Sphere();
          let m = new ray.Material();
          let p = ray.Origin;
          let eye = ray.Vector(0, 0, -1);
          let normal = ray.Vector(0, 0, -1);
          let light = new ray.LightPoint(ray.Point(0, 0, -10), ray.RGBColour(1, 1, 1));
          let result = ray.Render.lighting(m, s, light, p, eye, normal);
          if (result.equals(ray.RGBColour(1.9, 1.9, 1.9)) == false) return false;
          return true;
        }
      };
    }

    static test2()
    {
      return {
        name: "Lighting with the eye offset 45 degrees between light and surface",
        test: function ()
        {
          let s = new ray.Sphere();
          let m = new ray.Material();
          let p = ray.Origin;
          let num = Math.sqrt(2) / 2;
          let eye = ray.Vector(0, num, -num);
          let normal = ray.Vector(0, 0, -1);
          let light = new ray.LightPoint(ray.Point(0, 0, -10), ray.RGBColour(1, 1, 1));
          let result = ray.Render.lighting(m, s, light, p, eye, normal);
          if (result.equals(ray.RGBColour(1.0, 1.0, 1.0)) == false) return false;
          return true;
        }
      };
    }

    static test3()
    {
      return {
        name: "Lighting with the light offset 45 degrees between eye and surface",
        test: function ()
        {
          let s = new ray.Sphere();
          let m = new ray.Material();
          let p = ray.Origin;
          let eye = ray.Vector(0, 0, -1);
          let normal = ray.Vector(0, 0, -1);
          let light = new ray.LightPoint(ray.Point(0, 10, -10), ray.RGBColour(1, 1, 1));
          let result = ray.Render.lighting(m, s, light, p, eye, normal);
          if (result.equals(ray.RGBColour(0.7364, 0.7364, 0.7364)) == false) return false;
          return true;
        }
      };
    }

    static test4()
    {
      return {
        name: "Lighting with the eye in the path of the reflection",
        test: function ()
        {
          let s = new ray.Sphere();
          let num = Math.sqrt(2) / 2;
          let m = new ray.Material();
          let p = ray.Origin;
          let eye = ray.Vector(0, -num, -num);
          let normal = ray.Vector(0, 0, -1);
          let light = new ray.LightPoint(ray.Point(0, 10, -10), ray.RGBColour(1, 1, 1));
          let result = ray.Render.lighting(m, s, light, p, eye, normal);
          if (result.equals(ray.RGBColour(1.6364, 1.6364, 1.6364)) == false) return false;
          return true;
        }
      };
    }

    static test5()
    {
      return {
        name: "Lighting with the light behind the surface",
        test: function ()
        {
          let s = new ray.Sphere();
          let m = new ray.Material();
          let p = ray.Origin;
          let eye = ray.Vector(0, 0, -1);
          let normal = ray.Vector(0, 0, -1);
          let light = new ray.LightPoint(ray.Point(0, 0, 10), ray.RGBColour(1, 1, 1));
          let result = ray.Render.lighting(m, s, light, p, eye, normal);
          if (result.equals(ray.RGBColour(0.1, 0.1, 0.1)) == false) return false;
          return true;
        }
      };
    }

    static test6()
    {
      return {
        name: "Lighting with the surface in shadow",
        test: function ()
        {
          let s = new ray.Sphere();
          let m = new ray.Material();
          let p = ray.Origin;
          let eye = ray.Vector(0, 0, -1);
          let normal = ray.Vector(0, 0, -1);
          let light = new ray.LightPoint(ray.Point(0, 0, -10), ray.RGBColour(1, 1, 1));
          let result = ray.Render.lighting(m, s, light, p, eye, normal, true);
          if (result.equals(ray.RGBColour(0.1, 0.1, 0.1)) == false) return false;
          return true;
        }
      };
    }
    
    static test7()
    {
      return {
        name: "Check shading an intersection",
        test: function ()
        {
          ray.World.reset();
          ray.World.setToDefault();
          let r = ray.Ray(ray.Point(0, 0, -5), ray.Vector(0, 0, 1));
          let s = ray.World.objects[0];
          let i = new ray.Intersection(4, s);
          let comp = i.precompute(r);
          let c = ray.Render.getColourFor(comp);
          if (c.equals(ray.RGBColour(0.38066, 0.47583, 0.2855)) == false) return false;
          return true;
        }
      };
    }

    static test8()
    {
      return {
        name: "Check shading an intersection on the inside",
        test: function ()
        {
          ray.World.reset();
          ray.World.setToDefault();
          ray.World.lights[0] = new ray.LightPoint(ray.Point(0, 0.25, 0), ray.White);
          let r = ray.Ray(ray.Point(0, 0, 0), ray.Vector(0, 0, 1));
          let s = ray.World.objects[1];
          let i = new ray.Intersection(0.5, s);
          ray.World.options.shadowing = false;
          let comp = i.precompute(r);
          let c = ray.Render.getColourFor(comp);
          if (c.equals(ray.RGBColour(0.90498, 0.90498, 0.90498)) == false) return false;
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
          ray.World.reset();
          ray.World.setToDefault();
          let p = ray.Point(0, 10, 0);
          if (ray.Render.isShadowed(p, 0) == true) return false;
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
          ray.World.reset();
          ray.World.setToDefault();
          let p = ray.Point(10, -10, 10);
          if (ray.Render.isShadowed(p, 0) == 0) return false;
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
          ray.World.reset();
          ray.World.setToDefault();
          let p = ray.Point(-20, -20, -20);
          if (ray.Render.isShadowed(p, 0) == 1) return false;
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
          ray.World.reset();
          ray.World.setToDefault();
          let p = ray.Point(-2, 2, -2);
          if (ray.Render.isShadowed(p, 0) == 1) return false;
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
          ray.World.reset();
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
          ray.World.loadFromJSON(def);
          let r = ray.Ray(ray.Point(0, 0, 5), ray.Vector(0, 0, 1));
          let i = new ray.Intersection(4, ray.World.objects[0]);
          let comp = i.precompute(r);
          let c = ray.Render.getColourFor(comp);
          if (c.equals(ray.RGBColour(0.1, 0.1, 0.1)) == false) return false;
          return true;
        }
      };
    }

    static test14()
    {
      return {
        name: "Check reflected colour for reflective material",
        test: function ()
        {
          ray.World.reset();
          ray.World.setToDefault();
          let s = new ray.Plane();
          s.material = new ray.Material();
          s.material.reflective = 0.5;
          s.transform = ray.Matrix.translation(0, -1, 0);
          ray.World.objects.push(s);
          let r = ray.Ray(ray.Point(0, 0, -3), ray.Vector(0, -Math.sqrt(2) / 2, Math.sqrt(2) / 2));
          let i = new ray.Intersection(Math.sqrt(2), s);
          let comp = i.precompute(r);
          let c = ray.Render.getReflectionFor(comp);
          ray.lowrez();
          if (c.equals(ray.RGBColour(0.19032, 0.2379, 0.14274)) == false) return false;
          ray.hirez();
          return true;
        }
      };
    }

    static test15()
    {
      return {
        name: "Check reflected colour for nonreflective material",
        test: function ()
        {
          ray.World.reset();
          ray.World.setToDefault();
          let r = ray.Ray(ray.Point(0, 0, 0), ray.Vector(0, 0, 1));
          let s = ray.World.objects[1];
          s.material.ambient = 1;
          let i = new ray.Intersection(Math.sqrt(2), s);
          let comp = i.precompute(r);
          let c = ray.Render.getReflectionFor(comp);
          if (c.equals(ray.Black) == false) return false;
          return true;
        }
      };
    }

    static test16()
    {
      return {
        name: "Check getColourAt() with a reflective material",
        test: function ()
        {
          ray.World.reset();
          ray.World.setToDefault();
          let s = new ray.Plane();
          s.material = new ray.Material();
          s.material.reflective = 0.5;
          s.transform = ray.Matrix.translation(0, -1, 0);
          ray.World.objects.push(s);
          let r = ray.Ray(ray.Point(0, 0, -3), ray.Vector(0, -Math.sqrt(2) / 2, Math.sqrt(2) / 2));
          let i = new ray.Intersection(Math.sqrt(2), s);
          let comp = i.precompute(r);
          let c = ray.Render.getColourFor(comp);
          ray.lowrez();
          if (c.equals(ray.RGBColour(0.87677, 0.92436, 0.82918)) == false) return false;
          ray.hirez();
          return true;
        }
      };
    }

    static test17()
    {
      return {
        name: "Check getColourAt() with a mutually reflective surfaces",
        test: function ()
        {
          ray.World.reset();
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
          ray.World.loadFromJSON(def);
          let r = ray.Ray(ray.Point(0, 0, 0), ray.Vector(0, 1, 0));
          let c = ray.World.cast(r);
          return true;
        }
      };
    }

    static test18()
    {
      return {
        name: "Check getColourAt() with a reflective material has a call depth limit",
        test: function ()
        {
          ray.World.reset();
          ray.World.setToDefault();
          let s = new ray.Plane();
          s.material = new ray.Material();
          s.material.reflective = 0.5;
          s.transform = ray.Matrix.translation(0, -1, 0);
          ray.World.objects.push(s);
          let r = ray.Ray(ray.Point(0, 0, -3), ray.Vector(0, -Math.sqrt(2) / 2, Math.sqrt(2) / 2));
          let i = new ray.Intersection(Math.sqrt(2), s);
          let comp = i.precompute(r);
          let c = ray.Render.getReflectionFor(comp, 0);
          if (c.equals(ray.Black) == false) return false;
          return true;
        }
      };
    }

    static test19()
    {
      return {
        name: "Check refracted colour of opaque surface",
        test: function ()
        {
          ray.World.reset();
          ray.World.setToDefault();
          let s = ray.World.objects[0];
          let r = ray.Ray(ray.Point(0, 0, -5), ray.Vector(0, 0, 1));
          let points = new ray.Intersections();
          points.add(new ray.Intersection(4, s));
          points.add(new ray.Intersection(6, s));
          let comp = points.list[0].precompute(r, points);
          let c = ray.Render.getRefractionFor(comp, 5);
          if (c.equals(ray.Black) == false) return false;
          return true;
        }
      };
    }

    static test20()
    {
      return {
        name: "Check refracted colour at maximum recursion is black",
        test: function ()
        {
          ray.World.reset();
          ray.World.setToDefault();
          let s = ray.World.objects[0];
          s.material.transparency = 1.0;
          s.material.refraction = 1.5;
          let r = ray.Ray(ray.Point(0, 0, -5), ray.Vector(0, 0, 1));
          let points = new ray.Intersections();
          points.add(new ray.Intersection(4, s));
          points.add(new ray.Intersection(6, s));
          let comp = points.list[0].precompute(r, points);
          let c = ray.Render.getRefractionFor(comp, 0);
          if (c.equals(ray.Black) == false) return false;
          return true;
        }
      };
    }

    static test21()
    {
      return {
        name: "Check refracted colour at total internal refraction is black",
        test: function ()
        {
          ray.World.reset();
          ray.World.setToDefault();
          let s = ray.World.objects[0];
          s.material.transparency = 1.0;
          s.material.refraction = 1.5;
          let r = ray.Ray(ray.Point(0, 0, Math.sqrt(2) / 2), ray.Vector(0, 1, 0));
          let points = new ray.Intersections();
          points.add(new ray.Intersection(-Math.sqrt(2) / 2, s));
          points.add(new ray.Intersection(Math.sqrt(2) / 2, s));
          let comp = points.list[1].precompute(r, points);
          let c = ray.Render.getRefractionFor(comp, 5);
          if (c.equals(ray.Black) == false) return false;
          return true;
        }
      };
    }

    static test22()
    {
      return {

        name: "Check refracted colour is correct",
        test: function ()
        {
          ray.World.reset();
          ray.World.setToDefault();
          let A = ray.World.objects[0];
          A.material = new ray.Material();
          A.material.ambient = 1.0;
          A.material.pattern = new ray.PatternTest();
          let B = ray.World.objects[1];
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
          let c = ray.Render.getRefractionFor(comp, 5);
          ray.lowrez();
          if (c.equals(ray.RGBColour(0, 0.99888, 0.04725)) == false) return false;
          ray.hirez();
          return true;
        }
      };
    }

    static test23()
    {
      return {

        name: "Check casting computes refracted colour",
        test: function ()
        {
          ray.World.reset();
          ray.World.setToDefault();

          let floor = new ray.Plane();
          floor.setTransform(ray.Matrix.translation(0, -1, 0));
          floor.material = new ray.Material();
          floor.material.transparency = 0.5;
          floor.material.refraction = 1.5;
          ray.World.objects.push(floor);
          let ball = new ray.Sphere();
          ball.setTransform(ray.Matrix.translation(0, -3.5, -0.5));
          ball.material = new ray.Material();
          ball.material.colour = ray.RGBColour(1, 0, 0);
          ball.material.ambient = 0.5;
          ray.World.objects.push(ball);

          let r = ray.Ray(ray.Point(0, 0, -3), ray.Vector(0, -Math.sqrt(2) / 2, Math.sqrt(2) / 2));
          let points = new ray.Intersections();
          points.add(new ray.Intersection(Math.sqrt(2), floor));
          let comp = points.list[0].precompute(r, points);
          let c = ray.Render.getColourFor(comp, 5);
          ray.lowrez();
          if (c.equals(ray.RGBColour(0.93642, 0.68642, 0.68642)) == false) return false;
          ray.hirez();
          return true;
        }
      };
    }

    static test24()
    {
      return {

        name: "Check schlick value under total internal refelction",
        test: function ()
        {
          let s = new ray.GlassSphere();
          let r = ray.Ray(ray.Point(0, 0, Math.sqrt(2) / 2), ray.Vector(0, 1, 0));
          let points = ray.Intersections();
          points.add(ray.Intersection(-Math.sqrt(2) / 2, s));
          points.add(ray.Intersection(Math.sqrt(2) / 2, s));
          let comp = points.list[1].precompute(r, points);
          if (ray.Render.schlick(comp) != 1.0) return false;
          return true;
        }
      };
    }

    static test25()
    {
      return {
        name: "Check schlick value with a perpendicular view angle",
        test: function ()
        {
          let s = new ray.GlassSphere();
          let r = ray.Ray(ray.Point(0, 0, 0), ray.Vector(0, 1, 0));
          let points = ray.Intersections();
          points.add(ray.Intersection(-1, s));
          points.add(ray.Intersection(1, s));
          let comp = points.list[1].precompute(r, points);
          if (ray.isEqual(ray.Render.schlick(comp), 0.04) != true) return false;
          return true;
        }
      };
    }

    static test26()
    {
      return {
        name: "Check schlick value with a small angle",
        test: function ()
        {
          let s = new ray.GlassSphere();
          let r = ray.Ray(ray.Point(0, 0.99, -2), ray.Vector(0, 0, 1));
          let points = ray.Intersections();
          points.add(ray.Intersection(1.8589, s));
          let comp = points.list[0].precompute(r, points);
          if (ray.isEqual(ray.Render.schlick(comp), 0.48873) != true) return false;
          return true;
        }
      };
    }

    static test27()
    {
      return {

        name: "Check rendering reflective, transparent material",
        test: function ()
        {
          ray.World.reset();
          ray.World.setToDefault();

          let floor = new ray.Plane();
          floor.setTransform(ray.Matrix.translation(0, -1, 0));
          floor.material = new ray.Material();
          floor.material.reflective = 0.5;
          floor.material.transparency = 0.5;
          floor.material.refraction = 1.5;
          ray.World.objects.push(floor);
          let ball = new ray.Sphere();
          ball.setTransform(ray.Matrix.translation(0, -3.5, -0.5));
          ball.material = new ray.Material();
          ball.material.colour = ray.RGBColour(1, 0, 0);
          ball.material.ambient = 0.5;
          ray.World.objects.push(ball);

          let r = ray.Ray(ray.Point(0, 0, -3), ray.Vector(0, -Math.sqrt(2) / 2, Math.sqrt(2) / 2));
          let points = new ray.Intersections();
          points.add(new ray.Intersection(Math.sqrt(2), floor));
          let comp = points.list[0].precompute(r, points);
          let c = ray.Render.getColourFor(comp, 5);
          ray.lowrez();
          if (c.equals(ray.RGBColour(0.93391, 0.69643, 0.69243)) == false) return false;
          ray.hirez();
          return true;
        }
      };
    }
  }

  ray.classlist.push(rCanvas);
  ray.classlist.push(rRender);
  ray.Canvas = rCanvas;
  ray.Render = new rRender();
})();
