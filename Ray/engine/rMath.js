(function (){

  class rTouple
  {
    constructor(x,y,z,w)
    {
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
      this.isTouple = true;
    }

    copy()
    {
      return makeTouple(this.x, this.y, this.z, this.w);
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
      if (!ray.isEqual(this.x, t.x)) return false;
      if (!ray.isEqual(this.y, t.y)) return false;
      if (!ray.isEqual(this.z, t.z)) return false;
      if (!ray.isEqual(this.w, t.w)) return false;
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
      return makeTouple(v.y * t.z - v.z * t.y,
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
      return makeTouple(t1.x + t2.x, t1.y + t2.y, t1.z + t2.z, t1.w + t2.w);
    }

    static subtract(t1, t2)
    {
      let ret = makeTouple(t1.x, t1.y, t1.z, t1.w);
      if (ret == undefined)
      {
        let ret = makeTouple(t1.x, t1.y, t1.z, t1.w);
      }
      return ret.minus(t2);
    }

    static negate(t1)
    {
      let ret = makeTouple(t1.x, t1.y, t1.z, t1.w);
      return ret.negate();
    }

    static multiply(t1, s)
    {
      let ret = makeTouple(t1.x, t1.y, t1.z, t1.w);
      return ret.times(s);
    }

    static normalize(t1)
    {
      let ret = makeTouple(t1.x, t1.y, t1.z, t1.w);
      return ret.normalize();
    }

    // tests
    static test1()
    {
      return {
        name: "Check that point touples work",
        test: function ()
        {
        let t = new ray.Touple(4.3, -4.2, 3.1, 1.0);
        if (t.x != 4.3) return false;
        if (t.y != -4.2) return false;
        if (t.z != 3.1) return false;
        if (t.w != 1.0) return false;
        if (t.isPoint() != true) return false;
        if (t.isVector() != false) return false;
        return true;
      }};
    }

    static test2()
    {
      return {
        name: "Check that vector touples work",
        test: function ()
        {
        let t = new ray.Touple(4.3, -4.2, 3.1, 0.0);
        if (t.x != 4.3) return false;
        if (t.y != -4.2) return false;
        if (t.z != 3.1) return false;
        if (t.w != 0.0) return false;
        if (t.isPoint() != false) return false;
        if (t.isVector() != true) return false;
        return true;
      }};
    }

    static test3()
    {
      return {
        name: "Check that vector ctor works",
        test: function ()
        {
        let t = new ray.Vector(4.3, -4.2, 3.1);
        if (t.x != 4.3) return false;
        if (t.y != -4.2) return false;
        if (t.z != 3.1) return false;
        if (t.w != 0.0) return false;
        if (t.isPoint() != false) return false;
        if (t.isVector() != true) return false;
        return true;
      }};
    }

    static test4()
    {
      return {
        name: "Check that point ctor works",
        test: function ()
        {
        let t = new ray.Point(4.3, -4.2, 3.1);
        if (t.x != 4.3) return false;
        if (t.y != -4.2) return false;
        if (t.z != 3.1) return false;
        if (t.w != 1.0) return false;
        if (t.isPoint() != true) return false;
        if (t.isVector() != false) return false;
        return true;
      }};
    }

    static test5()
    {
      return {
        name: "Check that adding touples works",
        test: function ()
        {
        let t1 = new ray.Touple(4, -4, 3, 1);
        let t2 = new ray.Touple(-1, 2, 4, 0);
        let t3 = ray.Touple.add(t1,t2);
        t1.plus(t2);
        if (t3.x != 3) return false;
        if (t3.y != -2) return false;
        if (t3.z != 7) return false;
        if (t3.w != 1.0) return false;
        if (t3.isPoint() != true) return false;
        if (t3.isVector() != false) return false;
        if (t1.x != 3) return false;
        if (t1.y != -2) return false;
        if (t1.z != 7) return false;
        if (t1.w != 1.0) return false;
        if (t1.isPoint() != true) return false;
        if (t1.isVector() != false) return false;
        return true;
      }};
    }

    static test6()
    {
      return {
        name: "Check that subtracting points gives a vector",
        test: function ()
        {
          let t1 = new ray.Point(3, 2, 1);
          let t2 = new ray.Point(5, 6, 7);
          let t3 = ray.Touple.subtract(t1, t2);
          t1.minus(t2);
          if (t3.x != -2) return false;
          if (t3.y != -4) return false;
          if (t3.z != -6) return false;
          if (t3.isVector() != true) return false;
          if (t1.x != -2) return false;
          if (t1.y != -4) return false;
          if (t1.z != -6) return false;
          if (t1.isVector() != true) return false;
          return true;
        }
      };
    }

    static test7()
    {
      return {
        name: "Check that subtracting vector from a point gives a point",
        test: function ()
        {
          let t1 = new ray.Point(3, 2, 1);
          let t2 = new ray.Vector(5, 6, 7);
          let t3 = ray.Touple.subtract(t1, t2);
          t1.minus(t2);
          if (t3.x != -2) return false;
          if (t3.y != -4) return false;
          if (t3.z != -6) return false;
          if (t3.isPoint() != true) return false;
          if (t1.x != -2) return false;
          if (t1.y != -4) return false;
          if (t1.z != -6) return false;
          if (t1.isPoint() != true) return false;
          return true;
        }
      };
    }

    static test8()
    {
      return {
        name: "Check that subtracting vectors gives a vector",
        test: function ()
        {
          let t1 = new ray.Vector(3, 2, 1);
          let t2 = new ray.Vector(5, 6, 7);
          let t3 = ray.Touple.subtract(t1, t2);
          t1.minus(t2);
          if (t3.x != -2) return false;
          if (t3.y != -4) return false;
          if (t3.z != -6) return false;
          if (t3.isVector() != true) return false;
          if (t1.x != -2) return false;
          if (t1.y != -4) return false;
          if (t1.z != -6) return false;
          if (t1.isVector() != true) return false;
          return true;
        }
      };
    }

    static test9()
    {
      return {
        name: "Check that subtracting point from a vector fails",
        test: function ()
        {
          let t1 = new ray.Vector(3, 2, 1);
          let t2 = new ray.Point(5, 6, 7);
          let t3 = ray.Touple.subtract(t1, t2);
          if (t3) return false;
          return true;
        }
      };
    }

    static test10()
    {
      return {
        name: "Check that touples can be negated",
        test: function ()
        {
          let t1 = new ray.Touple(1, 2, 3, 4);
          let t2 = ray.Touple.negate(t1);
          t1.negate();
          if (t1.x != -1) return false;
          if (t1.y != -2) return false;
          if (t1.z != -3) return false;
          if (t1.w != -4) return false;
          if (t2.x != -1) return false;
          if (t2.y != -2) return false;
          if (t2.z != -3) return false;
          if (t2.w != -4) return false;
          return true;
        }
      };
    }

    static test11()
    {
      return {
        name: "Check that touples can be scaled",
        test: function ()
        {
          let t1 = new ray.Touple(1, -2, 3, -4);
          let t2 = ray.Touple.multiply(t1, 3.5);
          t1.times(3.5);
          if (t1.x != 3.5) return false;
          if (t1.y != -7) return false;
          if (t1.z != 10.5) return false;
          if (t1.w != -14) return false;
          if (t2.x != 3.5) return false;
          if (t2.y != -7) return false;
          if (t2.z != 10.5) return false;
          if (t2.w != -14) return false;
          return true;
        }
      };
    }

    static test12()
    {
      return {
        name: "Check that touples can be scaled by a fraction",
        test: function ()
        {
          let t1 = new ray.Touple(1, -2, 3, -4);
          let t2 = ray.Touple.multiply(t1, 0.5);
          t1.times(0.5);
          if (t1.x != 0.5) return false;
          if (t1.y != -1) return false;
          if (t1.z != 1.5) return false;
          if (t1.w != -2) return false;
          if (t2.x != 0.5) return false;
          if (t2.y != -1) return false;
          if (t2.z != 1.5) return false;
          if (t2.w != -2) return false;
          return true;
        }
      };
    }

    static test13()
    {
      return {
        name: "Check that magnitude of a vector works",
        test: function ()
        {
          let t1 = new ray.Vector(1, 0, 0);
          if (t1.magnitude() != 1) return false;
          let t2 = new ray.Vector(0, 1, 0);
          if (t2.magnitude() != 1) return false;
          let t3 = new ray.Vector(0, 0, 1);
          if (t3.magnitude() != 1) return false;
          let t4 = new ray.Vector(1, 2, 3);
          if (t4.magnitude() != Math.sqrt(14)) return false;
          let t5 = new ray.Vector(-1, -2, -3);
          if (t5.magnitude() != Math.sqrt(14)) return false;
          return true;
        }
      };
    }

    static test14()
    {
      return {
        name: "Check that magnitude of a point fails",
        test: function ()
        {
          let t1 = new ray.Point(1, 0, 0);
          let m = t1.magnitude();
          if (m) return false;
          return true;
        }
      };
    }

    static test15()
    {
      return {
        name: "Normalizing a unit vector works",
        test: function ()
        {
          let t1 = new ray.Vector(4, 0, 0);
          let t2 = ray.Touple.normalize(t1);
          t1.normalize();
          if (t1.x != 1) return false;
          if (t1.y != 0) return false;
          if (t1.z != 0) return false;
          if (t2.x != 1) return false;
          if (t2.y != 0) return false;
          if (t2.z != 0) return false;
          return true;
        }
      };
    }

    static test16()
    {
      return {
        name: "Normalizing a vector works",
        test: function ()
        {
          let t1 = new ray.Vector(1, 2, 3);
          let t2 = ray.Touple.normalize(t1);
          if (!ray.isEqual(t2.x, 0.26726)) return false;
          if (!ray.isEqual(t2.y, 0.53452)) return false;
          if (!ray.isEqual(t2.z, 0.80178)) return false;
          return true;
        }
      };
    }

    static test17()
    {
      return {
        name: "Magnitude of a normalized vector works",
        test: function ()
        {
          let t1 = new ray.Vector(1, 2, 3);
          let t2 = ray.Touple.normalize(t1);
          if (t2.magnitude() != 1) return false;
          return true;
        }
      };
    }

    static test17()
    {
      return {
        name: "Dot product works",
        test: function ()
        {
          let t1 = new ray.Vector(1, 2, 3);
          let t2 = new ray.Vector(2, 3, 4);
          if (t1.dot(t2) != 20) return false;
          return true;
        }
      };
    }

    static test18()
    {
      return {
        name: "Cross product works",
        test: function ()
        {
          let t1 = new ray.Vector(1, 2, 3);
          let t2 = new ray.Vector(2, 3, 4);
          let t3 = ray.Touple.cross(t1,t2);
          let t4 = ray.Touple.cross(t2,t1);
          if (t3.x != -1) return false;
          if (t3.y != 2) return false;
          if (t3.z != -1) return false;
          if (t4.x != 1) return false;
          if (t4.y != -2) return false;
          if (t4.z != 1) return false;

          return true;
        }
      };
    }

    static test19()
    {
      return {
        name: "Check that equality works",
        test: function ()
        {
          let t1 = new ray.Vector(1, 2, 3);
          let t2 = new ray.Vector(1, 2, 3);
          if (!t1.equals(t2)) return false;
          return true;
        }
      };
    }

    static test20()
    {
      return {
        name: "Check that inequality works",
        test: function ()
        {
          let t1 = new ray.Vector(1, 2, 3);
          let t2 = new ray.Vector(2, 3, 1);
          if (t1.equals(t2)) return false;
          return true;
        }
      };
    }

    static test21()
    {
      return {
        name: "Check reflecting a 45 degree vector",
        test: function ()
        {
          let v = new ray.Vector(1, -1, 0);
          let n = new ray.Vector(0, 1, 0);
          let r = ray.Touple.reflect(v, n);
          if (r.equals(ray.Vector(1,1,0)) == false) return false;
          return true;
        }
      };
    }

    static test22()
    {
      return {
        name: "Check reflecting of a slanted surface",
        test: function ()
        {
          let num = Math.sqrt(2) / 2;
          let v = new ray.Vector(0, -1, 0);
          let n = new ray.Vector(num, num, 0);
          let r = ray.Touple.reflect(v, n);
          if (r.equals(ray.Vector(1, 0, 0)) == false) return false;
          return true;
        }
      };
    }

  }

  class TouplePool
  {
    constructor()
    {
      this.size = 200;
      this.pool = new Array(this.size);
      this.next = 0;
      for (let i = 0; i < this.size; ++i) this.pool[i] = new rTouple(0, 0, 0, 0);
    }

    getTouple(x, y, z, w)
    {
      let ret = this.pool[this.next++];
      if (!ret)
        return null;
      if (this.next >= this.size) this.next = 0;
      ret.x = x;
      ret.y = y;
      ret.z = z;
      ret.w = w;
      return ret;
    }
  }

  var pool = new TouplePool();
  function makeTouple(x, y, z, w)
  {
    if (ray.usePool) return pool.getTouple(x, y, z, w);
    return new rTouple(x, y, z, w);
  }


  ray.classlist.push(rTouple);

  ray.Touple = rTouple;
  ray.rawTouple = function (x, y, z, w) { return makeTouple(x, y, z, w); }
  ray.Point = function (x, y, z) { return makeTouple(x,y,z,1.0); }
  ray.Vector = function (x, y, z) { return makeTouple(x,y,z,0.0); }

  ray.Origin = ray.Point(0, 0, 0);
  ray.Origin.plus = null;
  ray.Origin.minus = null;
  ray.Origin.negate = null;
  ray.Origin.times = null;
  ray.Origin.normalize = null;

  ray.usePool = false;

  ray.epsilon = 0.00001;
  ray.lowrez = function () { ray.epsilon = 0.002; }
  ray.hirez = function () { ray.epsilon = 0.00001; }
  ray.isEqual = function (a, b)
  {
//    let diff = a - b;
//    let adiff = Math.abs(diff);
//    let comp = (adiff < ray.epsilon);
    return Math.abs(a - b) < ray.epsilon;
  }
})();
