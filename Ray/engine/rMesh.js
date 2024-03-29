﻿(function ()
{
  class rImage
  {
    constructor(name, file)
    {
      this.name = name;
      this.file = file;
      this.isImage = true;

      if (ray.worker)
      {
        console.log("WORKER "+ray.worker+" load image "+name);
        let data = ray.World.imagedata[name];
        if (data) 
        {
          this.width = data.width;
          this.height = data.height;
          this.bytes = data.buffer; //new Uint8Array(data.buffer);    
        }
      }
      else
      {
        var obj = this;
        this.image = new Image();
        ray.World.incrLoading();
        this.image.onload = function () { console.log("loading image - ok"); ray.World.decrLoading(); obj.processDataFromImage(); }
        this.image.onerror = function () { console.log("loading image - bad"); ray.World.decrLoading(); ray.World.loadingError(obj.name); }
        this.image.src = file;        
      }
    }        

    processDataFromImage()
    {
      this.width = this.image.width;
      this.height = this.image.height;

      // get the bytes
      var img = document.createElement('canvas');
      img.width = this.width;
      img.height = this.height;
      var context = img.getContext('2d');
      context.drawImage(this.image, 0, 0);
      let bytes = context.getImageData(0, 0, img.width, img.height).data;

      // create a shared buffer
      if (false)
      {
        this.buffer = new SharedArrayBuffer(bytes.length);
        this.bytes = new Uint8Array(this.buffer);  
      }
      else
      {
        this.bytes = new Uint8ClampedArray(bytes.length);
      }
      // load it with the bytes
      this.bytes.set(bytes);
    }

    getBufferForWorker()
    {
      let ret = new Uint8ClampedArray(this.bytes);
      return ret;
    }

    sample(x, y)
    {
      let offset = ((y * this.width) + x) * 4;
      return ray.RGBColour(this.bytes[offset]/255, this.bytes[offset+1]/255, this.bytes[offset+2]/255); // ignore alpha
    }
  }

  class rMesh
  {
    constructor(name, file)
    {
      this.name = name;
      this.file = file;
      this.isMesh = true;

      if (ray.worker)
      {        
        console.log("WORKER "+ray.worker+" load mesh "+name);
        let data = ray.World.meshdata[name];
        if (data) this.loadFromFBX(data);
      }
      else
      {
        var mesh = this; 
        this.image = new Image();
        ray.World.incrLoading();
        this.image.onload = function () { console.log("loading mesh - ok"); ray.World.decrLoading(); mesh.processMeshPNG(); }
        this.image.onerror = function () { console.log("loading mesh - bad"); ray.World.decrLoading(); ray.World.loadingError(mesh.name); }
        this.image.src = file;        
      }
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
      this.meshdata = data;

      // computer the stride
      let step = 0;
      if ('POS' in data.attributes) step += 3;
      if ('TEX0' in data.attributes) step += 2;
      if ('NORM' in data.attributes) step += 3;
      
      let obj = new ray.Group();
      for (let g in data.groups)
      {
        let group = data.groups[g];

        // get the material
        let mat = new ray.Material();
        mat.ambient = group.AmbientFactor ? group.AmbientFactor[0] : ( group.AmbientColor ? group.AmbientColor[0] : 1);
        mat.diffuse = group.DiffuseFactor ? group.DiffuseFactor[0] : 1;
        mat.specular = group.SpecularFactor[0];
        mat.shininess = group.Shininess[0];
        mat.colour = ray.RGBColour(group.DiffuseColor[0],group.DiffuseColor[1],group.DiffuseColor[2]);
        mat.reflective = group.ReflectionFactor ? group.ReflectionFactor[0] : 0;
        mat.transparency = group.TransparencyFactor ? group.TransparencyFactor[0] : 0;
        mat.transmit = mat.transparency;
        mat.refraction = group.refraction ? group.refraction[0] : 1;
        mat.name = group.name;
        ray.World.materials[mat.name] = mat;

        // handle a texture
        if (group.texture)
        {
          // create an image
          let img = ray.World.images[group.texture];
          if (!img)
          {
            img = new ray.Image(group.texture,  "/Ray/assets/"+group.texture);
            ray.World.images[group.texture] = img;
          }

          // create a texture
          let tex = ray.World.textures[group.texture];
          if (!tex)
          {
            let def = { name: group.texture, type: "image", image: group.texture };
            ray.World.parseTexture(def);
            tex = ray.World.textures[group.texture];
          }

          // create a pattern
          let pattern = ray.World.patterns[group.name];
          if (!pattern)
          {
            let def = { name: group.name, type: "map", mapping: "baked", "texture": group.texture };
            pattern = ray.World.parsePattern(def);
            ray.World.patterns[pattern.name] = pattern;
          }
          mat.pattern = pattern;
        }

        // parse meshes
        for (let m in group.models)
        {
          let subobj = new ray.Group();
          subobj.material = mat;
          subobj.materialSelf = mat;
          subobj.blending = "self";

          let model = group.models[m];
          let mesh = model.mesh;
          let offset = 0;
          // each triangle is 3 indexes. loop over indexes, 3 at a time.
          for (let i = 0; i < mesh.indexes.length; i += 3)
          {
            let t = new ray.Triangle();
            // each triangle has 3 points so loop 3 times
            for (let k = 0; k < 3; ++k)
            {
              offset = mesh.indexes[i+k] * step; // get the index of this point, to get the offset into the vertex data, multiply by the stride

              let j = 0;
              if ('POS' in data.attributes)
              {
                t.addPoint( new ray.Point(mesh.vertexs[offset + j + 0],
                                             mesh.vertexs[offset + j + 1],
                                             mesh.vertexs[offset + j + 2]) );
                j += 3;                                           
              }
              if ('TEX0' in data.attributes)
              {
                t.uvs.push( new ray.Point(mesh.vertexs[offset + j + 0],
                                          mesh.vertexs[offset + j + 1], 0) );
                j += 2;                                        
              }
              if (ray.World.options.smoothing && ('NORM' in data.attributes))
              {
                t.vertNormals.push( new ray.Point(mesh.vertexs[offset + j + 0],
                                                  mesh.vertexs[offset + j + 1],
                                                  mesh.vertexs[offset + j + 2]) );
                j += 3;
              }  
              offset += step;
            }
            t.setDirty();
            subobj.addChild(t);
          }
          ray.World.split(subobj);

          let translate = ray.Matrix.translation(model.translation[0], model.translation[1], model.translation[2]);
          let scale = ray.Matrix.scale(model.scale[0], model.scale[1], model.scale[2]);
          let rot = ray.Matrix.fromYawPitchRoll(model.rotation[1] * 2 * 3.14159 / 360.0, model.rotation[0] * 2 * 3.14159 / 360.0, model.rotation[2] * 2 * 3.14159 / 360.0);
  
          let trans = ray.Matrix.multiply(rot, scale);
          trans = ray.Matrix.multiply(translate, trans);
          subobj.setTransform(trans);
          
          subobj.aabb = new ray.AABB();
          subobj.aabb.min = ray.Point( model.boundingbox.min[0], model.boundingbox.min[1], model.boundingbox.min[2] );
          subobj.aabb.max = ray.Point( model.boundingbox.max[0], model.boundingbox.max[1], model.boundingbox.max[2] );

          obj.addChild(subobj);
        }
      }

      obj.aabb = new ray.AABB();
      obj.aabb.min = ray.Point( data.boundingbox.min[0], data.boundingbox.min[1], data.boundingbox.min[2] );
      obj.aabb.max = ray.Point( data.boundingbox.max[0], data.boundingbox.max[1], data.boundingbox.max[2] );

      this.mesh = obj;
      this.mesh.isMeshGroup = true;

      // attributes: POS, TEX0, NORM (what else?) - existance of data.
      // boundingbox: min max arrays of 3 numbers
      // groups array
      //   material info
      //   name
      //   texture file
      //   "models"
      //      boundingbox
      //      rotation, scale, translation - arrays of 3 numbers
      //      mesh
      //         indexes, verts
    }
  }

  ray.Mesh = function (n,f) { return new rMesh(n,f); }
  ray.Image = function (n,f) { return new rImage(n,f); }

})();
