function World()
{
  this.currentlyPressedKeys = [];
  this.objects = {};

  this.uScene = null;

  this.lighteye = null;

  this.physicsWorker = null;
}



function GameObject(model, name)
{
//  this.id = Game.world.objects.length;
  if (name)
  {
    this.name = name;
    Game.world.objects[name] = this;
  }

  this.Model = model;
  this.LocalPosition = vec3.fromValues(0, 0, 0);
  this.Position = vec3.fromValues(0, 0, 0);
  this.Rotation = quat.create(); quat.identity(this.Rotation);
  this.Velocity = vec3.create();

  this.Trans = mat4.create(); mat4.identity(this.Trans);
  this.Orient = mat4.create(); mat4.identity(this.Orient);

  this.uniform = {};
  this.uniform.uWorld = mat4.create();
  this.uniform.minBB = vec3.create();
  this.uniform.maxBB = vec3.create();

  this.dirty = false;
}

GameObject.prototype.Place = function (x,y,z)
{
  vec3.set(this.LocalPosition, x, y, z);
  this.dirty = true;
}

GameObject.prototype.Rotate = function (x, y, z, w)
{
  quat.set(this.Rotation, x, y, z, w);
  this.dirty = true;
}

GameObject.prototype.Update = function (gametime)
{
  if (!this.dirty && !this.mover) return;

  this.dirty = false;
  if (this.mover) {
    this.mover.update();
    vec3.add(this.Position, this.LocalPosition, this.mover.offset);
  }
  else
    vec3.copy(this.Position, this.LocalPosition);
  mat4.fromQuat(this.Orient, this.Rotation);
  mat4.identity(this.Trans);
  mat4.translate(this.Trans, this.Trans, this.Position);
  mat4.multiply(this.uniform.uWorld, this.Trans, this.Orient);
}

GameObject.prototype.setMover = function(m)
{
  this.mover = m;
}


function PhysicsWorker()
{
  this.worker = new Worker("js/physics.js");;
  this.sendTime = 0;
  this.dt = 1 / 60;
  this.liveobjects = 70;
  this.positions = new Float32Array(3 * this.liveobjects);
  this.quaternions = new Float32Array(4 * this.liveobjects);
  this.bounds = new Float32Array(6 * this.liveobjects);

  var self = this;
  this.worker.onmessage = function (event) { self.fromWorker(event); };
  this.worker.onerror = function (event) { console.log("ERROR: " + event.message + " (" + event.filename + ":" + event.lineno + ")"); };
  this.toWorker();
}

PhysicsWorker.prototype.toWorker = function ()
{
  this.sendTime = Date.now();
  this.worker.postMessage({
    dt: this.dt,
    positions: this.positions,
    quaternions: this.quaternions,
    bounds: this.bounds
  }, [this.positions.buffer, this.quaternions.buffer, this.bounds.buffer]);
}

PhysicsWorker.prototype.queryPick = function (near, far)
{
  this.worker.postMessage({
    near: { x: near[0], y: near[1], z: near[2] },
    far: { x: far[0], y: far[1], z: far[2] }
  });
}

PhysicsWorker.prototype.fromWorker = function (e)
{
  if (e.data.hit) { Game.itemClick(e.data.hit); return; }

  // Get fresh data from the worker
  this.positions = e.data.positions;
  this.quaternions = e.data.quaternions;
  this.bounds = e.data.bounds;

  for (var index in e.data.names)
  {
    var body = Game.world.objects[e.data.names[index]];
    if (!body) continue;
    body.Place(this.positions[3 * index + 0], this.positions[3 * index + 1], this.positions[3 * index + 2]);
    body.Rotate(this.quaternions[4 * index + 0], this.quaternions[4 * index + 1], this.quaternions[4 * index + 2], this.quaternions[4 * index + 3]);
    vec3.set(body.uniform.minBB, this.bounds[6 * index + 0], this.bounds[6 * index + 1], this.bounds[6 * index + 2]);
    vec3.set(body.uniform.maxBB, this.bounds[6 * index + 3], this.bounds[6 * index + 4], this.bounds[6 * index + 5]);
  }

  // If the worker was faster than the time step (dt seconds), we want to delay the next timestep
  var delay = this.dt * 1000 - (Date.now() - this.sendTime);
  var self = this;
  if (delay < 0) delay = 0;
  setTimeout(function () { self.toWorker(); }, delay);
}



