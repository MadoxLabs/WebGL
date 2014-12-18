LibNoise.Cylinder = function(source)
{
  this.SourceModule = source;
}

LibNoise.Cylinder.prototype.GetValue = function (angle, height)
{
  var x, y, z;
  x = Math.cos(angle);
  y = height;
  z = Math.sin(angle);
  return this.SourceModule.GetValue(x, y, z);
}
