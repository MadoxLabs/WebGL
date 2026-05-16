(function (){

  class rMatrix
  {
    constructor(w, h, d)
    {
      this.width = w;
      this.height = h;
      this.size = w * h;

      this.d0  = 0;
      this.d1  = 0;
      this.d2  = 0;
      this.d3  = 0;
      this.d4  = 0;
      this.d5  = 0;
      this.d6  = 0;
      this.d7  = 0;
      this.d8  = 0;
      this.d9  = 0;
      this.d10 = 0;
      this.d11 = 0;
      this.d12 = 0;
      this.d13 = 0;
      this.d14 = 0;
      this.d15 = 0;  
      if (d.length == 4)
      {
        this.d0  = d[0]  ? d[0] : 0;
        this.d1  = d[1]  ? d[1] : 0;
        this.d4  = d[2]  ? d[2] : 0;
        this.d5  = d[3]  ? d[3] : 0;  
      }
      else if (d.length == 9)
      {
        this.d0  = d[0]  ? d[0] : 0;
        this.d1  = d[1]  ? d[1] : 0;
        this.d2  = d[2]  ? d[2] : 0;
        this.d4  = d[3]  ? d[3] : 0;
        this.d5  = d[4]  ? d[4] : 0;  
        this.d6  = d[5]  ? d[5] : 0;
        this.d8  = d[6]  ? d[6] : 0;
        this.d9  = d[7]  ? d[7] : 0;  
        this.d10  = d[8]  ? d[8] : 0;
      }
      else 
      {
        this.d0  = d[0]  ? d[0] : 0;
        this.d1  = d[1]  ? d[1] : 0;
        this.d2  = d[2]  ? d[2] : 0;
        this.d3  = d[3]  ? d[3] : 0;
        this.d4  = d[4]  ? d[4] : 0;
        this.d5  = d[5]  ? d[5] : 0;
        this.d6  = d[6]  ? d[6] : 0;
        this.d7  = d[7]  ? d[7] : 0;
        this.d8  = d[8]  ? d[8] : 0;
        this.d9  = d[9]  ? d[9] : 0;
        this.d10 = d[10] ? d[10] : 0;
        this.d11 = d[11] ? d[11] : 0;
        this.d12 = d[12] ? d[12] : 0;
        this.d13 = d[13] ? d[13] : 0;
        this.d14 = d[14] ? d[14] : 0;
        this.d15 = d[15] ? d[15] : 0;  
      }
      this.isMatrix = true;
    }

    copy()
    {
      return ray.rawMatrix(this.width, this.height, [this.d0, this.d1, this.d2, this.d3, this.d4, this.d5, this.d6, this.d7, this.d8, this.d9, this.d10, this.d11, this.d12, this.d13, this.d14, this.d15]);
    }

    get(r, c)
    {
      let elem = "d"+(4 * r + c);
      return this[elem];
    }

    set(r, c, n)
    {
      let elem = "d"+(4 * r + c);
      this[elem] = n;
      return this;
    }

    equals(m)
    {
      if (!m) return false;
      if (this.size != m.size) return false;
      if (!ray.isEqual(this.d0, m.d0)) return false;
      if (!ray.isEqual(this.d1, m.d1)) return false;
      if (!ray.isEqual(this.d2, m.d2)) return false;
      if (!ray.isEqual(this.d3, m.d3)) return false;
      if (this.size == 2) return true;
      if (!ray.isEqual(this.d4, m.d4)) return false;
      if (!ray.isEqual(this.d5, m.d5)) return false;
      if (!ray.isEqual(this.d6, m.d6)) return false;
      if (!ray.isEqual(this.d7, m.d7)) return false;
      if (!ray.isEqual(this.d8, m.d8)) return false;
      if (this.size == 3) return true;
      if (!ray.isEqual(this.d9, m.d9)) return false;
      if (!ray.isEqual(this.d10, m.d10)) return false;
      if (!ray.isEqual(this.d11, m.d11)) return false;
      if (!ray.isEqual(this.d12, m.d12)) return false;
      if (!ray.isEqual(this.d13, m.d13)) return false;
      if (!ray.isEqual(this.d14, m.d14)) return false;
      if (!ray.isEqual(this.d15, m.d15)) return false;
      return true;
    }

    // this is for M x M
    timesM(m)
    {
      if (this.size != m.size) return null;
      let tmpMatrix = tmps[this.width];

      tmpMatrix.d0 = this.d0 * m.d0 
      + this.d1 * m.d4 
      + this.d2 * m.d8 
      + this.d3 * m.d12; 
      tmpMatrix.d1 = this.d0 * m.d1 
      + this.d1 * m.d5 
      + this.d2 * m.d9 
      + this.d3 * m.d13; 
      tmpMatrix.d2 = this.d0 * m.d2 
      + this.d1 * m.d6 
      + this.d2 * m.d10 
      + this.d3 * m.d14; 
      tmpMatrix.d3 = this.d0 * m.d3 
      + this.d1 * m.d7 
      + this.d2 * m.d11 
      + this.d3 * m.d15; 

      tmpMatrix.d4 = this.d4 * m.d0 
      + this.d5 * m.d4 
      + this.d6 * m.d8 
      + this.d7 * m.d12; 
      tmpMatrix.d5 = this.d4 * m.d1 
      + this.d5 * m.d5 
      + this.d6 * m.d9 
      + this.d7 * m.d13; 
      tmpMatrix.d6 = this.d4 * m.d2 
      + this.d5 * m.d6 
      + this.d6 * m.d10 
      + this.d7 * m.d14; 
      tmpMatrix.d7 = this.d4 * m.d3 
      + this.d5 * m.d7 
      + this.d6 * m.d11 
      + this.d7 * m.d15; 

      tmpMatrix.d8 = this.d8 * m.d0 
      + this.d9 * m.d4 
      + this.d10 * m.d8 
      + this.d11 * m.d12; 
      tmpMatrix.d9 = this.d8 * m.d1 
      + this.d9 * m.d5 
      + this.d10 * m.d9 
      + this.d11 * m.d13; 
      tmpMatrix.d10 = this.d8 * m.d2 
      + this.d9 * m.d6 
      + this.d10 * m.d10 
      + this.d11 * m.d14; 
      tmpMatrix.d11 = this.d8 * m.d3 
      + this.d9 * m.d7 
      + this.d10 * m.d11 
      + this.d11 * m.d15; 

      tmpMatrix.d12 = this.d12 * m.d0 
      + this.d13 * m.d4 
      + this.d14 * m.d8 
      + this.d15 * m.d12; 
      tmpMatrix.d13 = this.d12 * m.d1 
      + this.d13 * m.d5 
      + this.d14 * m.d9 
      + this.d15 * m.d13; 
      tmpMatrix.d14 = this.d12 * m.d2 
      + this.d13 * m.d6 
      + this.d14 * m.d10 
      + this.d15 * m.d14; 
      tmpMatrix.d15 = this.d12 * m.d3 
      + this.d13 * m.d7 
      + this.d14 * m.d11 
      + this.d15 * m.d15; 

      this.d0 = tmpMatrix.d0;
      this.d1 = tmpMatrix.d1;
      this.d2 = tmpMatrix.d2;
      this.d3 = tmpMatrix.d3;
      this.d4 = tmpMatrix.d4;
      this.d5 = tmpMatrix.d5;
      this.d6 = tmpMatrix.d6;
      this.d7 = tmpMatrix.d7;
      this.d8 = tmpMatrix.d8;
      this.d9 = tmpMatrix.d9;
      this.d10 = tmpMatrix.d10;
      this.d11 = tmpMatrix.d11;
      this.d12 = tmpMatrix.d12;
      this.d13 = tmpMatrix.d13;
      this.d14 = tmpMatrix.d14;
      this.d15 = tmpMatrix.d15;

      return this;
    }

    // this is for M x V
    times(m)
    {
      if (m.isTouple && 4 == this.width)
      {
        tmpTouple0 = this.d0 * m.x
                   + this.d1 * m.y
                   + this.d2 * m.z
                   + this.d3 * m.w;
        tmpTouple1 = this.d4 * m.x
                   + this.d5 * m.y
                   + this.d6 * m.z
                   + this.d7 * m.w;
        tmpTouple2 = this.d8 * m.x
                   + this.d9 * m.y
                   + this.d10 * m.z
                   + this.d11 * m.w;
        tmpTouple3 = this.d12 * m.x
                   + this.d13 * m.y
                   + this.d14 * m.z
                   + this.d15 * m.w;
        return ray.rawTouple(tmpTouple0, tmpTouple1, tmpTouple2, tmpTouple3);  
      }
      else debugger;
    }

    transpose()
    {
      let tmpMatrix = tmps[this.width];

      tmpMatrix.d0 = this.d0;
      tmpMatrix.d1 = this.d4;
      tmpMatrix.d2 = this.d8;
      tmpMatrix.d3 = this.d12;
      tmpMatrix.d4 = this.d1;
      tmpMatrix.d5 = this.d5;
      tmpMatrix.d6 = this.d9;
      tmpMatrix.d7 = this.d13;
      tmpMatrix.d8 = this.d2;
      tmpMatrix.d9 = this.d6;
      tmpMatrix.d10 = this.d10;
      tmpMatrix.d11 = this.d14;
      tmpMatrix.d12 = this.d3;
      tmpMatrix.d13 = this.d7;
      tmpMatrix.d14 = this.d11;
      tmpMatrix.d15 = this.d15;

      this.d0 = tmpMatrix.d0;
      this.d1 = tmpMatrix.d1;
      this.d2 = tmpMatrix.d2;
      this.d3 = tmpMatrix.d3;
      this.d4 = tmpMatrix.d4;
      this.d5 = tmpMatrix.d5;
      this.d6 = tmpMatrix.d6;
      this.d7 = tmpMatrix.d7;
      this.d8 = tmpMatrix.d8;
      this.d9 = tmpMatrix.d9;
      this.d10 = tmpMatrix.d10;
      this.d11 = tmpMatrix.d11;
      this.d12 = tmpMatrix.d12;
      this.d13 = tmpMatrix.d13;
      this.d14 = tmpMatrix.d14;
      this.d15 = tmpMatrix.d15;
      return this;
    }

    determinant()
    {
      if (this.size == 4) 
      {
        return this.d0 * this.d5 - this.d1 * this.d4;
      }

      let det = 0;
      det += this.d0 * this.cofactor(0,0);      
      det += this.d1 * this.cofactor(0,1);
      if (this.width >= 3)
        det += this.d2 * this.cofactor(0,2);
      if (this.width == 4)
        det += this.d3 * this.cofactor(0,3);
      return det;
    }

    submatrix(badr, badc)
    {
      let tmpMatrix = tmps[this.width-1];

      if (!tmpMatrix || !this) debugger;
      if (badr == 0)
      {
        tmpMatrix.d0 = this.d4;
        tmpMatrix.d1 = this.d5;
        tmpMatrix.d2 = this.d6;
        tmpMatrix.d3 = this.d7;          
        tmpMatrix.d4 = this.d8;
        tmpMatrix.d5 = this.d9;
        tmpMatrix.d6 = this.d10;
        tmpMatrix.d7 = this.d11;          
        tmpMatrix.d8 = this.d12;
        tmpMatrix.d9 = this.d13;
        tmpMatrix.d10 = this.d14;
        tmpMatrix.d11 = this.d15;          
        tmpMatrix.d12 = 0;
        tmpMatrix.d13 = 0;
        tmpMatrix.d14 = 0;
        tmpMatrix.d15 = 0;          
      }
      else if (badr == 1)
      {
        tmpMatrix.d0 = this.d0;
        tmpMatrix.d1 = this.d1;
        tmpMatrix.d2 = this.d2;
        tmpMatrix.d3 = this.d3;          
        tmpMatrix.d4 = this.d8;
        tmpMatrix.d5 = this.d9;
        tmpMatrix.d6 = this.d10;
        tmpMatrix.d7 = this.d11;          
        tmpMatrix.d8 = this.d12;
        tmpMatrix.d9 = this.d13;
        tmpMatrix.d10 = this.d14;
        tmpMatrix.d11 = this.d15;          
        tmpMatrix.d12 = 0;
        tmpMatrix.d13 = 0;
        tmpMatrix.d14 = 0;
        tmpMatrix.d15 = 0;          
      }
      else if (badr == 2)
      {
        tmpMatrix.d0 = this.d0;
        tmpMatrix.d1 = this.d1;
        tmpMatrix.d2 = this.d2;
        tmpMatrix.d3 = this.d3;          
        tmpMatrix.d4 = this.d4;
        tmpMatrix.d5 = this.d5;
        tmpMatrix.d6 = this.d6;
        tmpMatrix.d7 = this.d7;          
        tmpMatrix.d8 = this.d12;
        tmpMatrix.d9 = this.d13;
        tmpMatrix.d10 = this.d14;
        tmpMatrix.d11 = this.d15;          
        tmpMatrix.d12 = 0;
        tmpMatrix.d13 = 0;
        tmpMatrix.d14 = 0;
        tmpMatrix.d15 = 0;          
      }
      else if (badr == 3)
      {
        tmpMatrix.d0 = this.d0;
        tmpMatrix.d1 = this.d1;
        tmpMatrix.d2 = this.d2;
        tmpMatrix.d3 = this.d3;          
        tmpMatrix.d4 = this.d4;
        tmpMatrix.d5 = this.d5;
        tmpMatrix.d6 = this.d6;
        tmpMatrix.d7 = this.d7;          
        tmpMatrix.d8 = this.d8;
        tmpMatrix.d9 = this.d9;
        tmpMatrix.d10 = this.d10;
        tmpMatrix.d11 = this.d11;          
        tmpMatrix.d12 = 0;
        tmpMatrix.d13 = 0;
        tmpMatrix.d14 = 0;
        tmpMatrix.d15 = 0;          
      }
      if (badc == 0)
      {
        tmpMatrix.d0  = tmpMatrix.d1;
        tmpMatrix.d4  = tmpMatrix.d5;
        tmpMatrix.d8  = tmpMatrix.d9;
        tmpMatrix.d12 = tmpMatrix.d13;          
        tmpMatrix.d1  = tmpMatrix.d2;
        tmpMatrix.d5  = tmpMatrix.d6;
        tmpMatrix.d9  = tmpMatrix.d10;
        tmpMatrix.d13 = tmpMatrix.d14;          
        tmpMatrix.d2  = tmpMatrix.d3;
        tmpMatrix.d6  = tmpMatrix.d7;
        tmpMatrix.d10 = tmpMatrix.d11;
        tmpMatrix.d14 = tmpMatrix.d15;          
        tmpMatrix.d3  = 0;
        tmpMatrix.d7  = 0;
        tmpMatrix.d11 = 0;
        tmpMatrix.d15 = 0;          
      }
      else if (badc == 1)
      {
        tmpMatrix.d1  = tmpMatrix.d2;
        tmpMatrix.d5  = tmpMatrix.d6;
        tmpMatrix.d9  = tmpMatrix.d10;
        tmpMatrix.d13 = tmpMatrix.d14;          
        tmpMatrix.d2  = tmpMatrix.d3;
        tmpMatrix.d6  = tmpMatrix.d7;
        tmpMatrix.d10 = tmpMatrix.d11;
        tmpMatrix.d14 = tmpMatrix.d15;          
        tmpMatrix.d3  = 0;
        tmpMatrix.d7  = 0;
        tmpMatrix.d11 = 0;
        tmpMatrix.d15 = 0;          
      }
      else if (badc == 2)
      {
        tmpMatrix.d2  = tmpMatrix.d3;
        tmpMatrix.d6  = tmpMatrix.d7;
        tmpMatrix.d10 = tmpMatrix.d11;
        tmpMatrix.d14 = tmpMatrix.d15;          
        tmpMatrix.d3  = 0;
        tmpMatrix.d7  = 0;
        tmpMatrix.d11 = 0;
        tmpMatrix.d15 = 0;          
      }
      else if (badc == 3)
      {
        tmpMatrix.d3  = 0;
        tmpMatrix.d7  = 0;
        tmpMatrix.d11 = 0;
        tmpMatrix.d15 = 0;          
      }

      return tmpMatrix.copy();
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
      let det = this.determinant();

      tmpMatrix.d0 = this.cofactor(0,0) / det;
      tmpMatrix.d1 = this.cofactor(1,0) / det;
      tmpMatrix.d2 = this.cofactor(2,0) / det;
      tmpMatrix.d3 = this.cofactor(3,0) / det;

      tmpMatrix.d4 = this.cofactor(0,1) / det;
      tmpMatrix.d5 = this.cofactor(1,1) / det;
      tmpMatrix.d6 = this.cofactor(2,1) / det;
      tmpMatrix.d7 = this.cofactor(3,1) / det;

      tmpMatrix.d8 =  this.cofactor(0,2) / det;
      tmpMatrix.d9 =  this.cofactor(1,2) / det;
      tmpMatrix.d10 = this.cofactor(2,2) / det;
      tmpMatrix.d11 = this.cofactor(3,2) / det;

      tmpMatrix.d12 = this.cofactor(0,3) / det;
      tmpMatrix.d13 = this.cofactor(1,3) / det;
      tmpMatrix.d14 = this.cofactor(2,3) / det;
      tmpMatrix.d15 = this.cofactor(3,3) / det;

      this.d0 = tmpMatrix.d0;
      this.d1 = tmpMatrix.d1;
      this.d2 = tmpMatrix.d2;
      this.d3 = tmpMatrix.d3;
      this.d4 = tmpMatrix.d4;
      this.d5 = tmpMatrix.d5;
      this.d6 = tmpMatrix.d6;
      this.d7 = tmpMatrix.d7;
      this.d8 = tmpMatrix.d8;
      this.d9 = tmpMatrix.d9;
      this.d10 = tmpMatrix.d10;
      this.d11 = tmpMatrix.d11;
      this.d12 = tmpMatrix.d12;
      this.d13 = tmpMatrix.d13;
      this.d14 = tmpMatrix.d14;
      this.d15 = tmpMatrix.d15;

      return this;
    }

    static multiply(m1, m2)
    {
      if (m2.isTouple) return m1.times(m2);

      let ret = m1.copy();
      return ret.timesM(m2);
    }

    static transpose(m1)
    {
      let ret = m1.copy();
      return ret.transpose();
    }

    static inverse(m)
    {
      let ret = m.copy();
      return ret.invert();
    }

    static submatrix(m, badr, badc)
    {
      return m.submatrix(badr, badc);
    }

    static translation(x, y, z)
    {
      let ret = ray.Identity4x4.copy();
      ret.d3  = x;
      ret.d7  = y;
      ret.d11 = z;
      return ret;
    }

    static scale(x, y, z)
    {
      let ret = ray.Identity4x4.copy();
      ret.d0 = x;
      ret.d5 = y;
      ret.d10 = z;
      return ret;
    }

    static fromYawPitchRoll(yaw, pitch, roll)
    {
      let out = ray.Identity4x4.copy();

//      var q = quat.create();
//      quat.fromYawPitchRoll(q, yaw, pitch, roll);
      let x = ((Math.cos((yaw * 0.5)) * Math.sin((pitch * 0.5))) * Math.cos((roll * 0.5))) + ((Math.sin((yaw * 0.5)) * Math.cos((pitch * 0.5))) * Math.sin((roll * 0.5)));
      let y = ((Math.sin((yaw * 0.5)) * Math.cos((pitch * 0.5))) * Math.cos((roll * 0.5))) - ((Math.cos((yaw * 0.5)) * Math.sin((pitch * 0.5))) * Math.sin((roll * 0.5)));
      let z = ((Math.cos((yaw * 0.5)) * Math.cos((pitch * 0.5))) * Math.sin((roll * 0.5))) - ((Math.sin((yaw * 0.5)) * Math.sin((pitch * 0.5))) * Math.cos((roll * 0.5)));
      let w = ((Math.cos((yaw * 0.5)) * Math.cos((pitch * 0.5))) * Math.cos((roll * 0.5))) + ((Math.sin((yaw * 0.5)) * Math.sin((pitch * 0.5))) * Math.sin((roll * 0.5)));

//      mat4.fromQuat(out, q);    
//      var x = q[0], y = q[1], z = q[2], w = q[3],
      let x2 = x + x,
      y2 = y + y,
      z2 = z + z,

      xx = x * x2,
      yx = y * x2,
      yy = y * y2,
      zx = z * x2,
      zy = z * y2,
      zz = z * z2,
      wx = w * x2,
      wy = w * y2,
      wz = w * z2;

      out.d0 = 1 - yy - zz;
      out.d1 = yx + wz;
      out.d2 = zx - wy;
      out.d3 = 0;

      out.d4 = yx - wz;
      out.d5 = 1 - xx - zz;
      out.d6 = zy + wx;
      out.d7 = 0;

      out.d8 = zx + wy;
      out.d9 = zy - wx;
      out.d10 = 1 - xx - yy;
      out.d11 = 0;

      out.d12 = 0;
      out.d13 = 0;
      out.d14 = 0;
      out.d15 = 1;

      return out;
    }

    static xRotation(r)
    {
      let c = Math.cos(r);
      let s = Math.sin(r);
      let ret = ray.Identity4x4.copy();
      ret.d5 = c;
      ret.d6 = -s;
      ret.d9 = s;
      ret.d10 = c;
      return ret;
    }

    static yRotation(r)
    {
      let c = Math.cos(r);
      let s = Math.sin(r);
      let ret = ray.Identity4x4.copy();
      ret.d0 = c;
      ret.d2 = s;
      ret.d8 = -s;
      ret.d10 = c;
      return ret;
    }

    static zRotation(r)
    {
      let c = Math.cos(r);
      let s = Math.sin(r);
      let ret = ray.Identity4x4.copy();
      ret.d0 = c;
      ret.d1 = -s;
      ret.d4 = s;
      ret.d5 = c;
      return ret;
    }

    static shearing(Xy, Xz, Yx, Yz, Zx, Zy)
    {
      let ret = ray.Identity4x4.copy();
      ret.d1 = Xy;
      ret.d2 = Xz;
      ret.d4 = Yx;
      ret.d6 = Yz;
      ret.d8 = Zx;
      ret.d9 = Zy;
      return ret;
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

          m1.timesM(m2);
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
          C.timesM(B.invert())
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

    static test24()
    {
      return {
        name: "Check translation of a point",
        test: function ()
        {
          let trans = ray.Matrix.translation(5, -3, 2);
          let point = new ray.Point(-3, 4, 5);
          let check = new ray.Point(2, 1, 7);
          let result = trans.times(point);
          if (result.equals(check) == false) return false;
          return true;
        }
      };
    }

    static test25()
    {
      return {
        name: "Check inverse translation of a point",
        test: function ()
        {
          let trans = ray.Matrix.translation(5, -3, 2);
          let point = new ray.Point(-3, 4, 5);
          let check = new ray.Point(-8, 7, 3);
          let result = trans.invert().times(point);
          if (result.equals(check) == false) return false;
          return true;
        }
      };
    }

    static test26()
    {
      return {
        name: "Check translation of a vector",
        test: function ()
        {
          let trans = ray.Matrix.translation(5, -3, 2);
          let vec = new ray.Vector(-3, 4, 5);
          let result = trans.times(vec);
          if (result.equals(vec) == false) return false;
          return true;
        }
      };
    }

    static test27()
    {
      return {
        name: "Check scaling of a point",
        test: function ()
        {
          let mat = ray.Matrix.scale(2, 3, 4);
          let point = new ray.Point(-4, 6, 8);
          let check = new ray.Point(-8, 18, 32);
          let result = mat.times(point);
          if (result.equals(check) == false) return false;
          return true;
        }
      };
    }

    static test28()
    {
      return {
        name: "Check inverse scaling of a point",
        test: function ()
        {
          let mat = ray.Matrix.scale(2, 3, 4);
          let point = new ray.Point(-4, 6, 8);
          let check = new ray.Point(-2, 2, 2);
          let result = mat.invert().times(point);
          if (result.equals(check) == false) return false;
          return true;
        }
      };
    }

    static test29()
    {
      return {
        name: "Check scaling of a vector",
        test: function ()
        {
          let mat = ray.Matrix.scale(2, 3, 4);
          let vec = new ray.Vector(-4, 6, 8);
          let check = new ray.Vector(-8, 18, 32);
          let result = mat.times(vec);
          if (result.equals(check) == false) return false;
          return true;
        }
      };
    }

    static test30()
    {
      return {
        name: "Check reflection scaling of a point",
        test: function ()
        {
          let mat = ray.Matrix.scale(-1, 1, 1);
          let point = new ray.Point(2, 3, 4);
          let check = new ray.Point(-2, 3, 4);
          let result = mat.times(point);
          if (result.equals(check) == false) return false;
          return true;
        }
      };
    }

    static test31()
    {
      return {
        name: "Check rotating a point around X",
        test: function ()
        {
          let p = ray.Point(0, 1, 0);
          let check1 = ray.Point(0, Math.sqrt(2.0) / 2.0, Math.sqrt(2.0) / 2.0);
          let check2 = ray.Point(0, 0, 1);
          let halfQuarter = ray.Matrix.xRotation(Math.PI / 4.0);
          let fullQuarter = ray.Matrix.xRotation(Math.PI / 2.0);
          if (halfQuarter.times(p).equals(check1) == false) return false;
          if (fullQuarter.times(p).equals(check2) == false) return false;
          return true;
        }
      };
    }

    static test32()
    {
      return {
        name: "Check inverse rotation of a point around X",
        test: function ()
        {
          let p = ray.Point(0, 1, 0);
          let check1 = ray.Point(0, Math.sqrt(2.0) / 2.0, Math.sqrt(2.0) / -2.0);
          let halfQuarter = ray.Matrix.xRotation(Math.PI / 4.0);
          if (halfQuarter.invert().times(p).equals(check1) == false) return false;
          return true;
        }
      };
    }

    static test33()
    {
      return {
        name: "Check rotating a point around Y",
        test: function ()
        {
          let p = ray.Point(0, 0, 1);
          let check1 = ray.Point(Math.sqrt(2.0) / 2.0, 0, Math.sqrt(2.0) / 2.0);
          let check2 = ray.Point(1, 0, 0);
          let halfQuarter = ray.Matrix.yRotation(Math.PI / 4.0);
          let fullQuarter = ray.Matrix.yRotation(Math.PI / 2.0);
          if (halfQuarter.times(p).equals(check1) == false) return false;
          if (fullQuarter.times(p).equals(check2) == false) return false;
          return true;
        }
      };
    }

    static test34()
    {
      return {
        name: "Check rotating a point around Z",
        test: function ()
        {
          let p = ray.Point(0, 1, 0);
          let check1 = ray.Point(Math.sqrt(2.0) / -2.0, Math.sqrt(2.0) / 2.0, 0);
          let check2 = ray.Point(-1, 0, 0);
          let halfQuarter = ray.Matrix.zRotation(Math.PI / 4.0);
          let fullQuarter = ray.Matrix.zRotation(Math.PI / 2.0);
          if (halfQuarter.times(p).equals(check1) == false) return false;
          if (fullQuarter.times(p).equals(check2) == false) return false;
          return true;
        }
      };
    }

    static test35()
    {
      return {
        name: "Check shearing moves X relative to Y",
        test: function ()
        {
          let p = ray.Point(2, 3, 4);
          let check = ray.Point(5, 3, 4);
          let shear = ray.Matrix.shearing(1, 0, 0, 0, 0, 0);
          if (shear.times(p).equals(check) == false) return false;
          return true;
        }
      };
    }

    static test36()
    {
      return {
        name: "Check shearing moves X relative to Z",
        test: function ()
        {
          let p = ray.Point(2, 3, 4);
          let check = ray.Point(6, 3, 4);
          let shear = ray.Matrix.shearing(0, 1, 0, 0, 0, 0);
          if (shear.times(p).equals(check) == false) return false;
          return true;
        }
      };
    }

    static test37()
    {
      return {
        name: "Check shearing moves Y relative to X",
        test: function ()
        {
          let p = ray.Point(2, 3, 4);
          let check = ray.Point(2, 5, 4);
          let shear = ray.Matrix.shearing(0, 0, 1, 0, 0, 0);
          if (shear.times(p).equals(check) == false) return false;
          return true;
        }
      };
    }

    static test38()
    {
      return {
        name: "Check shearing moves Y relative to Z",
        test: function ()
        {
          let p = ray.Point(2, 3, 4);
          let check = ray.Point(2, 7, 4);
          let shear = ray.Matrix.shearing(0, 0, 0, 1, 0, 0);
          if (shear.times(p).equals(check) == false) return false;
          return true;
        }
      };
    }

    static test39()
    {
      return {
        name: "Check shearing moves Z relative to X",
        test: function ()
        {
          let p = ray.Point(2, 3, 4);
          let check = ray.Point(2, 3, 6);
          let shear = ray.Matrix.shearing(0, 0, 0, 0, 1, 0);
          if (shear.times(p).equals(check) == false) return false;
          return true;
        }
      };
    }

    static test40()
    {
      return {
        name: "Check shearing moves Z relative to Y",
        test: function ()
        {
          let p = ray.Point(2, 3, 4);
          let check = ray.Point(2, 3, 7);
          let shear = ray.Matrix.shearing(0, 0, 0, 0, 0, 1);
          if (shear.times(p).equals(check) == false) return false;
          return true;
        }
      };
    }

    static test41()
    {
      return {
        name: "Check transformation applied in sequence",
        test: function ()
        {
          let p = ray.Point(1, 0, 1);
          let A = ray.Matrix.xRotation(Math.PI / 2.0);
          let B = ray.Matrix.scale(5, 5, 5);
          let C = ray.Matrix.translation(10, 5, 7);

          let check1 = ray.Point(1, -1, 0);
          p = A.times(p);
          if (p.equals(check1) == false) return false;

          let check2 = ray.Point(5, -5, 0);
          p = B.times(p);
          if (p.equals(check2) == false) return false;

          let check3 = ray.Point(15, 0, 7);
          p = C.times(p);
          if (p.equals(check3) == false) return false;

          return true;
        }
      };
    }
    static test42()
    {
      return {
        name: "Check chained transformations applied in reverse order",
        test: function ()
        {
          let p = ray.Point(1, 0, 1);
          let A = ray.Matrix.xRotation(Math.PI / 2.0);
          let B = ray.Matrix.scale(5, 5, 5);
          let C = ray.Matrix.translation(10, 5, 7);
          let T = C.timesM(B.timesM(A));
          let check = ray.Point(15, 0, 7);
          if (T.times(p).equals(check) == false) return false;
          return true;
        }
      };
    }
  }

  var tmpTouple0 = 0;
  var tmpTouple1 = 0;
  var tmpTouple2 = 0;
  var tmpTouple3 = 0;
//  var tmpTouple = new Array(4);
  var tmp2x2 = new rMatrix(2, 2, [0, 0, 0, 0]);
  var tmp3x3 = new rMatrix(3, 3, [0, 0, 0, 0, 0, 0, 0, 0, 0]);
  var tmp4x4 = new rMatrix(4, 4, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  var tmps = [];
  tmps[2] = tmp2x2;
  tmps[3] = tmp3x3;
  tmps[4] = tmp4x4;

  ray.classlist.push(rMatrix);

  ray.Matrix = rMatrix;
  ray.rawMatrix = function (w, h, d) { ray.counts.matrix += 1; return new rMatrix(w, h, d); }
  ray.Matrix4x4 = function (d) { ray.counts.matrix += 1; return new rMatrix(4, 4, d); }
  ray.Matrix3x3 = function (d) { ray.counts.matrix += 1; return new rMatrix(3, 3, d); }
  ray.Matrix2x2 = function (d) { ray.counts.matrix += 1; return new rMatrix(2, 2, d); }

  ray.Identity4x4 = new rMatrix(4, 4, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  ray.Identity4x4.set = null;
  ray.Identity4x4.multiply = null;
  ray.Identity4x4._times = null;

})();
