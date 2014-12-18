// source files to load, some optionally
var baseSrc = ["glMatrix.js",
               "pako.js",
               "mxMesh.js",
               "mxTexture.js",
               "mxShader.js",
               "mxShaderManager.js",
               "mxAssetManager.js",
               "mxCamera.js",
               "mxMouse.js",
               "mxGame.js"];
var oculusSrc = ["oculus.lib.js"];
var touchSrc = ["hammer.lib.js"];
var perlinSrc = ["NoiseLib/mxrandom.js",
                 "NoiseLib/noise.js",
                 "NoiseLib/math.js",
                 "NoiseLib/FastGenerators/FastMath.js",
                 "NoiseLib/FastGenerators/FastBillow.js",
                 "NoiseLib/FastGenerators/FastPerlin.js",
                 "NoiseLib/FastGenerators/FastRidgedMultifractal.js",
                 "NoiseLib/FastGenerators/FastTurbulence.js",
                 "NoiseLib/Generators/Constant.js",
                 "NoiseLib/Generators/Checkerboard.js",
                 "NoiseLib/Generators/Gradient.js",
                 "NoiseLib/Generators/Cylinders.js",
                 "NoiseLib/Generators/Spheres.js",
                 "NoiseLib/Generators/Perlin.js",
                 "NoiseLib/Generators/Billow.js",
                 "NoiseLib/Generators/RidgedMultifractal.js",
                 "NoiseLib/Generators/Voronoi.js",
                 "NoiseLib/Models/Plane.js",
                 "NoiseLib/Models/Cylinder.js",
                 "NoiseLib/Models/Sphere.js",
                 "NoiseLib/Models/Line.js",
                 "NoiseLib/Modifiers/Invert.js",
                 "NoiseLib/Modifiers/Scale.js",
                 "NoiseLib/Modifiers/Combine.js",
                 "NoiseLib/Modifiers/Chooser.js",
                 "NoiseLib/Modifiers/TerraceOutput.js",
                 "NoiseLib/Modifiers/CurveOutput.js",
                 "NoiseLib/Modifiers/Turbulence.js",
                 "NoiseLib/Modifiers/Displace.js"];

// define what parts of the lib to load
var WITH_MXFRAME = 1;
var WITH_OCULUS = 2;
var WITH_NOISE = 4;
var WITH_TOUCH = 8;

// internal helpers
var preload = 0;
var libdir = "./";

// predefined namespace for libnoise so it loads right
var LibNoise = {};

// internal function to include a new js file
// note when all files are loaded, main() is called.
function include(filename)
{
  var head = document.getElementsByTagName("head")[0];
  var script = document.createElement("script");
  head.appendChild(script);
  script.onload = function () { preload -= 1; if (!preload) main(); }
  script.src = filename;
  script.type = "text/javascript";
}

function extend(obj, base)
{
  for (var property in base)
    if (base.hasOwnProperty(property) || base.__proto__.hasOwnProperty(property)) obj[property] = base[property];
}

// call this from the page's onload to launch your app
function launchApp(appsrc, lib, type)
{
  if (!type) { alert("Missing app type"); return; }

  libdir = lib;
  var src = [];
  if (type & WITH_MXFRAME) src = src.concat(baseSrc);
  if (type & WITH_OCULUS) src = src.concat(oculusSrc);
  if (type & WITH_NOISE) src = src.concat(perlinSrc);
  if (type & WITH_TOUCH) src = src.concat(touchSrc);
  preload = src.length + appsrc.length;
  for (i in src) include(libdir + "/" + src[i]);
  for (i in appsrc) include(appsrc[i]);
}

function main()
{
  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;

  Game.init();
  //  Game.framerate = 34;
  window.requestAnimationFrame(Game.run);
  //  window.setTimeout(Game.run, Game.framerate);
}
