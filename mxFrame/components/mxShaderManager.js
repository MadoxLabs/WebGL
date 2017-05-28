(function ()
{
  var RenderState = function (state)
  {
    // convert the hash to states
    // render states
    if (state.cull) this.cull = (state.cull[0].trim() === 'true');
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
    if (state.depth) this.depth = (state.depth[0].trim() === "true");
    if (state.depthwrite) this.depthwrite = (state.depthwrite[0].trim() === 'true');
    if (state.depthfunc) this.depthfunc = gl[state.depthfunc[0].trim()];
    if (state.stencil) this.stencil = (state.stencil[0].trim() === 'true');
    if (state.stencilfunc) this.stencilfunc = { func: gl[state.stencilfunc[0].trim()], ref: state.stencilfunc[1].trim(), mask: state.stencilfunc[2].trim() };
    if (state.stencilmask) this.stencilmask = state.stencilmask[0].trim();
    if (state.stencilfront) this.stencilfront = { sfail: gl[state.stencilfront[0].trim()], dpfail: gl[state.stencilfront[0].trim()], pass: gl[state.stencilfront[0].trim()] };
    if (state.stencilback) this.stencilback = { sfail: gl[state.stencilback[0].trim()], dpfail: gl[state.stencilback[0].trim()], pass: gl[state.stencilback[0].trim()] };
  }

  RenderState.prototype.set = function ()
  {
    // render states
    if (typeof this.cull === typeof (true)) this.cull ? gl.enable(gl.CULL_FACE) : gl.disable(gl.CULL_FACE);
    if (this.cullmode) gl.cullFace(this.cullmode);
    if (this.frontface) gl.frontFace(this.frontface);
    if (this.depthbias) { gl.enable(gl.GL_POLYGON_OFFSET_FILL); gl.polygonOffset(this.depthbias.factor, this.depthbias.units); }
    if (this.depthrange) gl.depthRange(this.depthrange.near, this.depthrange.far);
    if (typeof this.scissor === typeof (true)) this.scissor ? gl.enable(gl.SCISSOR_TEST) : gl.disable(gl.SCISSOR_TEST);
    // blend states
    if (typeof this.blend === typeof (true)) this.blend ? gl.enable(gl.BLEND) : gl.disable(gl.BLEND);
    if (this.blendop && !this.blendopalpha) gl.blendEquation(this.blendop);
    if (this.blendop && this.blendopalpha) gl.blendEquationSeparate(this.blendop, this.blendopalpha);
    if (this.blendfunc && !this.blendfuncalpha) gl.blendFunc(this.blendfunc.src, this.blendfunc.dest);
    if (this.blendfunc && this.blendfuncalpha) gl.blendFunc(this.blendfunc.src, this.blendfunc.dest, this.blendfuncalpha.src, this.blendfuncalpha.dest);
    if (this.blendfactors) gl.blendColor(this.blendfactors.r, this.blendfactors.g, this.blendfactors.b, this.blendfactors.a);
    if (this.blendmask) gl.colorMask(this.colorMask.r, this.colorMask.g, this.colorMask.b, this.colorMask.a);
    // depth states
    if (typeof this.depth === typeof (true)) this.depth ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST);
    if (typeof this.depthwrite === typeof (true)) this.depthwrite ? gl.depthMask(true) : gl.depthMask(false);
    if (this.depthfunc) gl.depthFunc(this.depthfunc);
    if (typeof this.stencil === typeof (true)) this.stencil ? gl.enable(gl.STENCIL_TEST) : gl.disable(gl.STENCIL_TEST);
    if (this.stencilfunc) gl.stencilFunc(this.stencilfunc.func, this.stencilfunc.ref, this.stencilfunc.mask);
    if (this.stencilmask) gl.stencilMask(this.stencilmask);
    if (this.stencilfront) gl.stencilOpSeparate(gl.FRONT, this.stencilfront.sfail, this.stencilfront.dpfail, this.stencilfront.pass);
    if (this.stencilback) gl.stencilOpSeparate(gl.BACK, this.stencilback.sfail, this.stencilback.dpfail, this.stencilback.pass);
  }

  RenderState.prototype.unset = function ()
  {
    // render states
    if (typeof this.cull === typeof (true)) gl.disable(gl.CULL_FACE);
    if (this.cullmode) gl.cullFace(gl.BACK);
    if (this.frontface) gl.frontFace(gl.CCW);
    if (this.depthbias) { gl.disable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(0, 0); }
    if (this.depthrange) gl.depthRange(0, 1);
    if (typeof this.scissor === typeof (true)) gl.disable(gl.SCISSOR_TEST);
    // blend states
    if (typeof this.blend === typeof (true)) gl.disable(gl.BLEND);
    if (this.blendop && !this.blendopalpha) gl.blendEquation(gl.FUNC_ADD);
    if (this.blendop && this.blendopalpha) gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
    if (this.blendfunc && !this.blendfuncalpha) gl.blendFunc(gl.ONE, gl.ZERO);
    if (this.blendfunc && this.blendfuncalpha) gl.blendFunc(gl.ONE, gl.ZERO, gl.ONE, gl.ZERO);
    if (this.blendfactors) gl.blendColor(0, 0, 0, 0);
    if (this.blendmask) gl.colorMask(true, true, true, true);
    // depth states
    if (typeof this.depth === typeof (true)) gl.disable(gl.DEPTH_TEST);
    if (typeof this.depthwrite === typeof (true)) gl.depthMask(true);
    if (this.depthfunc) gl.depthFunc(gl.LESS);
    if (typeof this.stencil === typeof (true)) gl.disable(gl.STENCIL_TEST);
    if (this.stencilfunc) gl.stencilFunc(gl.ALWAYS, 0, 0xFFFFFFFF);
    if (this.stencilmask) gl.stencilMask(0xFFFFFFFF);
    if (this.stencilfront) gl.stencilOpSeparate(gl.FRONT, gl.KEEP, gl.KEEP, gl.KEEP);
    if (this.stencilback) gl.stencilOpSeparate(gl.BACK, gl.KEEP, gl.KEEP, gl.KEEP);
  }


  function checkarray(v1, v2)
  {
    if (!v1) return false;
    var l = v1.length;
    if (l != v2.length) return false;
    for (var i = 0; i < l; ++i) if (v1[i] !== v2[i]) return false;
    return true;
  }

  function checkvalue(v1, v2)
  {
    if (!v1) return false;
    return (v1 === v2);
  }


  //
  // The shader manager loads effect files and holds all programs

  var ShaderManager = function ()
  {
    this.shaders = {};
    this.shaderParts = {};
    this.renderstates = {};
    this.currentRenderState = null;
    this.enabledAttrs = 0;
    this.enabledUniforms = {};

    this.checkFunctions = {};
    this.checkFunctions[gl.FLOAT] = checkvalue;
    this.checkFunctions[gl.BOOL] = checkvalue;
    this.checkFunctions[gl.INT] = checkvalue;
    this.checkFunctions[gl.FLOAT_VEC2] = checkarray;
    this.checkFunctions[gl.FLOAT_VEC3] = checkarray;
    this.checkFunctions[gl.FLOAT_VEC4] = checkarray;
    this.checkFunctions[gl.BOOL_VEC2] = checkarray;
    this.checkFunctions[gl.BOOL_VEC3] = checkarray;
    this.checkFunctions[gl.BOOL_VEC4] = checkarray;
    this.checkFunctions[gl.INT_VEC2] = checkarray;
    this.checkFunctions[gl.INT_VEC3] = checkarray;
    this.checkFunctions[gl.INT_VEC4] = checkarray;
    this.checkFunctions[gl.FLOAT_MAT2] = checkarray;
    this.checkFunctions[gl.FLOAT_MAT3] = checkarray;
    this.checkFunctions[gl.FLOAT_MAT4] = checkarray;

    this.setFunctions = {};
    this.setFunctions[gl.FLOAT] = function (n, v) { gl.uniform1f(n, v); };
    this.setFunctions[gl.BOOL] = function (n, v) { gl.uniform1i(n, v); };
    this.setFunctions[gl.INT] = function (n, v) { gl.uniform1i(n, v); };
    this.setFunctions[gl.FLOAT_VEC2] = function (n, v) { gl.uniform2fv(n, v); };
    this.setFunctions[gl.FLOAT_VEC3] = function (n, v) { gl.uniform3fv(n, v); };
    this.setFunctions[gl.FLOAT_VEC4] = function (n, v) { gl.uniform4fv(n, v); };
    this.setFunctions[gl.BOOL_VEC2] = function (n, v) { gl.uniform2iv(n, v); };
    this.setFunctions[gl.BOOL_VEC3] = function (n, v) { gl.uniform3iv(n, v); };
    this.setFunctions[gl.BOOL_VEC4] = function (n, v) { gl.uniform4iv(n, v); };
    this.setFunctions[gl.INT_VEC2] = function (n, v) { gl.uniform2iv(n, v); };
    this.setFunctions[gl.INT_VEC3] = function (n, v) { gl.uniform3iv(n, v); };
    this.setFunctions[gl.INT_VEC4] = function (n, v) { gl.uniform4iv(n, v); };
    this.setFunctions[gl.FLOAT_MAT2] = function (n, v) { gl.uniformMatrix2fv(n, false, v); };
    this.setFunctions[gl.FLOAT_MAT3] = function (n, v) { gl.uniformMatrix3fv(n, false, v); };
    this.setFunctions[gl.FLOAT_MAT4] = function (n, v) { gl.uniformMatrix4fv(n, false, v); };

    this.log = false;
    this.skip = false;
  }

  ///////////////////////
  // REDUNDANT CALL SECTION
  ShaderManager.prototype.enableAttibutes = function (num)
  {
    if (num == this.enabledAttrs) return;
    if (num > this.enabledAttrs)
      for (var i = this.enabledAttrs; i < num; ++i) gl.enableVertexAttribArray(i);
    else
      for (var i = this.enabledAttrs - 1; i >= num; --i) gl.disableVertexAttribArray(i);
    this.enabledAttrs = num;
  }

  ShaderManager.prototype.enableUniform = function (name, loc, value)
  {
    if (!loc) return;

    if (this.log) console.log("setting " + name + " to " + value + " type " + loc.type);
    if (this.skip || !this.checkFunctions[loc.type](this.enabledUniforms[name], value))
    {
      if (this.log) console.log("  ok");
      try { this.setFunctions[loc.type](loc.loc, value); } catch( e) {}
      this.enabledUniforms[name] = value;
    }
  }

  /////////////////////////////
  // SHADER COMPILING SECTION
  var uniformSizes = [2, 3, 4, 2, 3, 4, 1, 2, 3, 4, 4, 9, 16, 0, 0];      // how many elements are in this certain variable type
  var uniformByteSizes = [8, 12, 16, 8, 12, 16, 1, 2, 3, 4, 16, 36, 64, 0, 0];    // the byte size of this certain variable type
  var uniformTypes = [0x1406, 0x1406, 0x1406,                             // the WebGL definition of this certain variable type
                      0x1404, 0x1404, 0x1404,
                      0x1400, 0x1400, 0x1400, 0x1400,
                      0x1406, 0x1406, 0x1406,
                      0, 0];
  // var uniformTypes = [gl.FLOAT, gl.FLOAT, gl.FLOAT,                             // the WebGL definition of this certain variable type
  //                     gl.INT, gl.INT, gl.INT, 
  //                     gl.BYTE, gl.BYTE, gl.BYTE, gl.BYTE, 
  //                     gl.FLOAT, gl.FLOAT, gl.FLOAT, 
  //                     0,0];

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

  ShaderManager.prototype.extractShaderPart = function (src, type)
  {
    var part = "";
    var start;

    // find and concats all the parts labels as a type  
    for (; ;)
    {
      start = src.indexOf(type);
      if (start == -1) break;

      src = src.substring(start + type.length + 1);
      var end = src.indexOf("[END]");
      part += src.substring(0, end);
      src = src.substring(end + 6);
    }
    return part;
  }

  ShaderManager.prototype.findCode = function (src, name)
  {
    // find attribute line with the name on it
    var code = "";
    var start = 0;
    for (var i = 0; i < 100; ++i)
    {
      var line = src.indexOf("attribute", start); if (line == -1) return code;
      var end = src.indexOf("\n", line); if (end == -1) return code;
      var loc = src.indexOf(name, line); if (loc == -1) return code;
      if (loc > end) { start = end; continue; }

      loc = src.indexOf("//", line); if (loc == -1) return code;
      code = src.substring(loc + 2, end);
      return code.trim();
    }
  }

  ShaderManager.prototype.findParam = function (src, name, param, def)
  {
    // find uniform line with the name on it
    // if name is part of an array, remove all after the [
    if (name.indexOf('[') != -1) name = name.substring(0, name.indexOf('[')+1);

    var code = def;
    var start = 0;
    for (var i = 0; i < 256; ++i)
    {
      var line = src.indexOf("uniform", start); if (line == -1) return code;
      var end = src.indexOf("\n", line); if (end == -1) return code;
      var loc = src.indexOf(name, line); if (loc == -1) return code;
      if (loc > end) { start = end; continue; }

      loc = src.indexOf("//", line); if (loc == -1) return code;
      var params = src.substring(loc + 2, end);

      // find the required param
      loc = params.indexOf(param); if (loc == -1) return code;
      // find the value up to , or end
      var end = params.indexOf(",", loc); if (end == -1) end = params.length;

      code = params.substring(loc + param.length + 1, end);
      return code.trim();
    }
  }

  ShaderManager.prototype.findTexParam = function (src, name, param, def)
  {
    var code = this.findParam(src, name, param, def);
    if (code == def) return code;

    var v = gl[code.trim()];
    if (!v) v = def;
    return v;
  }

  ShaderManager.prototype.processRenderStates = function (src)
  {
    // render states start with: name blah
    // find all name blah parts and sub parse
    // for each part, find all lines and divide into: state, args[]

    var renderstates = {};

    var start;
    var part;
    // find and concats all the parts labels as a type  
    for (; ;)
    {
      start = src.indexOf("name");
      if (start == -1) break;

      src = src.substring(start + 4);
      var end = src.indexOf("name");

      if (end >= 0)
      {
        part = "name" + src.substring(0, end);
        src = src.substring(end);
      }
      else
      {
        part = "name" + src;
        src = "";
      }

      // get each state
      var state = {};
      var lines = part.replace("\r", "").split("\n");
      for (var line in lines)
      {
        var words = lines[line].split(" ");
        state[words.shift()] = words;
      }
      renderstates[state.name] = state;
    }

    return renderstates;
  }

  ShaderManager.prototype.storeEffect = function (src)
  {
    var name = this.extractShaderPart(src, "[NAME]").trim();
    if (!name) name = this.extractShaderPart(src, "[PARTNAME]").trim();
    this.shaderParts[name] = src;
  }

  ShaderManager.prototype.processEffects = function ()
  {
    this.sources = {};

    for (name in this.shaderParts)
    {
      if (this.shaders[name]) continue;

      var src = this.shaderParts[name];

      // resolve includes
      for (; ;)
      {
        var start = src.indexOf("[INCLUDE ");
        if (start == -1) break;
        var end = src.indexOf("]", start);

        var n = src.substring(start + 9, end); // get name
        var newsrc = src.substring(0, start) + this.shaderParts[n] + src.substring(end + 1); // replace line with shaderpart
        src = newsrc; // do it again
      }

//      this.processEffect("[COMMON]\n#version 300 es\n// SHADER NAME: " + name + "\n[END]\n" + src);
      this.processEffect("[COMMON]\n// SHADER NAME: " + name + "\n[END]\n" + src);
      gl.flush();
    }
  }

  ShaderManager.prototype.processEffect = function (src)
  {
    var name = this.extractShaderPart(src, "[NAME]").trim();
    if (!name) return;

    var vertex = this.extractShaderPart(src, "[VERTEX]");
    var pixel = this.extractShaderPart(src, "[PIXEL]");
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
    var s = { VS: common + vertex, PS: common + pixel };
    this.sources[name] = s;

    var vertexShader = this.compileVertexShader(common + vertex);
    var fragmentShader = this.compilePixelShader(common + pixel);

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { alert("Could not initialise shaders"); }

    var shader = new mx.Shader(shaderProgram);

    //
    // turn on all the attributes and create properties for each

    if (usestate) shader.renderstate = this.renderstates[usestate];
    var numAttribs = gl.getProgramParameter(shaderProgram, gl.ACTIVE_ATTRIBUTES);
    var numUniforms = gl.getProgramParameter(shaderProgram, gl.ACTIVE_UNIFORMS);

    for (var i = 0; i < numAttribs; ++i)
    {
      var info = gl.getActiveAttrib(shaderProgram, i);
      gl.getError();
      if (!info) break;

      shader.namesInt[info.name] = gl.getAttribLocation(shaderProgram, info.name);
      shader.attributes[i] = new mx.ShaderAttribute(uniformSizes[info.type - 0x8b50], uniformTypes[info.type - 0x8b50]);// convert uniform type to data type
      if (info.name.indexOf("Instance") == -1) shader.stride += uniformByteSizes[info.type - 0x8b50];

      var code = this.findCode(src, info.name);
      if (!code) alert("missing code for " + info.name);
      shader.attributes[code] = shader.namesInt[info.name];
    }

    // 
    // make property for each uniform
    // make a struct also to hand out

    var u = 0;
    var t = 0;
    for (var i = 0; i < numUniforms; ++i)
    {
      var info = gl.getActiveUniform(shaderProgram, i);
      if (!info) break;

      if (info.type == gl.SAMPLER_2D || info.type == gl.SAMPLER_CUBE)
      {
        shader.textures[t] = new mx.ShaderTexture();
        shader.textures[t].name = info.name;
        shader.textures[t].loc = gl.getUniformLocation(shaderProgram, info.name);
        shader.textures[t].mag = this.findTexParam(src, info.name, 'mag', gl.LINEAR);
        shader.textures[t].min = this.findTexParam(src, info.name, 'min', gl.NEAREST_MIPMAP_LINEAR);
        shader.textures[t].wraps = this.findTexParam(src, info.name, 'wrapu', gl.REPEAT);
        shader.textures[t].wrapt = this.findTexParam(src, info.name, 'wrapv', gl.REPEAT);
        shader.namesInt[info.name] = t;
        t += 1;
      }
      else
      {
        shader.names[info.name] = new mx.ShaderUniformLocation(gl.getUniformLocation(shaderProgram, info.name), info.type);
        shader.uniforms[u] = new mx.ShaderUniform(info.name, this.findParam(src, info.name, 'group', ''));
        u += 1;
      }
    }

    this.shaders[name] = shader;
  }

  mx.RenderState = RenderState;
  mx.ShaderManager = ShaderManager;
})();





