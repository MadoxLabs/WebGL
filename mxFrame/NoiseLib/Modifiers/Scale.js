LibNoise.ScaleOutput = function(source, scale)
{
  this.SourceModule = source;
  this.Scale = scale;
}

LibNoise.ScaleOutput.prototype.GetValue = function(x,y,z)
{
  return this.SourceModule.GetValue(x, y, z) * this.Scale;
}




LibNoise.ScaleInput = function (source, x,y,z)
{
  this.SourceModule = source;
  this.X = x;
  this.Y = y;
  this.Z = z;
}

LibNoise.ScaleInput.prototype.GetValue = function (x, y, z)
{
  return this.SourceModule.GetValue(x * this.X, y * this.Y, z * this.Z);
}







LibNoise.ScaleBiasOutput = function (source)
{
  this.SourceModule = source;
  this.Scale = 1.0;
  this.Bias = 0.0;
}

LibNoise.ScaleBiasOutput.prototype.GetValue = function (x, y, z)
{
  return this.SourceModule.GetValue(x, y, z) * this.Scale + this.Bias;
}
