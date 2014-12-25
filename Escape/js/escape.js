function World()
{
  this.currentlyPressedKeys = [];
  this.floor = null;
  this.jenga = null;
  this.table = null;
  this.ceiling = null;
  this.fan = null;
  this.light = null;

  this.uScene = null;
  this.uFloor = null;
  this.uJenga = [];
  this.uWalls = [];
  this.uTable = null;
  this.uCeiling = null;
  this.uFan = null;
  this.uLight = null;

  this.lighteye = null;

  this.physicsWorker = null;

  this.fanrot = 0.0;
}





// Object represent an instance of a model in the world. It contains the object's position and velocity.
// Velocity gets updated by other classes that control the object.
// Object supports having a WorldOffset to handle models that do not have the origin set in the right place
// Object supports having an orientation different than its direction of motion
function GameObject(model)
{
  this.Model = model;
  this.WorldOffset = vec3.create();
  this.Position = vec3.create();
  this.Velocity = vec3.create();
  this.Orient = mat4.create();
  mat4.fromYawPitchRoll(this.Orient, 0, 0, 0);

  this.World = mat4.create();
  mat4.createWorld(this.World, vec3.addInline(this.WorldOffset, this.Position), vec3.unitZ, vec3.unitY);
}

GameObject.prototype.Update = function (gametime)
{
  // update due to the player's motion
  var vel = vec3.create();
  vec3.transformMat4(vel, this.Velocity, this.Orient);
  vec3.add(this.Position, this.Position, vel);
  this.Place();
  mat4.createWorld(this.World, vec3.addInline(this.WorldOffset, this.Position), vec3.unitZ, vec3.unitY);
}






Game.appInit = function ()
{
  Game.world = new World();

  Game.textureLocation = "assets/"
  Game.loadMeshPNG("floor", "assets/floor.model");
  Game.loadMeshPNG("table", "assets/table.model");
  Game.loadMeshPNG("jenga", "assets/jenga.model");
  Game.loadMeshPNG("ceiling", "assets/ceiling.model");
  Game.loadMeshPNG("light", "assets/light.model");
  Game.loadMeshPNG("fan", "assets/fan.model");
  Game.loadShaderFile("assets/renderstates.fx");
  Game.loadShaderFile("assets/objectrender.fx");
  Game.loadShaderFile("assets/lightrender.fx");
  Game.loadShaderFile("assets/boxrender.fx");
}

Game.deviceReady = function ()
{
}

Game.loadingStart = function ()
{
  Game.ready = false;
}

