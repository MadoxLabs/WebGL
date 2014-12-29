function World()
{
  this.currentlyPressedKeys = [];
  this.objects = [];
  this.objectFan;

  this.uScene = null;

  this.lighteye = null;

  this.physicsWorker = null;
}





function GameObject(model)
{
  this.id = Game.world.objects.length;
  Game.world.objects.push(this);

  this.Model = model;
  this.Position = vec3.create(); vec3.set(this.Position, 0,0,0);
  this.Rotation = quat.create(); quat.identity(this.Rotation);
  this.Velocity = vec3.create();

  this.Trans = mat4.create(); mat4.identity(this.Trans);
  this.Orient = mat4.create(); mat4.identity(this.Orient);

  this.uniform = {};
  this.uniform.uWorld = mat4.create();
  this.uniform.minBB = vec3.create();
  this.uniform.maxBB = vec3.create();
}

GameObject.prototype.Place = function (x,y,z)
{
  vec3.set(this.Position, x, y, z);
  this.Update();
}

GameObject.prototype.Rotate = function (x, y, z, w)
{
  quat.set(this.Rotation, x, y, z, w);
  this.Update();
}

GameObject.prototype.Update = function (gametime)
{
  mat4.fromQuat(this.Orient, this.Rotation);
  mat4.identity(this.Trans);
  mat4.translate(this.Trans, this.Trans, this.Position);
  mat4.multiply(this.uniform.uWorld, this.Trans, this.Orient);
}






