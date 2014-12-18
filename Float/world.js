function fPoint(x, y)
{
  this.X = x;
  this.Y = y;
}

function fRectangle(x, y, w, h)
{
  this.X = x;
  this.Y = y;
  this.Width = w;
  this.Height = h;

}

//----------------------------------------------------------------

var RegionSize = 201;  // vertex dimension in mesh.  This covers a square integer range in the noise field
var RegionArea = 100;  // physical dimension in world. This covers the vertex mesh
var NoiseScale = 20;

function fWorld()
{
  p0 = vec3.create(); // init the cache variables used by regions
  p1 = vec3.create();
  p2 = vec3.create();
  n = vec3.create();

  this.Regions = [];
  var d = new Date(); var r = new mxRand(); r.seed(d.getTime(), true);
  var mountains = new LibNoise.FastRidgedMultifractal();
  mountains.Seed = r.pop();
  mountains.Frequency = 4.0;//0.5;
  var baseFlat = new LibNoise.FastBillow();
  baseFlat.Seed = r.pop();
  baseFlat.Frequency = 4.0;//1.0;
  var flat = new LibNoise.ScaleBiasOutput(baseFlat);
  flat.Scale = 0.25;
  flat.Bias = -1.75;//-0.75
  var terrain = new LibNoise.FastPerlin();
  terrain.Seed = r.pop();
  terrain.Frequency = 3.0;//0.5;
  terrain.Persistence = 0.25;
  var final = new LibNoise.SelectOutput(terrain, mountains, flat);
  final.EdgeFalloff = 0.125;
  final.UpperBound = 1000;
  final.LowerBound = 0;

  this.Generator = final;
  this.cast = new fRayCasting();
  this.wang = new WangTiles();
}

// Takes in a location in world coords from player view
// Convert to a scaled region position and create region
// Create region that contains the point (x,y)
fWorld.prototype.createRegionContaining = function(x, y)
{
  var index = this.getIndexForRegionContaining(x, y);
  if (this.Regions[index]) return;

  // figure out the area
  var p = this.getOriginForRegionContaining(x, y);
  var area = new fRectangle(p.X, p.Y, RegionArea, RegionArea);
  this.Regions[index] = new fRegion(area);
}

// return the hash value of a region containing point (x,y) for map lookups
fWorld.prototype.getIndexForRegionContaining = function(x, y)
{
  // scale down to get region coords
  x = Math.floor(x / RegionArea);
  y = Math.floor(y / RegionArea);

  return x * 1000000000 + y;
}

// return the top left point of a region containing point (x,y)
fWorld.prototype.getOriginForRegionContaining = function(x,y)
{
  // scale down to get region coords
  x = Math.floor(x / RegionArea);
  y = Math.floor(y / RegionArea);

  return new fPoint(x * RegionArea,y * RegionArea );
}

// does the region that contains point (x,y) exist yet?
fWorld.prototype.containsSpot = function( x,  y)
{
  var index = this.getIndexForRegionContaining(x, y);
  return this.Regions[index] ? true : false;
}

fWorld.prototype.getHeight = function(x, y)
{
  var index = this.getIndexForRegionContaining(x, y);

  var ret = 0;
  if (this.Regions[index]) ret = this.Regions[index].getPoint(x, y);
  return ret;
}

fWorld.prototype.getWaterHeight = function (x, y)
{
  var index = this.getIndexForRegionContaining(x, y);

  var ret = 0;
  if (this.Regions[index]) ret = this.Regions[index].getPoint(x, y, true);
  return ret;
}

fWorld.prototype.getRegionContaining = function (x, y)
{
  var index = this.getIndexForRegionContaining(x, y);
  return this.Regions[index];
}

fWorld.prototype.getRegionByIndex = function( x,  y)
{
  var index = x * 1000000000 + y;
  return Regions[index];
}
