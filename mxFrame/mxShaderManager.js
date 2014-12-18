var RenderState = function(state)
{
  // convert the hash to states
  // render states
  if (state.cull)         this.cull = (state.cull[0].trim() === 'true');
  if (state.cullmode) this.cullmode = gl[state.cullmode[0].trim()];
  if (state.frontface) this.frontface = gl[state.frontface[0].trim()];
  if (state.depthbias) this.depthbias = { factor: state.depthbias[0].trim(), units: state.depthbias[1].trim() };
  if (state.depthrange) this.depthrange = { near: state.depthbias[0].trim(), far: state.depthbias[1].trim() };
  if (state.scissor) this.scissor = (state.scissor[0].trim() === 'true');
  // blend states
  if (state.blend) this.blend = (state.blend[0].trim() === "true");
  if (state.blendop) this.blendop = gl[state.blendop[0].trim()];
  if (state.blendopalpha) this.blendopalpha = gl[state.blendopalpha[0].trim()];
  if (state.blendfunc) this.blendfunc = { src: gl[state.blendfunc[0].trim()], dest: gl[state.blendfunc[1].trim()] };
  if (state.blendfuncalpha) this.blendfuncalpha = { src: gl[state.blendfuncalpha[0].trim()], dest: gl[state.blendfuncalpha[1].trim()] };
  if (state.blendfactors) this.blendfactors = { r: state.blendfactors[0].trim(), g: state.blendfactors[1].trim(), b: state.blendfactors[2].trim(), a: state.blendfactors[3].trim() };
  if (state.blendmask) this.blendmask = { r: state.blendmask[0].trim(), g: state.blendmask[1].trim(), b: state.blendmask[2].trim(), a: state.blendmask[3].trim() };
  // depth states
  if (state.depth)    this.depth = (state.depth[0].trim() === "true");
  if (state.depthwrite) this.depthwrite = (state.depthwrite[0].trim() === 'true');
  if (state.depthfunc) this.depthfunc = gl[state.depthfunc[0].trim()];
  if (state.stencil) this.stencil = (state.stencil[0].trim() === 'true');
  if (state.stencilfunc) this.stencilfunc = { func: gl[state.stencilfunc[0].trim()], ref: state.stencilfunc[1].trim(), mask: state.stencilfunc[2].trim() };
  if (state.stencilmask) this.stencilmask = state.stencilmask[0].trim();
  if (state.stencilfront) this.stencilfront = { sfail: gl[state.stencilfront[0].trim()], dpfail: gl[state.stencilfront[0].trim()], pass: gl[state.stencilfront[0].trim()] };
  if (state.stencilback) this.stencilback = { sfail: gl[state.stencilback[0].trim()], dpfail: gl[state.stencilback[0].trim()], pass: gl[state.stencilback[0].trim()] };
}

RenderState.prototype.set = function()
{
  // render states
  if (typeof this.cull === typeof (true))    this.cull ?      gl.enable(gl.CULL_FACE) :      gl.disable(gl.CULL_FACE);
  if (this.cullmode)    gl.cullFace(this.cullmode);
  if (this.frontface)    gl.frontFace(this.frontface);
  if (this.depthbias) { gl.enable(gl.GL_POLYGON_OFFSET_FILL); gl.polygonOffset(this.depthbias.factor, this.depthbias.units); }
  if (this.depthrange)    gl.depthRange(this.depthrange.near, this.depthrange.far);
  if (typeof this.scissor === typeof (true))    this.scissor ? gl.enable(gl.SCISSOR_TEST) : gl.disable(gl.SCISSOR_TEST);
  // blend states
  if (typeof this.blend === typeof (true))    this.blend ?      gl.enable(gl.BLEND) :      gl.disable(gl.BLEND);
  if (this.blendop && !this.blendopalpha)    gl.blendEquation(this.blendop);
  if (this.blendop && this.blendopalpha)    gl.blendEquationSeparate(this.blendop, this.blendopalpha);
  if (this.blendfunc && !this.blendfuncalpha)    gl.blendFunc(this.blendfunc.src, this.blendfunc.dest);
  if (this.blendfunc && this.blendfuncalpha)    gl.blendFunc(this.blendfunc.src, this.blendfunc.dest, this.blendfuncalpha.src, this.blendfuncalpha.dest);
  if (this.blendfactors)    gl.blendColor(this.blendfactors.r, this.blendfactors.g, this.blendfactors.b, this.blendfactors.a);
  if (this.blendmask)    gl.colorMask(this.colorMask.r, this.colorMask.g, this.colorMask.b, this.colorMask.a);
  // depth states
  if (typeof this.depth === typeof (true)) this.depth ?    gl.enable(gl.DEPTH_TEST) :    gl.disable(gl.DEPTH_TEST);
  if (typeof this.depthwrite === typeof (true)) this.depthwrite ?    gl.depthMask(true) :    gl.depthMask(false);
  if (this.depthfunc)    gl.depthFunc(this.depthfunc);
  if (typeof this.stencil === typeof (true)) this.stencil ? gl.enable(gl.STENCIL_TEST) : gl.disable(gl.STENCIL_TEST);
  if (this.stencilfunc)    gl.stencilFunc(this.stencilfunc.func, this.stencilfunc.ref, this.stencilfunc.mask);
  if (this.stencilmask)    gl.stencilMask(this.stencilmask);
  if (this.stencilfront)    gl.stencilOpSeparate(gl.FRONT, this.stencilfront.sfail, this.stencilfront.dpfail, this.stencilfront.pass);
  if (this.stencilback)    gl.stencilOpSeparate(gl.BACK, this.stencilback.sfail, this.stencilback.dpfail, this.stencilback.pass);
}