Game.appInit = function ()
{
  Game.world = new World();

  Game.textureLocation = "assets/"
  Game.loadMeshPNG("floor", "assets/floor.model");
  Game.loadMeshPNG("table", "assets/table.model");
  Game.loadMeshPNG("jenga", "assets/jenga.model");
  Game.loadMeshPNG("clock", "assets/clock.model");
  Game.loadMeshPNG("shelf", "assets/shelf.model");
  Game.loadMeshPNG("ceiling", "assets/ceiling.model");
  Game.loadMeshPNG("light", "assets/light.model");
  Game.loadMeshPNG("fan", "assets/fan.model");
  Game.loadMeshPNG("door", "assets/door.model");
  Game.loadMeshPNG("dresser", "assets/dresser.model");
  Game.loadMeshPNG("drawer", "assets/drawer.model");
  Game.loadMeshPNG("switch", "assets/switch.model");
  Game.loadShaderFile("assets/renderstates.fx");
  Game.loadShaderFile("assets/objectrender.fx");
  Game.loadShaderFile("assets/lightrender.fx");
  Game.loadShaderFile("assets/boxrender.fx");
  Game.loadShaderFile("assets/shadowcast.fx");
  Game.loadShaderFile("assets/shadowrecieve.fx");
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
  
  // SET UP CAMERA
  Game.camera.offset[0] = 0.0;
  Game.camera.offset[1] = 0.0;
  Game.camera.offset[2] = 1.0;
  var target = new GameObject(null);
  target.Position[1] = 5.0;
  Game.camera.setTarget(target);

  // SET UP SCENE
  var light = new GameObject(Game.assetMan.assets["light"]);    // these pieces are not physical
  light.Place(0.0, 8.0, 0.0);
  var ceiling = new GameObject(Game.assetMan.assets["ceiling"]);
  ceiling.Place(0.0, 8.0, 0.0);
  var fan = new GameObject(Game.assetMan.assets["fan"]);
  fan.Place(0.0, 8.0, 0.0);
  fan.fanrot = 0;
  Game.world.objectFan = fan;
  var floor = new GameObject(Game.assetMan.assets["floor"]);
  floor.Place(0.0, -0.05, 0.0);
  var lightswitch = new GameObject(Game.assetMan.assets["switch"]);
  quat.rotateY(lightswitch.Rotation, lightswitch.Rotation, Math.PI / 2);
  lightswitch.Place(3.9, 4.5, 0.0);
  var door = new GameObject(Game.assetMan.assets["door"]);
  quat.rotateY(door.Rotation, door.Rotation, Math.PI / -2);
  door.Place(0.0, 0.0, -3.9);

  var table = new GameObject(Game.assetMan.assets["table"]);   // from here on match the physical data coming from worker
  table.Place(0.0, 8.0, 0.0);

  var shelf = new GameObject(Game.assetMan.assets["shelf"]);
  shelf.Place(-3.25, 4.5, 0.0);
  var clock = new GameObject(Game.assetMan.assets["clock"]);
  clock.Place(-3.5, 4.8, 0.0);
  var dresser = new GameObject(Game.assetMan.assets["dresser"]);
  quat.rotateY(dresser.Rotation, dresser.Rotation, Math.PI);
  dresser.Place(3.4, 1.5835, 0.0);
  var drawer = new GameObject(Game.assetMan.assets["drawer"]);
  quat.rotateY(drawer.Rotation, drawer.Rotation, Math.PI);
  drawer.Place(3.2, 2.65, 0.0);

  for (var layer = 0; layer < 20; ++layer)
    for (var piece = 0; piece < 3; ++piece)
      var jenga = new GameObject(Game.assetMan.assets["jenga"]);

  for (var i = 0; i < 4; ++i) var wall = new GameObject(null); 

//  // SET UP LIGHT
//  Game.world.lighteye = new Camera(2048, 2048);
//  Game.world.lighteye.offset = vec3.fromValues(0.0, 7.0, 0.0);
//  Game.world.lighteye.setTarget(Game.world.objects[2]);

  // SET UP LIGHT AND SHADOWS
  Game.world.shadowUp = new RenderSurface(2048, 2048, gl.RGBA, gl.FLOAT);
  Game.world.shadowDown = new RenderSurface(2048, 2048, gl.RGBA, gl.FLOAT);

  Game.world.lighteyeUp = new Camera(2048, 2048);
  Game.world.lighteyeUp.fov = Math.PI / 1.1;
  Game.world.lighteyeUp.far = 10.0;
  Game.world.lighteyeUp.offset = vec3.fromValues(0.0, -0.1, 0.0001);
  var target2 = new GameObject(null);
  target2.Position[1] = 7.0;
  Game.world.lighteyeUp.setTarget(target2);
  Game.world.lighteyeUp.update();

  Game.world.lighteyeDown = new Camera(2048, 2048);
  Game.world.lighteyeDown.fov = Math.PI / 1.1;
  Game.world.lighteyeDown.far = 10.0;
  Game.world.lighteyeDown.offset = vec3.fromValues(0.0, 2.0, 0.0001);
  Game.world.lighteyeDown.setTarget(target);
  Game.world.lighteyeDown.update();

  // SCENE UNIFORMS
  var effect = Game.shaderMan.shaders["objectrender"];
  Game.world.uScene = effect.createUniform('scene');
  Game.world.uScene.uLightPosition = Game.world.lighteyeDown.position;
  Game.world.uScene.uWorldToLight = null;
  Game.world.uScene.uWorldToLight1 = mat4.create();
  Game.world.uScene.uWorldToLight2 = mat4.create();
  mat4.multiply(Game.world.uScene.uWorldToLight1, Game.world.lighteyeDown.eyes[0].projection, Game.world.lighteyeDown.eyes[0].view);
  mat4.multiply(Game.world.uScene.uWorldToLight2, Game.world.lighteyeUp.eyes[0].projection, Game.world.lighteyeUp.eyes[0].view);

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
var liveobjects = 69;
var positions = new Float32Array(3 * liveobjects);
var quaternions = new Float32Array(4 * liveobjects);
var bounds = new Float32Array(6 * liveobjects);

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

function queryPick(near, far)
{
  Game.world.physicsWorker.postMessage({
    near: { x: near[0], y: near[1], z: near[2] },
    far: { x: far[0], y: far[1], z: far[2] }
  });
}

function fromWorker(e)
{
  if (e.data.hit) { console.log("Mouse clicked: " + e.data.hit); return; }

  // Get fresh data from the worker
  positions = e.data.positions;
  quaternions = e.data.quaternions;
  bounds = e.data.bounds;

  for (var i = 7, index = 0; i < Game.world.objects.length; ++i) updateBody(Game.world.objects[i], index++);

  // If the worker was faster than the time step (dt seconds), we want to delay the next timestep
  var delay = dt * 1000 - (Date.now() - sendTime);
  if (delay < 0)    delay = 0;
  setTimeout(toWorker, delay);
}

function updateBody(body, index)
{
  body.Place(positions[3 * index + 0], positions[3 * index + 1], positions[3 * index + 2]);
  body.Rotate(quaternions[4 * index + 0], quaternions[4 * index + 1], quaternions[4 * index + 2], quaternions[4 * index + 3]);
  vec3.set(body.uniform.minBB, bounds[6 * index + 0], bounds[6 * index + 1], bounds[6 * index + 2]);
  vec3.set(body.uniform.maxBB, bounds[6 * index + 3], bounds[6 * index + 4], bounds[6 * index + 5]);
}

Game.appUpdate = function ()
{
  if (Game.loading) return;
  if (!Game.camera) return;

  Game.world.objectFan.fanrot += Math.PI / 30.0;
  quat.identity(Game.world.objectFan.Rotation);
  quat.rotateY(Game.world.objectFan.Rotation, Game.world.objectFan.Rotation, Game.world.objectFan.fanrot);
  Game.world.objectFan.Update();
}

Game.appDrawAux = function ()
{
  if (Game.loading) return;

  Game.world.lighteyeUp.engage();
  Game.world.shadowUp.engage();
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  var effect = Game.shaderMan.shaders["shadowcast"];
  effect.bind();
  effect.bindCamera(Game.world.lighteyeUp);
  effect.setUniforms(Game.world.uScene);
  effect.setUniforms(Game.world.objectFan.uniform);
  effect.draw(Game.world.objectFan.Model);

  Game.world.lighteyeDown.engage();
  Game.world.shadowDown.engage();
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  effect.bind();
  effect.bindCamera(Game.world.lighteyeDown);
  effect.setUniforms(Game.world.uScene);
  for (var i = 5; i < Game.world.objects.length; ++i) {
    if (!Game.world.objects[i].Model) continue;
    effect.setUniforms(Game.world.objects[i].uniform);
    effect.draw(Game.world.objects[i].Model);
  }
}

Game.appDraw = function (eye)
{
  if (!Game.ready || Game.loading) return;

  // light has a special shader
  effect = Game.shaderMan.shaders["lightrender"];
  effect.bind();
  effect.bindCamera(eye);
  effect.setUniforms(Game.world.uScene);
  effect.setUniforms(Game.world.objects[1].uniform);
  effect.draw(Game.world.objects[1].Model);

  // render objects
  effect = Game.shaderMan.shaders["objectrender"];
  effect.bind();
  effect.bindCamera(eye);

  // ceiling and fan use up facing shadow map
  Game.world.uScene.uWorldToLight = Game.world.uScene.uWorldToLight2;
  effect.setUniforms(Game.world.uScene);
  effect.bindTexture("shadow", Game.world.shadowUp.texture);  // ceiling
  effect.setUniforms(Game.world.objects[2].uniform);
  effect.draw(Game.world.objects[2].Model);
  effect.setUniforms(Game.world.objects[3].uniform);   // fan
  effect.draw(Game.world.objects[3].Model);

  // the rest are down facing
  Game.world.uScene.uWorldToLight = Game.world.uScene.uWorldToLight1;
  effect.setUniforms(Game.world.uScene);
  effect.bindTexture("shadow", Game.world.shadowDown.texture);
  for (var i = 3; i < Game.world.objects.length; ++i)
  {
    if (!Game.world.objects[i].Model) continue;
    effect.setUniforms(Game.world.objects[i].uniform);
    effect.draw(Game.world.objects[i].Model);
  }

  effect.setUniforms(pickUniform);
  effect.draw(Game.assetMan.assets["light"]);

  return;

  // AABB render for physics debug
  var boxmodel = Game.assetMan.assets["boxmodel"];
  effect = Game.shaderMan.shaders["boxrender"];
  effect.bind();
  effect.bindCamera(eye);
  effect.setUniforms(Game.world.uScene);
  for (var i = 5; i < Game.world.objects.length; ++i)
  {
    effect.setUniforms(Game.world.objects[i].uniform);
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
  else if (event.keyCode == 38)  // Up cursor key
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
var pickUniform = { uWorld: mat4.create() };

Game.appHandleMouseEvent = function(type, mouse)
{
  // console.log("Mouse event: " + ['Down', 'Up', 'Move', 'In', 'Out', 'Grab', 'Release', 'NoGrab', 'Wheel'][type]);
  if (mouse.button == 0 && type == MouseEvent.Down)
  {
    live = true;

    var unproject = mat4.create();
    var unproj = mat4.create();
    var unview = mat4.create();
    mat4.invert(unproj, Game.camera.eyes[0].projection);
    mat4.invert(unview, Game.camera.eyes[0].view);
    mat4.multiply(unproject, unview, unproj);

    var near = vec4.fromValues((mouse.X / Game.camera.width) * 2.0 - 1.0, -(mouse.Y / Game.camera.height) * 2.0 + 1.0, -1.0, 1.0);
    vec4.transformMat4(near, near, unproject);
    vec4.scale(near, near, 1.0/near[3])

    var far = vec4.fromValues((mouse.X / Game.camera.width) * 2.0 - 1.0, -(mouse.Y / Game.camera.height) * 2.0 + 1.0, 1.0, 1.0);
    vec4.transformMat4(far, far, unproject);
    vec4.scale(far, far, 1.0 / far[3])

    queryPick(near, far);
  }

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
