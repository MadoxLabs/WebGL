// MAIN GAME CODE
// GAME INIT
var Game = mx.Game;

Game.appWebGL = function() { return 2; }

Game.appInit = function ()
{ 
  let setup = {
    cameras: [
      {
        name: "main",
        width: 800,
        height: 600,
        fov: Math.PI * 0.5,
        from: [0, 0, -2.5],
        to: [0, 0, 0],
        up: [0, 1, 0]
      }
    ],
    materials: [
      {
        name: "ball",
        shininess: 50,
        colour: [1, 0.2, 0.2]
      }
    ],
    transforms: [
      {
        name: "ball",
        series: [{ type: "T", value: [0, 0, 0] }]
      }
    ],
    lights: [
      {
        type: "pointlight",
        position: [10, -10, -10],
        colour: [0, 0, 1],
      },
      {
        type: "pointlight",
        position: [-10, -10, -10],
        colour: [1, 1, 1],
      }
    ],
    objects: [
      {
        type: "sphere",
        transform: "ball",
        material: "ball"
      }
    ]
  };

  Game.World = new World();
  Game.World.loadFromJSON(setup);

  Game.webgl2 = true;
  Game.textureLocation = "assets/"  // autoloaded textures live here
  // MODELS
  //Game.loadMeshPNG("light2", "assets/light2.model");
  // TEXTURES
  //Game.loadTextureFile("button2tex", "button2tex.png", true);
  // SHADER PARTS to be included
  //Game.loadShaderFile("assets/partRenderstates.fx");
  // SHADERS that include the parts
  Game.loadShaderFile("assets/fsqtest.fx");
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
}

Game.fixShader = function(s)
{
  s.VS = s.VS.replace(/-NUM-OBJECTS-/g, "" + Game.World.numObjects());
  s.VS = s.VS.replace(/-NUM-LIGHTS-/g, "" + Game.World.numLights());
  s.VS = s.VS.replace(/-NUM-MATERIALS-/g, "" + Game.World.numMaterials());
  s.PS = s.PS.replace(/-NUM-OBJECTS-/g, "" + Game.World.numObjects());
  s.PS = s.PS.replace(/-NUM-LIGHTS-/g, "" + Game.World.numLights());
  s.PS = s.PS.replace(/-NUM-MATERIALS-/g, "" + Game.World.numMaterials());
}

// GAME UPDATES

var diff = 0.5;

Game.appUpdate = function ()
{
  if (Game.loading) return;
  if (!Game.camera) return;

  let p = Game.World.lights[1].position.x;
  p += diff;
  if (p > 10 || p < -10) diff *= -1;
  Game.World.lights[1].position.x = p;

  p = Game.World.lights[0].position.y;
  p += diff;
  Game.World.lights[0].position.y = p;
}

//GAME RENDERING

Game.appDrawAux = function ()
{
  if (Game.loading) return;

}

Game.appDraw = function (eye)
{
  if (!Game.ready || Game.loading) return;

  var effect = Game.shaderMan.shaders["fsqtest"];
  effect.bind();
  effect.setUniformBuffer("PerScene", Game.World.getCameraBuffer("main"));
  effect.setUniformBuffer("Objects", Game.World.getObjectBuffer());
  effect.setUniformBuffer("Materials", Game.World.getMaterialBuffer());
  effect.setUniformBuffer("Lights", Game.World.getLightBuffer());
  effect.draw(Game.assetMan.assets["fsq"]);
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