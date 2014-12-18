LibNoise.Constant = function(value)
{
  this.Value = value;
}

LibNoise.Constant.prototype.GetValue = function (x, y, z)
{
  return this.Value;
}
