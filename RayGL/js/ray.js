// MAIN GAME CODE
// GAME INIT
var Game = mx.Game;

Game.appWebGL = function() { return 2; }

Game.appInit = function ()
{
  document.getElementById("code").value = `
{
  "renderOptions": {
    "antialias": 0
  },
  "cameras": [
    {
      "name": "main",
      "width": 800,
      "height": 800,
      "fov": 1.25,
      "from": [0, 2, -5],
      "to": [0, 1, 0],
      "up": [0, 1, 0]
    }
  ],
  "materials": [
    {
      "name": "ball",
      "shininess": 50,
      "colour": [1, 0.2, 0.2]
    },
    {
      "name": "ball2",
      "shininess": 50,
      "colour": [0.2, 1, 0.2]
    },
    {
      "name": "floor",
      "shininess": 200,
      "colour": [1,1,1]
    }
  ],
  "transforms": [
    {
      "name": "floor",
      "series": [{ "type": "T", "value": [0, -1.1, 0] }, {"type":"S", "value": [20,0.1,20]}]
    },
    {
      "name": "wall1",
      "series": [{ "type": "T", "value": [5, 0, 9] }, {"type":"Ry", "value": 0.78 }, { "type": "S", "value": [20, 20, 0.1] }]
    },
    {
      "name": "wall2",
      "series": [{ "type": "T", "value": [-5, 0, 9] }, { "type": "Ry", "value": -0.78 }, { "type": "S", "value": [20, 20, 0.1] }]
    },
    {
      "name": "ball",
      "series": [{ "type": "T", "value": [2, 0, 0] }]
    },
    {
     "name": "ball2",
      "series": [{ "type": "T", "value": [0, 1, 2] },{ "type": "S", "value": [2,2,2] }]
    },
    {
      "name": "ball3",
      "series": [{ "type": "T", "value": [-3, 0.5, 0] }, { "type": "S", "value": [1.5, 1.5, 1.5] }]
    }

  ],
  "lights": [
    {
      "type": "pointlight",
      "position": [10, 10, -10],
      "colour": [0, 0, 1]
    },
    {
      "type": "pointlight",
      "position": [-10, 10, -10],
      "intensityDiffuse": 0.9,
      "intensityAmbient": 0.4,
      "colour": [1, 1, 1]
    }
  ],
  "objects": [
    {
      "type": "sphere",
      "transform": "floor",
      "material": "floor"
    },
    {
      "type": "sphere",
      "transform": "wall1",
      "material": "floor"
    },
    {
      "type": "sphere",
      "transform": "wall2",
      "material": "floor"
    },
    {
      "type": "sphere",
      "transform": "ball",
      "material": "ball"
    },
    {
      "type": "sphere",
      "transform": "ball3"
    },
    {
      "type": "sphere",
      "material": "ball2",
      "transform": "ball2"
    }
  ]
}`;
  /*
  document.getElementById("code").value = `
  {
    "cameras": [
      {
        "name": "main",
        "width": 800,
        "height": 600,
        "fov": 1.57,
        "from": [0, 0, -2.5],
        "to": [0, 0, 0],
        "up": [0, 1, 0]
      }
    ],
    "materials": [
      {
        "name": "ball",
        "shininess": 50,
        "colour": [1, 0.2, 0.2]
      }
    ],
    "transforms": [
      {
        "name": "ball",
        "series": [{ "type": "T", "value": [0, 0, 0] }]
      }
    ],
    "lights": [
      {
        "type": "pointlight",
        "position": [10, -10, -10],
        "colour": [0, 0, 1]
      },
      {
        "type": "pointlight",
        "position": [-10, -10, -10],
        "colour": [1, 1, 1]
      }
    ],
    "objects": [
      {
        "type": "sphere",
        "transform": "ball",
        "material": "ball"
      }
    ]
  }`;
  */
  Game.startCompiling();

  Game.resetNeeded = false;
  Game.World = new World();
  Game.World.loadFromJSON(JSON.parse(document.getElementById("code").value));

  Game.webgl2 = true;
  Game.textureLocation = "assets/"  // autoloaded textures live here
  // SHADER PARTS to be included
  Game.loadShaderFile("assets/partCommon.fx");
  Game.loadShaderFile("assets/partNoBlend.fx");
  Game.loadShaderFile("assets/partFSQHandler.fx");
  Game.loadShaderFile("assets/partDataDef.fx");
  Game.loadShaderFile("assets/partCasting.fx");
  Game.loadShaderFile("assets/partSphere.fx");
  Game.loadShaderFile("assets/partPlane.fx");
  Game.loadShaderFile("assets/partCube.fx");
  Game.loadShaderFile("assets/partCylinder.fx");
  Game.loadShaderFile("assets/partCone.fx");
  Game.loadShaderFile("assets/partLighting.fx");
  Game.loadShaderFile("assets/partCamera.fx");
  // SHADERS that include the parts
  Game.loadShaderFile("assets/ray.fx");
  Game.loadShaderFile("assets/showresult.fx");
  Game.loadShaderFile("assets/storeresult.fx");
}

