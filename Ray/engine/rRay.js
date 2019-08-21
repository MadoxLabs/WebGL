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
      return ray.Ray(m.times(this.origin), m.times(this.direction));      
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
          let s = new ray.Sphere();
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
          let s = new ray.Sphere();
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
          let s = new ray.Sphere();
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
          let s = new ray.Sphere();
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
          let s = new ray.Sphere();
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
        name: "Check that a ray can intersect a scaled shape",
        test: function ()
        {
          let r = new rRay(ray.Point(0, 0, -5), ray.Vector(0, 0, 1));
          let s = new ray.TestShape();
          s.setTransform(ray.Matrix.scale(2, 2, 2));
          let points = s.intersect(r);
          if (s.savedRay.origin.equals(ray.Point(0, 0, -2.5)) == false) return false;
          if (s.savedRay.direction.equals(ray.Vector(0, 0, 0.5)) == false) return false;
          return true;
        }
      };
    }

    static test12()
    {
      return {
        name: "Check that a ray can intersect a translated shape",
        test: function ()
        {
          let r = new rRay(ray.Point(0, 0, -5), ray.Vector(0, 0, 1));
          let s = new ray.TestShape();
          s.setTransform(ray.Matrix.translation(5, 0, 0));
          let points = s.intersect(r);
          if (s.savedRay.origin.equals(ray.Point(-5, 0, -5)) == false) return false;
          if (s.savedRay.direction.equals(ray.Vector(0, 0, 1)) == false) return false;
          return true;
        }
      };
    }

    static test13()
    {
      return {
        name: "Check that we can compute refraction angles",
        test: function ()
        {
          let A = new ray.GlassSphere();
          A.material.refraction = 1.5;
          A.transform = ray.Matrix.scale(2, 2, 2);
          let B = new ray.GlassSphere();
          B.transform = ray.Matrix.translation(0,0,-0.25);
          B.material.refraction = 2.0;
          let C = new ray.GlassSphere();
          C.transform = ray.Matrix.translation(0, 0, 0.25);
          C.material.refraction = 2.5;
          let r = ray.Ray(ray.Point(0, 0, -4), ray.Vector(0, 0, 1));
          let points = new ray.Intersections();
          points.add(new ray.Intersection(2, A));
          points.add(new ray.Intersection(2.75, B));
          points.add(new ray.Intersection(3.25, C));
          points.add(new ray.Intersection(4.75, B));
          points.add(new ray.Intersection(5.25, C));
          points.add(new ray.Intersection(6, A));

          let n1s = [1.0, 1.5, 2.0, 2.5, 2.5, 1.5];
          let n2s = [1.5, 2.0, 2.5, 2.5, 1.5, 1.0];
          for (let i = 0; i < 6; ++i)
          {
            let comp = points.list[i].precompute(r, points);
            if (comp.n1 != n1s[i]) return false;
            if (comp.n2 != n2s[i]) return false;
          }
          return true;
        }
      };
    }

  }

  class rIntersection
  {
    constructor(len, obj)
    {
      this.id = ray.getUUID();
      this.length = len;
      this.object = obj;
//      if (obj.isObject == false) throw "obj is not an object";
      this.isIntersection = true;
    }

    precompute(r, points)
    {
      if (!points) points = { num: 1, list: [this] };

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
      let scaleNormal = ret.normal.copy().times(ray.epsilon);
      ret.reflect = ray.Touple.reflect(r.direction, ret.normal);
      ret.overPoint = ret.point.copy().plus(scaleNormal);
      ret.underPoint = ret.point.copy().minus(scaleNormal);

      let containers = [];
      let included = {};
      for (let i = 0; i < points.num; ++i)
      {
        let p = points.list[i];
        if (p.id == this.id)
        {
          if (containers.length == 0) ret.n1 = 1.0;
          else ret.n1 = containers[containers.length - 1].material.refraction;
        }
        if (included[p.object.id])
        {
          for (let j = 0; j < containers.length; ++j)
          {
            if (containers[j].id == p.object.id) 
            {
              containers.splice(j, 1);
              break;
            }
          }
          included[p.object.id] = false;
        }
        else
        {
          containers.push(p.object);
          included[p.object.id] = true;
        }
        if (p.id == this.id)
        {
          if (containers.length == 0) ret.n2 = 1.0;
          else ret.n2 = containers[containers.length - 1].material.refraction;
          break;
        }
      }

      return ret;
    }

    // tests
    static test1()
    {
      return {
        name: "Check that intersection ctor works",
        test: function ()
        {
          let s = new ray.Sphere();
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
          let r = ray.Ray(ray.Point(0, 0, -5), ray.Vector(0, 0, 1));
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
          let r = ray.Ray(ray.Point(0, 0, -5), ray.Vector(0, 0, 1));
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
          let r = ray.Ray(ray.Point(0, 0, 0), ray.Vector(0, 0, 1));
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

    static test5()
    {
      return {
        name: "Check that the hit point is offset",
        test: function ()
        {
          let r = ray.Ray(ray.Point(0, 0, -5), ray.Vector(0, 0, 1));
          let s = new ray.Sphere();
          s.transform = ray.Matrix.translation(0, 0, 1);
          let i = new rIntersection(5, s);
          let comp = i.precompute(r);
          if (comp.overPoint.z >= ray.epsilon / 2) return false;
          if (comp.point.z <= comp.overPoint.z) return false;
          return true;
        }
      };
    }

    static test6()
    {
      return {
        name: "Check that we precompute the reflect vector",
        test: function ()
        {
          let s = new ray.Plane();
          let r = ray.Ray(ray.Point(0, 1, -1), ray.Vector(0, -Math.sqrt(2) / 2, Math.sqrt(2) / 2));
          let i = new rIntersection(Math.sqrt(2), s);
          let comp = i.precompute(r);
          if (comp.reflect.equals(ray.Vector(0, Math.sqrt(2) / 2, Math.sqrt(2) / 2)) == false) return false;
          return true;
        }
      };
    }

    static test7()
    {
      return {
        name: "Check that we precompute the underpoint",
        test: function ()
        {
          let s = new ray.GlassSphere();
          s.transform = ray.Matrix.translation(0, 0, 1);
          let r = ray.Ray(ray.Point(0, 0, -5), ray.Vector(0, 0, 1));
          let i = new rIntersection(5, s);
          let points = new rIntersections();
          points.add(i);
          let comp = i.precompute(r, points);
          if (comp.underPoint.z < ray.epsilon / 2) return false;
          if (comp.point.z >= comp.underPoint.z) return false;
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
      if (this.num > 1)
      {
        ray.timsort(this.list, function (a, b)
        {
          return a.length - b.length;
        }, 0, this.num);
      }
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

    hitSkipNoShadow()
    {
      this.sort();
      for (let i = 0; i < this.num; ++i)
      {
        if (this.list[i].length >= 0 && this.list[i].object.shadow) return this.list[i];
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
          let s = new ray.Sphere();
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
          let s = new ray.Sphere();
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
          let s = new ray.Sphere();
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
          let s = new ray.Sphere();
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
          let s = new ray.Sphere();
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

  class RayPool
  {
    constructor()
    {
      this.num = 100;
      this.pool = new Array(100);
      this.next = 0;
      for (let i = 0; i < this.num; ++i) this.pool[i] = new rRay(null, null);
    }

    getRay(o, d)
    {
      let ret = this.pool[this.next++];
      if (this.next >= this.num) this.next = 0;
      ret.origin = o;
      ret.direction = d;
      return ret;
    }
  }

  var pool = new RayPool();
  function makeRay(o, d)
  {
    if (ray.usePool) return pool.getRay(o, d);
    return new rRay(o, d);
  }

  ray.classlist.push(rRay);
  ray.classlist.push(rIntersection);
  ray.classlist.push(rIntersections);
  ray.Ray = function (o, d) { return makeRay(o, d); }
  ray.Intersection = rIntersection;
  ray.Intersections = rIntersections;

})();
