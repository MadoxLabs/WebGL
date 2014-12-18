//
// These functions get added to each WebGL shader object

function bind()
{
  if (!this.uMat)
  {
    this.uMat = this.createUniform('material');
    this.uMat.materialoption = vec3.create(); 
  }

  gl.useProgram(this);
  Game.shaderMan.enabledUniforms = {};
  Game.shaderMan.enableAttibutes(this.attributes.length);
  if (this.renderstate && this.renderstate != Game.shaderMan.currentRenderState)
  {
    if (Game.shaderMan.currentRenderState) Game.shaderMan.currentRenderState.unset();
    Game.shaderMan.currentRenderState = this.renderstate;
    this.renderstate.set();
  }
}

function bindCamera(eye)
{
  if (eye.eyes) eye = eye.eyes[0];
  this.setUniforms(eye.uniforms);
}

function bindMesh(mesh)
{
  if (mesh.indexbuffer) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexbuffer);
  else gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
  for (var code in mesh.attributes)          // code is what this attribute represents - IE TEX0, POSITION
  {
    var offset = mesh.attributes[code];     // get offset into the vertex buffer definition
    var attr = this.attributes[code];       // look up what attribute number this is in the shader
    if (attr == undefined) continue;                    // shader doesnt use this
    var size = this.attributes[attr].size;  // get the size and type for this attribute as set in the shader
    var type = this.attributes[attr].type;
//    gl.enableVertexAttribArray(attr);
    gl.vertexAttribPointer(attr, size, type, false, this.stride, offset);
  }
}

function bindInstanceData(mesh)
{
  if (!mesh.instanceBuffer) return;

  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.instanceBuffer);
  for (var code in mesh.instance)
  {
    var offset = mesh.instance[code];     // get offset into the vertex buffer definition
    var attr = this.attributes[code];       // look up what attribute number this is in the shader
    var size = this.attributes[attr].size;  // get the size and type for this attribute as set in the shader
    var type = this.attributes[attr].type;
//    gl.enableVertexAttribArray(attr);
    gl.vertexAttribPointer(attr, size, type, false, mesh.instanceStride, offset);
    ext.angle.vertexAttribDivisorANGLE(attr, 1); // This makes it instanced!
  }
}

function bindTexture(name, texture, mag, min, wraps, wrapt)
{
  var tnum = this[name];
  if (tnum === undefined) return;
  var t = this.textures[tnum];

  gl.activeTexture(gl.TEXTURE0 + tnum);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(t.loc, tnum);
  if (!texture) return;

  var fmag = mag;
  var fmin = min;
  var fwraps = wraps;
  var fwrapt = wrapt;
  if (arguments.length < 3 || !mag) fmag = t.mag;
  if (arguments.length < 4 || !min) fmin = t.min;
  if (arguments.length < 5 || !wraps) fwraps = t.wraps;
  if (arguments.length < 6 || !wrapt) fwrapt = t.wrapt;

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, fmag);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, fmin);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, fwraps);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, fwrapt);
}

function setUniforms(vals)
{
  for (var name in vals)
    Game.shaderMan.enableUniform(name, this[name], vals[name]);
}

function createUniform(group)
{
  var ret = {};
  for (var i = 0; i < this.uniforms.length; ++i)
  {
    if (this.uniforms[i].group !== group) continue;
    ret[this.uniforms[i].name] = 0;
  }
  return ret;
}

function draw(mesh)
{
  for (var i = 0; i < mesh.groups.length; ++i)
  {
    var group = mesh.groups[i];
    // set material
    this.setUniforms(group.material);
    if (this.textures.length)
    {
      if (group.texture)
      {
        if (Game.assetMan.assets[group.texture]) this.bindTexture('uTexture', Game.assetMan.assets[group.texture].texture);
        else this.bindTexture('uTexture', Game.assetMan.assets["missing"].texture);
      }
      else this.bindTexture('uTexture', null);
    }

    // render the parts
    for (var p = 0; p < group.parts.length; ++p)
    {
      var part = group.parts[p];
      this.setUniforms(part.uniforms);

      this.bindMesh(part);
      if (part.instanceBuffer)
      {
        this.bindInstanceData(part);
        if (part.indexbuffer)
          ext.angle.drawElementsInstancedANGLE(part.type, part.prims, gl.UNSIGNED_SHORT, 0, part.instanceNumber);
        else
          ext.angle.drawArraysInstancedANGLE(part.type, 0, part.prims, part.instanceNumber);
        return;
      }

      if (part.indexbuffer)
        gl.drawElements(part.type, part.prims, gl.UNSIGNED_SHORT, 0);
      else
        gl.drawArrays(part.type, 0, part.prims);
    }
  }
}