Game.loadingStop = function ()
{
  Game.ready = true;

  // SET UP FLOOR
  Game.world.floor = new GameObject(Game.assetMan.assets["floor"]);
  vec3.set(Game.world.floor.Position, 0.0, -0.05, 0.0);

  Game.world.uFloor = {};
  Game.world.uFloor.uWorld = mat4.create();
  mat4.fromRotationTranslation(Game.world.uFloor.uWorld, quat.fromValues(0,0,0,1), Game.world.floor.Position);

  for (var i = 0; i < 4; ++i)
  {
    Game.world.uWalls[i] = {};
    Game.world.uWalls[i].uWorld = mat4.create();
    Game.world.uWalls[i].minBB = vec3.create();
    Game.world.uWalls[i].maxBB = vec3.create();
  }

  Game.world.ceiling = new GameObject(Game.assetMan.assets["ceiling"]);
  vec3.set(Game.world.ceiling.Position, 0.0, 8.0, 0.0);
  Game.world.uCeiling = {};
  Game.world.uCeiling.uWorld = mat4.create();
  mat4.fromRotationTranslation(Game.world.uCeiling.uWorld, quat.fromValues(0, 0, 0, 1), Game.world.ceiling.Position);

  Game.world.fan = new GameObject(Game.assetMan.assets["fan"]);
  vec3.set(Game.world.fan.Position, 0.0, 8.0, 0.0);
  Game.world.uFan = {};
  Game.world.uFan.uWorld = mat4.create();
  mat4.fromRotationTranslation(Game.world.uFan.uWorld, quat.fromValues(0, 0, 0, 1), Game.world.fan.Position);

  Game.world.light = new GameObject(Game.assetMan.assets["light"]);
  vec3.set(Game.world.light.Position, 0.0, 8.0, 0.0);
  Game.world.uLight = {};
  Game.world.uLight.uWorld = mat4.create();
  mat4.fromRotationTranslation(Game.world.uLight.uWorld, quat.fromValues(0, 0, 0, 1), Game.world.light.Position);


  // SET UP TABLE
  Game.world.table = new GameObject(Game.assetMan.assets["table"]);
  vec3.set(Game.world.table.Position, 0.0, 1.5, 3.0);
  Game.world.uTable = {};
  Game.world.uTable.uWorld = mat4.create();
  Game.world.uTable.minBB = vec3.create();
  Game.world.uTable.maxBB = vec3.create();
  mat4.fromRotationTranslation(Game.world.uTable.uWorld, quat.fromValues(0, 0, 0, 1), Game.world.table.Position);

  // SET UP JENGA PEICES
  Game.world.jenga = new GameObject(Game.assetMan.assets["jenga"]);
  for (var layer = 0; layer < 20; ++layer)
  {
    for (var piece = 0; piece < 3; ++piece)
    {
      var uPiece = {};
      uPiece.uWorld = mat4.create();
      uPiece.minBB = vec3.create();
      uPiece.maxBB = vec3.create();
      Game.world.uJenga.push(uPiece);
    }
  }

  // SET UP CAMERA
  Game.camera.offset[0] = 0.0;
  Game.camera.offset[1] = 0.0;
  Game.camera.offset[2] = -3.0;
  var target = new GameObject(null);
  target.Position[1] = 5.0;
  Game.camera.setTarget(target);

  // SET UP LIGHT
  Game.world.lighteye = new Camera(2048, 2048);
  Game.world.lighteye.offset = vec3.fromValues(0.0, 7.0, 0.0);
  Game.world.lighteye.setTarget(Game.world.floor);

  // SCENE UNIFORMS
  var effect = Game.shaderMan.shaders["objectrender"];
  Game.world.uScene = effect.createUniform('scene');
  Game.world.uScene.uLightPosition = Game.world.lighteye.position;
  Game.world.uScene.uWorldToLight = mat4.create();
  mat4.multiply(Game.world.uScene.uWorldToLight, Game.world.lighteye.eyes[0].projection, Game.world.lighteye.eyes[0].view);

  // SET UP PHYSICS
  Game.world.physicsWorker = new Worker("js/physics.js");
  Game.world.physicsWorker.onmessage = fromWorker;
  Game.world.physicsWorker.onerror = function (event) { console.log("ERROR: " + event.message + " (" + event.filename + ":" + event.lineno + ")"); };
  toWorker();

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
  var boxModel = new Mesh();
  boxModel.loadFromArrays(aabbvertices, null, { 'POS': 0 }, gl.LINES, aabbvertices.length / 3.0, 0);
  Game.assetMan.assets['boxmodel'] = boxModel;
}

var sendTime;
var dt = 1 / 60;
var positions = new Float32Array(3 * 65);
var quaternions = new Float32Array(4 * 65);
var bounds = new Float32Array(6 * 65);

var live = false;
function toWorker()
{
  sendTime = Date.now();
  Game.world.physicsWorker.postMessage({
    dt: dt,
    live: live,
    positions: positions,
    quaternions: quaternions,
    bounds: bounds
  }, [positions.buffer, quaternions.buffer, bounds.buffer]);
}

function fromWorker(e)
{
  // Get fresh data from the worker
  positions = e.data.positions;
  quaternions = e.data.quaternions;
  bounds = e.data.bounds;

  var index = 0;
  updateBody(Game.world.uTable, index++);

  // Update rendering meshes
  for (var i = 0; i !== Game.world.uJenga.length; i++)
  {
    updateBody(Game.world.uJenga[i], index++);
  }
  for (var i = 0; i < 4; ++i)
  {
    updateBody(Game.world.uWalls[i], index++);
  }

  // If the worker was faster than the time step (dt seconds), we want to delay the next timestep
  var delay = dt * 1000 - (Date.now() - sendTime);
  if (delay < 0)
  {
    delay = 0;
  }
  setTimeout(toWorker, delay);
}

function updateBody(body, index)
{
  var position = vec3.create();
  var quaternion = quat.create();
  var rot = mat4.create();
  var trans = mat4.create();

  vec3.set(position, positions[3 * index + 0],
                     positions[3 * index + 1],
                     positions[3 * index + 2]);
  quat.set(quaternion, quaternions[4 * index + 0],
                       quaternions[4 * index + 1],
                       quaternions[4 * index + 2],
                       quaternions[4 * index + 3]);
  mat4.fromQuat(rot, quaternion);
  mat4.identity(trans);
  mat4.translate(trans, trans, position);
  mat4.multiply(body.uWorld, trans, rot);

  vec3.set(body.minBB, bounds[6 * index + 0], bounds[6 * index + 1], bounds[6 * index + 2]);
  vec3.set(body.maxBB, bounds[6 * index + 3], bounds[6 * index + 4], bounds[6 * index + 5]);
}

