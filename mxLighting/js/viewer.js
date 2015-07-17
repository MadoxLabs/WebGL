// models
var grid;
var model;
// gameobjects
var head;
var object;
var lighteye;
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
  Game.loadShaderFile("assets/shadowcast.fx");

  Game.loadMeshPNG("sample", "assets/sample.model");
  Game.loadMeshPNG("floor", "assets/grid.model");
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
  document.getElementById("scaleinfo").innerHTML = "<p>Model is being scaled by a factor of: " + scale + "</p>";

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

  /*
  model = Game.assetMan.assets["sample"];
  // determine model size and bring it down to reasonable proportions
  scale = 3.0;
  for (var i = 0; i < 2; ++i) {
    var s = model.boundingbox[0].max[i] - model.boundingbox[0].min[i];
    if (s > scale) scale = s;
  }
  scale = 3.0 / scale;
  model.scale = scale;
  document.getElementById("scaleinfo").innerHTML="<p>Model is being scaled by a factor of: " + scale +"</p>";
  // determine the model's BB
  var len = 0;
  for (var i = 0; i < 3; ++i) {
    var l = (model.boundingbox[0].max[i] - model.boundingbox[0].min[i]) * scale;
    if (l > len) len = l;
  }
  var max = (model.boundingbox[0].max[2] - model.boundingbox[0].min[2]) * scale;
  if (max < len) max = len;
  // create game object for model
  object = new mx.GameObject("model", model);
  object.setScale(scale);
  if (model.boundingbox[0].min[1] <= 0.0)
    object.setPositionXYZ(0.0,
                          model.boundingbox[0].min[1] * -1.0 * scale, //(model.boundingbox[0].min[1] + (model.boundingbox[0].max[1] - model.boundingbox[0].min[1]) / 2.0) * scale,
                          0.0);
  object.uniforms.uWorldToLight = mat4.create();
  object.uniforms.options = vec4.create();
  */
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
//  uLight.uGlobalAmbientRGB = [0.5, 0.5, 0.5];
  uLight["uLights[0].AmbientFactor"] = 0.2;
  uLight["uLights[0].Color"] = [0.4, 0.4, 0.4];
  uLight["uLights[0].Attenuation"] = 0.0;
  uLight["uLights[0].Position"] = [9.0, 9.0, 39.0];
  uLight["uLights[0].WorldToLight"] = mat4.create();
  mat4.multiply(uLight["uLights[0].WorldToLight"], lighteye.eyes[0].projection, lighteye.eyes[0].view);
  uLight["uLights[1].AmbientFactor"] = 0.0;
  uLight["uLights[1].Color"] = [1.0, 0.0, 0.0];
  uLight["uLights[1].Attenuation"] = 0.5;
  uLight["uLights[1].Position"] = [4.0, 4.0, 0.0];
  uLight["uLights[1].WorldToLight"] = mat4.create();
  mat4.multiply(uLight["uLights[1].WorldToLight"], lighteye.eyes[0].projection, lighteye.eyes[0].view);
  uLight["uLights[2].AmbientFactor"] = 0.0;
  uLight["uLights[2].Color"] = [0.0, 1.0, 0.0];
  uLight["uLights[2].Attenuation"] = 0.5;
  uLight["uLights[2].Position"] = [-4.0, 4.0, 0.0];
  uLight["uLights[2].WorldToLight"] = mat4.create();
  mat4.multiply(uLight["uLights[1].WorldToLight"], lighteye.eyes[0].projection, lighteye.eyes[0].view);

  mat4.multiply(object.uniforms.uWorldToLight, lighteye.eyes[0].projection, lighteye.eyes[0].view);
  mat4.multiply(grid.uniforms.uWorldToLight, lighteye.eyes[0].projection, lighteye.eyes[0].view);

  inited = true;
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
  effect.setUniforms(object.uniforms);
  effect.setUniforms(uLight);
  effect.bindTexture("shadow", shadowmap.texture);
  effect.draw(object.model);

  effect.setUniforms(grid.uniforms);
  effect.draw(grid.model);
}

Game.appHandleKeyDown = function (event)
{
  currentlyPressedKeys[event.keyCode] = true;
  if (event.keyCode == 83) Game.oculusMode(!Game.isOculus);
}

Game.appHandleKeyUp = function (event)
{
  currentlyPressedKeys[event.keyCode] = false;
}

Game.appHandleMouseEvent = function(type, mouse)
{

}