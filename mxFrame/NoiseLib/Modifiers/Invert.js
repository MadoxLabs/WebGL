LibNoise.InvertInput = function(source)
{
  this.SourceModule = source;
}

LibNoise.InvertInput.prototype.GetValue = function(x,y,z)
{
  return this.SourceModule.GetValue(-x, -y, -z);
}


LibNoise.InvertOutput = function(source)
{
  this.SourceModule = source;
}

LibNoise.InvertOutput.prototype.GetValue = function (x, y, z)
{
  return -this.SourceModule.GetValue(x, y, z);
}
