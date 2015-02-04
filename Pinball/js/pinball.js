function World()
{
  this.currentlyPressedKeys = [];
  this.objects = {};
  this.head = new mx.GameObject("head", null);

  this.uScene = null;
  this.uAABB = [];

  this.lighteye = null;

  this.physicsWorker = null;
  this.debug = false;
  this.shadow = true;
}

// MAIN GAME CODE
// GAME INIT
var Game = mx.Game;

Game.appInit = function ()
{
  Game.world = new World();

  Game.textureLocation = "assets/"  // autoloaded textures live here
  // MODELS
  Game.loadMeshPNG("board", "assets/board.model");
  Game.loadMeshPNG("ball", "assets/ball.model");
  // TEXTURES
  // SHADER PARTS to be included
  Game.loadShaderFile("assets/partRenderstates.fx");
  Game.loadShaderFile("assets/partShadowrecieve.fx");
  Game.loadShaderFile("assets/partVertexDef.fx");
  Game.loadShaderFile("assets/partPixelDef.fx");
  Game.loadShaderFile("assets/partPlainVertexShader.fx");
  Game.loadShaderFile("assets/partPlainPixelShader.fx");
  // SHADERS that include the parts
  Game.loadShaderFile("assets/objectrender.fx");
  Game.loadShaderFile("assets/boxrender.fx");
  Game.loadShaderFile("assets/shadowcast.fx");
  // AUDIO
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
  makeGameObject(Game.assetMan.assets["board"], "board");
  makeGameObject(Game.assetMan.assets["ball"], "ball1");
  makeGameObject(Game.assetMan.assets["ball"], "ball2");
  makeGameObject(Game.assetMan.assets["ball"], "ball3");
  makeGameObject(Game.assetMan.assets["ball"], "ball4");
  makeGameObject(Game.assetMan.assets["ball"], "ball5");

  // SET UP CAMERA
  Game.world.head.offset[0] = 0.0;
  Game.world.head.offset[1] = 0.0;
  Game.world.head.offset[2] = -7.0;
  Game.world.head.setTarget(Game.world.objects["board"]);
  Game.world.head.setOrientationXYZ(Math.PI / 4, -Math.PI / 2, 0);
  Game.camera.attachTo(Game.world.head);

  // SET UP LIGHT AND SHADOWS
  Game.world.shadow = new mx.RenderSurface(2048, 2048, gl.RGBA, gl.FLOAT);

  var light = new mx.GameObject("light", null);
  light.setPositionXYZ(0.0, 3.0, 6.0);
  light.setOrientationXYZ(Math.PI / 2.0, 0.0, 0.0);
  Game.world.lighteye = new mx.Camera(2048, 2048);
  Game.world.lighteye.fov = Math.PI / 1.1;
  Game.world.lighteye.far = 10.0;
  Game.world.lighteye.attachTo(light);
  Game.world.lighteye.update();

  // SCENE UNIFORMS
  var effect = Game.shaderMan.shaders["objectrender"];
  Game.world.uScene = effect.createUniform('scene');
  Game.world.uScene.uLightPosition = Game.world.lighteye.position;
  Game.world.uScene.uWorldToLight = mat4.create();
  mat4.multiply(Game.world.uScene.uWorldToLight, Game.world.lighteye.eyes[0].projection, Game.world.lighteye.eyes[0].view);

  // SET UP PHYSICS
  Game.world.physicsWorker = new PhysicsWorker();

  // MAKE THE AABB BOX
  var aabbvertices = [
    // front
    0.0, 0.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    1.0, 1.0, 0.0,
    1.0, 1.0, 0.0,
    1.0, 0.0, 0.0, 
    1.0, 0.0, 0.0,
    0.0, 0.0, 0.0,
    // back
    0.0, 0.0, 1.0,
    0.0, 1.0, 1.0,
    0.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 0.0, 1.0,
    1.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    // side
    0.0, 0.0, 0.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 1.0, 1.0,
    0.0, 1.0, 1.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 0.0, 0.0,
    // side
    1.0, 0.0, 0.0,
    1.0, 0.0, 1.0,
    1.0, 0.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, 0.0,
    1.0, 1.0, 0.0,
    1.0, 0.0, 0.0,
    // top
    0.0, 0.0, 0.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    1.0, 0.0, 1.0,
    1.0, 0.0, 1.0,
    1.0, 0.0, 0.0,
    0.0, 0.0, 0.0,
    // bottom
    0.0, 1.0, 0.0,
    0.0, 1.0, 1.0,
    0.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
  ];
  var boxModel = new mx.Mesh();
  boxModel.loadFromArrays(aabbvertices, null, { 'POS': 0 }, gl.LINES, aabbvertices.length / 3.0, 0);
  Game.assetMan.assets['boxmodel'] = boxModel;
}

