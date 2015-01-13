function World()
{
  this.currentlyPressedKeys = [];
  this.objects = {};
  this.head = new mx.GameObject("head", null);

  this.uScene = null;
  this.uAABB = [];

  this.lighteye = null;
  this.lighton = true;

  this.physicsWorker = null;
  this.debug = false;
  this.shadow = true;

  this.doorcode = [];
  this.doorsolution = [];
  this.dooruniform = vec4.create();
}

// MAIN GAME CODE
// GAME INIT
var Game = mx.Game;

Game.appInit = function ()
{
  Game.world = new World();

  for (var i = 0; i < 4; ++i)
  {
    val = (Math.random() * 15) | 0;
    Game.world.doorsolution.push("button" + val);
    Game.world.dooruniform[i] = val + 0.0;
  }

  Game.textureLocation = "assets/"  // autoloaded textures live here
  // MODELS
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
  // TEXTURES
  Game.loadTextureFile("button2tex", "button2tex.png", true);
  Game.loadTextureFile("clock2tex", "clock2tex.png", true);
  Game.loadTextureFile("clock3tex", "clock3tex.png", true);
  Game.loadTextureFile("clock4tex", "clock4tex.png", true);
  // SHADER PARTS to be included
  Game.loadShaderFile("assets/partRenderstates.fx");
  Game.loadShaderFile("assets/partShadowrecieve.fx");
  Game.loadShaderFile("assets/partVertexDef.fx");
  Game.loadShaderFile("assets/partPixelDef.fx");
  Game.loadShaderFile("assets/partPlainVertexShader.fx");
  Game.loadShaderFile("assets/partPlainPixelShader.fx");
  // SHADERS that include the parts
  Game.loadShaderFile("assets/objectrender.fx");
  Game.loadShaderFile("assets/transparentrender.fx");
  Game.loadShaderFile("assets/lightrender.fx");
  Game.loadShaderFile("assets/boxrender.fx");
  Game.loadShaderFile("assets/shadowcast.fx");
  Game.loadShaderFile("assets/fanrender.fx");
  Game.loadShaderFile("assets/buttonrender.fx");
  // AUDIO
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

  Game.world.sounds.hit = [];
  for (var i = 0; i < 10; ++i)
  {
    var hit = new buzz.sound("assets/hit", { formats: ["mp3"] });
    hit.setVolume(100);
    Game.world.sounds.hit.push(hit);
  }
}