RenderState.prototype.unset = function()
{
  // render states
  if (typeof this.cull === typeof (true)) gl.disable(gl.CULL_FACE);
  if (this.cullmode) gl.cullFace(gl.BACK);
  if (this.frontface) gl.frontFace(gl.CCW);
  if (this.depthbias) { gl.disable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(0, 0); }
  if (this.depthrange) gl.depthRange(0, 1);
  if (typeof this.scissor === typeof (true)) gl.disable(gl.SCISSOR_TEST);
  // blend states
  if (typeof this.blend === typeof (true))    gl.disable(gl.BLEND);
  if (this.blendop && !this.blendopalpha) gl.blendEquation(gl.FUNC_ADD);
  if (this.blendop && this.blendopalpha) gl.blendEquationSeparate(gl.FUNC_ADD,gl.FUNC_ADD);
  if (this.blendfunc && !this.blendfuncalpha)    gl.blendFunc(gl.ONE, gl.ZERO);
  if (this.blendfunc && this.blendfuncalpha) gl.blendFunc(gl.ONE, gl.ZERO, gl.ONE, gl.ZERO);
  if (this.blendfactors) gl.blendColor(0,0,0,0);
  if (this.blendmask) gl.colorMask(true, true, true, true);
  // depth states
  if (typeof this.depth === typeof (true))    gl.disable(gl.DEPTH_TEST);
  if (typeof this.depthwrite === typeof (true)) gl.depthMask(true);
  if (this.depthfunc)    gl.depthFunc(gl.LESS);
  if (typeof this.stencil === typeof (true)) gl.disable(gl.STENCIL_TEST);
  if (this.stencilfunc) gl.stencilFunc(gl.ALWAYS, 0, 0xFFFFFFFF);
  if (this.stencilmask) gl.stencilMask(0xFFFFFFFF);
  if (this.stencilfront) gl.stencilOpSeparate(gl.FRONT, gl.KEEP, gl.KEEP, gl.KEEP);
  if (this.stencilback) gl.stencilOpSeparate (gl.BACK, gl.KEEP, gl.KEEP, gl.KEEP);
}

//
// The shader manager loads effect files and holds all programs

var ShaderManager = function()
{
  this.shaders = {};
  this.shaderParts = {};
  this.renderstates = {};
  this.currentRenderState = null;
  this.enabledAttrs = 0;
  this.enabledUniforms = {};

  this.log = false;
}

///////////////////////
// REDUNDANT CALL SECTION
ShaderManager.prototype.enableAttibutes = function(num)
{
  if (num == this.enabledAttrs) return;
  if (num > this.enabledAttrs)
    for (var i = this.enabledAttrs; i < num; ++i) gl.enableVertexAttribArray(i);
  else 
    for (var i = this.enabledAttrs-1; i >= num; --i) gl.disableVertexAttribArray(i);
  this.enabledAttrs = num;
}

ShaderManager.prototype.checkarray = function(v1, v2)
{
  if (!v1) return false;
  var l = v1.length;
  if (l != v2.length) return false;
  for (var i = 0; i < l; ++i) if (v1[i] !== v2[i]) return false;
  return true;
}

var skip = false;

