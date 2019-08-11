(function (){

  class rShape
  {
    constructor()
    {
      this.id = ray.getUUID();
      this.isObject = true;
      this.transform = ray.Identity4x4;
      this.material = new ray.Material();

      this.inverse = null;
      this.transpose = null

      this.dirty = true;
    }

    clean()
    {
      this.dirty = false;
      this.inverse = ray.Matrix.inverse(this.transform);
      this.transpose = ray.Matrix.transpose(this.inverse);
    }

    setTransform(t)
    {
      this.transform = t;
      this.transpose = null
      this.inverse = null;
      this.dirty = true;
    }

    normalAt(p)
    {
      if (this.dirty) this.clean();

      let normal = this.local_normalAt(this.inverse.times(p));
      let wNormal = this.transpose.times(normal);
      wNormal.w = 0;
      return wNormal.normalize();
    }

    intersect(r)
    {
      if (this.dirty) this.clean();
      let r2 = r.transform(this.inverse);
      return this.local_intersect(r2);
    }

    fromJSON(def)
    {
      if (def.material && ray.World.materials[def.material]) this.material = ray.World.materials[def.material];
      if (def.transform && ray.World.transforms[def.transform]) { this.transform = ray.World.transforms[def.transform]; this.dirty = true; }
    }
  }

  class rTestShape extends rShape
  {
    constructor()
    {
      super();
    }

    local_normalAt(p)
    {
      return ray.Vector(p.x, p.y, p.z);
    }

    local_intersect(r)
    {
      this.savedRay = r;
    }
  }

  class rPlane extends rShape
  {
    constructor()
    {
      super();
      this.normal = new ray.Vector(0, 1, 0);
    }

    fromJSON(def)
    {
      super.fromJSON(def);
      if (def.xMin != null) { this.limits = true; this.xMin = def.xMin; }
      if (def.xMax != null) { this.limits = true; this.xMax = def.xMax; }
      if (def.yMin != null) { this.limits = true; this.yMin = def.yMin; }
      if (def.yMax != null) { this.limits = true; this.yMax = def.yMax; }
    }

    local_normalAt(p)
    {
      return this.normal.copy();
    }

    local_intersect(r)
    {
      let ret = new ray.Intersections();
      if (Math.abs(r.direction.y) < ray.epsilon) return ret;

      let d = (-r.origin.y / r.direction.y);
      if (this.limits)
      {
        let p = r.position(d);
        if (this.xMax != null && p.x > this.xMax) return ret;
        if (this.xMin != null && p.x < this.xMin) return ret;
        if (this.yMax != null && p.z > this.yMax) return ret;
        if (this.yMin != null && p.z < this.yMin) return ret;
      }
      ret.add(new ray.Intersection(d, this));;
      return ret;
    }

    static test1()
    {
      return {
        name: "Check that a plane's normal is constant",
        test: function ()
        {
          let s = new rPlane();
          let n1 = s.local_normalAt(ray.Point(0, 0, 0));
          let n2 = s.local_normalAt(ray.Point(10, 0, -10));
          let n3 = s.local_normalAt(ray.Point(-5, 0, 150));
          if (n1.equals(ray.Vector(0, 1, 0)) == false) return false;
          if (n2.equals(ray.Vector(0, 1, 0)) == false) return false;
          if (n3.equals(ray.Vector(0, 1, 0)) == false) return false;
          return true;
        }
      };
    }

    static test2()
    {
      return {
        name: "Check intersecting a ray parallel to a plane",
        test: function ()
        {
          let s = new rPlane();
          let r = ray.Ray(ray.Point(0, 10, 0), ray.Vector(0, 0, 1));
          let points = s.local_intersect(r);
          if (points.num > 0) return false;
          return true;
        }
      };
    }

    static test3()
    {
      return {
        name: "Check intersecting a ray coplanar to a plane",
        test: function ()
        {
          let s = new rPlane();
          let r = ray.Ray(ray.Point(0, 0, 0), ray.Vector(0, 0, 1));
          let points = s.local_intersect(r);
          if (points.num > 0) return false;
          return true;
        }
      };
    }

    static test4()
    {
      return {
        name: "Check a ray intersecting a plane from above",
        test: function ()
        {
          let s = new rPlane();
          let r = ray.Ray(ray.Point(0, 1, 0), ray.Vector(0, -1, 0));
          let points = s.local_intersect(r);
          if (points.num != 1) return false;
          if (points.list[0].length != 1) return false;
          if (points.list[0].object.id != s.id) return false;
          return true;
        }
      };
    }

    static test5()
    {
      return {
        name: "Check a ray intersecting a plane from below",
        test: function ()
        {
          let s = new rPlane();
          let r = ray.Ray(ray.Point(0, -1, 0), ray.Vector(0, 1, 0));
          let points = s.local_intersect(r);
          if (points.num != 1) return false;
          if (points.list[0].length != 1) return false;
          if (points.list[0].object.id != s.id) return false;
          return true;
        }
      };
    }

  }

  class rSphere extends rShape
  {
    constructor()
    {
      super();
      this.isSphere = true;
    }

    fromJSON(def)
    {
      super.fromJSON(def);
    }

    local_normalAt(p)
    {
      return p.minus(ray.Origin);
    }

    local_intersect(r)
    {
      let ret = new ray.Intersections();

      let sphereToRay = ray.Touple.subtract(r.origin, ray.Origin);
      let a = r.direction.dot(r.direction);
      let b = 2.0 * r.direction.dot(sphereToRay);
      let c = sphereToRay.dot(sphereToRay) - 1;
      let aa = a + a;
      let discr = b * b - 2.0 * aa * c;
      if (discr < 0) return ret;

      let rootDiscr = Math.sqrt(discr);
      ret.add(new ray.Intersection((-b - rootDiscr) / aa, this));;
      ret.add(new ray.Intersection((-b + rootDiscr) / aa, this));;
      return ret;
    }

    // tests
    static test1()
    {
      return {
        name: "Check that intersect sets the object",
        test: function ()
        {
          let s = new rSphere();
          let r = ray.Ray(ray.Point(0, 0, -5), ray.Vector(0, 0, 1));
          let points = s.intersect(r);
          if (points.num != 2) return false;
          if (points.list[0].object.id != s.id) return false;
          if (points.list[1].object.id != s.id) return false;
          return true;
        }
      };
    }

    static test2()
    {
      return {
        name: "Check that shapes have a transform",
        test: function ()
        {
          let s = new rTestShape();
          if (s.transform.equals(ray.Identity4x4) == false) return false;
          return true;
        }
      };
    }

    static test3()
    {
      return {
        name: "Check that transform can be set on shapes",
        test: function ()
        {
          let s = new rTestShape();
          let t = ray.Matrix.translation(2, 3, 4);
          s.setTransform(t);
          if (s.transform.equals(t) == false) return false;
          return true;
        }
      };
    }

    static test4()
    {
      return {
        name: "Check normals on a sphere on X",
        test: function ()
        {
          let s = new rSphere();
          let n = s.normalAt(ray.Point(1, 0, 0));
          if (n.equals(ray.Vector(1, 0, 0)) == false) return false;
          return true;
        }
      };
    }

    static test5()
    {
      return {
        name: "Check normals on a sphere on Y",
        test: function ()
        {
          let s = new rSphere();
          let n = s.normalAt(ray.Point(0, 1, 0));
          if (n.equals(ray.Vector(0, 1, 0)) == false) return false;
          return true;
        }
      };
    }

    static test6()
    {
      return {
        name: "Check normals on a sphere on Z",
        test: function ()
        {
          let s = new rSphere();
          let n = s.normalAt(ray.Point(0, 0, 1));
          if (n.equals(ray.Vector(0, 0, 1)) == false) return false;
          return true;
        }
      };
    }

    static test7()
    {
      return {
        name: "Check normals on a sphere",
        test: function ()
        {
          let num = Math.sqrt(3.0) / 3.0;
          let s = new rSphere();
          let n = s.normalAt(ray.Point(num,num,num));
          if (n.equals(ray.Vector(num, num, num)) == false) return false;
          return true;
        }
      };
    }

    static test8()
    {
      return {
        name: "Check normals on a sphere are normal",
        test: function ()
        {
          let num = Math.sqrt(3.0) / 3.0;
          let s = new rSphere();
          let n = s.normalAt(ray.Point(num, num, num));
          if (n.equals(ray.Touple.normalize(n)) == false) return false;
          return true;
        }
      };
    }

    static test9()
    {
      return {
        name: "Check normals on a translated shape",
        test: function ()
        {
          let s = new rTestShape();
          s.setTransform(ray.Matrix.translation(0, 1, 0));
          let n = s.normalAt(ray.Point(0, 1.70711, -0.70711));
          if (n.equals(ray.Vector(0, 0.70711, -0.70711)) == false) return false;
          return true;
        }
      };
    }

    static test10()
    {
      return {
        name: "Check normals on a transformed sphere",
        test: function ()
        {
          let num = Math.sqrt(2.0) / 2.0;
          let s = new rTestShape();
          s.setTransform(ray.Matrix.multiply(ray.Matrix.scale(1, 0.5, 1), ray.Matrix.zRotation(Math.PI / 5.0)));
          let n = s.normalAt(ray.Point(0, num, -num));
          if (n.equals(ray.Vector(0, 0.97014, -0.24254)) == false) return false;
          return true;
        }
      };
    }

    static test11()
    {
      return {
        name: "Check shape has a material",
        test: function ()
        {
          let s = new rTestShape();
          let m = s.material;
          if (m.equals(new ray.Material()) == false) return false;
          return true;
        }
      };
    }

    static test12()
    {
      return {
        name: "Check shape can be assigned a material",
        test: function ()
        {
          let s = new rTestShape();
          let m = new ray.Material();
          m.ambient = 1.0;
          s.material = m;
          if (s.material.ambient != 1.0) return false;
          return true;
        }
      };
    }

  }

  function generateUUID()
  { 
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function')
    {
      d += performance.now(); //use high-precision timer if available
    }
    return d;
  }

  ray.getUUID = generateUUID;

  ray.classlist.push(rSphere);
  ray.classlist.push(rPlane);
  ray.Plane = rPlane;
  ray.Sphere = rSphere;
  ray.TestShape = rTestShape;

})();
