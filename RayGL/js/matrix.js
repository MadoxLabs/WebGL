  class Matrix
  {
    constructor(w, h, d)
    {
      this.width = w;
      this.height = h;
      this.size = w * h;
      this.data = d;
      this.isMatrix = true;
    }

    copy()
    {
      return new Matrix(this.width, this.height, this.data.slice(0));
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

    _times(m)
    {
      let tmpMatrix = tmps[this.width];
      let index = 0;

      let rstride = 0;
      for (let r = 0; r < this.height; ++r)
      {
        for (let c = 0; c < this.width; ++c)
        {
          let v = this.data[rstride] * m.data[c]
            + this.data[rstride + 1] * m.data[this.width + c]
            + this.data[rstride + 2] * m.data[this.width + this.width + c]
            + this.data[rstride + 3] * m.data[this.width + this.width + this.width + c];
          tmpMatrix.data[index++] = v;
        }
        rstride += this.width;
      }
      let tmp = this.data;
      this.data = tmpMatrix.data;
      tmpMatrix.data = tmp;
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
        let index = 0;
        tmpTouple0 = this.data[0] * m.x
          + this.data[1] * m.y
          + this.data[2] * m.z
          + this.data[3] * m.w;
        tmpTouple1 = this.data[4] * m.x
          + this.data[5] * m.y
          + this.data[6] * m.z
          + this.data[7] * m.w;
        tmpTouple2 = this.data[8] * m.x
          + this.data[9] * m.y
          + this.data[10] * m.z
          + this.data[11] * m.w;
        tmpTouple3 = this.data[12] * m.x
          + this.data[13] * m.y
          + this.data[14] * m.z
          + this.data[15] * m.w;
        return new Touple(tmpTouple0, tmpTouple1, tmpTouple2, tmpTouple3);
      }
    }

    transpose()
    {
      let tmpMatrix = tmps[this.width];
      let index = 0;

      for (let c = 0; c < this.width; ++c)
      {
        let rstride = 0;
        for (let r = 0; r < this.height; ++r)
        {
          tmpMatrix.data[index++] = this.data[rstride + c];
          rstride += this.width;
        }
      }
      let tmp = this.data;
      this.data = tmpMatrix.data;
      tmpMatrix.data = tmp;
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
      let tmpMatrix = tmps[this.width - 1];
      let index = 0;
      let rstride = 0;
      for (let r = 0; r < this.height; ++r) 
      {
        for (let c = 0; c < this.width; ++c) 
        {
          if (r == badr) continue;
          if (c == badc) continue;
          tmpMatrix.data[index++] = this.data[rstride + c];
        }
        rstride += this.width;
      }
      let ret = tmpMatrix.copy();
      let tmp = ret.data;
      ret.data = tmpMatrix.data;
      tmpMatrix.data = tmp;
      return ret;
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
      if (!this.invertible()) return null; //throw "not invertible";

      let tmpMatrix = tmps[this.width];
      let index = 0;
      let det = this.determinant();

      for (let c = 0; c < this.width; ++c)
        for (let r = 0; r < this.height; ++r)
        {
          let val = this.cofactor(r, c);
          tmpMatrix.data[index++] = (val / det);
        }

      let tmp = this.data;
      this.data = tmpMatrix.data;
      tmpMatrix.data = tmp;
      return this;
    }

    static multiply(m1, m2)
    {
      if (m2.isTouple) return m1.times(m2);

      let ret =  new Matrix(m1.width, m1.height, m1.data.slice());
      return ret.times(m2);
    }

    static transpose(m1)
    {
      let ret = new Matrix(m1.width, m1.height, m1.data.slice());
      return ret.transpose();
    }

    static inverse(m)
    {
      let ret = new Matrix(m.width, m.height, m.data.slice());
      return ret.invert();
    }

    static submatrix(m, badr, badc)
    {
      return m.submatrix(badr, badc);
    }

    static translation(x, y, z)
    {
      let ret = Identity4x4.copy();
      ret.data[3] = x;
      ret.data[7] = y;
      ret.data[11] = z;
      return ret;
    }

    static scale(x, y, z)
    {
      let ret = Identity4x4.copy();
      ret.data[0] = x;
      ret.data[5] = y;
      ret.data[10] = z;
      return ret;
    }

    static xRotation(r)
    {
      let c = Math.cos(r);
      let s = Math.sin(r);
      let ret = Identity4x4.copy();
      ret.data[5] = c;
      ret.data[6] = -s;
      ret.data[9] = s;
      ret.data[10] = c;
      return ret;
    }

    static yRotation(r)
    {
      let c = Math.cos(r);
      let s = Math.sin(r);
      let ret = Identity4x4.copy();
      ret.data[0] = c;
      ret.data[2] = s;
      ret.data[8] = -s;
      ret.data[10] = c;
      return ret;
    }

    static zRotation(r)
    {
      let c = Math.cos(r);
      let s = Math.sin(r);
      let ret = Identity4x4.copy();
      ret.data[0] = c;
      ret.data[1] = -s;
      ret.data[4] = s;
      ret.data[5] = c;
      return ret;
    }

    static shearing(Xy, Xz, Yx, Yz, Zx, Zy)
    {
      let ret = Identity4x4.copy();
      ret.data[1] = Xy;
      ret.data[2] = Xz;
      ret.data[4] = Yx;
      ret.data[6] = Yz;
      ret.data[8] = Zx;
      ret.data[9] = Zy;
      return ret;
    }   
  }

  var tmpTouple0 = 0;
  var tmpTouple1 = 0;
  var tmpTouple2 = 0;
  var tmpTouple3 = 0;
  var tmp2x2 = new Matrix(2, 2, [0, 0, 0, 0]);
  var tmp3x3 = new Matrix(3, 3, [0, 0, 0, 0, 0, 0, 0, 0, 0]);
  var tmp4x4 = new Matrix(4, 4, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  var tmps = [];
  tmps[2] = tmp2x2;
  tmps[3] = tmp3x3;
  tmps[4] = tmp4x4;

  Identity4x4 = new Matrix(4, 4, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  Identity4x4.set = null;
  Identity4x4.multiply = null;
  Identity4x4._times = null;