ShaderManager.prototype.enableUniform = function(name, n, value)
{
  if (!n) return;

  switch (n.type) {
    case gl.FLOAT:
      if (this.log) console.log("setting " + name + " to " + value);
      if (skip || this.enabledUniforms[name] !== value)
      {
        if (this.log) console.log("  ok");
        gl.uniform1f(n, value);
        this.enabledUniforms[name] = value;
      }
      break;
    case gl.FLOAT_VEC2:
      if (this.log) console.log("setting " + name + " to " + vec2.str(value));
      if (skip || !this.checkarray(this.enabledUniforms[name], value))
      {
        if (this.log) console.log("  ok");
        gl.uniform2fv(n, value);
        this.enabledUniforms[name] = value;
      }
      break;
    case gl.FLOAT_VEC3:
      if (this.log) console.log("setting " + name + " to " + vec3.str(value));
      if (skip || !this.checkarray(this.enabledUniforms[name], value))
      {
        if (this.log) console.log("  ok");
        gl.uniform3fv(n, value);
        this.enabledUniforms[name] = value;
      }
      break;
    case gl.FLOAT_VEC4:
      if (this.log) console.log("setting " + name + " to " + vec4.str(value));
      if (skip || !this.checkarray(this.enabledUniforms[name], value))
      {
        if (this.log) console.log("  ok");
        gl.uniform4fv(n, value);
        this.enabledUniforms[name] = value;
      }
      break;
    case gl.BOOL:
    case gl.INT:
      if (this.log) console.log("setting " + name + " to " + value);
      if (skip || this.enabledUniforms[name] !== value)
      {
        if (this.log) console.log("  ok");
        gl.uniform1i(n, value);
        this.enabledUniforms[name] = value;
      }
      break;
    case gl.BOOL_VEC2:
    case gl.INT_VEC2:
      if (this.log) console.log("setting " + name + " to " + vec3(value));
      if (!skip || this.checkarray(this.enabledUniforms[name], value))
      {
        if (this.log) console.log("  ok");
        gl.uniform2iv(n, value);
        this.enabledUniforms[name] = value;
      }
      break;
    case gl.BOOL_VEC3:
    case gl.INT_VEC3:
      if (this.log) console.log("setting " + name + " to " + vec3.str(value));
      if (skip || !this.checkarray(this.enabledUniforms[name], value))
      {
        if (this.log) console.log("  ok");
        gl.uniform3iv(n, value);
        this.enabledUniforms[name] = value;
      }
      break;
    case gl.BOOL_VEC4:
    case gl.INT_VEC4:
      if (this.log) console.log("setting " + name + " to " + vec4.str(value));
      if (skip || !this.checkarray(this.enabledUniforms[name], value))
      {
        if (this.log) console.log("  ok");
        gl.uniform4iv(n, value);
        this.enabledUniforms[name] = value;
      }
      break;
    case gl.FLOAT_MAT2:
      if (this.log) console.log("setting " + name + " to " + mat2.str(value));
      if (skip || !this.checkarray(this.enabledUniforms[name], value))
      {
        if (this.log) console.log("  ok");
        gl.uniformMatrix2fv(n, false, value);
        this.enabledUniforms[name] = value;
      }
      break;
    case gl.FLOAT_MAT3:
      if (this.log) console.log("setting " + name + " to " + mat3.str(value));
      if (skip || !this.checkarray(this.enabledUniforms[name], value))
      {
        if (this.log) console.log("  ok");
        gl.uniformMatrix3fv(n, false, value);
        this.enabledUniforms[name] = value;
      }
      break;
    case gl.FLOAT_MAT4:
      if (this.log) console.log("setting " + name + " to " + mat4.str(value));
      if (skip || !this.checkarray(this.enabledUniforms[name], value))
      {
        if (this.log) console.log("  ok");
        gl.uniformMatrix4fv(n, false, value);
        this.enabledUniforms[name] = value;
      }
      break;
  }
}

/////////////////////////////
// SHADER COMPILING SECTION
ShaderManager.prototype.compileVertexShader = function (src)
{
  var shader = gl.createShader(gl.VERTEX_SHADER);

  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { alert(gl.getShaderInfoLog(shader)); return null; }
  return shader;
}

ShaderManager.prototype.compilePixelShader = function (src) 
{
  var shader = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { alert(gl.getShaderInfoLog(shader)); return null; }
  return shader;
}

