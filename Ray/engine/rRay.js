(function (){

  class rRay
  {
    constructor(o, d)
    {
      this.origin = o;
      this.direction = d;
//      if (o.isPoint == false) throw "origin not a point";
//      if (d.isVector == false) throw "direction not a vector";
      this.isRay = true;
    }

    position(len)
    {
      let ret = this.direction.copy();
      return ret.times(len).plus(this.origin);
    }

    transform(m)
    {
      return new rRay(m.times(this.origin), m.times(this.direction));      
    }

    // tests
    static test1()
    {
      return {
        name: "Check that ray ctor works",
        test: function ()
        {
          let o = new ray.Point(1, 2, 3);
          let d = new ray.Vector(4, 5, 6);
          let r = new rRay(o.copy(), d.copy());
          if (r.origin.equals(o) == false) return false;
          if (r.direction.equals(d) == false) return false;
          return true;
        }
      };
    }

    static test2()
    {
      return {
        name: "Check that rays calculate positions",
        test: function ()
        {
          let r = new rRay(new ray.Point(2, 3, 4), new ray.Vector(1, 0, 0));
          if (r.position(0).equals(new ray.Point(2, 3, 4)) == false) return false;
          if (r.position(1).equals(new ray.Point(3, 3, 4)) == false) return false;
          if (r.position(-1).equals(new ray.Point(1, 3, 4)) == false) return false;
          if (r.position(2.5).equals(new ray.Point(4.5, 3, 4)) == false) return false;
          return true;
        }
      };
    }

    static test3()
    {
      return {
        name: "Check that a ray interstects a sphere at two points",
        test: function ()
        {
          let r = new rRay(new ray.Point(0, 0, -5), new ray.Vector(0, 0, 1));
          let s = new rSphere();
          let points = s.intersect(r);
          if (points.num != 2) return false;
          if (points.list[0].length != 4.0) return false;
          if (points.list[1].length != 6.0) return false;
          return true;
        }
      };
    }

    static test4()
    {
      return {
        name: "Check that a ray can interstect a sphere at a tangent",
        test: function ()
        {
          let r = new rRay(new ray.Point(0, 1, -5), new ray.Vector(0, 0, 1));
          let s = new rSphere();
          let points = s.intersect(r);
          if (points.num != 2) return false;
          if (points.list[0].length != 5.0) return false;
          if (points.list[1].length != 5.0) return false;
          return true;
        }
      };
    }

    static test5()
    {
      return {
        name: "Check that a ray can miss a sphere",
        test: function ()
        {
          let r = new rRay(new ray.Point(0, 2, -5), new ray.Vector(0, 0, 1));
          let s = new rSphere();
          let points = s.intersect(r);
          if (points.num != 0) return false;
          return true;
        }
      };
    }

    static test6()
    {
      return {
        name: "Check that a ray can start inside a sphere",
        test: function ()
        {
          let r = new rRay(new ray.Point(0, 0, 0), new ray.Vector(0, 0, 1));
          let s = new rSphere();
          let points = s.intersect(r);
          if (points.num != 2) return false;
          if (points.list[0].length != -1.0) return false;
          if (points.list[1].length != 1.0) return false;
          return true;
        }
      };
    }

    static test7()
    {
      return {
        name: "Check that a sphere can be behind a ray",
        test: function ()
        {
          let r = new rRay(new ray.Point(0, 0, 5), new ray.Vector(0, 0, 1));
          let s = new rSphere();
          let points = s.intersect(r);
          if (points.num != 2) return false;
          if (points.list[0].length != -6.0) return false;
          if (points.list[1].length != -4.0) return false;
          return true;
        }
      };
    }

    static test8()
    {
      return {
        name: "Check that a ray can be translated",
        test: function ()
        {
          let r = new rRay(new ray.Point(1, 2, 3), new ray.Vector(0, 1, 0));
          let m = ray.Matrix.translation(3, 4, 5);
          let r2 = r.transform(m);
          if (r2.origin.equals(ray.Point(4, 6, 8)) == false) return false;
          if (r2.direction.equals(ray.Vector(0,1,0)) == false) return false;
          return true;
        }
      };
    }

    static test9()
    {
      return {
        name: "Check that a ray can be scaled",
        test: function ()
        {
          let r = new rRay(new ray.Point(1, 2, 3), new ray.Vector(0, 1, 0));
          let m = ray.Matrix.scale(2, 3, 4);
          let r2 = r.transform(m);
          if (r2.origin.equals(ray.Point(2,6,12)) == false) return false;
          if (r2.direction.equals(ray.Vector(0, 3, 0)) == false) return false;
          return true;
        }
      };
    }

    static test10()
    {
      return {
        name: "Check that a ray can be rotated",
        test: function ()
        {
          let r = new rRay(new ray.Point(1,2,3), new ray.Vector(0, 1, 0));
          let m = ray.Matrix.xRotation(Math.PI);
          let r2 = r.transform(m);
          if (r2.origin.equals(ray.Point(1,-2,-3)) == false) return false;
          if (r2.direction.equals(ray.Vector(0, -1, 0)) == false) return false;
          return true;
        }
      };
    }

    static test11()
    {
      return {
        name: "Check that a ray can intersect a scaled sphere",
        test: function ()
        {
          let r = new rRay(ray.Point(0, 0, -5), ray.Vector(0, 0, 1));
          let s = new rSphere();
          s.setTransform(ray.Matrix.scale(2, 2, 2));
          let points = s.intersect(r);
          if (points.num != 2) return false;
          if (points.list[0].length != 3) return false;
          if (points.list[1].length != 7) return false;
          return true;
        }
      };
    }

    static test12()
    {
      return {
        name: "Check that a ray can intersect a translated sphere",
        test: function ()
        {
          let r = new rRay(ray.Point(0, 0, -5), ray.Vector(0, 0, 1));
          let s = new rSphere();
          s.setTransform(ray.Matrix.translation(5, 0, 0));
          let points = s.intersect(r);
          if (points.num != 0) return false;
          return true;
        }
      };
    }

  }

  class rIntersection
  {
    constructor(len, obj)
    {
      this.length = len;
      this.object = obj;
//      if (obj.isObject == false) throw "obj is not an object";
      this.isIntersection = true;
    }

    precompute(r)
    {
      let ret = {};
      ret.length = this.length;
      ret.object = this.object;
      ret.point = r.position(ret.length);
      ret.normal = this.object.normalAt(ret.point);
      ret.eye = r.direction.copy().negate();
      if (ret.normal.dot(ret.eye) < 0)
      {
        ret.inside = true;
        ret.normal.negate();
      }
      else
        ret.inside = false;
      return ret;
    }

    // tests
    static test1()
    {
      return {
        name: "Check that intersection ctor works",
        test: function ()
        {
          let s = new rSphere();
          let i = new rIntersection(3.5, s);
          if (i.length != 3.5) return false;
          if (i.object.id != s.id) return false;
          return true;
        }
      };
    }

    static test2()
    {
      return {
        name: "Check that intersection values are precomputed",
        test: function ()
        {
          let r = new ray.Ray(ray.Point(0, 0, -5), ray.Vector(0, 0, 1));
          let s = new ray.Sphere();
          let i = new rIntersection(4, s);
          let comp = i.precompute(r);
          if (comp.length != i.length) return false;
          if (comp.point.equals(ray.Point(0,0,-1)) == false) return false;
          if (comp.eye.equals(ray.Vector(0,0,-1)) == false) return false;
          if (comp.normal.equals(ray.Vector(0, 0, -1)) == false) return false;
          if (comp.object.id != s.id) return false;
          return true;
        }
      };
    }

    static test3()
    {
      return {
        name: "Check that intersection can be on the outside",
        test: function ()
        {
          let r = new ray.Ray(ray.Point(0, 0, -5), ray.Vector(0, 0, 1));
          let s = new ray.Sphere();
          let i = new rIntersection(4, s);
          let comp = i.precompute(r);
          if (comp.inside != false) return false;
          return true;
        }
      };
    }

    static test4()
    {
      return {
        name: "Check that intersection can be on the inside",
        test: function ()
        {
          let r = new ray.Ray(ray.Point(0, 0, 0), ray.Vector(0, 0, 1));
          let s = new ray.Sphere();
          let i = new rIntersection(1, s);
          let comp = i.precompute(r);
          if (comp.inside != true) return false;
          if (comp.point.equals(ray.Point(0, 0, 1)) == false) return false;
          if (comp.eye.equals(ray.Vector(0, 0, -1)) == false) return false;
          if (comp.normal.equals(ray.Vector(0, 0, -1)) == false) return false;
          return true;
        }
      };
    }

  }

  class rIntersections
  {
    constructor()
    {
      this.list = new Array(20);
      this.max = 20;
      this.num = 0;
      this.sorted = false;
      this.isIntersections = true;
    }

    add(i)
    {
      if (i.isIntersection)
      {
        this.list[this.num++] = i;
        if (this.num == this.max)
        {
          this.max += 20;
          console.log("Hit the max!");
          this.list[this.max] = null;
        }
      }
      else if (i.isIntersections)
      {
        for (let x = 0; x < i.num; ++x)
        {
          this.list[this.num++] = i.list[x];
          if (this.num == this.max)
          {
            this.max += 20;
            console.log("Hit the max!");
            this.list[this.max] = null;
          }
        }
      }
      this.sorted = false;
    }

    sort()
    {
      if (this.sorted) return;
      this.list.sort(function (a, b) { return a.length - b.length; });
      this.sorted = true;
    }

    hit()
    {
      this.sort();
      for (let i = 0; i < this.num; ++i)
      {
        if (this.list[i].length >= 0) return this.list[i];
      }
      return null;
    }

    // tests
    static test1()
    {
      return {
        name: "Check that intersections aggregate intersection objects",
        test: function ()
        {
          let s = new rSphere();
          let i1 = new rIntersection(1, s);
          let i2 = new rIntersection(2, s);
          let points = new rIntersections();
          points.add(i1);
          points.add(i2);
          if (points.num != 2) return false;
          if (points.list[0].length != 1) return false;
          if (points.list[1].length != 2) return false;
          return true;
        }
      };
    }

    static test2()
    {
      return {
        name: "Check for the hit, when all intersections are positive",
        test: function ()
        {
          let s = new rSphere();
          let i1 = new rIntersection(1, s);
          let i2 = new rIntersection(2, s);
          let points = new rIntersections();
          points.add(i1);
          points.add(i2);
          if (points.hit().length != 1) return false;
          return true;
        }
      };
    }

    static test3()
    {
      return {
        name: "Check for the hit, when some intersections are negative",
        test: function ()
        {
          let s = new rSphere();
          let i1 = new rIntersection(-1, s);
          let i2 = new rIntersection(1, s);
          let points = new rIntersections();
          points.add(i1);
          points.add(i2);
          if (points.hit().length != 1) return false;
          return true;
        }
      };
    }
    static test4()
    {
      return {
        name: "Check for the hit, when all intersections are negative",
        test: function ()
        {
          let s = new rSphere();
          let i1 = new rIntersection(-2, s);
          let i2 = new rIntersection(-1, s);
          let points = new rIntersections();
          points.add(i1);
          points.add(i2);
          if (points.hit() != null) return false;
          return true;
        }
      };
    }

    static test5()
    {
      return {
        name: "Check for the hit being the lowest non negative intersection",
        test: function ()
        {
          let s = new rSphere();
          let i1 = new rIntersection(5, s);
          let i2 = new rIntersection(7, s);
          let i3 = new rIntersection(-3, s);
          let i4 = new rIntersection(2, s);
          let points = new rIntersections();
          points.add(i1);
          points.add(i2);
          points.add(i3);
          points.add(i4);
          if (points.hit().length != 2) return false;
          return true;
        }
      };
    }

  }

  class rSphere
  {
    constructor()
    {
      this.id = ray.getUUID();
      this.isObject = true;
      this.radius = 1;
      this.origin = new ray.Point(0, 0, 0);
      this.transform = ray.Identity4x4;
      this.material = new ray.Material();

      this.inverse = null;
      this.transpose = null

      this.dirty = true;
    }

    fromJSON(def)
    {
      if (def.material && ray.World.materials[def.material]) this.material = ray.World.materials[def.material];
      if (def.transform && ray.World.transforms[def.transform]) this.transform = ray.World.transforms[def.transform];
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

      let normal = this.inverse.times(p).minus(ray.Origin);
      let wNormal = this.transpose.times(normal);
      wNormal.w = 0;
      return wNormal.normalize();
    }

    clean()
    {
      this.dirty = false;
      this.inverse = ray.Matrix.inverse(this.transform);
      this.transpose = ray.Matrix.transpose(this.inverse);
    }

    intersect(r)
    {
      if (this.dirty) this.clean();

      let ret = new rIntersections();
      let r2 = r.transform(this.inverse);

      let sphereToRay = ray.Touple.subtract(r2.origin, this.origin);
      let a = r2.direction.dot(r2.direction);
      let b = 2.0 * r2.direction.dot(sphereToRay);
      let c = sphereToRay.dot(sphereToRay) - this.radius;
      let aa = a + a;
      let discr = b * b - 2.0 * aa * c;
      if (discr < 0) return ret;

      let rootDiscr = Math.sqrt(discr);
      ret.add(new rIntersection((-b - rootDiscr) / aa, this));;
      ret.add(new rIntersection((-b + rootDiscr) / aa, this));;
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
          let r = new ray.Ray(ray.Point(0, 0, -5), ray.Vector(0, 0, 1));
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
        name: "Check that spheres have a transform",
        test: function ()
        {
          let s = new rSphere();
          if (s.transform.equals(ray.Identity4x4) == false) return false;
          return true;
        }
      };
    }

    static test3()
    {
      return {
        name: "Check that transform can be set on sphere",
        test: function ()
        {
          let s = new rSphere();
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
        name: "Check normals on a translated sphere",
        test: function ()
        {
          let s = new rSphere();
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
          let s = new rSphere();
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
        name: "Check sphere has a material",
        test: function ()
        {
          let s = new rSphere();
          let m = s.material;
          if (m.equals(new ray.Material()) == false) return false;
          return true;
        }
      };
    }

    static test12()
    {
      return {
        name: "Check sphere can be assigned a material",
        test: function ()
        {
          let s = new rSphere();
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

  ray.classlist.push(rRay);
  ray.classlist.push(rSphere);
  ray.classlist.push(rIntersection);
  ray.classlist.push(rIntersections);
  ray.Ray = rRay;
  ray.Sphere = rSphere;
  ray.Intersection = rIntersection;
  ray.Intersections = rIntersections;

})();
