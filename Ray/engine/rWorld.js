(function ()
{
  function loadCheck()
  {
    if (ray.World.loading <= 0)
    {
      ray.World.loadingCB();
    }
    setTimeout(loadCheck, 10);
  }

  class rWorld
  {
    constructor()
    {
      this.reset();
    }

    reset()
    {
      this.loadingCB = null;
      this.patterns = {}; // just a cache
      this.materials = {}; // just a cache
      this.transforms = {}; // just a cache
      this.objects = [];
      this.widgets = {};  // non rendering group children
      this.lights = [];
      this.cameras = {};
      this.options = {
        lighting: true,
        shadowing: true,
        jigglePoints: false,
        threaded: true,
        maxReflections: 5,
        wireframes: false,
        regroup: false
      }

      this.modeCaustics = false;
      this.minCaustics = 1;

      this.causticFilter = new Array(400 * 400);
    }

    causticMode(val)
    {
      this.options.threaded = !val;
      this.modeCaustics = val;
    }

    setCamera(c, name)
    {
      this.cameras[name] = c;
    }

    render(name)
    {
      let c = this.cameras[name];
      if (!c) return;
      if (!c.canvas) return;

      for (let y = 0; y < c.height; ++y)
      {
        for (let x = 0; x < c.width; ++x)
        {
          let colour = this.renderPixel(x, y, c);
          c.canvas.set(colour, x, y);
        }
      }
    }

    renderPixel(x, y, c)
    {
      ray.counts = {
        touple: 0,
        matrix: 0,
        colour: 0,
        ray: 0,
        intersection: 0,
        intersections: 0
      };

      if (this.modeCaustics)
      {
        // if we are in caustics mode, we do not render pixels. each call for a pixel will instead render N rays from each light
        for (let l in this.lights)
        {
          for (let i = 0; i < this.objects.length; ++i)
          {
            let origin = this.lights[l].position;

            for (let t = 0; t < 10; ++t)
            {
              let jiggle = ray.Point(Math.random() * 5 - 2.5, Math.random() * 5 - 2.5, Math.random() * 5 - 2.5);
              let p = this.objects[i].transform.times(ray.Origin.copy().plus(jiggle));
              let direction = p.copy().minus(origin);
              let r = ray.Ray(origin, direction.normalize());
              this.causticCast(this.lights[l], r);
            }
          }
        }
        return;
      }

      let colour = ray.Black;
      let factor = 1.0;
      if (this.options.antialias > 1)
      {
        let ray1 = c.getRayAt(x, y, 0.25, 0.25);
        let ray4 = c.getRayAt(x, y, 0.75, 0.75);
        let colour1 = this.cast(ray1);
        let colour4 = this.cast(ray4);
        colour = colour4.copy().plus(colour1);
        factor = 0.5;
        if (this.options.antialias > 2)
        {
          let ray2 = c.getRayAt(x, y, 0.25, 0.75);
          let ray3 = c.getRayAt(x, y, 0.75, 0.25);
          let colour2 = this.cast(ray2);
          let colour3 = this.cast(ray3);
          colour.plus(colour2).plus(colour3);
          factor = 0.25;
        }
        colour.times(factor);
      }
      else
      {
        let ray = c.getRayAt(x, y);
        colour = this.cast(ray);
      }
      return colour;
    }

    renderRowToBuffer(name, y, buffer)
    {
      let c = this.cameras[name];
      if (!c) return;

      let index = 0;
      for (let x = 0; x < c.width; ++x)
      {
        let colour = this.renderPixel(x, y, c);
        if (!this.modeCaustics)
        {
          buffer[index++] = colour.redByte;
          buffer[index++] = colour.greenByte;
          buffer[index++] = colour.blueByte;
          buffer[index++] = 255;
        }
      }
    }

    setToDefault()
    {
      this.materials = {}; // just a cache
      this.transforms = {}; // just a cache
      this.objects = [];
      this.widgets = {};
      this.lights = [];
      this.lights.push(new ray.LightPoint(ray.Point(-10, 10, -10), ray.RGBColour(1, 1, 1)));

      let m = new ray.Material();
      m.colour = ray.RGBColour(0.8, 1.0, 0.6);
      m.diffuse = 0.7;
      m.specular = 0.2;
      this.materials["default"] = m;

      let sphere1 = new ray.Sphere();
      sphere1.material = m;
      this.objects.push(sphere1);

      let sphere2 = new ray.Sphere();
      sphere2.setTransform(ray.Matrix.scale(0.5, 0.5, 0.5));
      this.objects.push(sphere2);
    }

    intersect(r)
    {
      let ret = ray.Intersections();
      for (let i = 0; i < this.objects.length; ++i)
      {
        // TODO intersect lights
        this.objects[i].intersect(r, ret);
      }
      //      ret.sort();
      return ret;
    }

    cast(r, depth)
    {
      if (depth == null) depth = this.options.maxReflections;

      let points = this.intersect(r);
      let hit = points.hit();
      if (!hit) return ray.Black.copy();
      let comp = hit.precompute(r, points);
      return ray.Render.getColourFor(comp, depth);
    }

    //------------------
    // CAUSTIC

    causticCast(l, r)
    {
      // cast the ray until hit non transpart
      // find where spot is in camera view
      // write to location in buffer

      let depth = this.options.maxReflections;
      let hit = null;
      let lensed = false;

      do
      {
        let points = this.intersect(r);
        hit = points.hit();
        if (!hit)
        {
          hit = null;
          break;
        }
        //  we have a hit - is it transparent? - keep going, it lensed
        //  it has to be speculat - try doing the dot test normal.eye
        //  what is eye? just use the vector itself
        if (hit.object.material.transparency)
        {
          let comp = hit.precompute(r, points);
          let reflect = ray.Touple.reflect(r.direction, comp.normal);
          let reflectDotEye = reflect.dot(comp.eye);
          if (reflectDotEye <= 0)
          {
            hit = null;
            break;
          }
          r = ray.Render.getRefractedRay(comp);
          lensed = true;
          if (!r) break;
          continue;
        }
        // is it reflective? keep going
        if (hit.object.material.reflective)
        {
          let comp = hit.precompute(r, points);
          r = ray.Ray(comp.overPoint.copy(), comp.reflect.copy());
          depth--;
          continue;
        }
        // stop, draw caustic 
        break;
      } while (depth > 0);

      if (hit && lensed && r)
      {
        // we have a hit where a caustic appears
        // find where it in is camera space
        let c = this.cameras["main"];
        let x = -1;
        let y = -1;
        let p = r.origin.copy().plus(r.direction.normalize().times(hit.length)); // point in real world
        p.minus(c.position).normalize(); // vector from camera to point
        // untransform it
        p = c.transform.times(p);
        // convert to canvas coords
        x = (c.halfWidth - p.x) / c.pixelSize - 0.5;
        y = (c.halfHeight - p.y) / c.pixelSize - 0.5;

        if (x >= 0 && y >= 0 && x <= c.width && y <= c.height)
        {
          //          let index = (y * 400 + x) | 0;
          //          if (!this.causticFilter[index]) this.causticFilter[index] = 1;
          //          else this.causticFilter[index] += 1;
          //          if (this.causticFilter[index] > this.minCaustics)
          {
            //            this.causticFilter[index] = 0;
            let colour = {};
            c.canvas.get(colour, x, y);
            colour.red += 0.004;
            colour.green += 0.004;
            colour.blue += 0.004;
            c.canvas.set(colour, x, y);
          }
        }
      }
    }

    //--------------------
    // REGROUP

    regroup()
    {
      let topgroup = new ray.Group();
      for (let i in this.objects)
      {
        let o = this.objects[i];
        o.blending = "self";
        topgroup.addChild(o);
      }
      this.objects = [];
      this.objects.push(topgroup);
      this.split(topgroup);
      // put all top level objects in a group.
      // set them all to self
      // split group
    }

    split(group)
    {
      console.log("Split group: " + group.numChildren() + " children");

      if (group.numChildren() < 4) return;
      let box = new ray.AABB();
      box.min = group.getAABB().min.copy();
      box.max = group.getAABB().max.copy();
      let size = { x: box.max.x - box.min.x, y: box.max.y - box.min.y, z: box.max.z - box.min.z };
      console.log(" size: " + size.x + " x " + size.y + " x " + size.z);
      let sub = { x: box.splitX(), y: box.splitY(), z: box.splitZ() };
      let score = { x: group.subsumeScore(sub.x), y: group.subsumeScore(sub.y), z: group.subsumeScore(sub.z) };
      let child = null;
      if (score.x && (!score.y || score.x.value <= score.y.value))
      {
        if (score.x && (!score.z || score.x.value <= score.z.value))
          child = score.x;
        else
          child = score.z;
      }
      if (score.y && (!score.x || score.y.value <= score.x.value))
      {
        if (score.y && (!score.z || score.y.value <= score.z.value))
          child = score.y;
        else
          child = score.z;
      }
      if (score.z && (!score.y || score.z.value <= score.y.value))
      {
        if (score.z && (!score.x || score.z.value <= score.x.value))
          child = score.z;
        else
          child = score.x;
      }
      if (!child) { console.log(" no split"); return; }
      let left = new ray.Group();
      let right = new ray.Group();
      for (let i in child.list[0]) left.addChild(child.list[0][i]);
      for (let i in child.list[1]) right.addChild(child.list[1][i]);
      group.addChild(left);
      group.addChild(right);
      console.log(" subgroup children: " + left.numChildren() + ", " + right.numChildren());

      this.split(left);
      this.split(right);

      // split
      // find the total aabb size
      // split into 2 aabbs in x,y and z
      // for all childs, try to fit into a aabb for each
      // which dir has best split?
      // none? end
      // create aabbs with objs.
      // leave obj that dont fit in parent
      // recurse group 1 and 2 (if above max obj)
    }

    //--------------------
    // PARSE
    loadFromJSON(json, cb)
    {
      this.reset();
      this.loadingCB = cb;
      if (json.renderOptions) this.parseRenderOptions(json.renderOptions);
      if (json.transforms) this.parseTransforms(json.transforms);
      if (json.patterns) this.parsePatterns(json.patterns);
      if (json.materials) this.parseMaterials(json.materials);
      if (json.lights) this.parseLights(json.lights);
      if (json.widgets) this.parseWidgets(json.widgets);
      if (json.objects) this.parseObjects(json.objects);
      if (json.cameras) this.parseCameras(json.cameras);
      if (cb && json.meshes) this.parseMeshes(json.meshes);

      if (this.options.regroup) this.regroup();

      if (this.loading)
      {
        setTimeout(loadCheck, 10);
      }
      else if (cb) cb();
    }
    
    parseCameras(data)
    {
      for (let i in data)
      {
        if (!data[i].name) continue;
        if (!data[i].width) continue;
        if (!data[i].height) continue;
        if (!data[i].fov) continue;
        let c = new ray.Camera(data[i].width, data[i].height, data[i].fov);
        c.fromJSON(data[i]);
        this.cameras[data[i].name] = c;
      }
    }

    parseRenderOptions(data)
    {
      if (data.shadowDepth != null) ray.Render.shadowDepth = ((data.shadowDepth < 1) ? 1 : data.shadowDepth);
      if (data.lighting != null) this.options.lighting = data.lighting;
      if (data.antialias != null) this.options.antialias = data.antialias;
      if (data.shadowing != null) this.options.shadowing = data.shadowing;
      if (data.jigglePoints != null) this.options.jigglePoints = data.jigglePoints;
      if (data.maxReflections != null) this.options.maxReflections = data.maxReflections;
      if (data.threaded != null) this.options.threaded = data.threaded;
      if (data.wireframes != null) this.options.wireframes = data.wireframes;
      if (data.regroup != null) this.options.regroup = data.regroup;
      if (data.caustics != null)
      {
        this.modeCaustics = data.caustics;
        this.minCaustics = data.minCaustics;
        this.options.threaded = !data.caustics;
      }
    }

    parseTransforms(data)
    {
      for (let i in data)
      {
        if (!data[i].name) continue;
        this.transforms[data[i].name] = this.parseTransform(data[i]);
      }
    }

    parseTransform(transform)
    {
      let trans = ray.Identity4x4.copy();
      for (let j in transform.series)
      {
        let obj = transform.series[j];
        let M = null;
        if (obj.type == "T") M = ray.Matrix.translation(obj.value[0], obj.value[1], obj.value[2]);
        else if (obj.type == "S") M = ray.Matrix.scale(obj.value[0], obj.value[1], obj.value[2]);
        else if (obj.type == "Rx") M = ray.Matrix.xRotation(obj.value);
        else if (obj.type == "Ry") M = ray.Matrix.yRotation(obj.value);
        else if (obj.type == "Rz") M = ray.Matrix.zRotation(obj.value);
        else if (obj.type == "SH") M = ray.Matrix.shearing(obj.value[0], obj.value[1], obj.value[2], obj.value[3], obj.value[4], obj.value[5]);
        if (M) trans.times(M);
      }
      return trans;
    }

    parseMaterials(data)
    {
      for (let i in data)
      {
        if (!data[i].name) continue;
        this.materials[data[i].name] = this.parseMaterial(data[i]);
      }
    }

    parseMaterial(data)
    {
      let mat = new ray.Material();
      mat.fromJSON(data);
      return mat;
    }

    parsePatterns(data)
    {
      for (let i in data)
      {
        if (!data[i].name) continue;
        this.patterns[data[i].name] = this.parsePattern(data[i]);
      }
    }

    parsePattern(data)
    {
      let p = null;
      if (data.type == "solid") p = new ray.PatternSolid();
      else if (data.type == "stripe") p = new ray.PatternStripe();
      else if (data.type == "gradient") p = new ray.PatternGradient();
      else if (data.type == "ring") p = new ray.PatternRing();
      else if (data.type == "checker") p = new ray.PatternChecker();
      else if (data.type == "blend") p = new ray.PatternBlend();
      else if (data.type == "perlin") p = new ray.PatternPerlin();
      if (p) p.fromJSON(data);
      return p;
    }

    parseLights(data)
    {
      for (let i in data)
      {
        if (data[i].type == "pointlight")
        {
          let p = ray.Origin;
          let c = ray.White;
          if (null != data[i].position) p = ray.Point(data[i].position[0], data[i].position[1], data[i].position[2]);
          if (null != data[i].colour) c = ray.RGBColour(data[i].colour[0], data[i].colour[1], data[i].colour[2]);
          let obj = new ray.LightPoint(p, c);
          obj.fromJSON(data[i]);
          this.lights.push(obj);
        }
      }
    }

    parseObject(data)
    {
      if (data.skip) return null;
      if (data.type == "sphere")
      {
        let obj = new ray.Sphere();
        obj.fromJSON(data);
        return obj;
      }
      else if (data.type == "plane")
      {
        let obj = new ray.Plane();
        obj.fromJSON(data);
        return obj;
      }
      else if (data.type == "cube")
      {
        let obj = new ray.Cube();
        obj.fromJSON(data);
        return obj;
      }
      else if (data.type == "wireframe")
      {
        let obj = new ray.Wireframe();
        obj.fromJSON(data);
        return obj;
      }
      else if (data.type == "cylinder")
      {
        let obj = new ray.Cylinder();
        obj.fromJSON(data);
        return obj;
      }
      else if (data.type == "cone")
      {
        let obj = new ray.Cone();
        obj.fromJSON(data);
        return obj;
      }
      else if (data.type == "group")
      {
        let obj = new ray.Group();
        obj.fromJSON(data);
        return obj;
      }
      else if (data.type == "hexagon")
      {
        let obj = new ray.Hexagon();
        obj.fromJSON(data);
        return obj;
      }
    }

    parseObjects(data)
    {
      for (let i in data)
      {
        let o = this.parseObject(data[i]);
        if (o)
        {
          this.objects.push(o);
          if (this.options.wireframes)
          {
            //            if (data[i].type == "group")
            //            {
            //              this.objects.push(o.getAABB().wireframe);
            //            }
            //            else if (data[i].type == "hexagon")
            //            {
            //              let aabb = new ray.AABB();
            //              aabb.merge(o);
            //              aabb.updateWireframe();
            //              this.objects.push(aabb.wireframe);
            //              this.objects.push(o.getAABB().wireframe);
            //            }
            //            else
            {
              this.addWireframes(o);
            }
          }
        }
      }
    }

    parseMeshes(data)
    {
      for (let i in data)
      {
        if (data[i].skip || !data[i].name || !data[i].file) return null;

        let obj = new ray.Mesh(data[i].name, data[i].file);
        this.objects.push(obj);
      }
    }

    addWireframes(o)
    {
      if (o) 
      {
        let aabb = new ray.AABB();
        aabb.merge(o);
        aabb.updateWireframe();
        this.objects.push(aabb.wireframe);
      }
//      if (o.children)
//      {
//        for (let i in o.children) this.addWireframes(o.children[i]);
//      }
    }

    parseWidgets(data)
    {
      for (let i in data)
      {
        let name = data[i].name;
        this.widgets[name] = data[i];
      }
    }

    getWidget(name)
    {
      let o = this.parseObject(this.widgets[name]);
      return o;
    }

    incrLoading()
    {
      this.loading += 1;
    }

    decrLoading()
    {
      this.loading -= 1;
    }

    loadingError(name)
    {
      console.log("Error loading " + name);
    }

    static test1()
    {
      return {
        name: "Check that world can be created",
        test: function ()
        {
          let w = new rWorld();
          if (w.objects.length != 0) return false;
          if (w.lights.length != 0) return false;
          return true;
        }
      };
    }

    static test2()
    {
      return {
        name: "Check that default world can be created",
        test: function ()
        {
          let w = new rWorld();
          w.setToDefault();
          if (w.objects.length != 2) return false;
          if (w.lights.length != 1) return false;
          if (w.lights[0].position.x != -10) return false;
          if (w.objects[0].material.specular != 0.2) return false;
          if (w.objects[1].transform.equals(ray.Matrix.scale(0.5, 0.5, 0.5)) == false) return false;
          return true;
        }
      };
    }

    static test3()
    {
      return {
        name: "Check that a ray can intersect the default world",
        test: function ()
        {
          let w = new rWorld();
          w.setToDefault();
          let r = ray.Ray(ray.Point(0, 0, -5), ray.Vector(0, 0, 1));
          let points = w.intersect(r);
          if (points.num != 4) return false;
          if (points.list[0].length != 4) return false;
          if (points.list[1].length != 4.5) return false;
          if (points.list[2].length != 5.5) return false;
          if (points.list[3].length != 6) return false;
          return true;
        }
      };
    }

    static test4()
    {
      return {
        name: "Check casting a ray that missed",
        test: function ()
        {
          let w = new rWorld();
          w.setToDefault();
          let r = ray.Ray(ray.Point(0, 0, -5), ray.Vector(0, 1, 0));
          let c = w.cast(r);
          if (c.equals(ray.Black) == false) return false;
          return true;
        }
      };
    }

    static test5()
    {
      return {
        name: "Check casting a ray that hits",
        test: function ()
        {
          let w = new rWorld();
          w.setToDefault();
          let r = ray.Ray(ray.Point(0, 0, -5), ray.Vector(0, 0, 1));
          let c = w.cast(r);
          if (c.equals(ray.RGBColour(0.38066, 0.47583, 0.2855)) == false) return false;
          return true;
        }
      };
    }

    static test6()
    {
      return {
        name: "Check casting a ray that hits behind",
        test: function ()
        {
          let w = new rWorld();
          w.setToDefault();
          w.objects[0].material.ambient = 1;
          w.objects[1].material.ambient = 1;
          let r = ray.Ray(ray.Point(0, 0, 0.75), ray.Vector(0, 0, -1));
          let c = w.cast(r);
          if (c.equals(w.objects[1].material.colour) == false) return false;
          return true;
        }
      };
    }

  }

  class rCamera
  {
    constructor(w,h,fov)
    {
      this.height = h;
      this.width = w;
      this.fov = fov;
      this.transform = ray.Identity4x4;
      this.inverse = ray.Matrix.inverse(this.transform);

      let halfView = Math.tan(fov / 2.0);
      let ratio = w / h;
      this.halfWidth = 0;
      this.halfHeight = 0;
      if (ratio >= 1)
      {
        this.halfWidth = halfView;
        this.halfHeight = halfView / ratio;
      }
      else
      {
        this.halfHeight = halfView;
        this.halfWidth = halfView * ratio;
      }

      this.pixelSize = this.halfWidth * 2.0 / this.width;
      this.focalLength = 1.0;
    }

    fromJSON(def)
    {
      if (null == def.from) return;
      if (null == def.to) return;
      if (null == def.up) return;
      this.createView(ray.Point(def.from[0], def.from[1], def.from[2]), ray.Point(def.to[0], def.to[1], def.to[2]), ray.Vector(def.up[0], def.up[1], def.up[2]));
    }

    initCanvas(elem)
    {
      this.canvas = new ray.Canvas();
      if (elem == null)
        this.canvas.fromMemory(this.width, this.height);
      else
        this.canvas.fromElement(elem);
      this.canvas.tvstatic();
    }

    setTransform(t)
    {
      this.transform = t;
      this.inverse = ray.Matrix.inverse(this.transform);
    }

    createView(from, to, up)
    {
      this.position = from;
      this.forward = ray.Touple.subtract(to, from).normalize();
      this.left = ray.Touple.cross(this.forward, ray.Touple.normalize(up));
      this.up = ray.Touple.cross(this.left, this.forward);
      this.translate = ray.Matrix.translation(-from.x, -from.y, -from.z);
      this.transform = new ray.Matrix4x4([this.left.x,     this.left.y,     this.left.z, 0,
                                     this.up.x,       this.up.y,       this.up.z,   0,
                                    -this.forward.x, -this.forward.y, -this.forward.z, 0,
                                     0, 0, 0, 1]);
      this.transform.times(this.translate);    
      this.inverse = ray.Matrix.inverse(this.transform);
      return this.transform;
    }

    getRayAt(x, y, ox, oy)
    {
      let subX = ox ? ox : 0.5;
      let subY = oy ? oy : 0.5;
      if (ray.World.options.jigglePoints)
      {
        subX = Math.random();
        subY = Math.random();
      }
      let xoffset = (x + subX) * this.pixelSize;
      let yoffset = (y + subY) * this.pixelSize;
      let xworld = this.halfWidth - xoffset;
      let yworld = this.halfHeight - yoffset;
      let pixel = this.inverse.times(ray.Point(xworld, yworld, -this.focalLength));
      let origin = this.inverse.times(ray.Origin);
      let direction = pixel.minus(origin).normalize();
      return ray.Ray(origin, direction);
    }

    static test1()
    {
      return {
        name: "Check that view transforms can be made",
        test: function ()
        {
          let c = new rCamera();
          let v = c.createView(ray.Point(0, 0, 0), ray.Point(0, 0, -1), ray.Vector(0, 1, 0));
          if (v.equals(ray.Identity4x4) == false) return false;
          return true;
        }
      };
    }

    static test2()
    {
      return {
        name: "Check that view transforms can be made in +Z direction",
        test: function ()
        {
          let c = new rCamera();
          let v = c.createView(ray.Point(0, 0, 0), ray.Point(0, 0, 1), ray.Vector(0, 1, 0));
          if (v.equals(ray.Matrix.scale(-1,1,-1)) == false) return false;
          return true;
        }
      };
    }

    static test3()
    {
      return {
        name: "Check that view transform moves the world",
        test: function ()
        {
          let c = new rCamera();
          let v = c.createView(ray.Point(0, 0, 8), ray.Point(0, 0, 0), ray.Vector(0, 1, 0));
          if (v.equals(ray.Matrix.translation(0, 0, -8)) == false) return false;
          return true;
        }
      };
    }

    static test4()
    {
      return {
        name: "Check that view transform works in any direction",
        test: function ()
        {
          let c = new rCamera();
          let v = c.createView(ray.Point(1, 3, 2), ray.Point(4, -2, 8), ray.Vector(1, 1, 0));
          let check = new ray.Matrix4x4([-0.50709, 0.50709, 0.67612, -2.36643, 0.76772, 0.60609, 0.12122, -2.82843, -0.35857, 0.59761, -0.71714, 0.0, 0.0, 0.0, 0.0, 1.0]);
          if (v.equals(check) == false) return false;
          return true;
        }
      };
    }

    static test5()
    {
      return {
        name: "Check that camera ctor works",
        test: function ()
        {
          let c = new rCamera(160, 120, Math.PI / 2.0);
          if (c.height != 120) return false;
          if (c.width != 160) return false;
          if (c.fov != Math.PI / 2.0) return false;
          if (c.transform.equals(ray.Identity4x4) == false) return false;
          return true;
        }
      };
    }

    static test6()
    {
      return {
        name: "Check that camera knows the pixel size for horizontal canvas",
        test: function ()
        {
          let c = new rCamera(200, 125, Math.PI / 2.0);
          if (ray.isEqual(c.pixelSize, 0.01) == false) return false;
          return true;
        }
      };
    }

    static test7()
    {
      return {
        name: "Check that camera knows the pixel size for vertical canvas",
        test: function ()
        {
          let c = new rCamera(125, 200, Math.PI / 2.0);
          if (ray.isEqual(c.pixelSize, 0.01) == false) return false;
          return true;
        }
      };
    }

    static test8()
    {
      return {
        name: "Check getting a ray through the camera center",
        test: function ()
        {
          let c = new rCamera(201, 101, Math.PI / 2.0);
          let r = c.getRayAt(100, 50);
          if (r.origin.equals(ray.Origin) == false) return false;
          if (r.direction.equals(ray.Vector(0,0,-1)) == false) return false;
          return true;
        }
      };
    }

    static test9()
    {
      return {
        name: "Check getting a ray through the camera corner",
        test: function ()
        {
          let c = new rCamera(201, 101, Math.PI / 2.0);
          let r = c.getRayAt(0, 0);
          if (r.origin.equals(ray.Origin) == false) return false;
          if (r.direction.equals(ray.Vector(0.66519, 0.33259, -0.66851)) == false) return false;
          return true;
        }
      };
    }

    static test10()
    {
      return {
        name: "Check getting a ray through the camera with a trandform",
        test: function ()
        {
          let c = new rCamera(201, 101, Math.PI / 2.0);
          c.setTransform(ray.Matrix.yRotation(Math.PI / 4).times(ray.Matrix.translation(0, -2, 5)));
          let r = c.getRayAt(100, 50);
          if (r.origin.equals(ray.Point(0, 2, -5)) == false) return false;
          if (r.direction.equals(ray.Vector(Math.sqrt(2) / 2, 0, -Math.sqrt(2) / 2)) == false) return false;
          return true;
        }
      };
    }

    static test11()
    {
      return {
        name: "Check that the camera renders a scene",
        test: function ()
        {
          let c = new rCamera(11, 11, Math.PI / 2.0);
          c.createView(ray.Point(0, 0, -5), ray.Origin, ray.Vector(0, 1, 0));
          c.initCanvas();

          let w = new rWorld();
          w.setToDefault();
          w.setCamera(c, "main");
          w.render("main");

          let colour = ray.White.copy();
          c.canvas.get(colour, 5, 5);
          ray.lowrez();
          if (colour.equals(new ray.RGBColour(0.38066, 0.47583, 0.2855)) == false) return false;
          ray.hirez();
          return true;
        }
      };
    }
  }

  ray.classlist.push(rWorld);
  ray.classlist.push(rCamera);
  ray.Camera = rCamera;
  ray.World = new rWorld();

})();
