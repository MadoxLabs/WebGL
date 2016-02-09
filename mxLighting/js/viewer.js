// models
var grid;
var model;
// gameobjects
var head;
var object;
var lighteye;
var lamps = [];
// other stuff
var uPerObject;
var uLight;
var uGrid;
var scale;
var modelName = "sample";

var xRot = 0;
var xSpeed = 0;
var yRot = 0;
var ySpeed = 0;
var decay = 0.98;
var inited = false;
var loadingTextures = false;

var currentlyPressedKeys = {};

var Game = mx.Game;

function reportLoading() { }

function degToRad(degrees)
{
  return degrees * Math.PI / 180;
}

Game.appLoadingError = function (name)
{
  impTextures[name] = { color: "red" };

  var buf = "";
  for (var n in impTextures) buf += "<p style='color: " + impTextures[n].color + "'>" + n + "</p>"
  document.getElementById("listTextures").innerHTML = buf;
}

Game.appInit = function ()
{
  Game.textureLocation = "assets/";

  Game.loadShaderFile("assets/shaders.fx");
  Game.loadShaderFile("assets/normalShader.fx");
  Game.loadShaderFile("assets/shadowcast.fx");

  Game.loadMeshPNG("sample", "assets/sample.model");
  Game.loadMeshPNG("floor", "assets/grid.model");
  Game.loadMeshPNG("lamp", "assets/lamp.model");
}

Game.deviceReady = function ()
{
}

Game.loadingStart = function ()
{
}

Game.setModel = function(name)
{
  model = Game.assetMan.assets[name];
  // determine model size and bring it down to reasonable proportions
  scale = 3.0;
  for (var i = 0; i < 2; ++i)
  {
    var s = model.boundingbox[0].max[i] - model.boundingbox[0].min[i];
    if (s > scale) scale = s;
  }
  scale = 3.0 / scale;
  model.scale = scale;

  // create game object for model
  object = new mx.GameObject("model", model);
  object.setScale(scale);
  if (model.boundingbox[0].min[1] <= 0.0)
    object.setPositionXYZ(0.0,
                          model.boundingbox[0].min[1] * -1.0 * scale, 
                          0.0);
  object.uniforms.uWorldToLight = mat4.create();
  object.uniforms.options = vec4.create();
}

Game.loadingStop = function ()
{
  if (loadingTextures) {  loadingTextures = false; return; }

  xRot = 0;
  xSpeed = 0;
  yRot = 0;
  ySpeed = 0;
  decay = 0.98;

  // do setup work for the mesh
  this.setModel(modelName);

  // determine the model's BB
  var len = 0;
  for (var i = 0; i < 3; ++i)
  {
    var l = (model.boundingbox[0].max[i] - model.boundingbox[0].min[i]) * scale;
    if (l > len) len = l;
  }
  var max = (model.boundingbox[0].max[2] - model.boundingbox[0].min[2]) * scale;
  if (max < len) max = len;

  // create a head for the camera
  head = new mx.GameObject("head", null);
  head.offset[0] = 0.0;
  head.offset[1] = (model.boundingbox[0].max[1] - model.boundingbox[0].min[1]) / 2.0 * scale;
  head.offset[2] = -1 * len / (Math.tan(Game.camera.fov * 0.5));
  head.setTarget(object);
  head.setOrientationXYZ(0, Math.PI, 0);
  // set camera to use head position
  Game.camera.attachTo(head);

  // one time only after here
  if (inited) return;

  var effect = Game.shaderMan.shaders["meshViewer"];
  grid = new mx.GameObject("grid", Game.assetMan.assets["floor"]);
  var uGrid = effect.createUniform('perobject');
  grid.uniforms.options = vec4.fromValues(0, 0, 0, 0);
  grid.uniforms.uWorldToLight = mat4.create();
  grid.setScale(max * 2);
  grid.update();

  // do setup work for the plain object shader
  var effect = Game.shaderMan.shaders["meshViewer"];

  // shadowing support
  shadowmap = new mx.RenderSurface(2048, 2048, gl.RGBA, gl.FLOAT);
  lighteye = new mx.Camera(2048, 2048);
  var lightobj = new mx.GameObject();
  lightobj.offset = vec3.fromValues(9.0, 9.0, 39.0);
  lightobj.setTarget(new mx.GameObject());
  lighteye.attachTo(lightobj);
  lighteye.update();

  uLight = effect.createUniform('light');
  uLight.uLightCount = 0;
  uLight.uGlobalAmbientRGB = [0.5, 0.5, 0.5];
//  uLight["uLights[0].AmbientFactor"] = 0.05;
//  uLight["uLights[0].Color"] = [0.1, 0.1, 0.1];
//  uLight["uLights[0].Attenuation"] = 0.0;
//  uLight["uLights[0].Position"] = [9.0, 9.0, 39.0];
//  uLight["uLights[0].WorldToLight"] = mat4.create();
//  mat4.multiply(uLight["uLights[0].WorldToLight"], lighteye.eyes[0].projection, lighteye.eyes[0].view);
//  lamps.push(null); // ambient light is not rendered

  //  uLight["uLights[1].AmbientFactor"] = 0.0;
  //  uLight["uLights[1].Color"] = [1.0, 0.0, 0.0];
  //  uLight["uLights[1].Attenuation"] = 0.5;
  //  uLight["uLights[1].Position"] = [4.0, 4.0, 0.0];
  //  uLight["uLights[1].WorldToLight"] = mat4.create();
  //  mat4.multiply(uLight["uLights[1].WorldToLight"], lighteye.eyes[0].projection, lighteye.eyes[0].view);
  //  uLight["uLights[2].AmbientFactor"] = 0.0;
  //  uLight["uLights[2].Color"] = [0.0, 1.0, 0.0];
  //  uLight["uLights[2].Attenuation"] = 0.5;
  //  uLight["uLights[2].Position"] = [-4.0, 4.0, 0.0];
  //  uLight["uLights[2].WorldToLight"] = mat4.create();
  //  mat4.multiply(uLight["uLights[2].WorldToLight"], lighteye.eyes[0].projection, lighteye.eyes[0].view);

  mat4.multiply(object.uniforms.uWorldToLight, lighteye.eyes[0].projection, lighteye.eyes[0].view);
  mat4.multiply(grid.uniforms.uWorldToLight, lighteye.eyes[0].projection, lighteye.eyes[0].view);

  // create a lamp wireframe
  Game.assetMan.assets["lampoutline"] = Game.assetMan.assets["lamp"].drawBB();

  inited = true;
}

