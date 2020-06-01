(function (){

  class rShape
  {
    constructor()
    {
      this.id = ray.getUUID();
      this.isObject = true;
      this.transform = ray.Identity4x4;
      this.material = new ray.Material();
      this.shadow = true;
      this.parent = null;
      this.blending = "parent";
      this.inverse = null;
      this.transpose = null

      this.dirty = true;
    }

    getAABB()
    {
      if (!this.aabb) this.fixAABB();
      return this.aabb;
    }

    fixAABB()
    {
    }

    update()
    {
      if (this.dirty) this.clean();
    }

    clean()
    {
      this.dirty = false;
      this.inverse = ray.Matrix.inverse(this.transform);
      this.transpose = ray.Matrix.transpose(this.inverse);
      this.fixAABB();
    }

    setTransform(t)
    {
      this.transform = t;
      this.transpose = null
      this.inverse = null;
      this.dirty = true;
      if (this.parent) this.parent.bbdirty = true;
    }

    normalAt(p)
    {
      if (this.dirty) this.clean();

      let localPoint = p.copy().worldToObject(this);
      let normal = this.local_normalAt(localPoint);
      return normal.vectorToWorld(this);
    }

    intersect(r, hits)
    {
      if (this.dirty) this.clean();
      let r2 = r.transform(this.inverse);
      return this.local_intersect(r2, hits);
    }

    fromJSON(def)
    {
      if (def.blending) this.blending = def.blending;
      if (def.shadow != null) this.shadow = def.shadow;
      if (def.material && ray.World.materials[def.material]) this.material = ray.World.materials[def.material];
      if (def.material)
      {
        if (typeof def.material == "string" && ray.World.materials[def.material]) this.material = ray.World.materials[def.material];
        if (typeof def.material == "object") this.material = ray.World.parseMaterial(def.material); 
      }
      if (def.transform)
      {
        if (typeof def.transform == "string" && ray.World.transforms[def.transform]) { this.transform = ray.World.transforms[def.transform]; this.dirty = true; }
        if (typeof def.transform == "object") { this.transform = ray.World.parseTransform(def.transform); this.dirty = true; }
      }
      this.materialSelf = this.material;
    }

    bakeMaterial()
    {
      if (this.blending == "self") 
      {
        this.material = this.materialSelf;
      }
      else if (this.blending == "parent") 
      {
        this.material = this.parent.material;
      }
      else if (this.blending == "blend") 
      {
        this.material = new ray.Material();
        this.material.clone(this.materialSelf);
        this.material.pattern = new ray.PatternBlend(this.materialSelf.pattern, this.parent.material.pattern);
      }
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
      this.normal = ray.Vector(0, 1, 0);
    }

    fixAABB()
    {
      if (!this.aabb) this.aabb = new rAABB();
      this.aabb.min = ray.Point(this.limits ? this.xMin : -Infinity, 0, this.limits ? this.yMin : -Infinity);
      this.aabb.max = ray.Point(this.limits ? this.xMax : Infinity, 0, this.limits ? this.yMax : Infinity);
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

    local_intersect(r, hits)
    {
//      let ret = ray.Intersections();
      if (Math.abs(r.direction.y) < ray.epsilon) return;

      let d = (-r.origin.y / r.direction.y);
      if (this.limits)
      {
        let p = r.position(d);
        if (this.xMax != null && p.x > this.xMax) return;
        if (this.xMin != null && p.x < this.xMin) return;
        if (this.yMax != null && p.z > this.yMax) return;
        if (this.yMin != null && p.z < this.yMin) return;
      }
      hits.add(ray.Intersection(d, this));
//      return ret;
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
          let points = ray.Intersections();
          s.local_intersect(r, points);
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
          let points = ray.Intersections();
          s.local_intersect(r, points);
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
          let points = ray.Intersections();
          s.local_intersect(r, points);
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
          let points = ray.Intersections();
          s.local_intersect(r, points);
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

    fixAABB()
    {
      if (!this.aabb) this.aabb = new rAABB();
      this.aabb.min = ray.Point(-1,-1,-1);
      this.aabb.max = ray.Point(1,1,1);
    }

    fromJSON(def)
    {
      super.fromJSON(def);
    }

    local_normalAt(p)
    {
      return p.minus(ray.Origin);
    }

    local_intersect(r, hits)
    {
//      let ret = ray.Intersections();

      let sphereToRay = ray.Touple.subtract(r.origin, ray.Origin);
      let a = r.direction.dot(r.direction);
      let b = 2.0 * r.direction.dot(sphereToRay);
      let c = sphereToRay.dot(sphereToRay) - 1;
      let aa = a + a;
      let discr = b * b - 2.0 * aa * c;
      if (discr < 0) return;

      let rootDiscr = Math.sqrt(discr);
      hits.add(ray.Intersection((-b - rootDiscr) / aa, this));
      hits.add(ray.Intersection((-b + rootDiscr) / aa, this));
//      return ret;
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
          let points = ray.Intersections();
          s.intersect(r, points);
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

  class rGlassSphere extends rSphere
  {
    constructor()
    {
      super();
      this.material = new ray.Material();
      this.material.transparency = 1.0;
      this.material.refraction = 1.5;
    }

    // tests
    static test1()
    {
      return {
        name: "Check that glass sphere are glassy",
        test: function ()
        {
          let s = new rGlassSphere();
          if (s.transform.equals(ray.Identity4x4) == false) return false;
          if (s.material.transparency == null || s.material.transparency != 1.0) return false;
          if (s.material.refraction == null || s.material.refraction != 1.5) return false;
          return true;
        }
      };
    }
  }

  class rWireframe extends rShape
  {
    constructor()
    {
      super();
      this.isWireframe = true;
    }

    fixAABB()
    {
      if (!this.aabb) this.aabb = new rAABB();
      this.aabb.min = ray.Point(-1, -1, -1);
      this.aabb.max = ray.Point(1, 1, 1);
    }

    fromJSON(def)
    {
      super.fromJSON(def);
    }

    local_normalAt(p)
    {
      let max = Math.max(Math.abs(p.x), Math.abs(p.y), Math.abs(p.z));
      if (max == Math.abs(p.x)) return ray.Vector(p.x, 0, 0);
      if (max == Math.abs(p.y)) return ray.Vector(0, p.y, 0);
      return ray.Vector(0, 0, p.z);
    }

    checkAxis(origin, dir)
    {
      let minNumerator = -1 - origin;
      let maxNumerator = 1 - origin;
      let min = 0;
      let max = 0;
      if (Math.abs(dir) >= ray.epsilon)
      {
        min = minNumerator / dir;
        max = maxNumerator / dir;
      }
      else
      {
        min = minNumerator * Infinity;
        max = maxNumerator * Infinity;
      }

      if (min > max) return { min: max, max: min }
      return { min: min, max: max }
    }

    local_intersect(r, hits)
    {
      let x = this.checkAxis(r.origin.x, r.direction.x);
      let y = this.checkAxis(r.origin.y, r.direction.y);
      let z = this.checkAxis(r.origin.z, r.direction.z);
      let min = Math.max(x.min, y.min, z.min);
      let max = Math.min(x.max, y.max, z.max);
      if (min <= max)
      {
        let size = 0.02;
        let t = r.direction.copy().times(min).plus(r.origin);
        let xedge = Math.abs(Math.abs(t.x) - 1.0) < size;
        let yedge = Math.abs(Math.abs(t.y) - 1.0) < size;
        let zedge = Math.abs(Math.abs(t.z) - 1.0) < size;
        if ((xedge && yedge) || (xedge && zedge) || (zedge && yedge))
          hits.add(ray.Intersection(min, this));
        t = r.direction.copy().times(max).plus(r.origin);
        xedge = Math.abs(Math.abs(t.x) - 1.0) < size;
        yedge = Math.abs(Math.abs(t.y) - 1.0) < size;
        zedge = Math.abs(Math.abs(t.z) - 1.0) < size;
        if ((xedge && yedge) || (xedge && zedge) || (zedge && yedge))
          hits.add(ray.Intersection(max, this));
      }
    }
  }

  class rCube extends rShape
  {
    constructor()
    {
      super();
      this.isCube = true;
    }

    fixAABB()
    {
      if (!this.aabb) this.aabb = new rAABB();
      this.aabb.min = ray.Point(-1, -1, -1);
      this.aabb.max = ray.Point(1, 1, 1);
    }

    fromJSON(def)
    {
      super.fromJSON(def);
    }

    local_normalAt(p)
    {
      let max = Math.max(Math.abs(p.x), Math.abs(p.y), Math.abs(p.z));
      if (max == Math.abs(p.x)) return ray.Vector(p.x, 0, 0);
      if (max == Math.abs(p.y)) return ray.Vector(0, p.y, 0);
      return ray.Vector(0, 0, p.z);
    }

    checkAxis(origin, dir)
    {
      let minNumerator = -1 - origin;
      let maxNumerator = 1 - origin;
      let min = 0;
      let max = 0;
      if (Math.abs(dir) >= ray.epsilon)
      {
        min = minNumerator / dir;
        max = maxNumerator / dir;
      }
      else
      {
        min = minNumerator * Infinity;
        max = maxNumerator * Infinity;      
      }

      if (min > max) return { min: max, max: min }
      return { min: min, max: max }
    }

    local_intersect(r, hits)
    {
      let x = this.checkAxis(r.origin.x, r.direction.x);
      let y = this.checkAxis(r.origin.y, r.direction.y);
      let z = this.checkAxis(r.origin.z, r.direction.z);
      let min = Math.max(x.min, y.min, z.min);
      let max = Math.min(x.max, y.max, z.max);
      if (min <= max)
      {
        hits.add(ray.Intersection(min, this));
        hits.add(ray.Intersection(max, this));
      }
    }

    // tests
    static test1()
    {
      return {
        name: "Check that a ray intersects a cube",
        test: function ()
        {
          let p = [ray.Point(5,0.5,0),
            ray.Point(-5,0.5,0),
            ray.Point(0.5,5,0),
            ray.Point(0.5,-5,0),
            ray.Point(0.5,0,5),
            ray.Point(0.5,0,-5),
            ray.Point(0,0.5,0)];
          let d = [ray.Vector(-1, 0, 0),
            ray.Vector(1, 0, 0),
            ray.Vector(0, -1, 0),
            ray.Vector(0, 1, 0),
            ray.Vector(0, 0, -1),
            ray.Vector(0, 0, 1),
            ray.Vector(0, 0, 1)];
          let t1 = [4, 4, 4, 4, 4, 4, -1];
          let t2 = [6, 6, 6, 6, 6, 6,  1];
          let c = new rCube();
          for (let i = 0; i < 7; ++i)
          {
            let r = ray.Ray(p[i], d[i]);
            let points = ray.Intersections();
            c.local_intersect(r, points);
            if (points.num != 2) return false;
            if (points.list[0].length != t1[i]) return false;
            if (points.list[1].length != t2[i]) return false;
          }
          return true;
        }
      };
    }

    static test2()
    {
      return {
        name: "Check that a ray misses a cube",
        test: function ()
        {
          let p = [ray.Point(-2, 0, 0),
          ray.Point(0, -2, 0),
          ray.Point(0, 0, -2),
          ray.Point(2, 0, 2),
          ray.Point(0, 2, 2),
          ray.Point(2, 2, 0)];
          let d = [
          ray.Vector(0.2673, 0.5345, 0.8018),
          ray.Vector(0.8018, 0.2673, 0.5345),
          ray.Vector(0.5345, 0.8018, 0.2673),
          ray.Vector(0, 0, -1),
          ray.Vector(0, -1, 0),
          ray.Vector(-1, 0, 0)];
          let c = new rCube();
          for (let i = 0; i < 6; ++i)
          {
            let r = ray.Ray(p[i], d[i]);
            let points = ray.Intersections();
            c.local_intersect(r, points);
            if (points.num != 0) return false;
          }
          return true;
        }
      };
    }

    static test3()
    {
      return {
        name: "Check the normal of a cube",
        test: function ()
        {
          let p = [
            ray.Point(1, 0.5, -0.8),
            ray.Point(-1, -0.2, 0.9),
            ray.Point(-0.4, 1, -0.1),
            ray.Point(0.3, -1, -0.7),
            ray.Point(-0.6, 0.3, 1),
            ray.Point(0.4, 0.4, -1),
            ray.Point(1,1,1),
            ray.Point(-1,-1,-1)];
          let n = [
            ray.Vector(1, 0, 0),
            ray.Vector(-1, 0, 0),
            ray.Vector(0, 1, 0),
            ray.Vector(0, -1, 0),
            ray.Vector(0, 0, 1),
            ray.Vector(0, 0, -1),
            ray.Vector(1, 0, 0),
            ray.Vector(-1, 0, 0)];
          let c = new rCube();
          for (let i = 0; i < 8; ++i)
          {
            let normal = c.local_normalAt(p[i]);
            if (normal.equals(n[i]) == false) return false;
          }
          return true;
        }
      };
    }

  }

  class rCylinder extends rShape
  {
    constructor()
    {
      super();
      this.isCylinder = true;
      this.min = -Infinity;
      this.max = Infinity;
      this.closed = false;
    }

    fixAABB()
    {
      if (!this.aabb) this.aabb = new rAABB();
      this.aabb.min = ray.Point(-1, this.limits ? this.min : -Infinity, -1);
      this.aabb.max = ray.Point( 1, this.limits ? this.max :  Infinity,  1);
    }

    fromJSON(def)
    {
      super.fromJSON(def);
      if (def.min != null) { this.limits = true; this.min = def.min; }
      if (def.max != null) { this.limits = true; this.max = def.max; }      
      if (def.closed != null) { this.closed = def.closed ? true : false; }      
    }

    local_normalAt(p)
    {
      let d = p.x * p.x + p.z * p.z;
      if (d < 1.0 && p.y >= (this.max - ray.epsilon)) return ray.Vector(0, 1, 0);
      else if (d < 1.0 && p.y <= (this.min + ray.epsilon)) return ray.Vector(0, -1, 0);
      else return ray.Vector(p.x, 0, p.z);
    }

    check_cap(r, t)
    {
      let x = r.origin.x + t * r.direction.x;
      let z = r.origin.z + t * r.direction.z;
      return (x * x + z * z) <= 1.0;
    }

    local_intersect(r, hits)
    {
//      let ret = ray.Intersections();
      let a = r.direction.x * r.direction.x + r.direction.z * r.direction.z;

      if (ray.isEqual(a, 0) == false) // hit the walls?
      {
        let b = 2 * r.origin.x * r.direction.x + 2 * r.origin.z * r.direction.z;
        let c = r.origin.x * r.origin.x + r.origin.z * r.origin.z - 1.0;
        let disc = b * b - 4.0 * a * c;
        if (disc < 0) return;

        let aa = 2.0 * a;
        let rootdisc = Math.sqrt(disc);
        let t0 = (-b - rootdisc) / aa;
        let t1 = (-b + rootdisc) / aa;

        if (t0 > t1) { let t = t0; t0 = t1; t1 = t; } // swap

        let y = r.origin.y + t0 * r.direction.y;
        if (this.min < y && y < this.max) hits.add(ray.Intersection(t0, this));

        y = r.origin.y + t1 * r.direction.y;
        if (this.min < y && y < this.max) hits.add(ray.Intersection(t1, this));
      }

      if (this.closed) // hit the ends?
      {
        let t = (this.min - r.origin.y) / r.direction.y;
        if (this.check_cap(r, t)) hits.add(ray.Intersection(t, this));
        t = (this.max - r.origin.y) / r.direction.y;
        if (this.check_cap(r, t)) hits.add(ray.Intersection(t, this));
      }

//      return ret;
    }

    // tests
    static test1()
    {
      return {
        name: "Check that a ray misses a cylinder",
        test: function ()
        {
          let p = [ray.Point(1, 0, 0),  ray.Point(0, 0, 0),  ray.Point(0, 0, -5)];
          let d = [ray.Vector(0, 1, 0), ray.Vector(0, 1, 0), ray.Vector(1, 1, 1)];
          let c = new rCylinder();
          for (let i = 0; i < 3; ++i)
          {
            let r = ray.Ray(p[i], d[i].normalize());
            let points = ray.Intersections();
            c.local_intersect(r, points);
            if (points.num != 0) return false;
          }
          return true;
        }
      };
    }

    static test2()
    {
      return {
        name: "Check that a ray intersects a cylinder",
        test: function ()
        {
          let p =  [ray.Point (1, 0, -5), ray.Point (0, 0, -5), ray.Point (0.5, 0, -5)];
          let d =  [ray.Vector(0, 0,  1), ray.Vector(0, 0,  1), ray.Vector(0.1, 1,  1)];
          let t0 = [                   5,                    4,                6.80798 /*4.80198*/];
          let t1 = [                   5,                    6,                7.08872 /*5*/];
          let c = new rCylinder();
          for (let i = 0; i < 3; ++i)
          {
            let r = ray.Ray(p[i], d[i].normalize());
            let points = ray.Intersections();
            c.local_intersect(r, points);
            if (points.num != 2) return false;
            if (ray.isEqual(points.list[0].length, t0[i]) == false) return false;
            if (ray.isEqual(points.list[1].length, t1[i]) == false) return false;
          }
          return true;
        }
      };
    }

    static test3()
    {
      return {
        name: "Check normals on a cylinder work",
        test: function ()
        {
          let p = [ray.Point(1, 0, 0), ray.Point(0, 5, -1), ray.Point(0, -2, 1), ray.Point(-1, 1, 0)];
          let n = [ray.Vector(1, 0, 0), ray.Vector(0, 0, -1), ray.Vector(0, 0, 1), ray.Vector(-1,0,0)];
          let c = new rCylinder();
          for (let i = 0; i < 4; ++i)
          {
            let norm = c.local_normalAt(p[i]);
            if (norm.equals(n[i]) == false) return false;
          }
          return true;
        }
      };
    }

    static test4()
    {
      return {
        name: "Check default min and max of a cylinder",
        test: function ()
        {
          let c = new rCylinder();
          if (c.min != -Infinity) return false;
          if (c.max != Infinity) return false;
          return true;
        }
      };
    }

    static test5()
    {
      return {
        name: "Check intersecting a constrained cylinder",
        test: function ()
        {
          let p = [ray.Point(0, 1.5, 0), ray.Point(0, 3, -5), ray.Point(0, 0, -5), ray.Point(0, 2, -5), ray.Point(0, 1, -5), ray.Point(0, 1.5, -2)];
          let d = [ray.Vector(0.1, 1, 0), ray.Vector(0, 0, 1), ray.Vector(0, 0, 1), ray.Vector(0, 0, 1), ray.Vector(0, 0, 1), ray.Vector(0, 0, 1)];
          let h = [0, 0, 0, 0, 0, 2];
          let c = new rCylinder();
          c.min = 1;
          c.max = 2;
          for (let i = 0; i < 6; ++i)
          {
            let r = ray.Ray(p[i], d[i].normalize());
            let points = ray.Intersections();
            c.local_intersect(r, points);
            if (points.num != h[i]) return false;
          }
          return true;
        }
      };
    }

    static test6()
    {
      return {
        name: "Check default closed state of a cylinder",
        test: function ()
        {
          let c = new rCylinder();
          if (c.closed != false) return false;
          return true;
        }
      };
    }

    static test7()
    {
      return {
        name: "Check intersecting a constrained, capped cylinder",
        test: function ()
        {
          let p = [ray.Point(0, 3, 0), ray.Point(0, 3, -2), ray.Point(0, 4, -2), ray.Point(0, 0, -2), ray.Point(0, -1, -2)];
          let d = [ray.Vector(0, -1, 0), ray.Vector(0, -1, 2), ray.Vector(0, -1, 1), ray.Vector(0, 1, 2), ray.Vector(0, 1, 1)];
          let h = [2, 2, 2, 2, 2, 2];
          let c = new rCylinder();
          c.min = 1;
          c.max = 2;
          c.closed = true;
          for (let i = 0; i < 5; ++i)
          {
            let r = ray.Ray(p[i], d[i].normalize());
            let points = ray.Intersections();
            c.local_intersect(r, points);
            if (points.num != h[i]) return false;
          }
          return true;
        }
      };
    }

    static test8()
    {
      return {
        name: "Check normals on a cylinder endcaps work",
        test: function ()
        {
          let p = [ray.Point(0, 1, 0), ray.Point(0.5, 1, 0), ray.Point(0, 1, 0.5), ray.Point(0, 2, 0), ray.Point(0.5, 2, 0), ray.Point(0, 2, 0.5)];
          let n = [ray.Vector(0, -1, 0), ray.Vector(0, -1, 0), ray.Vector(0, -1, 0), ray.Vector(0, 1, 0), ray.Vector(0, 1, 0), ray.Vector(0, 1, 0)];
          let c = new rCylinder();
          c.min = 1.0;
          c.max = 2.0;
          c.closed = true;
          for (let i = 0; i < 6; ++i)
          {
            let norm = c.local_normalAt(p[i]);
            if (norm.equals(n[i]) == false) return false;
          }
          return true;
        }
      };
    }
  }

  class rCone extends rShape
  {
    constructor()
    {
      super();
      this.isCone = true;
      this.min = -Infinity;
      this.max = Infinity;
      this.closed = false;
    }

    fixAABB()
    {
      if (!this.aabb) this.aabb = new rAABB();
      let extent = Math.max(this.limits ? Math.abs(this.max) : Infinity, this.limits ? Math.abs(this.min) : Infinity);
      this.aabb.min = ray.Point(-extent, this.limits ? this.min : -Infinity, -extent);
      this.aabb.max = ray.Point( extent, this.limits ? this.max :  Infinity,  extent);
    }

    fromJSON(def)
    {
      super.fromJSON(def);
      if (def.min != null) { this.limits = true; this.min = def.min; }
      if (def.max != null) { this.limits = true; this.max = def.max; }
      if (def.closed != null) { this.closed = def.closed ? true : false; }
    }

    local_normalAt(p)
    {
      let d = p.x * p.x + p.z * p.z;
      if (d < this.max*this.max && p.y >= (this.max - ray.epsilon)) return ray.Vector(0, 1, 0);
      else if (d < this.min*this.min && p.y <= (this.min + ray.epsilon)) return ray.Vector(0, -1, 0);
      else
      {
        let y = Math.sqrt(d);
        y *= (p.y > 0) ? -1 : 1;
        return ray.Vector(p.x, y, p.z);
      }
    }

    check_mincap(r, t)
    {
      let x = r.origin.x + t * r.direction.x;
      let z = r.origin.z + t * r.direction.z;
      return (x * x + z * z) <= this.min * this.min;
    }

    check_maxcap(r, t)
    {
      let x = r.origin.x + t * r.direction.x;
      let z = r.origin.z + t * r.direction.z;
      return (x * x + z * z) <= this.max * this.max;
    }

    local_intersect(r, hits)
    {
//      let ret = ray.Intersections();
      let a = r.direction.x * r.direction.x - r.direction.y * r.direction.y + r.direction.z * r.direction.z;
      let b = 2 * r.origin.x * r.direction.x - 2 * r.origin.y * r.direction.y + 2 * r.origin.z * r.direction.z;

      if (ray.isEqual(a, 0) == true && ray.isEqual(b, 0) == true)
      {
        // missed
        return;
      }
      if (ray.isEqual(a, 0) == true && ray.isEqual(b, 0) == false)// parallel to one cone
      {
        let c = r.origin.x * r.origin.x - r.origin.y * r.origin.y + r.origin.z * r.origin.z;
        let t = -c / (2.0 * b);
        let y = r.origin.y + t * r.direction.y;
        if (this.min < y && y < this.max) hits.add(ray.Intersection(t, this));
      }
      else if (ray.isEqual(a, 0) == false) // hit the walls?
      {
        let c = r.origin.x * r.origin.x - r.origin.y * r.origin.y + r.origin.z * r.origin.z;
        let disc = b * b - 4.0 * a * c;
        if (disc < 0) return;

        let aa = 2.0 * a;
        let rootdisc = Math.sqrt(disc);
        let t0 = (-b - rootdisc) / aa;
        let t1 = (-b + rootdisc) / aa;

        if (t0 > t1) { let t = t0; t0 = t1; t1 = t; } // swap

        let y = r.origin.y + t0 * r.direction.y;
        if (this.min < y && y < this.max) hits.add(ray.Intersection(t0, this));

        y = r.origin.y + t1 * r.direction.y;
        if (this.min < y && y < this.max) hits.add(ray.Intersection(t1, this));
      }

      if (this.closed) // hit the ends?
      {
        let t = (this.min - r.origin.y) / r.direction.y;
        if (this.check_mincap(r, t)) hits.add(ray.Intersection(t, this));
        t = (this.max - r.origin.y) / r.direction.y;
        if (this.check_maxcap(r, t)) hits.add(ray.Intersection(t, this));
      }

//      return ret;
    }

    // tests
    static test1()
    {
      return {
        name: "Check that a ray intersects a cone",
        test: function ()
        {
          let p = [ray.Point(0, 0, -5), ray.Point(0, 0, -5), ray.Point(1, 1, -5)];
          let d = [ray.Vector(0, 0, 1), ray.Vector(1, 1, 1), ray.Vector(-0.5, -1, 1)];
          let t0 = [5, 8.66025, 4.55006 ];
          let t1 = [5, 8.66025, 49.44994 ];
          let c = new rCone();
          for (let i = 0; i < 3; ++i)
          {
            let r = ray.Ray(p[i], d[i].normalize());
            let points = ray.Intersections();
            c.local_intersect(r, points);
            if (points.num != 2) return false;
            if (ray.isEqual(points.list[0].length, t0[i]) == false) return false;
            if (ray.isEqual(points.list[1].length, t1[i]) == false) return false;
          }
          return true;
        }
      };
    }

    static test2()
    {
      return {
        name: "Check that a ray parallel to a side intersects a cone",
        test: function ()
        {
          let c = new rCone();
          let r = ray.Ray(ray.Point(0, 0, -1), ray.Vector(0, 1, 1).normalize());
          let points = ray.Intersections();
          c.local_intersect(r, points);
          if (points.num != 1) return false;
          if (ray.isEqual(points.list[0].length, 0.35355) == false) return false;
          return true;
        }
      };
    }
    static test3()
    {
      return {
        name: "Check normals on a cone work",
        test: function ()
        {
          let p = [ray.Point(0, 0, 0), ray.Point(1, 1, 1), ray.Point(-1, -1, 0)];
          let n = [ray.Vector(0, 0, 0), ray.Vector(1, -Math.sqrt(2), 1), ray.Vector(-1, 1, 0)];
          let c = new rCone();
          for (let i = 0; i < 3; ++i)
          {
            let norm = c.local_normalAt(p[i]);
            if (norm.equals(n[i]) == false) return false;
          }
          return true;
        }
      };
    }

    static test4()
    {
      return {
        name: "Check intersecting a capped cone",
        test: function ()
        {
          let p = [ray.Point(0, 0, -5), ray.Point(0, 0, -0.25), ray.Point(0, 0, -0.25)];
          let d = [ray.Vector(0, 1, 0), ray.Vector(0, 1, 1), ray.Vector(0, 1, 0)];
          let h = [0, 2, 4];
          let c = new rCone();
          c.min = -1.5;
          c.max = 1.5;
          c.closed = true;
          for (let i = 0; i < 3; ++i)
          {
            let r = ray.Ray(p[i], d[i].normalize());
            let points = ray.Intersections();
            c.local_intersect(r, points);
            if (points.num != h[i]) return false;
          }
          return true;
        }
      };
    }
  }

  class rAABB
  {
    constructor()
    {
      this.wireframe = null;
      this.clear();
    }

    clear()
    {
      this.min = null; // point
      this.max = null; // point
    }

    updateWireframe()
    {
      if (!this.max || !this.min) return;
      if (!this.wireframe) this.wireframe = new rWireframe();
      let scale = ray.Matrix.scale((this.max.x - this.min.x) / 2.0, (this.max.y - this.min.y) / 2.0, (this.max.z - this.min.z)/2.0);
      let pos = ray.Matrix.translation(this.min.x + (this.max.x - this.min.x) / 2.0,
                                       this.min.y + (this.max.y - this.min.y) / 2.0,
                                       this.min.z + (this.max.z - this.min.z) / 2.0);
      this.wireframe.setTransform(pos.times(scale));
    }

    merge(obj)
    {
      let aabb = obj.getAABB();
      let p1 = obj.transform.times(ray.Point(aabb.min.x, aabb.min.y, aabb.min.z));
      let p2 = obj.transform.times(ray.Point(aabb.min.x, aabb.min.y, aabb.max.z));
      let p3 = obj.transform.times(ray.Point(aabb.min.x, aabb.max.y, aabb.min.z));
      let p4 = obj.transform.times(ray.Point(aabb.min.x, aabb.max.y, aabb.max.z));
      let p5 = obj.transform.times(ray.Point(aabb.max.x, aabb.min.y, aabb.min.z));
      let p6 = obj.transform.times(ray.Point(aabb.max.x, aabb.min.y, aabb.max.z));
      let p7 = obj.transform.times(ray.Point(aabb.max.x, aabb.max.y, aabb.min.z));
      let p8 = obj.transform.times(ray.Point(aabb.max.x, aabb.max.y, aabb.max.z));
      let minx = Math.min(p1.x, p2.x, p3.x, p4.x, p5.x, p6.x, p7.x, p8.x);
      let miny = Math.min(p1.y, p2.y, p3.y, p4.y, p5.y, p6.y, p7.y, p8.y);
      let minz = Math.min(p1.z, p2.z, p3.z, p4.z, p5.z, p6.z, p7.z, p8.z);
      let maxx = Math.max(p1.x, p2.x, p3.x, p4.x, p5.x, p6.x, p7.x, p8.x);
      let maxy = Math.max(p1.y, p2.y, p3.y, p4.y, p5.y, p6.y, p7.y, p8.y);
      let maxz = Math.max(p1.z, p2.z, p3.z, p4.z, p5.z, p6.z, p7.z, p8.z);
      if (!this.min) this.min = ray.Point(minx, miny, minz);
      else this.min.setv(Math.min(this.min.x, minx), Math.min(this.min.y, miny), Math.min(this.min.z, minz));
      if (!this.max) this.max = ray.Point(maxx, maxy, maxz);
      else this.max.setv(Math.max(this.max.x, maxx), Math.max(this.max.y, maxy), Math.max(this.max.z, maxz));
    }

    checkAxis(origin, dir, lmin, lmax)
    {
      let minNumerator = lmin - origin;
      let maxNumerator = lmax - origin;
      let min = 0;
      let max = 0;
      if (Math.abs(dir) >= ray.epsilon)
      {
        min = minNumerator / dir;
        max = maxNumerator / dir;
      }
      else
      {
        min = minNumerator * Infinity;
        max = maxNumerator * Infinity;
      }

      if (min > max) return { min: max, max: min }
      return { min: min, max: max }
    }

    intersects(r)
    {
      if (!this.min || !this.max) return false;
      let x = this.checkAxis(r.origin.x, r.direction.x, this.min.x, this.max.x);
      let y = this.checkAxis(r.origin.y, r.direction.y, this.min.y, this.max.y);
      let z = this.checkAxis(r.origin.z, r.direction.z, this.min.z, this.max.z);
      let min = Math.max(x.min, y.min, z.min);
      let max = Math.min(x.max, y.max, z.max);
      if (min <= max) return true;
      return false;
    }
  }

  class rGroup extends rShape
  {
    constructor()
    {
      super();
      this.isGroup = true;
      this.children = {};
      this.bbdirty = false;
    }

    getAABB()
    {
      if (!this.aabb)
      {
        this.bbdirty = true;
        this.aabb = new rAABB();
      }
      if (this.bbdirty)
      {
        this.bbdirty = false;
        this.aabb.clear();
        for (let c in this.children)
        {
          let child = this.children[c];
          this.aabb.merge(child);
        }
        this.aabb.updateWireframe();
      }
      return this.aabb;
    }

    fromJSON(def)
    {
      super.fromJSON(def);

      if (def.children)
      {
        for (let c in def.children)
        {
          let o = ray.World.getWidget(def.children[c]);
          if (o) this.addChild(o);
        }
      }
    }

    local_normalAt(p)
    {
    }

    local_intersect(r, hits)
    {
//      if (this.getAABB().intersects(r) == false) return;

      for (let c in this.children)
      {
        let child = this.children[c];
        child.intersect(r, hits);
      }
    }

    contains(c)
    {
      if (Object.keys(this.children).includes(""+c.id) == false) return false;
      if (this.children[c.id] == null) return false;
      return true;
    }

    removeChild(c)
    {
      c.parent = null;
      delete this.children[c.id];
      this.bbdirty = true;
    }

    addChild(c)
    {
      if (!c || this.contains(c)) return;

      if (c.parent) c.parent.removeChild(c);
      c.parent = this;
      this.children[c.id] = c;
      c.bakeMaterial();
      this.bbdirty = true;
    }

    numChildren()
    {
      return Object.keys(this.children).length;
    }

    // tests
    static test1()
    {
      return {
        name: "Check creating a group",
        test: function ()
        {
          let g = new rGroup();
          if (ray.Identity4x4.equals(g.transform) == false) return false;
          if (g.numChildren() != 0) return false;
          return true;
        }
      };
    }

    static test2()
    {
      return {
        name: "Check that a parent exists and is null",
        test: function ()
        {
          let g = new rTestShape();
          if (g.parent === null) return true;
          return false;
        }
      };
    }

    static test3()
    {
      return {
        name: "Check adding a child to a group",
        test: function ()
        {
          let g = new rGroup();
          let s = new rTestShape();
          g.addChild(s);
          if (g.numChildren() != 1) return false;
          if (g.contains(s) == false) return false;
          if (s.parent.id != g.id) return false;
          return true;
        }
      };
    }

    static test4()
    {
      return {
        name: "Check intersecting a ray with a empty group",
        test: function ()
        {
          let g = new rGroup();
          let r = ray.Ray(ray.Point(0, 0, 0), ray.Vector(0, 0, 1));
          let points = ray.Intersections();
          g.local_intersect(r, points);
          if (points.num != 0) return false;
          return true;
        }
      };
    }

    static test5()
    {
      return {
        name: "Check intersecting a ray with a group",
        test: function ()
        {
          let g = new rGroup();
          let s1 = new ray.Sphere();
          let s2 = new ray.Sphere();
          s2.setTransform(ray.Matrix.translation(0, 0, -3));
          let s3 = new ray.Sphere();
          s3.setTransform(ray.Matrix.translation(5, 0, 0));
          g.addChild(s1);
          g.addChild(s2);
          g.addChild(s3);
          let r = ray.Ray(ray.Point(0, 0, -5), ray.Vector(0, 0, 1));
          let points = ray.Intersections();
          g.local_intersect(r, points);
          if (points.num != 4) return false;
          if (points.list[0].object.id != s2.id) return false;
          if (points.list[1].object.id != s2.id) return false;
          if (points.list[2].object.id != s1.id) return false;
          if (points.list[3].object.id != s1.id) return false;
          return true;
        }
      };
    }

    static test6()
    {
      return {
        name: "Check group transforms work",
        test: function ()
        {
          let g = new rGroup();
          g.setTransform(ray.Matrix.scale(2, 2, 2));
          let s = new ray.Sphere();
          s.setTransform(ray.Matrix.translation(5, 0, 0));
          g.addChild(s);
          let r = ray.Ray(ray.Point(10, 0, -10), ray.Vector(0, 0, 1));
          let points = ray.Intersections();
          g.intersect(r, points);
          if (points.num != 2) return false;
          return true;
        }
      };
    }

    static test7()
    {
      return {
        name: "Convert a point from world to object",
        test: function ()
        {
          let g1 = new rGroup();
          g1.setTransform(ray.Matrix.yRotation(Math.PI/2.0));
          let g2 = new rGroup();
          g2.setTransform(ray.Matrix.scale(2,2,2));
          let s = new ray.Sphere();
          s.setTransform(ray.Matrix.translation(5, 0, 0));
          g1.addChild(g2);
          g2.addChild(s);
          let p = ray.Point(-2, 0, -10);
          p.worldToObject(s);
          let p2 = ray.Point(0, 0, -1);
          if (p2.equals(p) == false) return false;
          return true;
        }
      };
    }

    static test8()
    {
      return {
        name: "Convert a vector from world to object",
        test: function ()
        {
          let g1 = new rGroup();
          g1.setTransform(ray.Matrix.yRotation(Math.PI / 2.0));
          let g2 = new rGroup();
          g2.setTransform(ray.Matrix.scale(1, 2, 3));
          let s = new ray.Sphere();
          s.setTransform(ray.Matrix.translation(5, 0, 0));
          g1.addChild(g2);
          g2.addChild(s);
          let p = ray.Vector(Math.sqrt(3.0) / 3.0, Math.sqrt(3.0) / 3.0, Math.sqrt(3.0) / 3.0);
          p.vectorToWorld(s);
          let p2 = ray.Vector(0.2857, 0.4286, -0.8571);
          ray.lowrez();
          if (p2.equals(p) == false) return false;
          ray.hirez();
          return true;
        }
      };
    }

    static test9()
    {
      return {
        name: "Get the normal of a group ",
        test: function ()
        {
          let g1 = new rGroup();
          g1.setTransform(ray.Matrix.yRotation(Math.PI / 2.0));
          let g2 = new rGroup();
          g2.setTransform(ray.Matrix.scale(1, 2, 3));
          let s = new ray.Sphere();
          s.setTransform(ray.Matrix.translation(5, 0, 0));
          g1.addChild(g2);
          g2.addChild(s);
          let p = s.normalAt(ray.Point(1.7321, 1.1547, -5.5774));
          let p2 = ray.Vector(0.2857, 0.4286, -0.8571);
          ray.lowrez();
          if (p2.equals(p) == false) return false;
          ray.hirez();
          return true;
        }
      };
    }

  }

  class rHexagon extends rGroup
  {
    constructor()
    {
      super();
      for (let i = 0; i < 6; ++i)
      {
        let side = this.createSide();
        side.setTransform(ray.Matrix.yRotation(i * Math.PI / 3.0));
        this.addChild(side);
      }
    }

    createSide()
    {
      let side = new rGroup();
      side.addChild(this.createCorner());
      side.addChild(this.createEdge());
      return side;
    }

    createEdge()
    {
      let edge = new rCylinder();
      edge.min = 0;
      edge.max = 1;
      edge.limits = true;
      edge.setTransform(       ray.Matrix.translation(0, 0, -1)
                        .times(ray.Matrix.yRotation(-1 * Math.PI / 6.0))
                        .times(ray.Matrix.zRotation(-1 * Math.PI / 2.0))
                        .times(ray.Matrix.scale(0.25, 1, 0.25)));
      return edge;
    }

    createCorner()
    {
      let corner = new rSphere();
      corner.setTransform(       ray.Matrix.translation(0, 0, -1)
                          .times(ray.Matrix.scale(0.25, 0.25, 0.25)));
      return corner;
    }
  }

  var startingID = 12345;
  function generateUUID()
  { 
    return startingID++;
  }

  ray.getUUID = generateUUID;

  ray.classlist.push(rSphere);
  ray.classlist.push(rPlane);
  ray.classlist.push(rGlassSphere);
  ray.classlist.push(rCube);
  ray.classlist.push(rCylinder);
  ray.classlist.push(rCone);
  ray.classlist.push(rGroup);
  ray.Cone = rCone;
  ray.Cylinder = rCylinder;
  ray.Cube = rCube;
  ray.GlassSphere = rGlassSphere;
  ray.Plane = rPlane;
  ray.Sphere = rSphere;
  ray.TestShape = rTestShape;
  ray.Group = rGroup;
  ray.Wireframe = rWireframe;
  ray.Hexagon = rHexagon;
  ray.AABB = rAABB;
})();
