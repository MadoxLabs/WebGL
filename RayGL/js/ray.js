// MAIN GAME CODE
// GAME INIT
var Game = mx.Game;

Game.appWebGL = function() { return 2; }

Game.appInit = function ()
{ 
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

// GAME UPDATES

Game.appUpdate = function ()
{
  if (Game.loading) return;
  if (!Game.camera) return;
}

//GAME RENDERING

Game.appDrawAux = function ()
{
  if (Game.loading) return;

}

var camera = new Float32Array([
  600, // height
  800, // width
  Math.PI * 0.5, // fov
  1.0, // focal length
  0.0, 0.0, -2.5, 0.0, // from 
  0.0, 0.0, 0.0, 0.0, // to
  0.0, 1.0, 0.0, 0.0  // up
]);

var materials = new Float32Array([
  0.2, 0.9, 0.9, 50.0,
  1.0, 0.2, 0.2, 1.0
]);

var lights = new Float32Array([
  -10.0, -10.0, -10.0, 1.0, // pos
  1.0, 1.0, 1.0, 1.0,      // colour 
  1.0, 0.0, 0.0, 0.0,      // attentuation
  1.0, 1.0, 1.0, 0.0,       // intensities

  10.0, -10.0, -10.0, 1.0, // pos
  0.0000001, 0.0, 1.0, 1.0,      // colour 
  1.0, 0.0, 0.0, 0.0,      // attentuation
  1.0, 1.0, 1.0, 0.0       // intensities
]);

var objects = new Float32Array([
  1.0, 0.0, 0.0, 0.0, // num p    p p
  255.0, 255.0, 0.0, 0.0, // id  type matieral p
  1.0, 0.0, 0.0, 0.0, // transform
  0.0, 1.0, 0.0, 0.0,
  0.0, 0.0, 1.0, 0.0,
  0.0, 0.0, 0.0, 1.0
]);

Game.appDraw = function (eye)
{
  if (!Game.ready || Game.loading) return;

  var effect = Game.shaderMan.shaders["fsqtest"];
  effect.bind();
  effect.setUniformBuffer("PerScene", camera);
  effect.setUniformBuffer("Objects", objects);
  effect.setUniformBuffer("Materials", materials);
  effect.setUniformBuffer("Lights", lights);
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