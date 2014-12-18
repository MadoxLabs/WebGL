LibNoise.Gradient = function(a)
{
  this.Axis = a;
  this.LowerBound = 0;
  this.UpperBound = 0.99999999;
}

LibNoise.Gradient.prototype.GetValue = function (x, y, z)
{
  var val = x;
  if (this.Axis == LibNoise.Axis.Y) val = y;
  else if (this.Axis == LibNoise.Axis.Z) val = z;

  if (val < this.LowerBound) val = this.LowerBound;
  if (val > this.UpperBound) val = this.UpperBound;
  return (val - Math.floor(val)) * 2.0 - 1.0;
}