Game.deviceReady = function ()
{
}

Game.appLoadingError = function (name)
{
}

Game.loadingStart = function ()
{
  Game.ready = false;
}

Game.loadingStop = function ()
{
  doneLoading();
  Game.ready = true;
  Game.doneCompiling();

  Game.rayTraceSurface = new mx.RenderSurface(800, 600);
  Game.lastResult = new mx.RenderSurface(800, 600);

  var effect = Game.shaderMan.shaders["ShowResult"];
  Game.uParams = effect.createUniform('params');
  Game.uParams.curslice = 0;
  Game.uParams.barsize = 0.99;
}

Game.fixShader = function(s)
{
  if (!s.VSorig) s.VSorig = s.VS;
  else           s.VS = s.VSorig;
  if (!s.PSorig) s.PSorig = s.PS;
  else           s.PS = s.PSorig;
  s.VS = s.VS.replace(/-NUM-OBJECTS-/g, "" + Game.World.numObjects());
  s.VS = s.VS.replace(/-NUM-LIGHTS-/g, "" + Game.World.numLights());
  s.VS = s.VS.replace(/-NUM-MATERIALS-/g, "" + Game.World.numMaterials());
  s.VS = s.VS.replace(/-NUM-PATTERNS-/g, "" + Game.World.numPatterns());
  s.PS = s.PS.replace(/-NUM-OBJECTS-/g, "" + Game.World.numObjects());
  s.PS = s.PS.replace(/-NUM-LIGHTS-/g, "" + Game.World.numLights());
  s.PS = s.PS.replace(/-NUM-MATERIALS-/g, "" + Game.World.numMaterials());
  s.PS = s.PS.replace(/-NUM-PATTERNS-/g, "" + Game.World.numPatterns());
}

Game.loadJSON = function ()
{
  Game.startCompiling();
  setTimeout(function ()
  {
    try
    {
      Game.World.loadFromJSON(JSON.parse(document.getElementById("code").value));
      Game.resetNeeded = true;
    } catch (e)
    {
      Game.failCompiling(e);
    }
  }, 500);
}

Game.startCompiling = function()
{
  document.getElementById("compileMsg").innerText = "WebGL is setting up.Please wait...";
  var modal = document.getElementById("myModal");
  modal.style.display = "block";
}

Game.doneCompiling = function ()
{
  var modal = document.getElementById("myModal");
  modal.style.display = "none";
  Game.start();
}

Game.failCompiling = function (error)
{
  setTimeout(function () 
  {
    var modal = document.getElementById("myModal");
    modal.style.display = "block";
    document.getElementById("compileMsg").innerText = error;
  }, 500);
  Game.stop();
  window.cancelAnimationFrame(Game.RAFid);
}

// GAME UPDATES

var diff = 0.5;
var set = false;

Game.appUpdate = function ()
{
  if (Game.loading) return;
  if (!Game.camera) return;

  if (Game.resetNeeded)
  {
    if (Game.shaderMan.recompile("Ray"))
      Game.doneCompiling();
    Game.resetNeeded = false;
    set = false;
  }

  if (fsqIndex == 0) {
    // animate a light to show that its not a single image
    let p = Game.World.lights[1].position.x;
    p += diff;
    if (p > 10 || p < -10) diff *= -1;
    Game.World.lights[1].position.x = p;

    p = Game.World.lights[0].position.y;
    p += diff;
    Game.World.lights[0].position.y = p;
  }
}

//GAME RENDERING

