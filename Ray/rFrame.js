// predefined namespaces so loading things have a place to go
var LibNoise = {};
var ray = { classlist: [], stages: {} };
ray.counts = {
  touple: 0,
  matrix: 0,
  colour: 0,
  ray: 0,
  intersection: 0,
  intersections: 0
};

function reportBootup(file) { }
function reportLoaded(name, value) { }
function reportLoading(name, value) { }

(function ()
{
  // source files to load, some optionally
  var baseSrc = ["NoiseLib/math.js",
                 "NoiseLib/mxrandom.js",
                 "NoiseLib/noise.js",
                 "NoiseLib/FastMath.js",
                 "NoiseLib/FastPerlin.js",
                 "engine/sort.js",
                 "engine/rMath.js",
                 "engine/rShape.js",
                 "engine/rColour.js",
                 "engine/rCanvas.js",
                 "engine/rMatrix.js",
                 "engine/rWorld.js",
                 "engine/rRay.js"
                ];
  var appSrc = ["rUnittest.js",
                "stages/Stage1.js",
                "stages/Stage2.js",
                "stages/Stage3.js",
                "stages/Stage4.js",
                "stages/Stage5.js",
                "stages/Stage6.js",
                "stages/Stage7.js",
                "stages/Stage8.js",
                "stages/Stage9.js",
                "stages/Stage10.js",
                "stages/Stage11.js",
                "stages/Stage12.js",
                "stages/Stage13.js",
                "stages/Testbed.js",
                "rApp.js"
               ];

  var loadState = {}

  // When a src file is loaded, this will track if we are done.
  // phase1 loads the library files.
  // when phase1 ends, user files are loaded. 
  // when phase2 ends, the game is started.
  function handleLoaded(filename)
  {
    if (loadState.loadPhase1)
    {
      loadState.loadPhase1 -= 1;
      if (reportBootup) reportBootup("Stage 2/3 - " + loadState.loadPhase1 + " files to go");
      console.log(" " + filename + " loaded. " + loadState.loadPhase1 + " left");
      if (!loadState.loadPhase1) 
      {
        console.log("Boot up phase 2");
        for (i in loadState.appsrc) include(loadState.appsrc[i]);
      }
    }
    else if (loadState.loadPhase2) {
      loadState.loadPhase2 -= 1;
      if (reportBootup) reportBootup("Stage 3/3 - " + loadState.loadPhase2 + " files to go");
      console.log(" " + filename + " loaded. " + loadState.loadPhase2 + " left");
      if (!loadState.loadPhase2)
      {
        main();
      }
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

    console.log("Init");
    ray.App.init();
    console.log("Begin");
//    ray.App.run();
  }

  // external loader function
  // needs array of user files, library file location, library flags
  ray.loadApp = function ()
  {
    loadState.src = baseSrc;
    loadState.appsrc = appSrc;

    loadState.loadPhase1 = loadState.src.length;
    loadState.loadPhase2 = loadState.appsrc.length;

    console.log("Boot up phase 0");
    for (i in loadState.src) include(loadState.src[i]);
  };
})();
