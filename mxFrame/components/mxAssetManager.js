(function ()
{
  var AssetManager = function ()
  {
    this.assets = {};
  }

  AssetManager.prototype.processTexture = function (tex)
  {
    gl.bindTexture(gl.TEXTURE_2D, tex.texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.image);
    if (tex.mipmap) { gl.generateMipmap(gl.TEXTURE_2D); }
    gl.bindTexture(gl.TEXTURE_2D, null);
    this.assets[tex.name] = tex;
    mx.Game.loadingDecr(tex.name);
  }

  AssetManager.prototype.processMesh = function (name, mesh)
  {
    var model = new mx.Mesh();
    model.loadFromFBX(JSON.parse(mesh));
    this.assets[name] = model;
    mx.Game.loadingDecr(name);
  }

  AssetManager.prototype.processMeshPNG = function (tex)
  {
    var img = document.createElement('canvas');
    img.width = tex.image.width;
    img.height = tex.image.height;
    var context = img.getContext('2d');
    context.drawImage(tex.image, 0, 0);
    var map = context.getImageData(0, 0, img.width, img.height);
    this.processMeshPNGData(tex, map.data);
  }

  AssetManager.prototype.processMeshPNGData = function(tex, map)
  {
    var len = map.length;
    var txt = "";
    var j = 0;
    var i = 0;
    var binary = false;
    for (i = 0; i < len; i++)
    {
      // stop at the extra padding at the end
      if (binary) { if (j == 0 && map[i + 3] === 0) break; }
      else { if (map[i] === 0) break; }
      // skip alpha channel
      if (j == 3) { j = 0; continue; }
      // get char
      if (!binary && map[i] > 128)
        binary = true;
      txt += String.fromCharCode(map[i]);
      ++j;
    }

    this.processMesh(tex, txt);
  }

  AssetManager.prototype.processMesh = function(tex, txt)
  {
    var model = new mx.Mesh();

    var raw;
    var data;
    try { raw = pako.inflate(txt, { to: "string" }); } catch (err) { raw = txt; }
    try { data = JSON.parse(raw); }
    catch (err) { raw += "}"; data = JSON.parse(raw); }

    model.loadFromFBX(data);

    this.assets[tex.name] = model;
    mx.Game.loadingDecr(tex.name);
  }


  mx.AssetManager = AssetManager;
})();


