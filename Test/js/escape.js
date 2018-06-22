function World()
{
  this.objects = {};
  this.head = new mx.GameObject("head", null);

  this.uScene = null;

  this.shadertype = false;
}

// MAIN GAME CODE
// GAME INIT
var Game = mx.Game;

Game.toggle = function()
{
  this.shadertype = !this.shadertype;
}

Game.appInit = function ()
{
  Game.world = new World();

  Game.textureLocation = "assets/"  // autoloaded textures live here
  // MODELS
  Game.loadMeshPNG("table", "assets/table.model");
  // SHADER PARTS to be included
  Game.loadShaderFile("assets/partRenderstates.fx");
  // SHADERS that include the parts
  Game.loadShaderFile("assets/shadowcast.fx");
  Game.loadShaderFile("assets/shadowcast2.fx");
}

Game.deviceReady = function ()
{
}

Game.loadingStart = function ()
{
  Game.ready = false;
}

function makeGameObject(model, name)
{
  var obj = new mx.GameObject(name, model);
  Game.world.objects[name] = obj;
  return obj;
}

Game.loadingStop = function ()
{
  doneLoading();

  Game.ready = true;

  // SET UP SCENE
  var table   = makeGameObject(Game.assetMan.assets["table"], "table");
  table.setPositionXYZ(0.0, 1.5, 0.0);
  table.update();

  // SET UP LIGHT AND SHADOWS
  Game.world.shadowDown = new mx.RenderSurface(2048, 2048, gl.RGBA, gl.FLOAT);

  var lightdown = new mx.GameObject("lightdown", null);
  lightdown.setPositionXYZ(0.0, 7.0, 0.0001);
  lightdown.setOrientationXYZ(Math.PI / 2.0, 0.0, 0.0);
  lightdown.update();
  Game.world.lighteyeDown = new mx.Camera(2048, 2048);
  Game.world.lighteyeDown.fov = Math.PI / 1.1;
  Game.world.lighteyeDown.far = 10.0;
  Game.world.lighteyeDown.attachTo(lightdown);
  Game.world.lighteyeDown.update();

  // SET UP CAMERA
  Game.camera.attachTo(Game.world.lighteyeDown);
}

// GAME UPDATES

Game.appUpdate = function ()
{
}

//GAME RENDERING

Game.appDrawAux = function ()
{
}

Game.appDraw = function (eye)
{
  if (!Game.ready || Game.loading) return;
  var obj;

  effect = Game.shaderMan.shaders[Game.shadertype ? "shadowcast2" : "shadowcast"];
  effect.bind();
  effect.bindCamera(eye);

  for (var i in Game.world.objects)
  {
    obj = Game.world.objects[i];
    effect.setUniforms(obj.uniforms);
    effect.draw(obj.model);
  }
}

Game.appHandleMouseEvent = function(type, mouse)
{
}

Game.appLoadingError = function (name)
{
}