var pickedLight = -1;

Game.pickLight = function(n)
{
  if (pickedLight == n) pickedLight = -1;
  else pickedLight = n;
}

Game.removeLight = function(n)
{
  if (pickedLight == n) pickedLight = -1;
  uLight.uLightCount--;
  delete lamps[n];
}

Game.addLight = function()
{
  var model = Game.assetMan.assets["lamp"];
  // determine model size and bring it down to reasonable proportions
  var scale = 2.0;
  for (var i = 0; i < 2; ++i)
  {
    var s = model.boundingbox[0].max[i] - model.boundingbox[0].min[i];
    if (s > scale) scale = s;
  }
  scale = 2.0 / scale;
  model.scale = scale;

  // create game object for model
  var object = new mx.GameObject("lamp"+lamps.length, model);
  object.setScale(scale);
  object.setPositionXYZ(Math.random() * 6.0 - 3.0,
                        0.0,
                        Math.random() * 6.0-3.0);
  object.uniforms.uWorldToLight = mat4.create();
  object.uniforms.options = vec4.create();
  object.update();
  lamps.push(object);

  uLight["uLights[" + uLight.uLightCount + "].AmbientFactor"] = 0.0;
  uLight["uLights[" + uLight.uLightCount + "].Color"] = [(Math.random() + 0.5) | 0, (Math.random() + 0.5) | 0, (Math.random() + 0.5) | 0];
  uLight["uLights[" + uLight.uLightCount + "].Attenuation"] = 0.5;
  uLight["uLights[" + uLight.uLightCount + "].Position"] = [object.position[0], object.position[1]+2.0, object.position[2]];
  uLight["uLights[" + uLight.uLightCount + "].WorldToLight"] = mat4.create();
  mat4.multiply(uLight["uLights[" + uLight.uLightCount + "].WorldToLight"], lighteye.eyes[0].projection, lighteye.eyes[0].view);
  uLight.uLightCount += 1;

  return uLight.uLightCount;
}

Game.appUpdate = function ()
{
  if (Game.loading) return;
  if (!Game.camera) return;

  if (currentlyPressedKeys[33])  // Page Up
    head.offset[2] -= 0.15;
  if (currentlyPressedKeys[34])  // Page Down
    head.offset[2] += 0.15;
  if (currentlyPressedKeys[37])  // Left cursor key
  {
    if (currentlyPressedKeys[16]) { head.updateOrientationXYZ(0.0, 0.1, 0.0); }
    else ySpeed -= 0.07; // 4 degrees
  }
  if (currentlyPressedKeys[39])  // Right cursor key
  {
    if (currentlyPressedKeys[16]) { head.updateOrientationXYZ(0.0, -0.1, 0.0); }
    else ySpeed += 0.07;
  }
  if (currentlyPressedKeys[38])  // Up cursor key
  {
    if (currentlyPressedKeys[16]) { head.offset[1] += 0.1; }
    else xSpeed -= 0.07;
  }
  if (currentlyPressedKeys[40])  // Down cursor key
  {
    if (currentlyPressedKeys[16]) { head.offset[1] -= 0.1; }
    else xSpeed += 0.07;
  }

  ySpeed *= decay; // auto slow down
  xSpeed *= decay;
  xRot += (xSpeed * Game.elapsed) / 1000.0; 
  yRot += (ySpeed * Game.elapsed) / 1000.0;
  object.setOrientationXYZ(xRot, yRot, 0.0);

  lighteye.update();
  object.update();
  head.update();
}

