//----------------------------------------------------------------------------------------------------
// Define a patch of ground using the area rect. This contains real world whole-number coords
// Its pointless to have ground patches extend fractional amounts.
function fRegion(area)
{
  this.Area = area;
  this.Map = new Float32Array(RegionSize * RegionSize);
  this.WaterAdjust = new Float32Array(RegionSize * RegionSize);
  this.Water = new Float32Array(RegionSize * RegionSize * 3);
  this.mesh = null;
  this.heightmap = null;
  this.aomap = null;
  this.wangmap = null;

  this.addedWater = [];

  this.watermap = null;
  this.watermapA = null;
  this.flowmapA = null;
  this.flowmapB = null;
  this.waterAdjustMap = null;

  this.uPerObject = {};
  this.uPerObject.uWorld = mat4.create();
  mat4.identity(this.uPerObject.uWorld);
//  var pos = vec3.fromValues(area.X, 0, area.Y);
//  mat4.translate(this.uPerObject.uWorld, this.uPerObject.uWorld, pos);

  this.create();
  this.createBuffers();
}

// Resets every point in the ground to 0 height then terraform it
fRegion.prototype.create = function()
{
  var size = RegionSize * RegionSize;
  var j;
  for (var i = 0; i < size; ++i)
  {
    this.Map[i] = 0.0;
    this.WaterAdjust[i] = 0.0;
    j = i * 3;
    this.Water[j+0] = 0.0;
    this.Water[j+1] = 0.0;
    this.Water[j+2] = 0.0;
  }
  this.generate();
}

// This function is to create a height for every point in the ground. It should be overload for different
// terraform styles. A ground patch should also inherit the terraform parameters from its neighbour ground patches
// and slightly change them to create gradual transition between radical changes.
fRegion.prototype.generate = function()
{
  var locx = this.Area.X / this.Area.Width;   // every integer square number space of noise represents a region
  var locy = this.Area.Y / this.Area.Height; 
  var step = 1.0 / (RegionSize-1);  
  var xf = locx + 10000;
  var zf = locy + 10000;

  var noise = Game.World.Generator;
  var i = 0;

  var max = 0;
  var val;
  for (var y = 0; y < RegionSize; ++y)
  {
    xf = locx + 10000;
    for (var x = 0; x < RegionSize; ++x)
    {
      val = noise.GetValue(xf, 0, zf) * NoiseScale;
      this.Water[i*3] =  Math.max(0.0 - val, 0.0);
      this.Map[i] = val;
      if (val > max) max = val;
      i++;
      xf += step;
    }
    zf += step;
  }
}

fRegion.prototype.getUnknownPoint = function(x,y)
{
  var locx = this.Area.X / this.Area.Width;
  var locy = this.Area.Y / this.Area.Height;
  var step = 1.0 / (RegionSize-1);
  var xf = locx + 10000 + (x * step);
  var zf = locy + 10000 + (y * step);
  return Game.World.Generator.GetValue(xf, 0, zf) * NoiseScale;
}

// this gets the height at a certain point using the raw array coordinated.
// should only be used internally
fRegion.prototype.getMapPoint = function (x, y)
{
  if (x >= RegionSize || y >= RegionSize || x < 0 || y < 0) return this.getUnknownPoint(x, y);
  return this.Map[y * RegionSize + x];
}

fRegion.prototype.getWaterPoint = function (x, y)
{
  if (x >= RegionSize || y >= RegionSize || x < 0 || y < 0) return 0;//this.getUnknownPoint(x, y);
  return this.Water[3 * (y * RegionSize + x)];
}