function MoverTranslate(e, t) // vec3 extent, float time
{
  this.extent = e;
  this.time = t;
  this.step = vec3.create();
  this.offset = vec3.fromValues(0, 0, 0);
  this.direction = -1;
}

MoverTranslate.prototype.start = function()
{
  if (this.startTime) return;
  this.direction = -1 * this.direction;
  this.startTime = Date.now();
}

MoverTranslate.prototype.stop = function ()
{
  if (this.direction == 1)
    vec3.copy(this.offset, this.extent);
  else
    vec3.set(this.offset, 0, 0, 0);
  this.startTime = 0;
}

MoverTranslate.prototype.update = function ()
{
  if (!this.startTime) return;

  var now = Date.now();
  if (now - this.startTime > this.time) { this.stop(); return; }

  vec3.scale(this.step, this.extent, (now - this.startTime) / this.time);

  if (this.direction == 1)
  {
         if (Math.abs(this.offset[0] + this.step[0]) > Math.abs(this.extent[0])) this.stop();
    else if (Math.abs(this.offset[1] + this.step[1]) > Math.abs(this.extent[1])) this.stop();
    else if (Math.abs(this.offset[2] + this.step[2]) > Math.abs(this.extent[2])) this.stop();
    else vec3.add(this.offset, this.offset, this.step);
  }
  else
  {
         if (this.offset[0] * (this.offset[0] - this.step[0]) < 0) this.stop();
    else if (this.offset[1] * (this.offset[1] - this.step[1]) < 0) this.stop();
    else if (this.offset[2] * (this.offset[2] - this.step[2]) < 0) this.stop();
    else vec3.subtract(this.offset, this.offset, this.step);
  }
}


// MAIN GAME CODE
// GAME INIT
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
  Game.loadMeshPNG("flashlight", "assets/flashlight.model");
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
  var light = new GameObject(Game.assetMan.assets["light"], "light");    // these pieces are not physical
  light.Place(0.0, 8.0, 0.0);
  light.skip = true;
  var ceiling = new GameObject(Game.assetMan.assets["ceiling"], "ceiling");
  ceiling.Place(0.0, 8.0, 0.0);
  ceiling.skip = true;
  var fan = new GameObject(Game.assetMan.assets["fan"], "fan");
  fan.Place(0.0, 8.0, 0.0);
  fan.fanrot = 0;
  fan.skip = true;
  var floor = new GameObject(Game.assetMan.assets["floor"], "floor");
  floor.Place(0.0, -0.05, 0.0);
  var lightswitch = new GameObject(Game.assetMan.assets["switch"], "switch");
  quat.rotateY(lightswitch.Rotation, lightswitch.Rotation, Math.PI / 2);
  lightswitch.Place(3.9, 4.5, 0.0);
  var door = new GameObject(Game.assetMan.assets["door"], "door");
  quat.rotateY(door.Rotation, door.Rotation, Math.PI / -2);
  door.Place(0.0, 0.0, -3.9);

  var table = new GameObject(Game.assetMan.assets["table"], "table");   // from here on match the physical data coming from worker
  table.Place(0.0, 8.0, 0.0);

  var shelf = new GameObject(Game.assetMan.assets["shelf"], "shelf");
  shelf.Place(-3.25, 4.5, 0.0);
  var clock = new GameObject(Game.assetMan.assets["clock"], "clock");
  clock.Place(-3.5, 4.8, 0.0);
  var dresser = new GameObject(Game.assetMan.assets["dresser"], "dresser");
  quat.rotateY(dresser.Rotation, dresser.Rotation, Math.PI);
  dresser.Place(3.4, 1.5835, 0.0);
  var drawer = new GameObject(Game.assetMan.assets["drawer"], "drawer");
  quat.rotateY(drawer.Rotation, drawer.Rotation, Math.PI);
  drawer.Place(3.2, 2.65, 0.0);
  drawer.setMover(new MoverTranslate(vec3.fromValues(-0.6,0,0),1000));

  for (var layer = 0; layer < 20; ++layer)
    for (var piece = 0; piece < 3; ++piece)
      var jenga = new GameObject(Game.assetMan.assets["jenga"], "jenga"+(piece+layer*3));

  for (var i = 0; i < 4; ++i) var wall = new GameObject(null, "wall"+i); 

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
  var boxModel = new Mesh();
  boxModel.loadFromArrays(aabbvertices, null, { 'POS': 0 }, gl.LINES, aabbvertices.length / 3.0, 0);
  Game.assetMan.assets['boxmodel'] = boxModel;
}


