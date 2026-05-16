(function ()
{

  var Texture = function (name)
  {
    this.name = name;
    this.texture = gl.createTexture();
    this.mipmap = false;
  }

  Texture.prototype.load = function (file)
  {
    var tex = this;  // cant use 'this' in the onload line below.
    this.image = new Image();
    this.image.onload = function () { mx.Game.assetMan.processTexture(tex); }
    this.image.onerror = function () { mx.Game.loadingError(tex.name); }
    this.image.src = file;
  }

  Texture.prototype.fromArray = function (w, h, data, format, type)
  {
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, format, w, h, 0, format, type, data);
    if (this.mipmap) { gl.generateMipmap(gl.TEXTURE_2D); }
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  var MeshPNG = function (name)
  {
    this.name = name;
  }

  MeshPNG.prototype.load = function (file)
  {
    var tex = this;  // cant use 'this' in the onload line below.
    this.image = new Image();
    this.image.onload = function () { mx.Game.assetMan.processMeshPNG(tex); }
    this.image.onerror = function () { mx.Game.loadingError(tex.name); }
    this.image.src = file;
  }

  MeshPNG.prototype.loadFromRaw = function (data)
  {
    mx.Game.assetMan.processMeshPNGData(this, data); 
  }

  function RenderSurface(w, h, format, type, data)
  {
    if (!format) format = gl.RGBA;
    if (!type) type = gl.UNSIGNED_BYTE;
    if (!data) data = null;

    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
//    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, format, w, h, 0, format, type, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.surface = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.surface);
    this.surface.width = w;
    this.surface.height = h;
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);

    this.depth = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depth);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.surface.width, this.surface.height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depth);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  RenderSurface.prototype.fromArray = function (w, h, data, format, type)
  {
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, format, w, h, 0, format, type, data);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  RenderSurface.prototype.engage = function ()
  {
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.surface);
  }

  mx.Texture = Texture;
  mx.MeshPNG = MeshPNG;
  mx.RenderSurface = RenderSurface;
})();

