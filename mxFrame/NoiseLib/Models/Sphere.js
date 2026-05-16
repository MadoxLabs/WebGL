LibNoise.Sphere = function(source)
{
  this.SourceModule = source;
}

LibNoise.Sphere.prototype.GetValue = function (latitude, longitude)
{
  var x=0, y=0, z=0;
  var coords = LibNoise.NMath.LatLonToXYZ(latitude, longitude);
  return this.SourceModule.GetValue(coords.x, coords.y, coords.z);
}