Game.playHit = function()
{
  if (over || !started) return;
  for (var i = 0; i < 10; ++i)
  {
    if (Game.world.sounds.hit[i].isPaused()) { Game.world.sounds.hit[i].play(); return; }
  }
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

  // SET UP CAMERA
  Game.world.head.setPositionXYZ(0.0, 5.0, 0.0);
  Game.world.head.setOrientationXYZ(0.0, Math.PI, 0.0);
  Game.camera.attachTo(Game.world.head);

  // SET UP SCENE
  var title = makeGameObject(Game.assetMan.assets["titlepage"], "title");
  title.setPositionXYZ(0.0, 5.0, -1.3);
  title.transparent = true;
  var win = makeGameObject(Game.assetMan.assets["winpage"], "win");
  win.setPositionXYZ(0.0, 5.0, -1.3);
  win.transparent = true;
  win.skip = true;

  var light = makeGameObject(Game.assetMan.assets["light"], "light");    // these pieces are not physical
  light.setPositionXYZ(0.0, 8.0, 0.0);
  light.skip = true;
  var ceiling = makeGameObject(Game.assetMan.assets["ceiling"], "ceiling");
  ceiling.setPositionXYZ(0.0, 8.0, 0.0);
  ceiling.skip = true;
  var fan = makeGameObject(Game.assetMan.assets["fan"], "fan");
  fan.setPositionXYZ(0.0, 8.0, 0.0);
  fan.setMover(new MoverRotate(Math.PI * 3.0));
  fan.mover.start();
  fan.skip = true;
  fan.uniforms.uCode = Game.world.dooruniform;
  var floor = makeGameObject(Game.assetMan.assets["room"], "floor");
  floor.setPositionXYZ(0.0, -0.05, 0.0);
  var lightswitch = makeGameObject(Game.assetMan.assets["switch"], "lightswitch");
  lightswitch.setOrientationXYZ(0, Math.PI / 2, 0);
  lightswitch.setPositionXYZ(3.9, 4.5, 0.0);
  var light2 = makeGameObject(Game.assetMan.assets["light2"], "light2");
  light2.setPositionXYZ(3.9, 4.5, 0.0);
  var door = makeGameObject(Game.assetMan.assets["door"], "door");
  door.setOrientationXYZ(0, -Math.PI / 2, 0);
  door.setPositionXYZ(0.0, 0.0, -3.9);

  var table   = makeGameObject(Game.assetMan.assets["table"], "table");   // from here on match the physical data coming from worker
  var shelf   = makeGameObject(Game.assetMan.assets["shelf"], "shelf");
  var clock   = makeGameObject(Game.assetMan.assets["clock"], "clock");
  var dresser = makeGameObject(Game.assetMan.assets["dresser"], "dresser");
  var drawer  = makeGameObject(Game.assetMan.assets["drawer"], "drawer");
  var lock    = makeGameObject(Game.assetMan.assets["lock"], "lock");
  var lockbox = makeGameObject(Game.assetMan.assets["lockbox"], "lockbox");
  lockbox.transparent = true;
  var flashlight = makeGameObject(Game.assetMan.assets["flashlight"], "flashlight");
  var battery = makeGameObject(Game.assetMan.assets["battery"], "battery");
  battery.setPositionXYZ(0.0, -4.5, 0.0);

  for (var layer = 0; layer < 20; ++layer)
    for (var piece = 0; piece < 3; ++piece)
      if (piece + layer * 3 == 31)
        var jenga = makeGameObject(Game.assetMan.assets["key"], "jenga" + (piece + layer * 3));
      else
        var jenga = makeGameObject(Game.assetMan.assets["jenga"], "jenga" + (piece + layer * 3));

  for (var i = 0; i < 4; ++i) var wall = makeGameObject(null, "wall"+i); 

  for (var i = 0; i < 16; ++i)
  {
    var button = makeGameObject(Game.assetMan.assets["button"], "button" + i);
    button.uniforms.uState = vec2.fromValues(i, 0);
    button.skip = true;
  }

  // SET UP LIGHT AND SHADOWS
  Game.world.shadowUp = new mx.RenderSurface(2048, 2048, gl.RGBA, gl.FLOAT);
  Game.world.shadowDown = new mx.RenderSurface(2048, 2048, gl.RGBA, gl.FLOAT);

  var lightup = new mx.GameObject("lightup", null);
  lightup.setPositionXYZ(0.0, 7.0, 0.0001);
  lightup.setOrientationXYZ(Math.PI / 2.0, 0.0, 0.0);
  var lightdown = new mx.GameObject("lightdown", null);
  lightdown.setPositionXYZ(0.0, 7.0, 0.0001);
  lightdown.setOrientationXYZ(Math.PI / 2.0, 0.0, 0.0);
  Game.world.lighteyeUp = new mx.CameraFirst(2048, 2048);
  Game.world.lighteyeUp.fov = Math.PI / 1.1;
  Game.world.lighteyeUp.far = 10.0;
  Game.world.lighteyeUp.attachTo(lightup);
  Game.world.lighteyeUp.update();
  Game.world.lighteyeDown = new mx.CameraFirst(2048, 2048);
  Game.world.lighteyeDown.fov = Math.PI / 1.1;
  Game.world.lighteyeDown.far = 10.0;
  Game.world.lighteyeDown.attachTo(lightdown);
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
  var boxModel = new mx.Mesh();
  boxModel.loadFromArrays(aabbvertices, null, { 'POS': 0 }, gl.LINES, aabbvertices.length / 3.0, 0);
  Game.assetMan.assets['boxmodel'] = boxModel;

  setInterval(function () { Game.flashClock(); }, 1000);
}