var fanquat = quat.create();

Game.appUpdate = function ()
{
  if (Game.loading) return;
  if (!Game.camera) return;

  Game.world.fanrot += Math.PI / 30.0;
  quat.identity(fanquat);
  quat.rotateY(fanquat, fanquat, Game.world.fanrot);
  mat4.fromRotationTranslation(Game.world.uFan.uWorld, fanquat, Game.world.fan.Position);
}

Game.appDrawAux = function ()
{
  if (Game.loading) return;
}

Game.appDraw = function (eye)
{
  if (!Game.ready || Game.loading) return;

  effect = Game.shaderMan.shaders["lightrender"];
  effect.bind();
  effect.bindCamera(eye);
  effect.setUniforms(Game.world.uScene);
  effect.setUniforms(Game.world.uLight);
  effect.draw(Game.world.light.Model);

  effect = Game.shaderMan.shaders["objectrender"];
  effect.bind();
  effect.bindCamera(eye);
  effect.setUniforms(Game.world.uScene);
  effect.setUniforms(Game.world.uFloor);
  effect.draw(Game.world.floor.Model);
  effect.setUniforms(Game.world.uTable);
  effect.draw(Game.world.table.Model);
  effect.setUniforms(Game.world.uCeiling);
  effect.draw(Game.world.ceiling.Model);
  effect.setUniforms(Game.world.uFan);
  effect.draw(Game.world.fan.Model);

  for (var p in Game.world.uJenga)
  {
    effect.setUniforms(Game.world.uJenga[p]);
    effect.draw(Game.world.jenga.Model);
  }

  // AABB render for physics debug
  effect = Game.shaderMan.shaders["boxrender"];
  effect.bind();
  effect.bindCamera(eye);
  effect.setUniforms(Game.world.uScene);
  var boxmodel = Game.assetMan.assets["boxmodel"];
  for (var p in Game.world.uJenga) {
    effect.setUniforms(Game.world.uJenga[p]);
    effect.draw(boxmodel);
  }
  effect.setUniforms(Game.world.uTable);
  effect.draw(boxmodel);
  for (var i = 0; i < 4; ++i)
  {
    effect.setUniforms(Game.world.uWalls[i]);
    effect.draw(boxmodel);
  }
}

Game.appHandleKeyDown = function (event)
{
  if (Game.world.currentlyPressedKeys[event.keyCode]) { console.log("abort"); return; }
  Game.world.currentlyPressedKeys[event.keyCode] = true;

  if ([33, 34].indexOf(event.keyCode) > -1) event.preventDefault();
  else if (event.keyCode == 37 && Game.camera.target.Position[0] > 0)  // Left cursor key
  {
  }
  else if (event.keyCode == 39 && Game.camera.target.Position[0] < 100)  // Right cursor key
  {
  }
  else if (event.keyCode == 38 && Game.camera.target.Position[2] > 0)  // Up cursor key
  {
  }
  else if (event.keyCode == 40 && Game.camera.target.Position[2] < 100)  // Down cursor key
  {
  }
}

Game.appHandleKeyUp = function (event)
{
  Game.world.currentlyPressedKeys[event.keyCode] = false;

  if (event.keyCode == 70) Game.fullscreenMode(!Game.isFullscreen);
  else if (event.keyCode == 37)
  {
  }
  else if (event.keyCode == 39)
  {
  }
  else if (event.keyCode == 38)
  {
  }
  else if (event.keyCode == 40)
  {
  }
}

var clicked = false;
Game.appHandleMouseEvent = function(type, mouse)
{
  // console.log("Mouse event: " + ['Down', 'Up', 'Move', 'In', 'Out', 'Grab', 'Release', 'NoGrab', 'Wheel'][type]);
  if (mouse.button == 0 && type == MouseEvent.Down)
    live = true;

  if (mouse.button == 2 && type == MouseEvent.Down)
  { console.log("click"); clicked = true; } //mouse.grab(); }
  if (mouse.button == 2 && type == MouseEvent.Up)
  { console.log("unclick");  clicked = false; } //mouse.release();

  if (clicked && type == MouseEvent.Move)
  {
    if (mouse.moveOffsetX < 20 && mouse.moveOffsetX > -20)
    {
      Game.camera.angles[1] += -0.01 * mouse.moveOffsetX;
      Game.camera.angles[0] += 0.01 * mouse.moveOffsetY;
    }
  }
}

Game.appLoadingError = function (name)
{
}
