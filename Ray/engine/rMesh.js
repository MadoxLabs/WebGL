(function ()
{

  class rMesh
  {
    constructor(name, file)
    {
      this.name = name;
      this.file = file;
      this.isMesh = true;

      var mesh = this; 
      this.image = new Image();
      ray.World.incrLoading();
      this.image.onload = function () { ray.World.decrLoading(); mesh.processMeshPNG(); }
      this.image.onerror = function () { ray.World.decrLoading(); ray.World.loadingError(mesh.name); }
      this.image.src = file;
    }

    processMeshPNG()
    {
      var img = document.createElement('canvas');
      img.width = this.image.width;
      img.height = this.image.height;
      var context = img.getContext('2d');
      context.drawImage(this.image, 0, 0);
      var map = context.getImageData(0, 0, img.width, img.height);
      this.processMeshPNGData(map.data);
    }

    processMeshPNGData(map)
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

      var raw;
      var data;
      try { raw = pako.inflate(txt, { to: "string" }); } catch (err) { raw = txt; }
      try { data = JSON.parse(raw); }
      catch (err) { raw += "}"; data = JSON.parse(raw); }

      this.loadFromFBX(data);
    }

    loadFromFBX(data)
    {
    }
  }

  ray.Mesh = function (n,f) { return new rMesh(n,f); }

})();