Game.appDrawAux = function ()
{
  if (Game.loading) return;

  if (!Game.stepRender && Game.stopRender) return;
  if (Game.stepRender) Game.stepRender -= 1;

  /***  DO THE RAY TRACING ***/
  // we are rendering to a texture
  Game.rayTraceSurface.engage();
  gl.viewport(0, 0, 800, 600);
  gl.clear(gl.DEPTH_BUFFER_BIT);
  // get shader
  var effect = Game.shaderMan.shaders["Ray"];
  effect.bind();

  // send our world data to the shader
  if (!set)
  {
    // these dont change
    effect.setUniformBuffer("PerScene", Game.World.getCameraBuffer("main"));
    effect.setUniformBuffer("Objects", Game.World.getObjectBuffer());
    effect.setUniformBuffer("Materials", Game.World.getMaterialBuffer());
    effect.setUniformBuffer("Patterns", Game.World.getPatternBuffer());
    set = true;
  }
  effect.setUniformBuffer("Lights", Game.World.getLightBuffer());

  // check if we were waiting for a query result. now is a good time
  if (Game.timer.pending)
  {
    let val = Game.timer.report();
    if (val)
    {
      console.log("Frame shader slice time: " + val + " ms");
      console.log("Frame shader total time: " + (val * numFSQ) + " ms");
    }
  }

  // check if we want to time this shader run
  if (Game.snapshot)
    Game.timer.start();

  // Ray Trace!
  // get a full screen quad and draw it. its our only primitive
  let start = -1.0 + (fsqIndex * fsqStep);
  let end = start + fsqStep;
  let startT = 0.0 + (fsqIndex * fsqStep / 2.0);
  let endT = startT + fsqStep / 2.0;
  fsqvertices = [
    -1.0, start, 0.0, startT,
    1.0, start, 1.0, startT,
    -1.0, end, 0.0, endT,
    1.0, end, 1.0, endT
  ];
  var fsq = new mx.Mesh();
  fsq.loadFromArrays(fsqvertices, null, { 'POS': 0, 'TEX0': 8 }, gl.TRIANGLE_STRIP, 4);

  effect.draw(fsq);

  fsqIndex += 1;
  if (fsqIndex == numFSQ)
  {
    fsqIndex = 0;

    /***  SAVE THE FINISHED RESULT ? ***/
    Game.lastResult.engage();
    gl.viewport(0, 0, 800, 600);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    // get shader
    var effect = Game.shaderMan.shaders["StoreResult"];
    effect.bind();
    effect.bindTexture("result", Game.rayTraceSurface.texture);
    effect.draw(Game.assetMan.assets['fsq']);

  }
  Game.uParams.curslice = fsqIndex/numFSQ;

  // stop timing the shader
  if (Game.snapshot)
  {
    Game.timer.end();
    Game.snapshot = false;
  }
}

Game.appDraw = function (eye)
{
  // is everything ready to go?
  if (!Game.ready || Game.loading) return;

  // get shader
  var effect = Game.shaderMan.shaders["ShowResult"];
  effect.bind();

  // show the texture full screen
  effect.bindTexture("result", Game.lastResult.texture);
  effect.setUniforms(Game.uParams);
  effect.draw(Game.assetMan.assets['fsq']);

  // are we pausing the render loop?
  //  if (Game.stopRender)
  //    window.cancelAnimationFrame(Game.RAFid);

  // TODO
  // todo only recompile for item num change
}

//GAME FRAME RATE CONTROLS

var fsqIndex = 0;
var numFSQ = 1;
var fsqStep = 2.0 / numFSQ;

Game.upSlices = function ()
{
  Game.setSlices(numFSQ + 1);
}

Game.downSlices = function ()
{
  if (numFSQ > 1) Game.setSlices(numFSQ - 1);
}

Game.setSlices = function (n)
{
  numFSQ = n;
  fsqIndex = 0;
  if (n == 1) Game.uParams.barsize = 1.0;
  else Game.uParams.barsize = 0.99;
  document.getElementById('slices').value = numFSQ;
}


Game.stop = function ()
{
  Game.stopRender = true;
}

Game.start = function ()
{
  if (Game.stopRender)
  {
    Game.stopRender = false;
//    Game.RAFid = window.requestAnimationFrame(Game.run);
  }
}

Game.step = function ()
{
  Game.stepRender = 1;
//  if (Game.stopRender)
//    Game.RAFid = window.requestAnimationFrame(Game.run);
}

// USER INTERACTION

Game.appHandleMouseEvent = function (type, mouse)
{
}

Game.appHandleKeyDown = function (event)
{
}

Game.appHandleKeyUp = function (event)
{
}