// GAME UPDATES

Game.appUpdate = function ()
{
  if (Game.loading) return;
  if (!Game.camera) return;

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

  // rotate picked up piece to follow camera
  if (Game.world.pickup)
  {
    var test = Game.world.objects[Game.world.pickup];
    test.setPositionXYZ(0, 4.6, 0);
    vec3.add(test.position, test.position, Game.camera.forward);
    mat4.copy(test.orientation, Game.camera.orientation);
    mat4.identity(test.translation);
    mat4.translate(test.translation, test.translation, test.position);
    mat4.multiply(test.uniforms.uWorld, test.translation, test.orientation);
  }

  // update flashlight matrixes for lighting shader
  vec3.copy(Game.world.uScene.spotlightPos, Game.world.objects['flashlight'].position);
  vec3.transformMat4(Game.world.uScene.spotlightDir, mx.axis.zNegative, Game.world.objects['flashlight'].orientation);
}

Game.itemClick = function(name)
{
  if (name == 'lightswitch')
  {
    if (Game.world.sounds.fanOff.isPaused() && Game.world.sounds.fanOn.isPaused())
    {
      var lightswitch = Game.world.objects[name];
      quat.rotateZ(lightswitch.rotation, lightswitch.rotation, Math.PI);
      lightswitch.dirty = true;
      Game.world.lighton = !Game.world.lighton;
      Game.world.uScene.lighton[0] = Game.world.lighton ? 1.0 : 0.0;
      if (!Game.world.lighton) {
        Game.world.sounds.fan.pause();
        Game.world.sounds.fanOff.play();
        Game.world.objects['fan'].mover.stop();
      }
      else {
        Game.world.sounds.fanOn.play();
        Game.world.objects['fan'].mover.start();
      }
      if ((Game.assetMan.assets['clock'].groups[0].texture == "clock3tex") || (Game.assetMan.assets['clock'].groups[0].texture == "clock4tex"))
        Game.assetMan.assets['clock'].groups[0].texture = "clocktex";
      else if ((Game.assetMan.assets['clock'].groups[0].texture == "clocktex") || (Game.assetMan.assets['clock'].groups[0].texture == "clock2tex"))
        Game.assetMan.assets['clock'].groups[0].texture = "clock3tex";
      if (Game.assetMan.assets['button'].groups[0].texture == "buttontex")
        Game.assetMan.assets['button'].groups[0].texture = "button2tex";
      else
        Game.assetMan.assets['button'].groups[0].texture = "buttontex";
    }
  }
  else if (name == 'clockbattery')
  {
    Game.world.objects['clock'].model = Game.assetMan.assets["clockdead"];
    Game.world.sounds.radio.stop();
  }

    // drop
  else if (name == Game.world.pickup) 
  {
    Game.world.pickup = null;
    Game.world.physicsWorker.dropItem();
  }
  // battery, key, flashlight can be picked up
  else if (!Game.world.pickup && (name == 'battery' || name == 'jenga31' || name == 'flashlight')) Game.world.pickup = name;

  // battery turns on the flashlight
  else if (Game.world.pickup == "battery" && name == "flashlight")
  {
    Game.world.uScene.lighton[1] = 1.0;
    Game.world.pickup.skip = true;
    Game.world.pickup = null;
  }
  else if (Game.world.pickup == "flashlight" && name == "battery")
    Game.world.uScene.lighton[1] = 1.0;

  // user is entering a solution
  else if (Game.world.lighton && name.substr(0, 6) == "button")
  {
    Game.world.objects[name].uniforms.uState[1] = 2;
    setTimeout(function () { Game.unlightButton(name); }, 200 );

    Game.world.doorcode.push(name);
    if (Game.world.doorcode.length == 4)
    {
      var ok = true;
      for (var i = 0; i < 4; ++i)
      {
        if (Game.world.doorcode[i] != Game.world.doorsolution[i]) {
          for (var i = 0; i < 16; ++i) Game.world.objects["button" + i].uniforms.uState[1] = 1;
          setTimeout(function () { Game.unlightAllButtons(); }, 200);
          ok = false;
          Game.world.sounds.buttonbad.play();
          break;
        }
      }
      if (ok)
      {
        over = true;
        Game.world.head.setOrientationXYZ(0, Math.PI, 0);
        Game.world.objects["win"].skip = false;
        Game.world.sounds.fan.stop();
        if (Game.world.pickup) Game.world.objects[Game.world.pickup].skip = true;
      }
      Game.world.doorcode = [];
    }
    else Game.world.sounds.buttonok.play();

  }
}

