
// predefined namespaces so loading things have a palce to go
var LibNoise = {};
var mx = {};
function reportBootup(file) { }
function reportLoaded(name, value) { }
function reportLoading(name, value) { }
function doneLoading() { }

(function ()
{
  // define what parts of the lib to load
  mx.WITH_MXFRAME = 1;
  mx.WITH_OCULUS = 2;
  mx.WITH_NOISE = 4;
  mx.WITH_TOUCH = 8;
  mx.WITH_DEBUG = 16;

  // source files to load, some optionally
//  var dependancies = ["libs/glMatrix.js"];
  var baseSrc = [ [ "libs/glMatrix.js"],
                  [ "libs/pako.js",
                    "components/ui/mxLayout.js",
                    "components/ui/mxLoaders.js",
                    "components/ui/mxData.js",
                    "components/ui/mxInput.js",
                    "components/ui/mxPlayer.js",
                    "components/ui/mxUISkin.js",
                    "components/mxMesh.js",
                    "components/mxTexture.js",
                    "components/mxShader.js",
                    "components/mxShaderManager.js",
                    "components/mxAssetManager.js",
                    "components/mxCamera.js",
                    "components/mxMouse.js",
                    "components/mxGame.js" 
                  ],
                  [ "components/ui/widgets/mxWidget.js" ],
                  ["components/ui/widgets/mxContainer.js"]
                 ];
  var oculusSrc = ["libs/oculus.lib.js"];
  var touchSrc = ["libs/hammer.lib.js"];
  var debugSrc = ["libs/WebGLInspector/embed.js"];
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

  var loadState = {}

  // When a src file is loaded, this will track if we are done.
  // phase1 loads the library files.
  // when phase1 ends, user files are loaded. 
  // when phase2 ends, the game is started.
  function handleLoaded(filename)
  {
      loadState.length -= 1;
      if (reportBootup) reportBootup("Loading - " + loadState.length + " files to go");
      console.log(" " + filename + " loaded. " + loadState.length + " left");

      loadState.groupLength -= 1;
      if (!loadState.groupLength)
      {
        console.log("Done group");
        loadState.loadIndex++;
        nextGroup();
      }

      if (!loadState.length)
      {
        if (loadState.libtype & mx.WITH_DEBUG) include(loadState.libdir + "/libs/WebGLInspector/core/embed.js");
        waitForDebug();
      }    
  }

  function nextGroup()
  {
    if (loadState.loadIndex < loadState.src.length)
    {
      console.log("Load group "+loadState.loadIndex);
      loadState.groupLength = loadState.src[loadState.loadIndex].length;
      for (let i in loadState.src[loadState.loadIndex])
      {
        if ( loadState.loadIndex >= loadState.userFilesIndex)
          include(loadState.src[loadState.loadIndex][i]);
        else
          include(loadState.libdir + "/" + loadState.src[loadState.loadIndex][i]);
      }  
    }
  }

  function waitForDebug()
  {
    console.log("debug ready?");
    if (!HTMLCanvasElement.prototype.getContextOrig || HTMLCanvasElement.prototype.getContext != HTMLCanvasElement.prototype.getContextOrig)
      main();
    else
    {
      console.log(" debug not ready");
      setTimeout(waitForDebug, 50);
    }
  }

  // internal function to include a new js file
  function include(filename)
  {
    var head = document.getElementsByTagName("head")[0];
    var script = document.createElement("script");
    var loader = this;
    head.appendChild(script);
    script.onload = function () { handleLoaded(filename); };
    script.src = filename;
    script.type = "text/javascript";
  }

  // launch the game using the Game object
  function main()
  {
    console.log("main called");
    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;

    mx.libdir = loadState.libdir;
    mx.libtype = loadState.libtype;

    console.log("Init");
    mx.Game.init();
    console.log("Begin");
    window.requestAnimationFrame(mx.Game.run);
  }

  // external loader function
  // needs array of user files, library file location, library flags
  mx.loadApp = function (files, lib, type)
  {
    if (urlParams["debug"]) type |= mx.WITH_DEBUG;

    if (type & mx.WITH_DEBUG) {
      console.log("with debug");
      window["gliEmbedDebug"] = true;
      HTMLCanvasElement.prototype.getContextOrig = HTMLCanvasElement.prototype.getContext;
    }

    if (!type) { alert("Missing app type"); return; }

    loadState.libtype = type;
    loadState.libdir = lib;

    var src = baseSrc;
//    if (type & mx.WITH_MXFRAME) src = src.concat(baseSrc);
    if (type & mx.WITH_OCULUS)  src.push(oculusSrc);
    if (type & mx.WITH_NOISE)   src.push(perlinSrc);
    if (type & mx.WITH_TOUCH)   src.push(touchSrc);

    loadState.userFilesIndex = src.length;

    if (Array.isArray(files[0]))
    {
      for (let i in files) src.push(files[i]);
    }
    else src.push(files);

    loadState.length = 0;
    for (let i in src) loadState.length += src[i].length;
    loadState.loadIndex = 0;
    loadState.src = src;
    loadState.loadDebug = (type & mx.WITH_DEBUG) ? 1 : 0;

    console.log("Boot up");
    nextGroup();
  };
})();

// useful function
function extend(obj, base)
{
  for (var property in base)
    if (base.hasOwnProperty(property) || base.__proto__.hasOwnProperty(property)) obj[property] = base[property];
}

var urlParams;
(window.onpopstate = function () {
  var match,
    pl = /\+/g,  // Regex for replacing addition symbol with a space
    search = /([^&=]+)=?([^&]*)/g,
    decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
    query = window.location.search.substring(1);

  urlParams = {};
  while (match = search.exec(query))
    urlParams[decode(match[1])] = decode(match[2]);
})();