// GAME UPDATES

Game.appUpdate = function ()
{
  if (Game.loading) return;
  if (!Game.camera) return;

  Game.world.head.update();

  // keyboard camera rotation section
  var x = 0, y = 0, z = 0;
  if (Game.world.currentlyPressedKeys[37]) y = 0.002 * Game.elapsed;
  if (Game.world.currentlyPressedKeys[39]) y = -0.002 * Game.elapsed;
  if (Game.world.currentlyPressedKeys[38]) x = -0.002 * Game.elapsed;
  if (Game.world.currentlyPressedKeys[40]) x = 0.002 * Game.elapsed;
  if (Game.world.currentlyPressedKeys[65]) y = 0.002 * Game.elapsed;
  if (Game.world.currentlyPressedKeys[68]) y = -0.002 * Game.elapsed;
  if (Game.world.currentlyPressedKeys[87]) x = -0.002 * Game.elapsed;
  if (Game.world.currentlyPressedKeys[83]) x = 0.002 * Game.elapsed;
  setHeadAngle(x, y, z);

  // asset updates
  for (var i in Game.world.objects) Game.world.objects[i].update();
}

//GAME RENDERING

Game.appDrawAux = function ()
{
  if (Game.loading) return;

  Game.world.lighteye.engage();
  Game.world.shadow.engage();
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  if (Game.world.shadow)
  {
    var effect = Game.shaderMan.shaders["shadowcast"];
    effect.bind();
    effect.bindCamera(Game.world.lighteye);
    effect.setUniforms(Game.world.uScene);

    for (var i in Game.world.objects) {
      var obj = Game.world.objects[i];
      if (obj.skip || !obj.model) continue;
      effect.setUniforms(obj.uniforms);
      effect.draw(obj.model);
    }
  }
}

Game.appDraw = function (eye)
{
  if (!Game.ready || Game.loading) return;

  var obj;
  
  // normal object shader
  effect = Game.shaderMan.shaders["objectrender"];
  effect.bind();
  effect.bindCamera(eye);
  effect.setUniforms(Game.world.uScene);
  effect.bindTexture("shadow", Game.world.shadow.texture);
  for (var i in Game.world.objects)
  {
    obj = Game.world.objects[i];
    if (obj.skip || obj.transparent || !obj.model) continue;
    effect.setUniforms(obj.uniforms);
    effect.draw(obj.model);
  }

  if (!Game.world.debug) return;

  // AABB render for physics debug
  var boxmodel = Game.assetMan.assets["boxmodel"];
  effect = Game.shaderMan.shaders["boxrender"];
  effect.bind();
  effect.bindCamera(eye);
  effect.setUniforms(Game.world.uScene);
  for (var i in Game.world.uAABB)
  {
    effect.setUniforms(Game.world.uAABB[i]);
    effect.draw(boxmodel);
  }
}


// USER INTERACTION

Game.appHandleKeyDown = function (event)
{
  if ([33, 34].indexOf(event.keyCode) > -1) event.preventDefault();
  if (Game.world.currentlyPressedKeys[event.keyCode]) return;
  Game.world.currentlyPressedKeys[event.keyCode] = true;
}

Game.appHandleKeyUp = function (event)
{
  Game.world.currentlyPressedKeys[event.keyCode] = false;
  if (event.keyCode == 70) Game.fullscreenMode(!Game.isFullscreen);
  else if (event.keyCode == 81) Game.world.debug = !Game.world.debug;
  else if (event.keyCode == 84) Game.world.shadow = !Game.world.shadow;
}

Game.appHandleMouseEvent = function(type, mouse)
{
}

function setHeadAngle(x,y,z)
{
  if (Game.world.head.angles[0] + x < -1.2 || Game.world.head.angles[0] + x > 1.2) x = 0;
  Game.world.head.updateOrientationXYZ(x, y, z);
}

Game.appLoadingError = function (name)
{
}
