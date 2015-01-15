var gl; // leave this global for quick access

(function ()
{
  // 
  // some graphical helpers for global use
  mx.axis = {};
  mx.axis.x = vec3.fromValues(1, 0, 0);
  mx.axis.y = vec3.fromValues(0, 1, 0);
  mx.axis.z = vec3.fromValues(0, 0, 1);
  mx.axis.xNegative = vec3.fromValues(-1, 0, 0);
  mx.axis.yNegative = vec3.fromValues(0, -1, 0);
  mx.axis.zNegative = vec3.fromValues(0, 0, -1);

  // internal data
  var ext = {};
  var Game = {};

  // Internal helpers
  function makeFSQ()
  {
    spritevertices = [
      0.0, 0.0, 0.0, 0.0,
      1.0, 0.0, 1.0, 0.0,
      0.0, 1.0, 0.0, 1.0,
      1.0, 1.0, 1.0, 1.0
    ];
    var attr = { 'POS': 0, 'TEX0': 8 };
    var sprite = new mx.Mesh();
    sprite.loadFromArrays(spritevertices, null, attr, gl.TRIANGLE_STRIP, 4);
    Game.assetMan.assets['sprite'] = sprite;

    fsqvertices = [
     -1.0, -1.0, 0.0, 0.0,
      1.0, -1.0, 1.0, 0.0,
     -1.0, 1.0, 0.0, 1.0,
      1.0, 1.0, 1.0, 1.0
    ];
    var fsq = new mx.Mesh();
    fsq.loadFromArrays(fsqvertices, null, attr, gl.TRIANGLE_STRIP, 4);
    Game.assetMan.assets['fsq'] = fsq;

    fsqvertices = [
     -1.0, -1.0, 0.0, 0.0,
      1.0, -1.0, 0.5, 0.0,
     -1.0, 1.0, 0.0, 1.0,
      1.0, 1.0, 0.5, 1.0
    ];
    var fsqleft = new mx.Mesh();
    fsqleft.loadFromArrays(fsqvertices, null, attr, gl.TRIANGLE_STRIP, 4);
    Game.assetMan.assets['fsqleft'] = fsqleft;

    fsqvertices = [
     -1.0, -1.0, 0.5, 0.0,
      1.0, -1.0, 1.0, 0.0,
     -1.0, 1.0, 0.5, 1.0,
      1.0, 1.0, 1.0, 1.0
    ];
    var fsqright = new mx.Mesh();
    fsqright.loadFromArrays(fsqvertices, null, attr, gl.TRIANGLE_STRIP, 4);
    Game.assetMan.assets['fsqright'] = fsqright;
  }

  var oculusDefault = {};
  oculusDefault.hResolution = 1280;
  oculusDefault.vResolution = 800;
  oculusDefault.hScreenSize = 0.14976;
  oculusDefault.vScreenSize = 0.0935;
  oculusDefault.distortionK = [1.0, 0.22, 0.24, 0.0];
  oculusDefault.vScreenCenter = oculusDefault.VScreenSize / 2.0;
  oculusDefault.eyeToScreenDistance = 0.041;
  oculusDefault.lensSeparationDistance = 0.0635;
  oculusDefault.interpupillaryDistance = 0.065;

  // game renders to texture for possible post processing

  function bridgeConfigUpdated(config)
  {
    console.log("Oculus config gotten!");
    Game.oculus = config;
    Game.oculusReady |= 2;
  }

  function bridgeConnected()
  {
    console.log("Bridge gotten!");
    Game.oculusReady |= 1;
  }

  function bridgeDisconnected()
  {
    console.log("Bridge not here!");
    Game.oculusReady = 0;
  }

  // The one game object
  Game.init = function ()
  {
    // initial set up of the game object, init gl, create helpers
    Game.loading = 0;
    Game.ready = false;
    Game.isOculus = false;
    Game.isFullscreen = false;
    Game.textureLocation = "";

    Game.surface = document.getElementById("surface");
    Game.mouse = new mx.Mouse(Game.surface);

    Game.time = Date.now();
    Game.lastTime = Game.time;
    Game.elapsed = 0;

    try {
      gl = Game.surface.getContext("experimental-webgl");
      ext.angle = gl.getExtension("ANGLE_instanced_arrays");
      ext.index = gl.getExtension("OES_element_index_uint");
      ext.std = gl.getExtension("OES_standard_derivitives");
      ext.float = gl.getExtension("OES_texture_float");
      ext.floatlinear = gl.getExtension("OES_texture_float_linear");
      ext.halffloat = gl.getExtension("OES_texture_half_float");
      ext.halffloatlinear = gl.getExtension("OES_texture_half_float_linear");
      ext.drawbuffers = gl.getExtension("WEBGL_draw_buffers");
      ext.fragdepth = gl.getExtension("EXT_frag_depth");
      ext.depthtex = gl.getExtension("WEBGL_depth_texture");
      ext.texturelod = gl.getExtension("EXT_shader_texture_lod");
      ext.anisotropic = gl.getExtension("EXT_texture_filter_anisotropic");

      gl.viewportWidth = Game.surface.clientWidth;
      gl.viewportHeight = Game.surface.clientHeight;
    } catch (e) { }

    if (!gl) { alert("Could not initialise WebGL, sorry :("); return; }

    // GL is ready, graphics specific init now happens
    gl.clearColor(0.05, 0.05, 0.05, 1.0);

    Game.shaderMan = new mx.ShaderManager();
    Game.assetMan = new mx.AssetManager();
    makeFSQ();

    Game.camera = new mx.CameraFirst(gl.viewportWidth, gl.viewportHeight);

    // handlers
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    window.addEventListener('resize', handleSizeChange);

    if (mx.libtype & mx.WITH_OCULUS) {
      Game.oculus = oculusDefault;
      Game.oculusReady = 0;
      Game.oculusBridge = new OculusBridge({
        onConfigUpdate: bridgeConfigUpdated,
        onConnect: bridgeConnected,
        onDisconnect: bridgeDisconnected
      });
      Game.loadShaderFile(mx.libdir + "/oculus.fx");
    }

    // let game specific stuff init
    Game.loadShaderFile(mx.libdir + "/sprite.fx");
    Game.loadTextureFile("mouse", mx.libdir + "/mouse.png", false);
    Game.loadTextureFile("missing", mx.libdir + "/missing.png", true);
    Game.appInit();

    Game.ready = true;
    Game.lastTime = Date.now();
    handleSizeChange();
    Game.deviceReady();
  }


  Game.oculusMode = function (state)
  {
    if (mx.libtype & mx.WITH_OCULUS == 0) return;

    if (state && !Game.isOculus)
    {
      Game.fullscreenMode(true);
      Game.oculusBridge.connect();
      Game.postprocess("oculus");
      Game.camera.splitscreen(true);
      Game.isOculus = true;
      adjust = 15;
    }
    else if (!state && Game.isOculus)
    {
      Game.fullscreenMode(false);
      Game.oculusBridge.disconnect();
      Game.postprocess(null);
      Game.camera.splitscreen(false);
      Game.isOculus = false;
      adjust = 0;
    }
  }

  Game.fullscreenMode = function (state)
  {
    if (state && !Game.isFullscreen)
    {
      var docElm = document.documentElement;
      if (docElm.requestFullscreen) docElm.requestFullscreen();
      else if (docElm.mozRequestFullScreen) docElm.mozRequestFullScreen();
      else if (docElm.webkitRequestFullScreen) { docElm.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT); }
      else if (docElm.msRequestFullscreen) docElm.msRequestFullscreen();
      Game.surface.style.width = "100%";
      Game.surface.style.height = "100%";
      Game.isFullscreen = true;
    }
    else if (!state && Game.isFullscreen)
    {
      if (document.isFullscreen) document.exitFullscreen();
      else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
      else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
      Game.surface.style.width = "800px";
      Game.surface.style.height = "600px";
      Game.isFullscreen = false;
    }
  }
  
  Game.getFPS = function ()
  {
    var out = "";
    var perFrame = lastidleTime + lastdrawTime + lastupdateTime;
    out += "FPS: " + lastfps + "  Each frame: " + ((lastframetime / lastfps) | 0) + " ms\n";
    out += "Frame Time: Update: " + ((lastupdateTime / lastfps) | 0) + "ms  Draw: " + ((lastdrawTime / lastfps) | 0) + "ms  Idle: " + ((lastidleTime / lastfps) | 0) + "ms\n";
    lastupdateTime = (lastupdateTime / perFrame * 100) | 0;
    lastdrawTime = (lastdrawTime / perFrame * 100) | 0;
    lastidleTime = (lastidleTime / perFrame * 100) | 0;
    out += "Frame Time: Update: " + lastupdateTime + "%  Draw: " + lastdrawTime + "%  Idle: " + lastidleTime + "%";
    return out;
  }

  Game.postprocess = function (name)
  {
    if (!name) Game.frontbuffer = null;
    else Game.frontbuffer = new mx.RenderSurface(gl.viewportWidth, gl.viewportHeight);
    Game.postprocessShader = name;
  }




  Game.loadShaderFile = function (name)
  {
    Game.loadingIncr();

    var client = new XMLHttpRequest();
    client.open('GET', name);
    client.onload = function () { Game.shaderMan.storeEffect(client.responseText); }
    client.send();
  }

  Game.loadTextureFile = function (name, file, mipmap)
  {
    if (this.assetMan.assets[name]) return;

    Game.loadingIncr();

    var tex = new mx.Texture(name);
    if (arguments.length == 3) tex.mipmap = mipmap;
    tex.load(Game.textureLocation + file);
  }

  Game.loadTextureData = function (name, file, mipmap)
  {
    Game.loadingIncr();

    var tex = new mx.Texture(name);
    if (arguments.length == 3) tex.mipmap = mipmap;
    tex.load(file);
  }

  Game.loadMeshPNG = function (name, file)
  {
    Game.loadingIncr();

    var tex = new mx.MeshPNG(name);
    tex.load(file);
  }

  Game.loadMesh = function (name, file)
  {
    Game.loadingIncr();

    var client = new XMLHttpRequest();
    client.open('GET', file);
    client.onload = function () { Game.assetMan.processMesh(name, client.responseText); }
    client.send();
  }

  Game.loadingError = function (name)
  {
    Game.appLoadingError(name);
    Game.loadingDecr();
  }

  Game.loadingIncr = function ()
  {
    if (Game.loading == 0) Game.loadingStart();
    Game.loading += 1;
  }

  Game.loadingDecr = function ()
  {
    if (reportLoading) reportLoading(Game.loading);

    if (Game.loading == 1) { Game.shaderMan.processEffects(); Game.loadingStop(); }
    Game.loading -= 1;
  }


  var frametime = 0;
  var frametotal = 0;
  var framenum = 0;
  var lastfps = 0;
  var lastframetime = 0;

  var updateTime = 0;
  var drawTime = 0;
  var idleTime = 0;
  var myupdateTime;
  var mydrawTime;
  var myidleTime;
  var lastupdateTime = 0;
  var lastdrawTime = 0;
  var lastidleTime = 0;

  Game.run = function ()
  {
    if (Game.ready == false) return;

    //  var scope = WTF.trace.enterScope('Game.run');

    Game.lastTime = Game.time;
    Game.time = Date.now();
    Game.elapsed = Game.time - Game.lastTime;

    Game.update(); myupdateTime = Date.now() - Game.time;
    Game.draw(); mydrawTime = Date.now() - Game.time - myupdateTime;
    myidleTime = Game.elapsed - updateTime - mydrawTime;
    window.requestAnimationFrame(Game.run);

    updateTime += myupdateTime;
    drawTime += mydrawTime;
    idleTime += myidleTime;
    frametime += Game.elapsed;
    framenum += 1;

    if (frametime > 1000)
    {
      lastfps = framenum;
      lastframetime = frametime;
      lastupdateTime = updateTime;
      lastdrawTime = drawTime;
      lastidleTime = idleTime;
      frametime = 0;
      framenum = 0;
      updateTime = 0;
      drawTime = 0;
      idleTime = 0;
    }

    //  WTF.trace.leaveScope(scope);
  }

  Game.update = function ()
  {
    Game.appUpdate();
    Game.camera.update();
  }

  Game.draw = function ()
  {
    //  Game.shaderMan.enabledUniforms = {};
    Game.appDrawAux();

    if (Game.frontbuffer) Game.frontbuffer.engage();
    else gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.clearColor(0.05, 0.05, 0.05, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    Game.drawEachEye();

    // post process here
    if (Game.isOculus)
    {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      Game.drawEachEyeOculusEffect();
    }

    Game.shaderMan.log = false;
  }

  Game.drawEachEye = function ()
  {
    for (var eye in Game.camera.eyes) Game.drawEye(Game.camera.eyes[eye]);
  }

  var adjust = 0;
  var drawEyeMouseUniform = { location: vec2.create(), size: vec2.fromValues(32, 32), screensize: vec2.create() };

  Game.drawEye = function (eye)
  {
    eye.engage();
    Game.appDraw(eye);

    if (Game.loading > 0) return;
    if (Game.mouse.grabbed) return;

    // MOUSE AREA
    vec2.set(drawEyeMouseUniform.location, Game.mouse.X + eye.ipd * 100 * adjust, Game.mouse.Y);
    //  vec2.set(drawEyeMouseUniform.size, 32, 32);
    vec2.set(drawEyeMouseUniform.screensize, eye.viewport[2], eye.viewport[3]);

    var effect = Game.shaderMan.shaders['sprite'];
    effect.bind();
    effect.setUniforms(drawEyeMouseUniform);
    effect.bindTexture("uSpriteTex", Game.assetMan.assets['mouse'].texture);
    effect.draw(Game.assetMan.assets['sprite']);
    // END MOUSE AREA
  }

  Game.drawEachEyeOculusEffect = function ()
  {
    for (var eye in Game.camera.eyes) Game.drawEyeOculusEffect(Game.camera.eyes[eye]);
  }

  var oculusEffectUniform = { distortionscale: 0.8, aspect: 0, ScreenCenter: 0, LensCenter: 0 };

  Game.drawEyeOculusEffect = function (eye)
  {
    if (mx.libtype & mx.WITH_OCULUS == 0) return;

    eye.engage();
    oculusEffectUniform.aspect = Game.oculus.hResolution * 0.5 / Game.oculus.vResolution;
    oculusEffectUniform.ScreenCenter = eye.center;
    oculusEffectUniform.LensCenter = eye.lenscenter;

    var effect = Game.shaderMan.shaders[Game.postprocessShader];
    effect.bind();
    effect.setUniforms(oculusEffectUniform);
    effect.bindTexture("uFrontbuffer", Game.frontbuffer.texture);
    effect.draw(Game.assetMan.assets[eye.fsq]);
  }


  Game.fireMouseEvent = function (type, mouse)
  {
    Game.appHandleMouseEvent(type, mouse);
  }

  function handleSizeChange()
  {
    Game.surface.width = Game.surface.clientWidth;
    Game.surface.height = Game.surface.clientHeight;
    gl.viewportWidth = Game.surface.clientWidth;
    gl.viewportHeight = Game.surface.clientHeight;

    if (mx.libtype & mx.WITH_OCULUS)
    {
      Game.oculus.hResolution = Game.surface.clientWidth;
      Game.oculus.vResolution = Game.surface.clientHeight;
    }

    Game.camera.handleSizeChange(Game.surface.width, Game.surface.height);
    if (Game.frontbuffer) Game.frontbuffer = new mx.RenderSurface(gl.viewportWidth, gl.viewportHeight);
    Game.deviceReady();
  }

  function handleKeyDown(event)
  {
    // space and arrow keys dont scroll
    if ([32, 37, 38, 39, 40].indexOf(event.keyCode) > -1) event.preventDefault();
    if ([90].indexOf(event.keyCode) > -1) adjust += 1;
    if ([88].indexOf(event.keyCode) > -1) adjust -= 1;
    if ([80].indexOf(event.keyCode) > -1) { /*Game.shaderMan.log = true;*/ console.log(Game.getFPS()); }
    //if ([189].indexOf(event.keyCode) > -1) { wtf.trace.reset(); wtf.trace.start(options); }
    //if ([187].indexOf(event.keyCode) > -1) { wtf.trace.snapshot(); wtf.trace.stop(); }

    Game.appHandleKeyDown(event);
  }

  function handleKeyUp(event)
  {
    Game.appHandleKeyUp(event);
  }


  // exports
  mx.Game = Game;
  mx.gl = gl;
  mx.ext = ext;
})();




// Start Game specific stuff
// Game.appInit = function ()
// {
// }
// 
// Game.deviceReady = function ()
// {
// }
// 
// Game.loadingStart = function ()
// {
// }
//
// Game.loadingStop = function ()
// {
// }
//
// Game.appUpdate = function ()
// {
// 
// }
// 
// Game.appDrawAux = function ()
// {
// }
// 
// Game.appDraw= function (eye)
// {
// }
// 
// Game.appHandleKeyDown = function (event)
// {
// }
//
// Game.appHandleKeyUp = function (event)
// {
// }
// 
// Game.appHandleMouseEvent = function(type, mouse)
// {
// }
// 
// Game.appLoadingError = function (name)
// {
// }