Game.appDrawAux = function ()
{
  if (Game.loading) return;
  // shadowing render
  if (model)
  {
    lighteye.engage();
    shadowmap.engage();
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var effect = Game.shaderMan.shaders["shadowcast"];
    effect.bind();
    effect.bindCamera(lighteye);
    effect.setUniforms(object.uniforms);
    effect.draw(object.model);
  }
}

Game.appDraw = function (eye)
{
  if (Game.loading) return;

  var effect;

  effect = Game.shaderMan.shaders["meshViewer"];
  effect.bind();
  effect.bindCamera(eye);
  effect.setUniforms(uLight);
  effect.bindTexture("shadow", shadowmap.texture);

  effect.setUniforms(object.uniforms);
  effect.draw(object.model);

  for (var lamp in lamps)
  {
    if (!lamps[lamp]) continue;

    var color = uLight["uLights[" + lamp + "].Color"];
    vec3.set(lamps[lamp].model.groups[0].material.diffusecolor, color[0], color[1], color[2]);
    vec3.set(lamps[lamp].model.groups[0].material.emissivecolor, color[0], color[1], color[2]);

    effect.setUniforms(lamps[lamp].uniforms);
    effect.draw(lamps[lamp].model);
  }

  effect.setUniforms(grid.uniforms);
  effect.draw(grid.model);

  if (pickedLight > -1) {
    effect = Game.shaderMan.shaders["normalViewer"];
    effect.bind();
    effect.bindCamera(eye);
    if (lamps[pickedLight])
    {
      effect.setUniforms(lamps[pickedLight].uniforms);
      effect.draw(Game.assetMan.assets["lampoutline"]);
    }
  }

//  if (raymesh) {
//    effect.setUniforms(raymesh.uniforms);
//    effect.draw(raymesh);
//  }
}

Game.handleEnterFullscreen = function()
{
    Game.surface.style.top = "0px";
    Game.surface.style.left = "-200px";
    Game.surface.style.width = window.outerWidth;
    Game.surface.style.height = window.outerHeight;
    Game.surface.style.position = "absolute";
}

Game.handleExitFullscreen = function ()
{
  Game.surface.style.top = "57px";
  Game.surface.style.left = "0px";
  Game.surface.style.width = "100%";
  Game.surface.style.height = "100%";
  Game.surface.style.position = "absolute";
}

Game.appHandleKeyDown = function (event)
{
  currentlyPressedKeys[event.keyCode] = true;
}

Game.appHandleKeyUp = function (event)
{
  currentlyPressedKeys[event.keyCode] = false;
  if (event.keyCode == 70) Game.fullscreenMode(!Game.isFullscreen);
  if (event.keyCode == 79) Game.oculusMode(!Game.isOculus);
  if (event.keyCode == 83 && raymesh) Game.raystep(); // 's'
  if (event.keyCode == 84 && raymesh) raymesh = null; // 't'
}

var leftClick = 0;
var rightClick = 0;
var clickLoc = {};
var skip = 0;

////
var raymesh = null;
var raystep = vec4.create();
var raynear = vec4.create();
var rayverts = null;

Game.rayset = function(mouse)
{
  var unproject = mat4.create();
  var unproj = mat4.create();
  var unview = mat4.create();
  mat4.invert(unproj, Game.camera.eyes[0].projection);
  mat4.invert(unview, Game.camera.eyes[0].view);
  mat4.multiply(unproject, unview, unproj);

//  var unproject = mat4.create();
//  mat4.multiply(unproject, Game.camera.eyes[0].projection, Game.camera.eyes[0].view);
//  mat4.invert(unproject, unproject);

  var near = vec4.fromValues((mouse.X / Game.camera.width) * 2.0 - 1.0, -(mouse.Y / Game.camera.height) * 2.0 + 1.0, -1.0, 1.0);
  vec4.transformMat4(near, near, unproject);
  vec4.scale(near, near, 1.0 / near[3])

  var far = vec4.fromValues((mouse.X / Game.camera.width) * 2.0 - 1.0, -(mouse.Y / Game.camera.height) * 2.0 + 1.0, 1.0, 1.0);
  vec4.transformMat4(far, far, unproject);
  vec4.scale(far, far, 1.0 / far[3])

  // get the stepping vector
  var step = vec4.create();
  vec4.subtract(step, far, near);
  vec4.normalize(step, step);

  raynear = vec4.clone(near);
  raystep = vec4.clone(step);

  raymesh = new mx.Mesh();
  rayverts = [];
  rayverts.push(raynear[0]); rayverts.push(raynear[1]); rayverts.push(raynear[2]);
  rayverts.push(far[0]); rayverts.push(far[1]); rayverts.push(far[2]);
  raymesh.loadFromArrays(rayverts, null, { 'POS': 0 }, gl.LINES, rayverts.length / 3.0, 0);
}

