
var uPerObject;
var uScene;
var uBall;
var uSky;
var uSun;

var ball;

var currentlyPressedKeys = [];
var helper;
var shadowmap;
var lighteye;
var sunpos = 0.0; 
var cameraMode = false;

Game.appInit = function ()
{
  Game.World = new fWorld();
  Game.World.createRegionContaining(0, 0);
  Game.World.createRegionContaining(100, 0);
  Game.World.createRegionContaining(-100, 0);
  Game.World.createRegionContaining(0, 100);
  Game.World.createRegionContaining(0, -100);
  Game.World.createRegionContaining( 100, 100);
  Game.World.createRegionContaining(-100, 100);
  Game.World.createRegionContaining( 100, -100);
  Game.World.createRegionContaining(-100, -100);

  Game.loadShaderFile("renderstates.fx");
  Game.loadShaderFile("waterFlowIn.fx");
  Game.loadShaderFile("waterFlowOut.fx");
  Game.loadShaderFile("groundpicker.fx");
  Game.loadShaderFile("colorlines.fx");
  Game.loadShaderFile("shadowcast.fx");
  Game.loadShaderFile("shadowcastobject.fx");
  Game.loadShaderFile("shadowrecieve.fx");
  Game.loadShaderFile("ground.fx");
  Game.loadShaderFile("water.fx");
  Game.loadShaderFile("plainobject.fx");
  Game.loadShaderFile("sky.fx");

  Game.loadTextureFile("tile", "tile.jpg", true);
  Game.loadTextureFile("grass", "grass.jpg", true);
  Game.loadTextureFile("sand", "sand.jpg", true);
  Game.loadTextureFile("dirt", "dirtcliff.jpg", true);

  Game.loadMeshPNG("ball", "ball.model");
}

Game.deviceReady = function ()
{
  pickmap = new RenderSurface(Game.camera.width, Game.camera.height, gl.RGBA, gl.UNSIGNED_BYTE);
}

Game.loadingStart = function ()
{
  Game.ready = false;
}

Game.loadingStop = function ()
{
  Game.ready = true;

  ball = new GameObject(Game.assetMan.assets["ball"]);
  vec3.set(ball.Position, 50.0, 0.0, 50.0);

  Game.camera.offset[0] = 0.0;
  Game.camera.offset[1] = 0.0;
  Game.camera.offset[2] = 50.0;
  Game.camera.angles[0] = -0.55;
  Game.camera.setTarget(ball); //(50.0, 0.0, 50.0);

  shadowmap = new RenderSurface(2048, 2048, gl.RGBA, gl.FLOAT);
  lighteye = new Camera(2048, 2048);
  lighteye.offset = vec3.fromValues(0.0, 200.0, 0.0);
  lighteye.setTarget(ball);
  sunpos = 0.0;

  var effect = Game.shaderMan.shaders["ground"];
  uScene = effect.createUniform('scene');
  uScene.options = vec3.fromValues(1.0, 1.0, 1.0);
  uScene.regionsize = (RegionSize - 1);
  uScene.uLightPosition = lighteye.position;
  uScene.uWorldToLight = mat4.create();
  mat4.multiply(uScene.uWorldToLight, lighteye.eyes[0].projection, lighteye.eyes[0].view);

  uBall = {};
  uBall.uWorld = mat4.create();
  mat4.identity(uBall.uWorld);

  uSun = {};
  uSun.uWorld = mat4.create();
  mat4.identity(uSun.uWorld);

  uSky = {};
  uSky.orient = mat3.create();
  uSky.sunorient = mat3.create();

  Game.makeHelper();
}

Game.makeHelper = function()
{
  helper = new aoHelper(Game.World.cast);
  var pos = vec3.fromValues(50.0, Game.World.getHeight(50.0,50.0), 50.0);
  helper.Update(pos);
}

var moved = false;

