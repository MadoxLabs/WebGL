LibNoise.Plane = function(source)
{
  this.SourceModule = source;
}

LibNoise.Plane.prototype.GetValue = function (x, z)
{
  return this.SourceModule.GetValue(x, 0, z);
}