// GAME UPDATES

Game.appUpdate = function ()
{
  if (Game.loading) return;
  if (!Game.camera) return;

  var fan = Game.world.objects['fan'];
  fan.fanrot += Math.PI / 30.0;
  quat.identity(fan.Rotation);
  quat.rotateY(fan.Rotation, fan.Rotation, fan.fanrot);
  fan.dirty = true;
//  fan.Update();

  for (var i in Game.world.objects) Game.world.objects[i].Update();
}

Game.itemClick = function(name)
{
  if (name == 'drawer')
  {
    Game.world.objects['drawer'].mover.start();
  }
}

//GAME RENDERING

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
  effect.setUniforms(Game.world.objects['fan'].uniform);
  effect.draw(Game.world.objects['fan'].Model);

  Game.world.lighteyeDown.engage();
  Game.world.shadowDown.engage();
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  effect.bind();
  effect.bindCamera(Game.world.lighteyeDown);
  effect.setUniforms(Game.world.uScene);

  for (var i in Game.world.objects)
  {
//  for (var i = 5; i < Game.world.objects.length; ++i) {
    if (Game.world.objects[i].skip || !Game.world.objects[i].Model) continue;
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
  effect.setUniforms(Game.world.objects['light'].uniform);
  effect.draw(Game.world.objects['light'].Model);

  // render objects
  effect = Game.shaderMan.shaders["objectrender"];
  effect.bind();
  effect.bindCamera(eye);

  // ceiling and fan use up facing shadow map
  Game.world.uScene.uWorldToLight = Game.world.uScene.uWorldToLight2;
  effect.setUniforms(Game.world.uScene);
  effect.bindTexture("shadow", Game.world.shadowUp.texture);  // ceiling
  effect.setUniforms(Game.world.objects['ceiling'].uniform);
  effect.draw(Game.world.objects['ceiling'].Model);
  effect.setUniforms(Game.world.objects['fan'].uniform);   // fan
  effect.draw(Game.world.objects['fan'].Model);

  // the rest are down facing
  Game.world.uScene.uWorldToLight = Game.world.uScene.uWorldToLight1;
  effect.setUniforms(Game.world.uScene);
  effect.bindTexture("shadow", Game.world.shadowDown.texture);
  for (var i in Game.world.objects)
//  for (var i = 3; i < Game.world.objects.length; ++i)
  {
    if (Game.world.objects[i].skip || !Game.world.objects[i].Model) continue;
    effect.setUniforms(Game.world.objects[i].uniform);
    effect.draw(Game.world.objects[i].Model);
  }

  // AABB render for physics debug
  var boxmodel = Game.assetMan.assets["boxmodel"];
  effect = Game.shaderMan.shaders["boxrender"];
  effect.bind();
  effect.bindCamera(eye);
  effect.setUniforms(Game.world.uScene);
  for (var i in Game.world.objects)
  {
    if (Game.world.objects[i].skip) continue;
    effect.setUniforms(Game.world.objects[i].uniform);
    effect.draw(boxmodel);
  }
}


// USER INTERACTION

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

    Game.world.physicsWorker.queryPick(near, far);
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
