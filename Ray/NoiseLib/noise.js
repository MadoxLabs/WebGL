LibNoise.NoiseQuality = { Low: 1, Standard: 2, High: 3 };
LibNoise.Axis = { X: 1, Y: 2, Z: 3 };

// useful function
function extend(obj, base)
{
  for (var property in base)
    if (base.hasOwnProperty(property) || base.__proto__.hasOwnProperty(property)) obj[property] = base[property];
}