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

    get(r, c)
    {
      return this.data[this.width * r + c];
    }

    set(r, c, n)
    {
      this.data[this.width * r + c] = n;
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
      let data = new Array(this.size);
      let index = 0;

      let rstride = 0;
      for (let r = 0; r < this.height; ++r)
      {
        for (let c = 0; c < this.width; ++c)
        {
          let v = this.data[rstride]     * m.data[c]
                + this.data[rstride + 1] * m.data[this.width+c]
                + this.data[rstride + 2] * m.data[this.width+this.width+c]
                + this.data[rstride + 3] * m.data[this.width+this.width+this.width+c];
          data[index++] = v;
        }
        rstride += this.width;
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
        let data = new Array(4);
        let index = 0;
        for (let i = 0; i < 4; ++i)
        {
          let v = this.get(i, 0) * m.x
                + this.get(i, 1) * m.y
                + this.get(i, 2) * m.z
                + this.get(i, 3) * m.w;
          data[index++] = v;
        }
        return new ray.Touple(data[0], data[1], data[2], data[3]);
      }
    }

    transpose()
    {
      let d = new Array(this.size);
      let index = 0;

      for (let c = 0; c < this.width; ++c)
        for (let r = 0; r < this.height; ++r)
          d[index++] = this.get(r, c);
      this.data = d;
      return this;
    }

    determinant()
    {
      if (this.size == 4) 
      {
        return this.data[0] * this.data[3] - this.data[1] * this.data[2];
      }

      let det = 0;
      for (let c = 0; c < this.height; ++c)
        det += this.data[c] * this.cofactor(0, c);
      return det;
    }

    submatrix(badr, badc)
    {
      let data = new Array((this.width - 1) * (this.width - 1));
      let index = 0;
      for (let r = 0; r < this.height; ++r)
        for (let c = 0; c < this.width; ++c)
        {
          if (r == badr) continue;
          if (c == badc) continue;
          data[index++] = this.get(r, c);
        }
      return new rMatrix(this.width - 1, this.height - 1, data);
    }

    invertible()
    {
      return (this.determinant() != 0);
    }

    minor(r, c)
    {
      let sub = this.submatrix(r, c);
      return sub.determinant();
    }

    cofactor(r, c)
    {
      let m = this.minor(r, c);
      if ((r + c) % 2 == 1) m *= -1;
      return m;
    }

    invert()
    {
      if (!this.invertible()) throw "not invertible";

      let d = new Array(this.size);
      let index = 0;
      let det = this.determinant();

      for (let c = 0; c < this.width; ++c)
        for (let r = 0; r < this.height; ++r)
        {
          let val = this.cofactor(r, c);
          d[index++] = (val / det);
        }

      this.data = d;
      return this;
    }

    static multiply(m1, m2)
    {
      if (m2.isTouple) return m1.times(m2);

      let ret = new rMatrix(m1.width, m1.height, m1.data);
      return ret.times(m2);
    }

    static transpose(m1)
    {
      let ret = new rMatrix(m1.width, m1.height, m1.data);
      return ret.transpose();
    }

    static inverse(m)
    {
      let ret = new rMatrix(m.width, m.height, m.data);
      return ret.invert();
    }

    static submatrix(m, badr, badc)
    {
      return m.submatrix(badr, badc);
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

    static test9()
    {
      return {
        name: "Check that matrix transposition works",
        test: function ()
        {
          let m1 = new ray.Matrix4x4([0, 9, 3, 0, 9, 8, 0, 8, 1, 8, 5, 3, 0, 0, 5, 8]);
          let m2 = new ray.Matrix4x4([0, 9, 1, 0, 9, 8, 8, 0, 3, 0, 5, 5, 0, 8, 3, 8]);

          let ret = rMatrix.transpose(m1);
          if (!ret.equals(m2)) return false;

          m1.transpose();
          if (!m1.equals(m2)) return false;
          return true;
        }
      };
    }

    static test10()
    {
      return {
        name: "Check that 2x2 matrix determinant works",
        test: function ()
        {
          let m1 = new ray.Matrix2x2([1,5,-3,2]);

          let ret = m1.determinant();
          if (!ray.isEqual(ret,17)) return false;
          return true;
        }
      };
    }
    
    static test11()
    {
      return {
        name: "Check that a 3x3 submatrix works",
        test: function ()
        {
          let m1 = new ray.Matrix3x3([1, 5, 0, -3, 2, 7, 0, 6, -3]);
          let m2 = new ray.Matrix2x2([-3, 2, 0, 6]);

          let ret = rMatrix.submatrix(m1, 0, 2);
          if (!ret.equals(m2)) return false;
          return true;
        }
      };
    }

    static test12()
    {
      return {
        name: "Check that a 4x4 submatrix works",
        test: function ()
        {
          let m1 = new ray.Matrix4x4([-6, 1, 1, 6, -8, 5, 8, 6, -1, 0, 8, 2, -7, 1, -1, 1]);
          let m2 = new ray.Matrix3x3([-6, 1, 6, -8, 8, 6, -7, -1, 1]);

          let ret = rMatrix.submatrix(m1, 2, 1);
          if (!ret.equals(m2)) return false;
          return true;
        }
      };
    }

    static test13()
    {
      return {
        name: "Check that a calculating a minor works",
        test: function ()
        {
          let m = new ray.Matrix3x3([3, 5, 0, 2, -1, -7, 6, -1, 5]);
          let b = m.submatrix(1, 0);

          if (b.determinant() != 25) return false;
          if (m.minor(1, 0) != 25) return false;
          return true;
        }
      };
    }

    static test14()
    {
      return {
        name: "Check that a calculating a cofactor works",
        test: function ()
        {
          let m = new ray.Matrix3x3([3, 5, 0, 2, -1, -7, 6, -1, 5]);
          if (m.minor(0, 0) != -12) return false;
          if (m.cofactor(0, 0) != -12) return false;
          if (m.minor(1, 0) != 25) return false;
          if (m.cofactor(1, 0) != -25) return false;
          return true;
        }
      };
    }

    static test15()
    {
      return {
        name: "Check that a 3x3 matrix determinant works",
        test: function ()
        {
          let m = new ray.Matrix3x3([1, 2, 6, -5, 8, -4, 2, 6, 4]);
          if (m.cofactor(0, 0) != 56) return false;
          if (m.cofactor(0, 1) != 12) return false;
          if (m.cofactor(0, 2) != -46) return false;
          if (m.determinant() != -196) return false;
          return true;
        }
      };
    }

    static test16()
    {
      return {
        name: "Check that a 4x4 matrix determinant works",
        test: function ()
        {
          let m = new ray.Matrix4x4([-2, -8, 3, 5, -3, 1, 7, 3, 1, 2, -9, 6, -6, 7, 7, -9]);
          if (m.cofactor(0, 0) != 690) return false;
          if (m.cofactor(0, 1) != 447) return false;
          if (m.cofactor(0, 2) != 210) return false;
          if (m.cofactor(0, 3) != 51) return false;
          if (m.determinant() != -4071) return false;
          return true;
        }
      };
    }

    static test17()
    {
      return {
        name: "Check for an invertible matrix",
        test: function ()
        {
          let m = new ray.Matrix4x4([6,4,4,4,5,5,7,6,4,-9,3,-7,9,1,7,-6]);
          if (m.invertible() == false) return false;
          return true;
        }
      };
    }

    static test18()
    {
      return {
        name: "Check for an non invertible matrix",
        test: function ()
        {
          let m = new ray.Matrix4x4([-4,2,-2,-3,9,6,2,6,0,-5,1,-5,0,0,0,0]);
          if (m.invertible() == true) return false;
          return true;
        }
      };
    }

    static test19()
    {
      return {
        name: "Check that inverting a 4x4 matrix works",
        test: function ()
        {
          let m = new ray.Matrix4x4([-5, 2, 6, -8, 1, -5, 1, 8, 7, 7, -6, -7, 1, -3, 7, 4]);
          let check = new ray.Matrix4x4([0.21805, 0.45113, 0.24060, -0.04511, -0.80827, -1.45677, -0.44361, 0.52068, -0.07895, -0.22368, -0.05263, 0.19737, -0.52256, -0.81391, -0.30075, 0.30639]);
          let b = rMatrix.inverse(m);
          if (ray.isEqual(m.determinant(), 532) == false) return false;
          if (ray.isEqual(m.cofactor(2,3), -160) == false) return false;
          if (ray.isEqual(b.get(3,2), (-160/532)) == false) return false;
          if (ray.isEqual(m.cofactor(3,2), 105) == false) return false;
          if (ray.isEqual(b.get(2, 3), (105 / 532)) == false) return false;
          if (b.equals(check) == false) return false;
          return true;
        }
      };
    }

    static test20()
    {
      return {
        name: "Check that inverting a 4x4 matrix works again",
        test: function ()
        {
          let m = new ray.Matrix4x4([8, -5, 9, 2, 7, 5, 6, 1, -6, 0, 9, 6, -3, 0, -9, -4]);
          let check = new ray.Matrix4x4([-0.15385, -0.15385, -0.28205, -0.53846, -0.07692, 0.12308, 0.02564, 0.03077, 0.35897, 0.35897, 0.43590, 0.92308, -0.69231, -0.69231, -0.76923, -1.92308]);
          m.invert();
          if (m.equals(check) == false) return false;
          return true;
        }
      };
    }

    static test21()
    {
      return {
        name: "Check that inverting a 4x4 matrix works again again",
        test: function ()
        {
          let m = new ray.Matrix4x4([9, 3, 0, 9, -5, -2, -6, -3, -4, 9, 6, 4, -7, 6, 6, 2]);
          let check = new ray.Matrix4x4([-0.04074, -0.07778, 0.14444, -0.22222, -0.07778, 0.03333, 0.36667, -0.33333, -0.02901, -0.14630, -0.10926, 0.12963, 0.17778, 0.06667, -0.26667, 0.33333]);
          m.invert();
          if (m.equals(check) == false) return false;
          return true;
        }
      };
    }

    static test22()
    {
      return {
        name: "Check multiplying a matrix by the inverse",
        test: function ()
        {
          let A = new ray.Matrix4x4([3, -9, 7, 3, 3, -8, 2, -9, -4, 4, 4, 1, -6, 5, -1, 1]);
          let B = new ray.Matrix4x4([8, 2, 2, 2, 3, -1, 7, 0, 7, 0, 5, 4, 6, -2, 0, 5]);
          let C = ray.Matrix.multiply(A, B);
          C.times(B.invert())
          if (C.equals(A) == false) return false;
          return true;
        }
      };
    }

    static test23()
    {
      return {
        name: "Check multiplying by the inverse gives the identity",
        test: function ()
        {
          let A = new ray.Matrix4x4([3, -9, 7, 3, 3, -8, 2, -9, -4, 4, 4, 1, -6, 5, -1, 1]);
          let B = ray.Matrix.inverse(A);
          let C = ray.Matrix.multiply(A, B);
          if (C.equals(ray.Identity4x4) == false) return false;
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