ShaderManager.prototype.extractShaderPart = function(src, type)
{
  var part = "";
  var start;

// find and concats all the parts labels as a type  
  for (;;)
  {
    start = src.indexOf(type);
    if (start == -1) break;
  
    src = src.substring(start+type.length+1);
    var end = src.indexOf("[END]");
    part += src.substring(0, end);
    src = src.substring(end+6);
  }
  return part;
}

var uniformSizes     = [2,3,4,   2,3,4,   1,2,3,4, 4,9,16, 0,0];      // how many elements are in this certain variable type
var uniformByteSizes = [8,12,16, 8,12,16, 1,2,3,4, 16,36,64, 0,0];    // the byte size of this certain variable type
var uniformTypes = [0x1406, 0x1406, 0x1406,                             // the WebGL definition of this certain variable type
                    0x1404, 0x1404, 0x1404, 
                    0x1400, 0x1400, 0x1400, 0x1400, 
                    0x1406, 0x1406, 0x1406, 
                    0,0];
// var uniformTypes = [gl.FLOAT, gl.FLOAT, gl.FLOAT,                             // the WebGL definition of this certain variable type
//                     gl.INT, gl.INT, gl.INT, 
//                     gl.BYTE, gl.BYTE, gl.BYTE, gl.BYTE, 
//                     gl.FLOAT, gl.FLOAT, gl.FLOAT, 
//                     0,0];

ShaderManager.prototype.findCode = function(src, name)
{
  // find attribute line with the name on it
  var code = "";
  var start = 0;
  for (var i = 0; i < 100; ++i)
  {
    var line = src.indexOf("attribute", start); if (line == -1) return code;
    var end = src.indexOf("\n", line);          if (end == -1) return code;
    var loc = src.indexOf(name, line);          if (loc == -1) return code;
    if (loc > end) { start = end; continue; }

    loc = src.indexOf("//", line);              if (loc == -1) return code;
    code = src.substring(loc+2, end);
    return code.trim();
  }
}

ShaderManager.prototype.findParam = function(src, name, param, def)
{
  // find uniform line with the name on it
  var code = def;
  var start = 0;
  for (var i = 0; i < 256; ++i)
  {
    var line = src.indexOf("uniform", start); if (line == -1) return code;
    var end = src.indexOf("\n", line);          if (end == -1) return code;
    var loc = src.indexOf(name, line);          if (loc == -1) return code;
    if (loc > end) { start = end; continue; }

    loc = src.indexOf("//", line);              if (loc == -1) return code;
    var params = src.substring(loc+2, end);

    // find the required param
    loc = params.indexOf(param);           if (loc == -1) return code;
    // find the value up to , or end
    var end = params.indexOf(",", loc);           if (end == -1) end = params.length;

    code = params.substring(loc+param.length+1, end);
    return code.trim();
  }
}

ShaderManager.prototype.findTexParam = function(src, name, param, def)
{
  var code = this.findParam(src, name, param, def);
  if (code == def) return code;

  var v =  gl[code.trim()];
  if (!v) v = def;
  return v;
}

ShaderManager.prototype.processRenderStates = function(src)
{
  // render states start with: name blah
  // find all name blah parts and sub parse
  // for each part, find all lines and divide into: state, args[]

  var renderstates = {};

  var start;
  var part;
  // find and concats all the parts labels as a type  
  for (;;)
  {
    start = src.indexOf("name");
    if (start == -1) break;

    src = src.substring(start + 4);
    var end = src.indexOf("name");

    if (end >= 0) 
    {
      part = "name"+src.substring(0, end);
      src = src.substring(end);
    }
    else 
    {
      part = "name"+src;
      src = "";
    }

    // get each state
    var state = {};
    var lines = part.replace("\r","").split("\n");
    for (var line in lines)
    {
      var words = lines[line].split(" ");
      state[words.shift()] = words;
    }
    renderstates[state.name] = state;
  }

  return renderstates;
}

ShaderManager.prototype.storeEffect = function(src)
{
  var name = this.extractShaderPart(src, "[NAME]").trim();
  if (!name) name = this.extractShaderPart(src, "[PARTNAME]").trim();
  this.shaderParts[name] = src;
  Game.loadingDecr();
}

ShaderManager.prototype.processEffects = function()
{
  for (name in this.shaderParts)
  {
    if (this.shaders[name]) continue;

    var src = this.shaderParts[name];

    // resolve includes
    for (;;)
    {
      var start = src.indexOf("[INCLUDE ");
      if (start == -1) break;
      var end = src.indexOf("]", start);

      var n = src.substring(start+9, end); // get name
      var newsrc = src.substring(0, start) + this.shaderParts[n] + src.substring(end + 1); // replace line with shaderpart
      src = newsrc; // do it again
    }

    this.processEffect("[COMMON]\n// SHADER NAME: " + name + "\n[END]\n" + src);
    gl.flush();
  }
}

