LibNoise.AddOutput = function(s1, s2)
{
  this.SourceModule1 = s1;
  this.SourceModule2 = s2;
}

LibNoise.AddOutput.prototype.GetValue = function(x, y, z)
{
  return this.SourceModule1.GetValue(x, y, z) + this.SourceModule2.GetValue(x, y, z);
}



LibNoise.MultiplyOutput = function(s1, s2)
{
  this.SourceModule1 = s1;
  this.SourceModule2 = s2;
}

LibNoise.MultiplyOutput.prototype.GetValue = function(x, y, z)
{
  return this.SourceModule1.GetValue(x, y, z) * this.SourceModule2.GetValue(x, y, z);
}




LibNoise.PowerOutput = function (s1, s2)
{
  this.BaseModule = s1;
  this.PowerModule = s2;
}

LibNoise.PowerOutput.prototype.GetValue = function (x, y, z)
{
  return Math.pow(this.BaseModule.GetValue(x, y, z), this.PowerModule.GetValue(x, y, z));
}





LibNoise.BlendOutput = function (s1, s2, w)
{
  this.SourceModule1 = s1;
  this.SourceModule2 = s2;
  this.WeightModule = w;
}

LibNoise.BlendOutput.prototype.GetValue = function (x, y, z)
{
  return LibNoise.NMath.LinearInterpolate(this.SourceModule1.GetValue(x, y, z), this.SourceModule2.GetValue(x, y, z), (this.WeightModule.GetValue(x, y, z) + 1.0) / 2.0);
}