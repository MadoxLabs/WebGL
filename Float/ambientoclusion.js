function fRay(x,y,z,raySteps, size)
{
  this.ray = vec3.fromValues(x,y,z);
  this.offsets = [];

  // compute the integer-based cels this ray crosses - up to a max length
  var step = vec3.clone(this.ray);
  step[0] *= size;
  step[1] *= size;
  step[2] *= size;
  var current = vec3.create();
  for (var i = 0; i < raySteps; ++i)     // 100 steps defines the length of the ray casting vector
{
    var cel = vec3.create();
    cel[0] = current[0];
    cel[1] = current[1] + 0.5;
    cel[2] = current[2];
    this.offsets.push(cel);
    vec3.add(current, current, step);
}
}

function fRayCasting()
{
  this.setRays(30, 10, 1.0);
}

  fRayCasting.prototype.setRays = function(numRays, steps, stepsize)
  {
    this.rays = [];
    if (steps) this.raySteps = steps;
    if (stepsize) this.stepsize = stepsize;
    if (numRays) this.numRays = numRays;
    this.createRays();
  }

fRayCasting.prototype.createRays = function ()
{
  this.rays = [];

  // use a Golden spiral to pick ray directions on a unit sphere - http://cgafaq.info/wiki/Evenly_distributed_points_on_sphere
  var dlong = LibNoise.NMath.PI * (3.0 - Math.sqrt(5.0));
  var dz = 2.0 / this.numRays;
  var _long = 0;
  var z = 1.0 - dz / 2.0;
  for (var k = 0; k < this.numRays; ++k)
  {
    var r = Math.sqrt(1.0 - z * z);
    this.rays[k] = new fRay(Math.cos(_long) * r, Math.sin(_long) * r, z, this.raySteps, this.stepsize);
    z -= dz;
    _long += dlong;
  }
}

fRayCasting.prototype.calculate = function(x,y,z,ground)
{
  // Ambient Occlusion
  var escapes = 0;
  for (var ray in this.rays)
  {
    if (this.calculateRay(this.rays[ray], x, y, z, ground)) escapes++;
  }
  // convert the influence value to a percent.
  // invert the percent so 1.0 is not occluded

  if (escapes == 0) {
    var oh = ground.getPoint(x, z);
    console.log("wierd: " +x+","+z+"="+oh+" =?= " + y); //return 0.5;
  }

  return escapes / this.rays.length;
}

fRayCasting.prototype.calculateRay = function (ray, x, y, z, ground)
{
  var ok = true;
  for (var offset in ray.offsets) {
    var o = ray.offsets[offset];
    var h = ground.getPoint(x + o[0], z + o[2]);
    if (y + o[1] <= h) { ok = false; break; }
  }
  return ok;
}

function aoHelper(r)
{
  this.cast = r;
  this.groundVertex = [];
  this.aoBuf = null;
}

aoHelper.prototype.Update = function(aoLoc /* vec3 */)
{
  if (this.aoBuf == null)
  {
    this.aoBuf = new Mesh();
    for (r in this.cast.rays)
    {
      var ray = this.cast.rays[r];
      this.groundVertex.push(ray.offsets[0][0]);
      this.groundVertex.push(ray.offsets[0][1]);
      this.groundVertex.push(ray.offsets[0][2]);
      this.groundVertex.push(0.0);
      this.groundVertex.push(0.0);
      this.groundVertex.push(0.0);
      this.groundVertex.push(1.0);
      this.groundVertex.push(ray.offsets[this.cast.raySteps - 1][0]);
      this.groundVertex.push(ray.offsets[this.cast.raySteps - 1][1]);
      this.groundVertex.push(ray.offsets[this.cast.raySteps - 1][2]);
      this.groundVertex.push(0.0);
      this.groundVertex.push(0.0);
      this.groundVertex.push(0.0);
      this.groundVertex.push(1.0);
    }
  }

  {
    var i = -1;
    var reg = Game.World.Regions[0];   // fRegion
    var total = 0;
    for (var r in this.cast.rays) // set colors
    {
      var ray = this.cast.rays[r];
      if (this.cast.calculateRay(ray, aoLoc[0], aoLoc[1], aoLoc[2], reg))
      {
        i += 4;
        this.groundVertex[i++] = 0.0;
        this.groundVertex[i++] = 0.0;
        this.groundVertex[i++] = 1.0;
        i += 4;
        this.groundVertex[i++] = 0.0;
        this.groundVertex[i++] = 0.0;
        this.groundVertex[i++] = 1.0;
        total++;
      }
      else
      {
        i += 4;
        this.groundVertex[i++] = 1.0;
        this.groundVertex[i++] = 0.0;
        this.groundVertex[i++] = 0.0;
        i += 4;
        this.groundVertex[i++] = 1.0;
        this.groundVertex[i++] = 0.0;
        this.groundVertex[i++] = 0.0;
        total++;
      }
    }
    var pos = mat4.create();
    mat4.identity(pos);
    mat4.translate(pos, pos, vec3.fromValues(aoLoc[0], aoLoc[1], aoLoc[2]));
    this.aoBuf.loadFromArrays(this.groundVertex, null, { 'POS': 0, 'COLOR': 12 }, gl.LINES, this.groundVertex.length / 7.0, 0, pos);
  }
}