ShaderManager.prototype.processEffect = function(src)
{
  var name   = this.extractShaderPart(src, "[NAME]").trim();
  if (!name) return;

  var vertex = this.extractShaderPart(src, "[VERTEX]");
  var pixel  = this.extractShaderPart(src, "[PIXEL]");
  var common = this.extractShaderPart(src, "[COMMON]");
  var usestate = this.extractShaderPart(src, "[APPLY]").trim();
  var renderstates = this.processRenderStates(this.extractShaderPart(src, "[RENDERSTATE]"));

  // save renderstates
  for (var n in renderstates)
  {
    if (!this.renderstates[n]) this.renderstates[n] = new RenderState(renderstates[n]);
  }

  // early exit for noop shaders
  if (vertex.length == 0 && pixel.length == 0) return;

  // make a shader
  var vertexShader   = this.compileVertexShader(common + vertex);
  var fragmentShader = this.compilePixelShader(common + pixel);

  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { alert("Could not initialise shaders"); }

  //
  // turn on all the attributes and create properties for each

  if (usestate) shaderProgram.renderstate = this.renderstates[usestate];
  shaderProgram.attributes = [];
  shaderProgram.stride = 0;

  var numAttribs = gl.getProgramParameter(shaderProgram, gl.ACTIVE_ATTRIBUTES);
  var numUniforms = gl.getProgramParameter(shaderProgram, gl.ACTIVE_UNIFORMS);

  for (var i = 0; i < numAttribs; ++i)
  {
    var info = gl.getActiveAttrib(shaderProgram, i);
    gl.getError();
    if (!info) break;

    shaderProgram[info.name] = gl.getAttribLocation(shaderProgram, info.name);
    shaderProgram.attributes[i] = {};
    shaderProgram.attributes[i].size = uniformSizes[info.type - 0x8b50];
    shaderProgram.attributes[i].type = uniformTypes[info.type - 0x8b50];   // convert uniform type to data type
    if (info.name.indexOf("Instance") == -1) shaderProgram.stride += uniformByteSizes[info.type - 0x8b50];

    var code = this.findCode(src, info.name);
    if (!code) alert("missing code for " + info.name);
    shaderProgram.attributes[code] = shaderProgram[info.name];
  }

  // 
  // make property for each uniform
  // make a struct also to hand out

  shaderProgram.uniforms = [];
  shaderProgram.textures = [];
  var u = 0;
  var t = 0;
  for (var i = 0; i < numUniforms; ++i)
  {
    var info = gl.getActiveUniform(shaderProgram, i);
    if (!info) break;

    if (info.type == gl.SAMPLER_2D || info.type == gl.SAMPLER_CUBE)
    {
      shaderProgram.textures[t] = {};
      shaderProgram.textures[t].name = info.name;
      shaderProgram.textures[t].loc = gl.getUniformLocation(shaderProgram, info.name);
      shaderProgram.textures[t].mag  = this.findTexParam(src, info.name, 'mag', gl.LINEAR);
      shaderProgram.textures[t].min = this.findTexParam(src, info.name, 'min', gl.NEAREST_MIPMAP_LINEAR);
      shaderProgram.textures[t].wraps = this.findTexParam(src, info.name, 'wrapu', gl.REPEAT);
      shaderProgram.textures[t].wrapt = this.findTexParam(src, info.name, 'wrapv', gl.REPEAT);
      shaderProgram[info.name] = t;
      t += 1;
    }
    else
    {
      shaderProgram[info.name] = gl.getUniformLocation(shaderProgram, info.name);
      shaderProgram[info.name].type = info.type;
      shaderProgram.uniforms[u] = {};
      shaderProgram.uniforms[u].name = info.name;
      shaderProgram.uniforms[u].group = this.findParam(src, info.name, 'group', '');
      u += 1;
    }
  }

  shaderProgram.bind = bind;
  shaderProgram.bindCamera = bindCamera;
  shaderProgram.bindMesh = bindMesh;
  shaderProgram.bindInstanceData = bindInstanceData;
  shaderProgram.bindTexture = bindTexture;
  shaderProgram.draw = draw;
  shaderProgram.createUniform = createUniform;
  shaderProgram.setUniforms = setUniforms;

  this.shaders[name] = shaderProgram;
}

