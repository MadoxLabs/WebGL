function World()
{
  this.currentlyPressedKeys = [];
  this.objects = {};

  this.uScene = null;
  this.uAABB = [];

  this.lighteye = null;
  this.lighton = true;

  this.physicsWorker = null;
  this.debug = false;

  this.doorcode = [];
  this.doorsolution = [];
  this.dooruniform = vec4.create();
}

// MAIN GAME CODE
// GAME INIT
Game.appInit = function ()
{
  Game.world = new World();

  for (var i = 0; i < 4; ++i)
  {
    val = (Math.random() * 15) | 0;
    Game.world.doorsolution.push("button" + val);
    Game.world.dooruniform[i] = val + 0.0;
  }

  Game.textureLocation = "assets/"
  Game.loadMeshPNG("room", "assets/floor.model");
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
  Game.loadMeshPNG("key", "assets/key.model");
  Game.loadMeshPNG("lock", "assets/lock.model");
  Game.loadMeshPNG("lockbox", "assets/lockbox.model");
  Game.loadMeshPNG("battery", "assets/battery.model");
  Game.loadMeshPNG("clockdead", "assets/clockdead.model");
  Game.loadMeshPNG("titlepage", "assets/title.model");
  Game.loadMeshPNG("button", "assets/button.model");
  Game.loadMeshPNG("winpage", "assets/win.model");
  Game.loadMeshPNG("light2", "assets/light2.model");
  Game.loadTextureFile("clock2tex", "clock2tex.png", true);
  Game.loadShaderFile("assets/renderstates.fx");
  Game.loadShaderFile("assets/objectrender.fx");
  Game.loadShaderFile("assets/transparentrender.fx");
  Game.loadShaderFile("assets/lightrender.fx");
  Game.loadShaderFile("assets/boxrender.fx");
  Game.loadShaderFile("assets/shadowcast.fx");
  Game.loadShaderFile("assets/shadowrecieve.fx");
  Game.loadShaderFile("assets/fanrender.fx");
  Game.loadShaderFile("assets/buttonrender.fx");

  Game.world.sounds = {};
  Game.world.sounds.radio = new buzz.sound("assets/radio", { formats: ["mp3"] });
  Game.world.sounds.radio.loop();
  Game.world.sounds.radio.setVolume(30);
  Game.world.sounds.buttonok = new buzz.sound("assets/buttonok", { formats: ["wav"] });
  Game.world.sounds.buttonok.setVolume(100);
  Game.world.sounds.buttonbad = new buzz.sound("assets/buttonbad", { formats: ["wav"] });
  Game.world.sounds.buttonbad.setVolume(100);
  Game.world.sounds.fan = new buzz.sound("assets/fan", { formats: ["mp3"] });
  Game.world.sounds.fan.loop();
  Game.world.sounds.fan.setVolume(10);
  Game.world.sounds.fanOn = new buzz.sound("assets/fanSwitchOn", { formats: ["mp3"] });
  Game.world.sounds.fanOn.setVolume(20);
  Game.world.sounds.fanOn.bind('ended', function () { Game.world.sounds.fan.togglePlay(); });
  Game.world.sounds.fanOff = new buzz.sound("assets/fanSwitchOff", { formats: ["mp3"] });
  Game.world.sounds.fanOff.setVolume(20);
  Game.world.sounds.hit = new buzz.sound("assets/hit", { formats: ["mp3"] });
  Game.world.sounds.hit.setVolume(100);
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
  doneLoading();

  Game.ready = true;

  // SET UP CAMERA
  Game.camera.offset[0] = 0.0;
  Game.camera.offset[1] = 0.0;
  Game.camera.offset[2] = 1.0;
  var target = new GameObject(null);
  target.Position[1] = 5.0;
  Game.camera.setTarget(target);

  // SET UP SCENE
  var title = new GameObject(Game.assetMan.assets["titlepage"], "title");
  title.Place(0.0, 5.0, -0.3);
  title.transparent = true;
  var win = new GameObject(Game.assetMan.assets["winpage"], "win");
  win.Place(0.0, 5.0, -0.3);
  win.transparent = true;
  win.skip = true;

  var light = new GameObject(Game.assetMan.assets["light"], "light");    // these pieces are not physical
  light.Place(0.0, 8.0, 0.0);
  light.skip = true;
  var ceiling = new GameObject(Game.assetMan.assets["ceiling"], "ceiling");
  ceiling.Place(0.0, 8.0, 0.0);
  ceiling.skip = true;
  var fan = new GameObject(Game.assetMan.assets["fan"], "fan");
  fan.Place(0.0, 8.0, 0.0);
  fan.setMover(new MoverRotate(Math.PI * 3.0));
  fan.mover.start();
  fan.skip = true;
  fan.uniform.uCode = Game.world.dooruniform;
  var floor = new GameObject(Game.assetMan.assets["room"], "floor");
  floor.Place(0.0, -0.05, 0.0);
  var lightswitch = new GameObject(Game.assetMan.assets["switch"], "lightswitch");
  quat.rotateY(lightswitch.Rotation, lightswitch.Rotation, Math.PI / 2);
  lightswitch.Place(3.9, 4.5, 0.0);
  var light2 = new GameObject(Game.assetMan.assets["light2"], "light2");
  light2.Place(3.9, 4.5, 0.0);
  var door = new GameObject(Game.assetMan.assets["door"], "door");
  quat.rotateY(door.Rotation, door.Rotation, Math.PI / -2);
  door.Place(0.0, 0.0, -3.9);

  var table = new GameObject(Game.assetMan.assets["table"], "table");   // from here on match the physical data coming from worker
  var shelf = new GameObject(Game.assetMan.assets["shelf"], "shelf");
  var clock = new GameObject(Game.assetMan.assets["clock"], "clock");
  var dresser = new GameObject(Game.assetMan.assets["dresser"], "dresser");
  var drawer = new GameObject(Game.assetMan.assets["drawer"], "drawer");
  //  drawer.setMover(new MoverTranslate(vec3.fromValues(3.3, 2.55, 0.0), vec3.fromValues(2.7, 2.55, 0), 1));
  var lock = new GameObject(Game.assetMan.assets["lock"], "lock");
  var lockbox = new GameObject(Game.assetMan.assets["lockbox"], "lockbox");
  lockbox.transparent = true;
  var flashlight = new GameObject(Game.assetMan.assets["flashlight"], "flashlight");
  var battery = new GameObject(Game.assetMan.assets["battery"], "battery");
  battery.Place(0.0, -4.5, 0.0);

  for (var layer = 0; layer < 20; ++layer)
    for (var piece = 0; piece < 3; ++piece)
      if (piece + layer * 3 == 31)
        var jenga = new GameObject(Game.assetMan.assets["key"], "jenga" + (piece + layer * 3));
      else
        var jenga = new GameObject(Game.assetMan.assets["jenga"], "jenga" + (piece + layer * 3));

  for (var i = 0; i < 4; ++i) var wall = new GameObject(null, "wall"+i); 

  for (var i = 0; i < 16; ++i)
  {
    var button = new GameObject(Game.assetMan.assets["button"], "button" + i);
    button.uniform.uState = vec2.fromValues(i, 0);
    button.skip = true;
  }

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
  Game.world.uScene.uLight2Position = vec3.fromValues(3.9, 4.7, 0.0);
  Game.world.uScene.lighton = vec3.fromValues(1.0, 0.0, 0.0);
  Game.world.uScene.uWorldToLight = null;
  Game.world.uScene.uWorldToLight1 = mat4.create();
  Game.world.uScene.uWorldToLight2 = mat4.create();
  Game.world.uScene.spotlightPos = vec3.create();
  Game.world.uScene.spotlightDir = vec3.create();
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

  setInterval(function () { Game.flashClock(); }, 1000);
}