Game.raystep = function()
{
  rayverts.push(raynear[0]); rayverts.push(raynear[1]); rayverts.push(raynear[2]);
  vec3.add(raynear, raynear, raystep);
  rayverts.push(raynear[0]); rayverts.push(raynear[1]); rayverts.push(raynear[2]);
  var t = mat4.create();
  mat4.identity(t);
  raymesh.loadFromArrays(rayverts, null, { 'POS': 0 }, gl.LINES, rayverts.length / 3.0, 0, t);
}

Game.appHandleMouseEvent = function(type, mouse)
{
  switch (type)
  {
    case 0: // button down

      // clicked on a lamp?
      {
        if (!raymesh) Game.rayset(mouse);

        // for each lamp
//        for (var l in lamps)
//        {
//          var lamp = lamps[l];
//          if (!lamp) continue;
//          var minX = lamp.model.boundingbox[0].min[0];
//          var maxX = lamp.model.boundingbox[0].max[0];
//          var minY = lamp.model.boundingbox[0].min[1];
//          var maxY = lamp.model.boundingbox[0].max[1];
//          var minZ = lamp.model.boundingbox[0].min[2];
//          var maxZ = lamp.model.boundingbox[0].max[2];
//          var p = vec4.clone(near);
//          for (var n = 0; n < 20; ++n) {
//            vec3.add(p, p, step);
//            if (p[0] >= minX && p[0] <= maxX && p[1] >= minY && p[1] <= maxY && p[2] >= minZ && p[2] <= maxX) {
//              console.log("hit lamp #" + l);
//              break;
//            }
//          }
//        }
      }

      if (mouse.button == 0) leftClick = 1;
      if (mouse.button == 2) rightClick = 1;
      clickLoc.X = mouse.X;
      clickLoc.Y = mouse.Y;
      break;
    case 4:
    case 1: // button up
      leftClick = 0;
      rightClick = 0;
      break;
    case 2: // move
      if (leftClick)
      {
        if (pickedLight) {
          var offset = vec3.create();
          vec3.copy(offset, Game.camera.left);
          vec3.scale(offset, offset, 0.01 * (mouse.X - clickLoc.X));
          lamps[pickedLight].updatePositionVec(offset);
          vec3.copy(offset, Game.camera.forward);
          vec3.scale(offset, offset, 0.01 * (mouse.Y - clickLoc.Y));
          lamps[pickedLight].updatePositionVec(offset);
          lamps[pickedLight].update();
          uLight["uLights[" + pickedLight + "].Position"] = [lamps[pickedLight].position[0], lamps[pickedLight].position[1] + 2.0, lamps[pickedLight].position[2]];
        }
        else {
          xSpeed += 0.01 * (mouse.Y - clickLoc.Y);
          ySpeed += 0.01 * (mouse.X - clickLoc.X);
        }
        clickLoc.X = mouse.X;
        clickLoc.Y = mouse.Y;
      }
      if (rightClick)
      {
        head.offset[1] += 0.01 * (mouse.Y - clickLoc.Y);
        head.updateOrientationXYZ(0.0, -0.01 * (mouse.X - clickLoc.X), 0.0);
        clickLoc.X = mouse.X;
        clickLoc.Y = mouse.Y;
      }
      break;
    case 8:
      head.offset[2] -= 0.5 * mouse.wheel;
      break;
    case 9:
      if (mouse.gesture.direction == 'up')
        xSpeed += 0.04 * mouse.gesture.deltaY;
      else if (mouse.gesture.direction == 'down')
        xSpeed += 0.04 * mouse.gesture.deltaY;
      else if (mouse.gesture.direction == 'left')
        ySpeed += 0.03 * mouse.gesture.deltaX;
      else if (mouse.gesture.direction == 'right')
        ySpeed += 0.03 * mouse.gesture.deltaX;
      skip = 1;
    case 10:
      if (!skip)
      {
        xSpeed = 0;
        ySpeed = 0;
      }
      skip = 0;
      break;
    case 11:
      head.offset[2] -= 0.05;
      break;
    case 12:
      head.offset[2] += 0.05;
      break;
  }
}