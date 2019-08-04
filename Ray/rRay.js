(function (){

  class rRay
  {
    constructor(o, d)
    {
      this.origin = o;
      this.direction = d;
      if (o.isPoint == false) throw "origin not a point";
      if (d.isVector == false) throw "direction not a vector";
      this.isRay = true;
    }

    position(len)
    {
      let ret = this.direction.copy();
      return ret.times(len).plus(this.origin);
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
          if (points.length != 2) return false;
          if (points[0] != 4.0) return false;
          if (points[1] != 6.0) return false;
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
          if (points.length != 2) return false;
          if (points[0] != 5.0) return false;
          if (points[1] != 5.0) return false;
          return true;
        }
      };
    }

    static test5()
    {
      return {
        name: "Check that a ray ca nmiss a sphere",
        test: function ()
        {
          let r = new rRay(new ray.Point(0, 2, -5), new ray.Vector(0, 0, 1));
          let s = new rSphere();
          let points = s.intersect(r);
          if (points.length != 0) return false;
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
          if (points.length != 2) return false;
          if (points[0] != -1.0) return false;
          if (points[1] != 1.0) return false;
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
          if (points.length != 2) return false;
          if (points[0] != -6.0) return false;
          if (points[1] != -4.0) return false;
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
      if (obj.isObject == false) throw "obj is not an object";
      this.isIntersection = true;
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
  }

  class rSphere
  {
    constructor()
    {
      this.id = ray.getUUID();
      this.isObject = true;
      this.radius = 1;
      this.origin = new ray.Point(0, 0, 0);
    }

    intersect(r)
    {
      let ret = [0, 0];

      let sphereToRay = ray.Touple.subtract(r.origin, this.origin);
      let a = r.direction.dot(r.direction);
      let b = 2.0 * r.direction.dot(sphereToRay);
      let c = sphereToRay.dot(sphereToRay) - 1;
      let aa = a + a;
      let discr = b * b - 2.0 * aa * c;
      if (discr < 0) return [];

      let rootDiscr = Math.sqrt(discr);
      ret[0] = (-b - rootDiscr) / aa;
      ret[1] = (-b + rootDiscr) / aa;
      return ret;
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
  ray.Ray = rRay;
  ray.Sphere = rSphere;
  ray.Intersection = rIntersection;

})();
