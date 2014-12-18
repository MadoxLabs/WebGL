var AssetManager = function ()
{
  this.assets = {};
}

AssetManager.prototype.processTexture = function(tex)
{
  gl.bindTexture(gl.TEXTURE_2D, tex.texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.image);
  if (tex.mipmap) { gl.generateMipmap(gl.TEXTURE_2D); }
  gl.bindTexture(gl.TEXTURE_2D, null);
  this.assets[tex.name] = tex;
  Game.loadingDecr();
}

AssetManager.prototype.processMesh = function(name, mesh)
{
  var model = new Mesh();
  model.loadFromFBX(JSON.parse(mesh));
  this.assets[name] = model;
  Game.loadingDecr();
}

AssetManager.prototype.processMeshPNG = function (tex)
{
  var model = new Mesh();

  var img = document.createElement('canvas');
  img.width = tex.image.width;
  img.height = tex.image.height;
  var context = img.getContext('2d');
  context.drawImage(tex.image, 0, 0);
  var map = context.getImageData(0, 0, img.width, img.height);
  var len = map.data.length;
  var txt = "";
  var j = 0;
  var i = 0;
  var binary = false;
  for (i = 0; i < len; i++)
  {
    // stop at the extra padding at the end
    if (binary) { if (j == 0 && map.data[i + 3] === 0) break; }
    else        { if (map.data[i] === 0) break; }
    // skip alpha channel
    if (j == 3) { j = 0; continue; }
    // get char
    if (!binary && map.data[i] > 128)
      binary = true;
    txt += String.fromCharCode(map.data[i]);
    ++j;
  }

  var data;

  try { data = pako.inflate(txt, { to: "string" }); } catch (err) { data = txt; }

  try { model.loadFromFBX(JSON.parse(data)); }
  catch (err) { data += "}"; model.loadFromFBX(JSON.parse(data)); }

  this.assets[tex.name] = model;
  Game.loadingDecr();
}