// this will map the world coords into the ground array and determine the height by lerping as needed
// anything passed into the ground will be de-scaled so we dont have to care what the world scale is
//
// The logic for this comes from http://www.toymaker.info/Games/html/terrain_follow.html
//
var p0;
var p1;
var p2;
var n ;
fRegion.prototype.getPoint = function( x,  y, water)
{
  x -= this.Area.X;  // translate to the range 0 to RegionArea
  y -= this.Area.Y;
  x = x * RegionSize / this.Area.Width;  // scale from RegionArea to RegionSize
  y = y * RegionSize / this.Area.Height;

  var dx = (x - Math.floor(x));
  var dz = (y - Math.floor(y));
  x = Math.floor(x);
  y = Math.floor(y);

  // which triangle for this cell is the point in? get the points for that triangle
  if (dx > dz)
  {
    p0[0] = x;     p0[1] = 0; p0[2] = y;
    p1[0] = x + 1; p1[1] = 0; p1[2] = y + 1;
    p2[0] = x + 1; p2[1] = 0; p2[2] = y;
  }
  else
  {
    p0[0] = x;     p0[1] = 0; p0[2] = y;
    p1[0] = x;     p1[1] = 0; p1[2] = y + 1;
    p2[0] = x + 1; p2[1] = 0; p2[2] = y + 1;
  }

  // fill in the y values above
  if (water)
  {
    p0[1] = this.getWaterPoint(p0[0], p0[2]);
    p1[1] = this.getWaterPoint(p1[0], p1[2]);
    p2[1] = this.getWaterPoint(p2[0], p2[2]);
  }
  else
  {
    p0[1] = this.getMapPoint(p0[0], p0[2]);
    p1[1] = this.getMapPoint(p1[0], p1[2]);
    p2[1] = this.getMapPoint(p2[0], p2[2]);
  }

  // get the face normal
//  var n = vec3.create();
  vec3.subtract(p1, p1, p0);
  vec3.subtract(p2, p2, p0);
  vec3.cross(n,p1,p2);
  vec3.normalize(n,n);   // normalize( (p1-p0) x (p2-p0) )

  // calculate height at the point using normal
  return p0[1] + (n[0] * dx + n[2] * dz) / -n[1];
}

fRegion.prototype.createBuffers = function()
{
  if (!this.mesh)
  {
    this.mesh = new Mesh();
    var index = 0;
    var vertexData = [];

    var step = this.Area.Height / (RegionSize - 1);
    for (var j = 0; j < RegionSize; ++j)
    {
      for (var i = 0; i < RegionSize; ++i)
      {
        // position (3)
        vertexData[index++] = this.Area.X + (i * step);
        vertexData[index++] = 0;
        vertexData[index++] = this.Area.Y + (j * step);
        // texture (2)
        vertexData[index++] = (i / (RegionSize-1));
        vertexData[index++] = (j / (RegionSize-1));
      }
    }

    // index buffer
    index = 0;
    var indexData = [];
    for (var j = 0; j < RegionSize - 1; ++j)
    {
      for (var i = 0; i < RegionSize - 1; ++i)
      {
        indexData[index++] = (j + 1) * RegionSize + i;
        indexData[index++] = j * RegionSize + (i + 1);
        indexData[index++] = j * RegionSize + i;

        indexData[index++] = (j + 1) * RegionSize + (i + 1);
        indexData[index++] = j * RegionSize + (i + 1);
        indexData[index++] = (j + 1) * RegionSize + i;
      }
    }

    this.mesh.loadFromArrays(vertexData, indexData, { 'POS': 0, 'TEX0': 12 }, gl.TRIANGLES, vertexData.length / 5.0);
  }

  if (!this.heightmap)
  {
    this.heightmap = new Texture('heightmap');
    this.heightmap.fromArray(RegionSize, RegionSize, this.Map, gl.LUMINANCE, gl.FLOAT);
  }

  if (!this.watermap)
  {
    this.waterAdjustMap = new Texture('waterAdjustMap');
    this.waterAdjustMap.fromArray(RegionSize, RegionSize, this.WaterAdjust, gl.LUMINANCE, gl.FLOAT);

    this.watermap = new RenderSurface(RegionSize, RegionSize, gl.RGB, gl.FLOAT, this.Water);
    this.watermapA = new RenderSurface(RegionSize, RegionSize, gl.RGB, gl.FLOAT, this.Water);
    this.watermapB = new RenderSurface(RegionSize, RegionSize, gl.RGB, gl.FLOAT, this.Water);

    var size = RegionSize * RegionSize * 4;
    var zeros = new Float32Array(size);
    for (var i = 0; i < size; ++i) zeros[i] = 0.0;
    this.flowmapA = new RenderSurface(RegionSize, RegionSize, gl.RGBA, gl.FLOAT, zeros);
    this.flowmapB = new RenderSurface(RegionSize, RegionSize, gl.RGBA, gl.FLOAT, zeros);
  }

  if (!this.wangmap)
  {
    var wangsize = 64.0;
    var data = Game.World.wang.Create(wangsize, wangsize);
    this.wangmap = new Texture('wangmap');
    this.wangmap.fromArray(wangsize, wangsize, data, gl.LUMINANCE_ALPHA, gl.FLOAT);
  }

  if (!this.aomap) this.createAOMap();
}