// GAME UPDATES
var forward = vec3.fromValues(0, 0, 1);

Game.appUpdate = function ()
{
  if (Game.loading) return;
  if (!Game.camera) return;

  for (var i in Game.world.objects) Game.world.objects[i].Update();

  // rotate test piece to follow camera
  if (Game.world.pickup)
  {
    var test = Game.world.objects[Game.world.pickup];
    test.Place(0, 4.6, 0);
    mat4.copy(test.Orient, Game.camera.orientation);
    mat4.identity(test.Trans);
    mat4.translate(test.Trans, test.Trans, test.Position);
    mat4.multiply(test.uniform.uWorld, test.Trans, test.Orient);
  }

  vec3.copy(Game.world.uScene.spotlightPos, Game.world.objects['flashlight'].Position);
  vec3.transformMat4(Game.world.uScene.spotlightDir, forward, Game.world.objects['flashlight'].Orient);
}

Game.itemClick = function(name)
{
  if (name == 'lightswitch')
  {
    var lightswitch = Game.world.objects[name];
    quat.rotateZ(lightswitch.Rotation, lightswitch.Rotation, Math.PI);
    lightswitch.dirty = true;
    Game.world.lighton = !Game.world.lighton;
    Game.world.uScene.lighton[0] = Game.world.lighton ? 1.0 : 0.0;
    if (!Game.world.lighton)
    {
      Game.world.sounds.fan.togglePlay();
      Game.world.sounds.fanOff.play();
      Game.world.objects['fan'].mover.stop();
    }
    else
    {
      Game.world.sounds.fanOn.play();
      Game.world.objects['fan'].mover.start();
    }
  }
  else if (name == 'clockbattery')
  {
    Game.world.objects['clock'].Model = Game.assetMan.assets["clockdead"];
    Game.world.sounds.radio.stop();
  }

  // battery, key, flashlight can be picked up
  else if (!Game.world.pickup && (name == 'battery' || name == 'jenga31' || name == 'flashlight')) Game.world.pickup = name;

  // battery turns on the flashlight
  else if (Game.world.pickup == "battery" && name == "flashlight")
  {
    Game.world.uScene.lighton[1] = 1.0;
    Game.world.pickup = null;
  }

  // user is entering a solution
  else if (Game.world.lighton && name.substr(0, 6) == "button")
  {
    Game.world.objects[name].uniform.uState[1] = 2;
    setTimeout(function () { Game.unlightButton(name); }, 200 );

    Game.world.doorcode.push(name);
    if (Game.world.doorcode.length == 4)
    {
      var ok = true;
      for (var i = 0; i < 4; ++i)
      {
        if (Game.world.doorcode[i] != Game.world.doorsolution[i]) {
          for (var i = 0; i < 16; ++i) Game.world.objects["button" + i].uniform.uState[1] = 1;
          setTimeout(function () { Game.unlightAllButtons(); }, 200);
          ok = false;
          Game.world.sounds.buttonbad.play();
          break;
        }
      }
      if (ok)
      {
        Game.camera.angles[0] = 0;
        Game.camera.angles[1] = 0;
        Game.camera.angles[2] = 0;
        Game.world.objects["win"].skip = false;
        Game.world.sounds.fan.stop();
      }
      Game.world.doorcode = [];
    }
    else Game.world.sounds.buttonok.play();

  }
}

