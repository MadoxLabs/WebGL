(function (){

  class rMatrix
  {
    constructor(w, h, d)
    {
      this.width = w;
      this.height = h;
      this.size = w * h;
      this.data = d;
      this.isMatrix = true;
    }

    get(x, y)
    {
      return this.data[this.width * x + y];
    }

    set(x, y, n)
    {
      this.data[this.width * x + y] = n;
      return this;
    }

    equals(m)
    {
      if (this.size != m.size) return false;
      for (let i = 0; i < this.size; ++i)
        if (!ray.isEqual(this.data[i], m.data[i])) return false;
      return true;
    }

    _times(m)
    {
      let data = [];
      for (let r = 0; r < this.width; ++r)
        for (let c = 0; c < this.height; ++c)
        {
          let v = this.get(r, 0) * m.get(0, c)
            + this.get(r, 1) * m.get(1, c)
            + this.get(r, 2) * m.get(2, c)
            + this.get(r, 3) * m.get(3, c);
          data.push(v);
        }
      this.data = data;
      return this;
    }

    times(m)
    {
      if (this.size == m.size)
      {
        return this._times(m);
      }
      else if (m.isTouple && 4 == this.width)
      {
        let data = [];
        for (let i = 0; i < 4; ++i)
        {
          let v = this.get(i, 0) * m.x
                + this.get(i, 1) * m.y
                + this.get(i, 2) * m.z
                + this.get(i, 3) * m.w;
          data.push(v);
        }
        return new ray.Touple(data[0], data[1], data[2], data[3]);
      }
    }

    static multiply(m1, m2)
    {
      if (m2.isTouple) return m1.times(m2);

      let ret = new rMatrix(m1.width, m1.height, m1.data);
      return ret.times(m2);
    }

    // tests
    static test1()
    {
      return {
        name: "Check that 4x4 matrix works",
        test: function ()
        {
          let c = new ray.Matrix4x4([1,2,3,4, 5.5,6.5,7.5,8.5, 9,10,11,12, 13.5,14.5,15.5,16.5]);
          if (c.get(0,0) != 1) return false;
          if (c.get(0, 3) != 4) return false;
          if (c.get(1, 0) != 5.5) return false;
          if (c.get(1, 2) != 7.5) return false;
          if (c.get(2, 2) != 11) return false;
          if (c.get(3, 0) != 13.5) return false;
          if (c.get(3, 2) != 15.5) return false;
          return true;
        }
      };
    }

    static test2()
    {
      return {
        name: "Check that 2x2 matrix works",
        test: function ()
        {
          let c = new ray.Matrix2x2([-3, 5, 1, -2]);
          if (c.get(0, 0) != -3) return false;
          if (c.get(0, 1) != 5) return false;
          if (c.get(1, 0) != 1) return false;
          if (c.get(1, 1) != -2) return false;
          return true;
        }
      };
    }

    static test3()
    {
      return {
        name: "Check that 3x3 matrix works",
        test: function ()
        {
          let c = new ray.Matrix3x3([-3, 5, 0, 1, -2, -7, 0, 1, 1]);
          if (c.get(0, 0) != -3) return false;
          if (c.get(1, 1) != -2) return false;
          if (c.get(2, 2) != 1) return false;
          return true;
        }
      };
    }

    static test4()
    {
      return {
        name: "Check that matrix equality works",
        test: function ()
        {
          let m1 = new ray.Matrix4x4([1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 2]);
          let m2 = new ray.Matrix4x4([1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 2]);
          if (!m1.equals(m2)) return false;
          return true;
        }
      };
    }

    static test5()
    {
      return {
        name: "Check that matrix inequality works",
        test: function ()
        {
          let m1 = new ray.Matrix4x4([1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 2]);
          let m2 = new ray.Matrix4x4([2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
          if (m1.equals(m2)) return false;
          return true;
        }
      };
    }

    static test5()
    {
      return {
        name: "Check that matrix multiplication works",
        test: function ()
        {
          let m1 = new ray.Matrix4x4([1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 2]);
          let m2 = new ray.Matrix4x4([-2, 1, 2, 3, 3, 2, 1, -1, 4, 3, 6, 5, 1, 2, 7, 8]);
          let check = new ray.Matrix4x4([20,22,50,48,44,54,114,108,40,58,110,102,16,26,46,42]);

          let ret = rMatrix.multiply(m1, m2);
          if (!ret.equals(check)) return false;

          m1.times(m2);
          if (!m1.equals(check)) return false;
          return true;
        }
      };
    }

    static test6()
    {
      return {
        name: "Check that matrix/touple multiplication works",
        test: function ()
        {
          let m = new ray.Matrix4x4([1, 2, 3, 4, 2, 4, 4, 2, 8, 6, 4, 1, 0, 0, 0, 1]);
          let t = new ray.Touple(1, 2, 3, 1);
          let check = new ray.Touple(18, 24, 33, 1);

          let ret = rMatrix.multiply(m, t);
          if (!ret.equals(check)) return false;
          return true;
        }
      };
    }

    static test7()
    {
      return {
        name: "Check matrix multiplication with identity",
        test: function ()
        {
          let m = new ray.Matrix4x4([0, 1, 2, 4, 1, 2, 4, 8, 2, 4, 8, 16, 4, 8, 16, 32]);
          let ret = rMatrix.multiply(m, ray.Identity4x4);
          if (!ret.equals(m)) return false;
          return true;
        }
      };
    }

    static test8()
    {
      return {
        name: "Check touple multiplication with identity",
        test: function ()
        {
          let t = new ray.Touple(1, 2, 3, 4);
          let ret = rMatrix.multiply(ray.Identity4x4, t);
          if (!ret.equals(t)) return false;
          return true;
        }
      };
    }

  }

  ray.classlist.push(rMatrix);

  ray.Matrix = rMatrix;
  ray.Matrix4x4 = function (d) { return new rMatrix(4, 4, d); }
  ray.Matrix3x3 = function (d) { return new rMatrix(3, 3, d); }
  ray.Matrix2x2 = function (d) { return new rMatrix(2, 2, d); }

  ray.Identity4x4 = new rMatrix(4, 4, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  ray.Identity4x4.set = null;
  ray.Identity4x4.multiply = null;
  ray.Identity4x4._times = null;

})();