fRegion.prototype.addwater = function(i, j, amount)
{
  var x = j * RegionSize + i;
  this.WaterAdjust[x] = amount;
  this.addedWater.push(x);
}

fRegion.prototype.createAOMap = function ()
{
  // ao data
  var index = 0;
  var savedFactors = new Float32Array(RegionSize * RegionSize);

  var g = 0;
  for (var j = 0; j < RegionSize; ++j) {
    for (var i = 0; i < RegionSize; ++i) {
//      g = this.getPoint((this.Area.X + i) * this.Area.Width / RegionSize, (this.Area.Y + j) * this.Area.Width / RegionSize);
//      savedFactors[index] = Game.World.cast.calculate((this.Area.X + i) * this.Area.Width / RegionSize, g, (this.Area.Y + j) * this.Area.Width / RegionSize, this);
      savedFactors[index] = 1;
      ++index;
    }
  }
  this.aomap = new Texture('aomap');
  this.aomap.fromArray(RegionSize, RegionSize, savedFactors, gl.LUMINANCE, gl.FLOAT);
}

var awtrigger = false;

fRegion.prototype.renderflows = function()
{
  if (awtrigger) {
    this.waterAdjustMap.fromArray(RegionSize, RegionSize, this.WaterAdjust, gl.LUMINANCE, gl.FLOAT);
    awtrigger = false;
  }
  if (this.addedWater.length > 0)
  {
    this.waterAdjustMap.fromArray(RegionSize, RegionSize, this.WaterAdjust, gl.LUMINANCE, gl.FLOAT);
    for (var x in this.addedWater) this.WaterAdjust[this.addedWater[x]] = 0;
    this.addedWater = [];
    awtrigger = true;
  }

  // flip water and newwater
  var tmp = this.watermap;
  this.watermap = this.watermapA;
  this.watermapA = tmp;
  // flip flows A and B
  var tmp = this.flowmapA;
  this.flowmapA = this.flowmapB;
  this.flowmapB = tmp;

  // step 1
  // needed: height, water, flowsA
  // output to: flowsB
  {
    var uniforms = {};
    uniforms.regionsize = RegionSize-1;

    this.flowmapB.engage();
    gl.viewport(0, 0, RegionSize, RegionSize);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var effectin = Game.shaderMan.shaders["waterFlowOut"];
    effectin.bind();
    effectin.setUniforms(uniforms);
    effectin.bindTexture("height", this.heightmap.texture);
    effectin.bindTexture("water", this.watermapA.texture);
    effectin.bindTexture("flows", this.flowmapA.texture);
    effectin.draw(Game.assetMan.assets["fsq"]);
  }
  
  // step 2
  // needed: water, flowsB
  // output to: newwater
  {
    var uniforms = {};
    uniforms.regionsize = RegionSize - 1;

    this.watermap.engage();
    gl.viewport(0, 0, RegionSize, RegionSize);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var effectout = Game.shaderMan.shaders["waterFlowIn"];
    effectout.bind();
    effectout.setUniforms(uniforms);
    effectout.bindTexture("water", this.watermapA.texture);
    effectout.bindTexture("adjust", this.waterAdjustMap.texture);
    effectout.bindTexture("flows", this.flowmapB.texture);
    effectout.draw(Game.assetMan.assets["fsq"]);
  }
}