Game.unlightButton = function(button)
{
  Game.world.objects[button].uniforms.uState[1] = 0;
}

Game.unlightAllButtons = function ()
{
  for (var i = 0; i < 16; ++i)
     Game.world.objects["button"+i].uniforms.uState[1] = 0;
}

Game.flashClock = function ()
{
  if (Game.assetMan.assets['clock'].groups[0].texture == "clocktex")
    Game.assetMan.assets['clock'].groups[0].texture = "clock2tex";
  else if(Game.assetMan.assets['clock'].groups[0].texture == "clock2tex")
    Game.assetMan.assets['clock'].groups[0].texture = "clocktex";
  else if (Game.assetMan.assets['clock'].groups[0].texture == "clock3tex")
    Game.assetMan.assets['clock'].groups[0].texture = "clock4tex";
  else if (Game.assetMan.assets['clock'].groups[0].texture == "clock4tex")
    Game.assetMan.assets['clock'].groups[0].texture = "clock3tex";
}

//GAME RENDERING

Game.appDrawAux = function ()
{
  return;
  if (Game.loading) return;

  Game.world.lighteyeUp.engage();
  Game.world.shadowUp.engage();
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  if (Game.world.shadow)
  {
    var effect = Game.shaderMan.shaders["shadowcast"];
    effect.bind();
    effect.bindCamera(Game.world.lighteyeUp);
    effect.setUniforms(Game.world.uScene);
    effect.setUniforms(Game.world.objects['fan'].uniforms);
    effect.draw(Game.world.objects['fan'].model);
  }

  Game.world.lighteyeDown.engage();
  Game.world.shadowDown.engage();
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  if (Game.world.shadow)
  {
    effect.bind();
    effect.bindCamera(Game.world.lighteyeDown);
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

  // light has a special shader
  effect = Game.shaderMan.shaders["lightrender"];
  effect.bind();
  effect.bindCamera(eye);
  effect.setUniforms(Game.world.uScene);
  if (Game.world.lighton) {
    obj = Game.world.objects['light'];
    effect.setUniforms(obj.uniforms);
    effect.draw(obj.model);
  }
  else
  {
    obj = Game.world.objects['clock'];  // clock glows in the dark
    effect.setUniforms(obj.uniforms);
    effect.draw(obj.model);
  }
  obj = Game.world.objects['light2'];
  effect.setUniforms(obj.uniforms);
  effect.draw(obj.model);

  // ceiling and fan use up facing shadow map
  Game.world.uScene.uWorldToLight = Game.world.uScene.uWorldToLight2;

  // fan is special object with its own shader
  effect = Game.shaderMan.shaders["fanrender"];
  effect.bind();
  effect.bindCamera(eye);
  effect.setUniforms(Game.world.uScene);
  effect.bindTexture("shadow", Game.world.shadowUp.texture);
  obj = Game.world.objects['fan'];
  effect.setUniforms(obj.uniforms);
  effect.draw(obj.model);
  
  // change to normal object shader
  effect = Game.shaderMan.shaders["objectrender"];
  effect.bind();
  effect.bindCamera(eye);

  // still using upwards shadow map
  effect.setUniforms(Game.world.uScene);
  effect.bindTexture("shadow", Game.world.shadowUp.texture);  // ceiling
  obj = Game.world.objects['ceiling'];
  effect.setUniforms(obj.uniforms);
  effect.draw(obj.model);

  // the rest are down facing
  Game.world.uScene.uWorldToLight = Game.world.uScene.uWorldToLight1;
  effect.setUniforms(Game.world.uScene);
  effect.bindTexture("shadow", Game.world.shadowDown.texture);
  for (var i in Game.world.objects)
  {
    obj = Game.world.objects[i];
    if (obj.skip || obj.transparent || !obj.model) continue;
    effect.setUniforms(obj.uniforms);
    effect.draw(obj.model);
  }
  
  // now do button which are down facing and special shader
  effect = Game.shaderMan.shaders["buttonrender"];
  effect.bind();
  effect.bindCamera(eye);
  effect.setUniforms(Game.world.uScene);
  effect.bindTexture("shadow", Game.world.shadowDown.texture);
  for (var i = 0; i < 16; ++i)
  {
    obj = Game.world.objects['button' + i];
    effect.setUniforms(obj.uniforms);
    effect.draw(obj.model);
  }

  // now do clear things
  if (Game.world.lighton) {
    effect = Game.shaderMan.shaders["transparentrender"];
    effect.bind();
    effect.bindCamera(eye);
    effect.setUniforms(Game.world.uScene);
    for (var i in Game.world.objects) {
      obj = Game.world.objects[i];
      if (obj.skip || !obj.transparent || !obj.model) continue;
      effect.setUniforms(obj.uniforms);
      effect.draw(obj.model);
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
  if ([33, 34].indexOf(event.keyCode) > -1) event.preventDefault();

  if (over) return;
  if (Game.world.currentlyPressedKeys[event.keyCode]) return;
  Game.world.currentlyPressedKeys[event.keyCode] = true;
}

Game.appHandleKeyUp = function (event)
{
  Game.world.currentlyPressedKeys[event.keyCode] = false;

  if (over) return;
  if (event.keyCode == 70) Game.fullscreenMode(!Game.isFullscreen);
  if (event.keyCode == 79) Game.oculusMode(!Game.isOculus);
  else if (event.keyCode == 81) Game.world.debug = !Game.world.debug;
  else if (event.keyCode == 84) Game.world.shadow = !Game.world.shadow;
}

var clicked = false;
var started = false;
var over = false;

Game.appHandleMouseEvent = function(type, mouse)
{
  if (over) return;

  if (mouse.button == 0 && type == mx.MouseEvent.Down)
  {
    if (!started)
    {
      Game.world.objects['title'].skip = true;
      started = true;
      Game.world.sounds.radio.play();
      Game.world.sounds.fan.play();
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

  if (mouse.button == 2 && type == mx.MouseEvent.Down)
  {
    clicked = true;
//    mouse.grab();
  }

  if (mouse.button == 2 && type == mx.MouseEvent.Up)
  {
    clicked = false;
//    mouse.release();
  }

  if (clicked && type == mx.MouseEvent.Move)
  {
    if (mouse.moveOffsetX < 20 && mouse.moveOffsetX > -20) setHeadAngle(0.01 * mouse.moveOffsetY, -0.01 * mouse.moveOffsetX, 0.0);
  }
}

function setHeadAngle(x,y,z)
{
  if (Game.world.head.angles[0] + x < -1.2 || Game.world.head.angles[0] + x > 1.2) x = 0;
  Game.world.head.updateOrientationXYZ(x, y, z);
}

Game.appLoadingError = function (name)
{
}
