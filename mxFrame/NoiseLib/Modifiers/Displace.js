LibNoise.DisplaceInput = function(source, xmod, ymod, zmod)
{
  this.SourceModule = source;
  this.XDisplaceModule = xmod;
  this.YDisplaceModule = ymod;
  this.ZDisplaceModule = zmod;
}

LibNoise.DisplaceInput.prototype.GetValue = function(x,y,z)
{
  x += this.XDisplaceModule != null ? this.XDisplaceModule.GetValue(x, y, z) : 0;
  y += this.YDisplaceModule != null ? this.YDisplaceModule.GetValue(x, y, z) : 0;
  z += this.ZDisplaceModule != null ? this.ZDisplaceModule.GetValue(x, y, z) : 0;

  return this.SourceModule.GetValue(x, y, z);
}




LibNoise.TranslateInput = function (source, x, y, z)
{
  this.SourceModule = source;
  this.X = x;
  this.Y = y;
  this.Z = z;
}

LibNoise.TranslateInput.prototype.GetValue = function (x, y, z)
{
  return this.SourceModule.GetValue(x + this.X, y + this.Y, z + this.Z);
}




LibNoise.RotateInput = function (source, xangle, yangle, zangle)
{
  this.SourceModule = source;
  this.SetAngles(xangle, yangle, zangle);
}

LibNoise.RotateInput.prototype.SetAngles = function(xAngle, yAngle, zAngle)
{
  this.XAngle = xAngle;
  this.YAngle = yAngle;
  this.ZAngle = zAngle;

  var xCos, yCos, zCos, xSin, ySin, zSin;
  xCos = Math.cos(xAngle);
  yCos = Math.cos(yAngle);
  zCos = Math.cos(zAngle);
  xSin = Math.sin(xAngle);
  ySin = Math.sin(yAngle);
  zSin = Math.sin(zAngle);

  this.m_x1Matrix = ySin * xSin * zSin + yCos * zCos;
  this.m_y1Matrix = xCos * zSin;
  this.m_z1Matrix = ySin * zCos - yCos * xSin * zSin;
  this.m_x2Matrix = ySin * xSin * zCos - yCos * zSin;
  this.m_y2Matrix = xCos * zCos;
  this.m_z2Matrix = -yCos * xSin * zCos - ySin * zSin;
  this.m_x3Matrix = -ySin * xCos;
  this.m_y3Matrix = xSin;
  this.m_z3Matrix = yCos * xCos;
}

LibNoise.RotateInput.prototype.GetValue = function (x, y, z)
{
  var nx = (this.m_x1Matrix * x) + (this.m_y1Matrix * y) + (this.m_z1Matrix * z);
  var ny = (this.m_x2Matrix * x) + (this.m_y2Matrix * y) + (this.m_z2Matrix * z);
  var nz = (this.m_x3Matrix * x) + (this.m_y3Matrix * y) + (this.m_z3Matrix * z);
  return this.SourceModule.GetValue(nx, ny, nz);
}





LibNoise.BiasOutput = function (source, b)
{
  this.SourceModule = source;
  this.Bias = b;
}

LibNoise.BiasOutput.prototype.GetValue = function (x, y, z)
{
  return this.SourceModule.GetValue(x, y, z) + this.Bias;
}





LibNoise.ClampOutput = function (source)
{
  this.SourceModule = source;
  this.LowerBound = -1;
  this.UpperBound = 1;
}

LibNoise.ClampOutput.prototype.GetValue = function (x, y, z)
{
  var value = this.SourceModule.GetValue(x, y, z);
  if (value < this.LowerBound) return this.LowerBound;
  else if (value > this.UpperBound) return this.UpperBound;
  else    return value;
}





LibNoise.AbsoluteOutput = function (source)
{
  this.SourceModule = source;
}

LibNoise.AbsoluteOutput.prototype.GetValue = function (x, y, z)
{
  return Math.abs(this.SourceModule.GetValue(x, y, z));
}






LibNoise.ExponentialOutput = function (source, exponent)
{
  this.SourceModule = source;
  this.Exponent = exponent;
}

LibNoise.ExponentialOutput.prototype.GetValue = function (x, y, z)
{
  return (Math.pow(Math.abs((this.SourceModule.GetValue(x, y, z) + 1.0) / 2.0), this.Exponent) * 2.0 - 1.0);
}