Game.unlightButton = function(button)
{
  Game.world.objects[button].uniform.uState[1] = 0;
}

Game.unlightAllButtons = function ()
{
  for (var i = 0; i < 16; ++i)
     Game.world.objects["button"+i].uniform.uState[1] = 0;
}

Game.flashClock = function ()
{
  if (Game.assetMan.assets['clock'].groups[0].texture == "clocktex")
    Game.assetMan.assets['clock'].groups[0].texture = "clock2tex";
  else
    Game.assetMan.assets['clock'].groups[0].texture = "clocktex";
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
  if (Game.world.lighton) {
    effect.setUniforms(Game.world.objects['light'].uniform);
    effect.draw(Game.world.objects['light'].Model);
  }
  effect.setUniforms(Game.world.objects['light2'].uniform);
  effect.draw(Game.world.objects['light2'].Model);

  // ceiling and fan use up facing shadow map
  Game.world.uScene.uWorldToLight = Game.world.uScene.uWorldToLight2;

  // fan is special object with its own shader
  effect = Game.shaderMan.shaders["fanrender"];
  effect.bind();
  effect.bindCamera(eye);
  effect.setUniforms(Game.world.uScene);
  effect.bindTexture("shadow", Game.world.shadowUp.texture);
  effect.setUniforms(Game.world.objects['fan'].uniform);
  effect.draw(Game.world.objects['fan'].Model);
  
  // change to normal object shader
  effect = Game.shaderMan.shaders["objectrender"];
  effect.bind();
  effect.bindCamera(eye);

  // still using upwards shadow map
  effect.setUniforms(Game.world.uScene);
  effect.bindTexture("shadow", Game.world.shadowUp.texture);  // ceiling
  effect.setUniforms(Game.world.objects['ceiling'].uniform);
  effect.draw(Game.world.objects['ceiling'].Model);

  // the rest are down facing
  Game.world.uScene.uWorldToLight = Game.world.uScene.uWorldToLight1;
  effect.setUniforms(Game.world.uScene);
  effect.bindTexture("shadow", Game.world.shadowDown.texture);
  for (var i in Game.world.objects)
  {
    if (Game.world.objects[i].skip || Game.world.objects[i].transparent || !Game.world.objects[i].Model) continue;
    effect.setUniforms(Game.world.objects[i].uniform);
    effect.draw(Game.world.objects[i].Model);
  }
  
  // now do button which are down facing and special shader
  effect = Game.shaderMan.shaders["buttonrender"];
  effect.bind();
  effect.bindCamera(eye);
  effect.setUniforms(Game.world.uScene);
  effect.bindTexture("shadow", Game.world.shadowDown.texture);
  for (var i = 0; i < 16; ++i)
  {
    effect.setUniforms(Game.world.objects['button'+i].uniform);
    effect.draw(Game.world.objects['button'+i].Model);
  }

  // now do clear things
  if (Game.world.lighton) {
    effect = Game.shaderMan.shaders["transparentrender"];
    effect.bind();
    effect.bindCamera(eye);
    effect.setUniforms(Game.world.uScene);
    for (var i in Game.world.objects) {
      if (Game.world.objects[i].skip || !Game.world.objects[i].transparent || !Game.world.objects[i].Model) continue;
      effect.setUniforms(Game.world.objects[i].uniform);
      effect.draw(Game.world.objects[i].Model);
    }
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
  if (Game.world.currentlyPressedKeys[event.keyCode]) { console.log("abort"); return; }
  Game.world.currentlyPressedKeys[event.keyCode] = true;

  if ([33, 34].indexOf(event.keyCode) > -1) event.preventDefault();
}

Game.appHandleKeyUp = function (event)
{
  Game.world.currentlyPressedKeys[event.keyCode] = false;

  if (event.keyCode == 70) Game.fullscreenMode(!Game.isFullscreen);
  else if (event.keyCode == 81) Game.world.debug = !Game.world.debug;
}

var clicked = false;
var started = false;

Game.appHandleMouseEvent = function(type, mouse)
{
  // console.log("Mouse event: " + ['Down', 'Up', 'Move', 'In', 'Out', 'Grab', 'Release', 'NoGrab', 'Wheel'][type]);
  if (mouse.button == 0 && type == MouseEvent.Down)
  {
    if (!started)
    {
      Game.world.objects['title'].skip = true;
      started = true;
      Game.world.sounds.radio.play();
      Game.world.sounds.fan.play();
    }

    // drop item?
    if (Game.world.pickup)
    {
      if ((mouse.Y / Game.camera.height > 0.8) && ((mouse.X / Game.camera.width > 0.4) || (mouse.X / Game.camera.width < 0.6)))
      {
        Game.world.pickup = null;
        Game.world.physicsWorker.dropItem();
        return;
      }
    }

    {
      var unproject = mat4.create();
      var unproj = mat4.create();
      var unview = mat4.create();
      mat4.invert(unproj, Game.camera.eyes[0].projection);
      mat4.invert(unview, Game.camera.eyes[0].view);
      mat4.multiply(unproject, unview, unproj);

      var near = vec4.fromValues((mouse.X / Game.camera.width) * 2.0 - 1.0, -(mouse.Y / Game.camera.height) * 2.0 + 1.0, -1.0, 1.0);
      vec4.transformMat4(near, near, unproject);
      vec4.scale(near, near, 1.0 / near[3])

      var far = vec4.fromValues((mouse.X / Game.camera.width) * 2.0 - 1.0, -(mouse.Y / Game.camera.height) * 2.0 + 1.0, 1.0, 1.0);
      vec4.transformMat4(far, far, unproject);
      vec4.scale(far, far, 1.0 / far[3])

      Game.world.physicsWorker.queryPick(near, far);
    }
  }

  if (!started) return;

  if (mouse.button == 2 && type == MouseEvent.Down)
  {  clicked = true; } //mouse.grab(); }

  if (mouse.button == 2 && type == MouseEvent.Up)
  {   clicked = false; } //mouse.release();

  if (clicked && type == MouseEvent.Move)
  {
    if (mouse.moveOffsetX < 20 && mouse.moveOffsetX > -20)
    {
      Game.camera.angles[1] += -0.01 * mouse.moveOffsetX;
      Game.camera.angles[0] += -0.01 * mouse.moveOffsetY;

      if (Game.camera.angles[0] < -1.2) Game.camera.angles[0] = -1.2;
      if (Game.camera.angles[0] > 1.2) Game.camera.angles[0] = 1.2;
    }
  }
}

Game.appLoadingError = function (name)
{
}