Game.appUpdate = function ()
{
  if (Game.loading) return;
  if (!Game.camera) return;

  // CAMERA AND TARGET MOVEMENT
  if (currentlyPressedKeys[33] && Game.camera.offset[2] > 4)  // Page Up
    Game.camera.offset[2] -= 1;
  if (currentlyPressedKeys[34] && Game.camera.offset[2] < 100)  // Page Down
    Game.camera.offset[2] += 1;

  var tmp = vec3.create();
  var lasttargetx = Game.camera.target[0];
  var lasttargety = Game.camera.target[2];

  if (Game.World.getWaterHeight(Game.camera.target.Position[0], Game.camera.target.Position[2]))
  {
    var i = ((lasttargetx * (RegionSize - 1) / RegionArea) | 0) + 1;
    var j = ((lasttargety * (RegionSize - 1) / RegionArea) | 0) + 1;
    Game.World.Regions[0].addwater(i, j, -0.25);
    var i = ((Game.camera.target.Position[0] * (RegionSize - 1) / RegionArea) | 0) + 1;
    var j = ((Game.camera.target.Position[2] * (RegionSize - 1) / RegionArea) | 0) + 1;
    Game.World.Regions[0].addwater(i, j, 0.25);
  }

  ball.Update();
  if (ball.Position[0] <= 0.0) { ball.Position[0] = 0.01; Game.camera.stop(Direction.all); }
  if (ball.Position[2] <= 0.0) { ball.Position[2] = 0.01; Game.camera.stop(Direction.all); }
  if (ball.Position[0] >= 100.0) { ball.Position[0] = 99.99; Game.camera.stop(Direction.all); }
  if (ball.Position[2] >= 100.0) { ball.Position[2] = 99.99; Game.camera.stop(Direction.all); }

  // SUN MOVEMENT
  sunpos += 0.00001; 
  if (sunpos > (Math.PI * 2.0)) sunpos = 0.0;
  lighteye.offset[0] = ball.Position[0];
  lighteye.offset[2] = ball.Position[2];
  lighteye.angles[0] = sunpos;
  lighteye.update();
  uScene.uLightPosition = lighteye.position;
  mat4.multiply(uScene.uWorldToLight, lighteye.eyes[0].projection, lighteye.eyes[0].view);

  // UPDATE SUN UI
  var v = document.getElementById("sunval");
  var p = sunpos * 360.0 / (Math.PI * 2.0);
  v.innerHTML = p.toString().substr(0,5);
  var s = document.getElementById("sun");
  s.value = p;

  // IF MOUSE WAS CLICKED, GET SPOT CLICKED ON
  if (readback)
  {
    readback = false;
    pickmap.engage();
    var pixel = new Uint8Array(4);
    gl.readPixels(mx, Game.camera.height - my, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    var i = ((pixel[0] * (RegionSize - 1) / 255.0) | 0) + 1;
    var j = ((pixel[1] * (RegionSize - 1) / 255.0) | 0) + 1;
    Game.World.Regions[0].addwater(i, j, water);
  }

  // ADJUST CAMERA TO NOT CLIP
  Game.camerafix();

  // CAMERA MODE
  if (cameraMode)
  {
    vec3.copy(Game.camera.target, lighteye.target);
    vec3.copy(Game.camera.angles, lighteye.angles);
    vec3.copy(Game.camera.offset, lighteye.offset );
  }

  // UPDATE UNIFORMS
  mat4.identity(uBall.uWorld);
  mat4.translate(uBall.uWorld, uBall.uWorld, Game.camera.target.Position);
  mat4.identity(uSun.uWorld);
  mat4.translate(uSun.uWorld, uSun.uWorld, lighteye.position);
  mat3.fromMat4(uSky.orient, Game.camera.orientation);
  mat3.identity(uSky.sunorient)
  mat3.rotate(uSky.sunorient, uSky.sunorient, (sunpos * 0.7) * (2 * 3.14159) / 300.0);
}

Game.camerafix = function()
{
  Game.camera.target.Position[1] = Game.World.getHeight(Game.camera.target.Position[0], Game.camera.target.Position[2]) + Game.World.getWaterHeight(Game.camera.target.Position[0], Game.camera.target.Position[2]);

  // check for ground clip
  var x = 0;
  do {
    x++;
    if (x == 100) break; // sanity
    var h = Game.World.getHeight(Game.camera.position[0], Game.camera.position[2]);
    h += Game.World.getWaterHeight(Game.camera.position[0], Game.camera.position[2]);
    if (Game.camera.position[1] - h > 1.0) break;
    Game.camera.angles[0] -= 0.001;
    Game.camera.update();
  } while (true);
}

Game.appDrawAux = function ()
{
  if (Game.loading) return;

  // water
  if (showFlow) Game.World.Regions[0].renderflows();

  // shadowing render
  if (uScene.options[2]) 
  {
    lighteye.engage();
    shadowmap.engage();
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var effect = Game.shaderMan.shaders["shadowcast"];
    effect.bind();
    effect.bindCamera(lighteye);
    effect.setUniforms(uScene);
    for (var x in Game.World.Regions)
    {
      var region = Game.World.Regions[x];
      effect.setUniforms(region.uPerObject);
      effect.bindTexture("heightmap", region.heightmap.texture);
      effect.draw(region.mesh);
    }

   var effect = Game.shaderMan.shaders["shadowcastobject"];
   effect.bind();
   effect.bindCamera(lighteye);
   effect.setUniforms(uScene);
   effect.setUniforms(uBall);
   effect.draw(Game.assetMan.assets["ball"]);
  }

  // if the mouse is clicked, determine the spot clicked
  if (clicked && !readback)
  {
    Game.camera.eyes[0].engage()
    pickmap.engage();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var effect = Game.shaderMan.shaders["picker"];
    effect.bind();
    effect.bindCamera(Game.camera.eyes[0]);
    effect.setUniforms(uScene);
    effect.setUniforms(Game.World.Regions[0].uPerObject);
    effect.bindTexture("heightmap", Game.World.Regions[0].heightmap.texture);
    effect.bindTexture("watermap", Game.World.Regions[0].watermap.texture);
    effect.draw(Game.World.Regions[0].mesh);
    readback = true;
  }
}

Game.appDraw = function (eye)
{
  if (!Game.ready || Game.loading) return;

  // SKY
  var effect = Game.shaderMan.shaders["sky"];
  effect.bind();
  effect.bindCamera(eye);
  effect.setUniforms(uSky);
  effect.draw(Game.assetMan.assets[eye.fsq]);

  // TERRAIN
  effect = Game.shaderMan.shaders["ground"];
  effect.bind();
  effect.bindCamera(eye);
  effect.setUniforms(uScene);
  effect.bindTexture("shadow", shadowmap.texture);
  if (showWang) {
    effect.bindTexture("grass", Game.assetMan.assets['tile'].texture);
    effect.bindTexture("dirt", Game.assetMan.assets['tile'].texture);
    effect.bindTexture("sand", Game.assetMan.assets['tile'].texture);
  }
  else {
    effect.bindTexture("grass", Game.assetMan.assets['grass'].texture);
    effect.bindTexture("dirt", Game.assetMan.assets['dirt'].texture);
    effect.bindTexture("sand", Game.assetMan.assets['sand'].texture);
  }
  for (var x in Game.World.Regions)
  {
    var region = Game.World.Regions[x];
    effect.bindTexture("heightmap", region.heightmap.texture);
    if (region.aomap) effect.bindTexture("aomap", region.aomap.texture);
    effect.bindTexture("wang", region.wangmap.texture);
    effect.setUniforms(region.uPerObject);
    effect.draw(region.mesh);
  }

  // WATER
  effect = Game.shaderMan.shaders["water"];
  effect.bind();
  effect.bindCamera(eye);
  effect.setUniforms(uScene);
  effect.bindTexture("shadow", shadowmap.texture);
  for (var x in Game.World.Regions)
  {
    var region = Game.World.Regions[x];
    effect.setUniforms(region.uPerObject);
    effect.bindTexture("heightmap", region.heightmap.texture);
    effect.bindTexture("watermap", region.watermap.texture);
    effect.draw(region.mesh);
  }

  // OBJECTS - BALL
  effect = Game.shaderMan.shaders["plainobject"];
  effect.bind();
  effect.bindCamera(eye);
  effect.setUniforms(uScene);
  effect.setUniforms(uBall);
  effect.draw(Game.assetMan.assets["ball"]);
  effect.setUniforms(uSun);
  effect.draw(Game.assetMan.assets["ball"]);

//  effect = Game.shaderMan.shaders["colorlines"];
//  effect.bind();
//  effect.bindCamera(eye);
//  effect.draw(helper.aoBuf);
}

var mx = 0;
var my = 0;
var clicked = false;
var readback = false;
var pickmap;

Game.appHandleMouseEvent = function (type, mouse)
{
  if (mouse.button == 0 && type == MouseEvent.Down)
  {
    mx = mouse.X;
    my = mouse.Y;
    clicked = true;
  }
  if (mouse.button == 0 && type == MouseEvent.Up)
  {
    clicked = false;
  }
  if (clicked && type == MouseEvent.Move)
  {
    mx = mouse.X;
    my = mouse.Y;
  }

  if (mouse.button == 2 && type == MouseEvent.Down)
    mouse.grab();
  if (mouse.button == 2 && type == MouseEvent.Up)
    mouse.release();

  if (type == MouseEvent.Out) Game.camera.stop(Direction.all);

  if (type == MouseEvent.Wheel)
  {
    Game.camera.offset[2] -= mouse.wheel * 3;
    if (Game.camera.offset[2] < 4) Game.camera.offset[2] = 4;
    if (Game.camera.offset[2] > 100) Game.camera.offset[2] = 100;
    Game.camerafix();
  }

  if (mouse.grabbed)
  {
    if (mouse.moveOffsetX < 20 && mouse.moveOffsetX > -20) 
    {
      Game.camera.angles[1] += -0.01 * mouse.moveOffsetX;
      Game.camera.angles[0] += -0.01 * mouse.moveOffsetY;
      Game.camerafix();
    }
  }
}

Game.appHandleKeyDown = function (event)
{
  if (currentlyPressedKeys[event.keyCode]) { console.log("abort"); return; }
  currentlyPressedKeys[event.keyCode] = true;

  if ([33, 34].indexOf(event.keyCode) > -1) event.preventDefault();
  else if (event.keyCode == 67) cameraMode = !cameraMode;
  else if (event.keyCode == 37 && Game.camera.target.Position[0] > 0)  // Left cursor key
  {
    Game.camera.move(Direction.left, 0.4);
    moved = true;
  }
  else if (event.keyCode == 39 && Game.camera.target.Position[0] < 100)  // Right cursor key
  {
    Game.camera.move(Direction.right, 0.4);
    moved = true;
  }
  else if (event.keyCode == 38 && Game.camera.target.Position[2] > 0)  // Up cursor key
  {
    Game.camera.move(Direction.back, 0.4);
    moved = true;
  }
  else if (event.keyCode == 40 && Game.camera.target.Position[2] < 100)  // Down cursor key
  {
    Game.camera.move(Direction.forward, 0.4);
    moved = true;
  }
}

Game.appHandleKeyUp = function (event)
{
  currentlyPressedKeys[event.keyCode] = false;

  if (event.keyCode == 70) Game.fullscreenMode(!Game.isFullscreen);
  else if (event.keyCode == 79) Game.oculusMode(!Game.isOculus);
  else if (event.keyCode == 37)
  {
    Game.camera.stop(Direction.left);
    moved = true;
  }
  else if (event.keyCode == 39)
  {
    Game.camera.stop(Direction.right);
    moved = true;
  }
  else if (event.keyCode == 38)
  {
    Game.camera.stop(Direction.back);
    moved = true;
  }
  else if (event.keyCode == 40)
  {
    Game.camera.stop(Direction.forward);
    moved = true;
  }
}

var showWang = false;
var showFlow = true;
var water = 0.25;

Game.setparam = function(name, value)
{
  if (name == 'ao') uScene.options[1] = (value ? 1.0 : 0.0);
  else if (name == 'diffuse') uScene.options[0] = (value ? 1.0 : 0.0);
  else if (name == 'wang') showWang = !showWang;
  else if (name == 'flow') showFlow = !showFlow;
  else if (name == 'shadow') uScene.options[2] = (value ? 1.0 : 0.0);
  else if (name == 'count') { Game.World.cast.setRays(value, 0, 0); Game.World.Regions[0].createAOMap(); Game.makeHelper(); }
  else if (name == 'size') { Game.World.cast.setRays(0, 0, value); Game.World.Regions[0].createAOMap(); Game.makeHelper(); }
  else if (name == 'step') { Game.World.cast.setRays(0, value, 0); Game.World.Regions[0].createAOMap(); Game.makeHelper(); }
  else if (name == 'water') water = parseInt(value) * 0.01;
  else if (name == 'sun') {
    sunpos = parseFloat(value * Math.PI * 2.0 / 260.0);
  }
}


// Object represent an instance of a model in the world. It contains the object's position and velocity.
// Velocity gets updated by other classes that control the object.
// Object supports having a WorldOffset to handle models that do not have the origin set in the right place
// Object supports having an orientation different than its direction of motion
function GameObject(model)
{
  this.mModel = model;
  this.WorldOffset = vec3.create();
  this.Position = vec3.create();
  this.Velocity = vec3.create();
  this.Orient = mat4.create(); 
  mat4.fromYawPitchRoll(this.Orient, 0, 0, 0);

  this.World = mat4.create();
  mat4.createWorld(this.World, vec3.addInline(this.WorldOffset, this.Position), vec3.unitZ, vec3.unitY);
}

GameObject.prototype.Place = function()
{
  this.Position[1] = Game.World.getHeight(this.Position[0], this.Position[2]) + Game.World.getWaterHeight(this.Position[0], this.Position[2]);
}

GameObject.prototype.Update = function(gametime)
{
  // update due to the player's motion
  var vel = vec3.create();
  vec3.transformMat4(vel, this.Velocity, this.Orient);
  vec3.add(this.Position, this.Position, vel);
  this.Place();
  mat4.createWorld(this.World, vec3.addInline(this.WorldOffset, this.Position), vec3.unitZ, vec3.unitY);

  // TODO create new chunk?
}

