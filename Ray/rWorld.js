(function (){

  class rWorld
  {
    constructor()
    {
      this.objects = [];
      this.lights = [];
    }

    setToDefalt()
    {
      this.objects = [];
      this.lights = [];
      this.lights.push(new ray.LightPoint(ray.Point(-10, 10, -10), new ray.Colour(1, 1, 1)));

      let sphere1 = new ray.Sphere();
      let m = new ray.Material();
      m.colour = new ray.Colour(0.8, 1.0, 0.6);
      m.diffuse = 0.7;
      m.specular = 0.2;
      sphere1.material = m;
      this.objects.push(sphere1);

      let sphere2 = new ray.Sphere();
      sphere2.setTransform(ray.Matrix.scale(0.5, 0.5, 0.5));
      this.objects.push(sphere2);
    }

    intersect(r)
    {
      let ret = new ray.Intersections();
      for (let i = 0; i < this.objects.length; ++i)
      {
        // TODO intersect lights
        ret.add(this.objects[i].intersect(r));
      }
      ret.sort();
      return ret;
    }

    getColourFor(comp)
    {
      let colour = ray.Render.lighting(comp.object.material, this.lights[0], comp.point, comp.eye, comp.normal);
      for (let l = 1; l < this.lights.length; ++l)
      {
        colour.plus(ray.Render.lighting(comp.object.material, this.lights[1], comp.point, comp.eye, comp.normal));
      }
      return colour;
    }

    cast(r)
    {
      let points = this.intersect(r);
      let hit = points.hit();
      if (!hit) return ray.Black;
      let comp = hit.precompute(r);
      return this.getColourFor(comp);
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
          w.setToDefalt();
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
          w.setToDefalt();
          let r = new ray.Ray(ray.Point(0, 0, -5), ray.Vector(0, 0, 1));
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
          w.setToDefalt();
          let r = new ray.Ray(ray.Point(0, 0, -5), ray.Vector(0, 0, 1));
          let s = w.objects[0];
          let i = new ray.Intersection(4, s);
          let comp = i.precompute(r);
          let c = w.getColourFor(comp);
          if (c.equals(new ray.Colour(0.38066, 0.47583, 0.2855)) == false) return false;
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
          w.setToDefalt();
          w.lights[0] = new ray.LightPoint(ray.Point(0, 0.25, 0), ray.White);
          let r = new ray.Ray(ray.Point(0, 0, 0), ray.Vector(0, 0, 1));
          let s = w.objects[1];
          let i = new ray.Intersection(0.5, s);
          let comp = i.precompute(r);
          let c = w.getColourFor(comp);
          if (c.equals(new ray.Colour(0.90498, 0.90498, 0.90498)) == false) return false;
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
          w.setToDefalt();
          let r = new ray.Ray(ray.Point(0, 0, -5), ray.Vector(0, 1, 0));
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
          w.setToDefalt();
          let r = new ray.Ray(ray.Point(0, 0, -5), ray.Vector(0, 0, 1));
          let c = w.cast(r);
          if (c.equals(new ray.Colour(0.38066, 0.47583, 0.2855)) == false) return false;
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
          w.setToDefalt();
          w.objects[0].material.ambient = 1;
          w.objects[1].material.ambient = 1;
          let r = new ray.Ray(ray.Point(0, 0, 0.75), ray.Vector(0, 0, -1));
          let c = w.cast(r);
          if (c.equals(w.objects[1].material.colour) == false) return false;
          return true;
        }
      };
    }

  }

  ray.classlist.push(rWorld);
  ray.World = rWorld;

})();
