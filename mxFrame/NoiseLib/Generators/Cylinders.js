﻿LibNoise.Cylinders = function()
{
  this.Frequency = 1.0;
}

LibNoise.Cylinders.prototype.GetValue = function (x, y, z)
{
  x *= this.Frequency;
  y *= this.Frequency;
  
  var distFromCenter = Math.sqrt(x * x + y * y);
  var distFromCenter0 = Math.floor(distFromCenter > 0.0 ? distFromCenter : distFromCenter - 1);
  var distFromSmallerSphere = distFromCenter - distFromCenter0;
  var distFromLargerSphere = 1.0 - distFromSmallerSphere;
  var nearestDist = LibNoise.NMath.GetSmaller(distFromSmallerSphere, distFromLargerSphere);
  return 1.0 - (nearestDist * 4.0);
}

