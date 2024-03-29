(function ()
{
  var Material = function(data)
  {
    this.materialoptions = vec4.create();
    this.ambientcolor = vec3.fromValues(0.2, 0.2, 0.2);
    this.diffusecolor = vec3.fromValues(0.8, 0.8, 0.8);
    this.emissivecolor = vec3.create();
    this.specularcolor = vec3.create();
  }

  Material.prototype.loadFromFBX = function(data)
  {
    if (data.AmbientColor) this.ambientcolor = vec3.fromValues(data.AmbientColor[0], data.AmbientColor[1], data.AmbientColor[2]);
    var factor = 1.0;
    if (data.DiffuseFactor) factor = data.DiffuseFactor;
    if (data.DiffuseColor) this.diffusecolor = vec3.fromValues(data.DiffuseColor[0] * factor, data.DiffuseColor[1] * factor, data.DiffuseColor[2] * factor);
    factor = 1.0;
    if (data.EmissiveFactor) factor = data.EmissiveFactor[0];
    if (data.EmissiveColor) this.emissivecolor = vec3.fromValues(data.EmissiveColor[0] * factor, data.EmissiveColor[1] * factor, data.EmissiveColor[2] * factor);
    if (data.Emissive) this.emissivecolor = vec3.fromValues(data.Emissive[0] * factor, data.Emissive[1] * factor, data.Emissive[2] * factor);
    if (data.SpecularColor) this.specularcolor = vec3.fromValues(data.SpecularColor[0] * data.SpecularFactor[0], data.SpecularColor[1] * data.SpecularFactor[0], data.SpecularColor[2] * data.SpecularFactor[0]);
    if (data.ShininessExponent) this.materialoptions[1] = data.ShininessExponent[0];
  }

  // a mesh needs to store set of materials and subsets of meshparts
  // group { material, [parts] }

  var Mesh = function ()
  {
    this.groups = [];
    this.scale = 1.0; // this is only to scale normals up to visible size
    this.worldTransform = mat4.create();
    mat4.identity(this.worldTransform);
  }

  Mesh.prototype.loadFromArrays = function(verts, indexs, attr, type, prims, group, trans, name)
  {
    var part = {};

    if (name) part.name = name;
    part.uniforms = {};
    part.uniforms.partcolor = vec3.create();
    vec3.random(part.uniforms.partcolor);
    vec3.abs(part.uniforms.partcolor, part.uniforms.partcolor);
    if (part.uniforms.partcolor[0] < 0.3) part.uniforms.partcolor[0] += 0.3;
    if (part.uniforms.partcolor[1] < 0.3) part.uniforms.partcolor[1] += 0.3;
    if (part.uniforms.partcolor[2] < 0.3) part.uniforms.partcolor[2] += 0.3;
    if (arguments.length > 6) part.uniforms.localTransform = mat4.clone(trans);
    else
    {
      part.uniforms.localTransform = mat4.create();
      mat4.identity(part.uniforms.localTransform);
    }
    part.uniforms.defaultTransform = mat4.clone(part.uniforms.localTransform);

    part.attributes = attr;
    part.verts = verts;
    part.indexs = indexs;
    part.type = type;
    part.prims = prims;

    part.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, part.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    if (indexs)
    {
      part.prims = indexs.length;
      part.indexbuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, part.indexbuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexs), gl.STATIC_DRAW);
    }

    if (arguments.length > 4 && this.groups.length > group)
      this.groups[group].parts.push(part);
    else
      this.groups.push( { material: new Material(), parts: [part] } );
  }

  function getTransform(obj)
  {
    var trans = mat4.create();
    var t = mat4.create();
    var r = mat4.create();
    var s = mat4.create();
    var rot = quat.create();

    // translate
    mat4.identity(t);
    mat4.translate(t, t, obj.translation);
    // rotation
    quat.fromYawPitchRoll(rot, obj.rotation[1] * 2 * 3.14159 / 360.0, obj.rotation[0] * 2 * 3.14159 / 360.0, obj.rotation[2] * 2 * 3.14159 / 360.0);
    mat4.fromQuat(r, rot);
    // scale
    mat4.identity(s);
    mat4.scale(s, s, obj.scale);
    // combine all into a transformation
    mat4.identity(trans);
    mat4.multiply(trans, r, s);
    mat4.multiply(trans, t, trans);
    return trans;
  }

  Mesh.prototype.loadFromFBX = function(data)
  {
    this.boundingbox = [ data.boundingbox ];

    for (var g = 0; g < data.groups.length; ++g)
    {
      if (!data.groups[g].models) continue;
      for (var m = 0; m < data.groups[g].models.length; ++m)
      {
        this.boundingbox.push(data.groups[g].models[m].boundingbox);
        // create mesh
        this.loadFromArrays(data.groups[g].models[m].mesh.vertexs, data.groups[g].models[m].mesh.indexes, data.attributes, gl.TRIANGLES, data.groups[g].models[m].mesh.indexes.length, g, getTransform(data.groups[g].models[m]), data.groups[g].models[m].name);
      }
      if (data.groups[g].material) this.groups[g].material.loadFromFBX(data.groups[g]);
      if (data.groups[g].texture)
      {
        var name = data.groups[g].texture.lastIndexOf('/');
        if (name == -1) name = data.groups[g].texture.lastIndexOf('\\');
        if (name == -1) name = data.groups[g].texture.split(".")[0];
        else name = data.groups[g].texture.substr(name + 1).split(".")[0];
        mx.Game.loadTextureFile(name, data.groups[g].texture, true);
        this.groups[g].texture = name;
        this.groups[g].material.materialoptions[0] = 1.0;
      }
    }
    if (data.animations)
    {
      // create matrix keys for all animations - animation has layers, has keys
      for (var s in data.animations)
      {
        for (var l in data.animations[s].layers)
        {
          var matrixes = [];
          for (var k in data.animations[s].layers[l].keys)
          {
            matrixes.push(getTransform(data.animations[s].layers[l].keys[k]));
          }
          data.animations[s].layers[l].keys = matrixes;
        }
      }
      this.animations = data.animations;
    }
  }

  Mesh.prototype.setInstances = function(data, number)
  {
    if (!this.instanceBuffer) this.instanceBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    this.instanceNumber = number;
    this.instanceStride =  4 * (data.length / number); // TODO this assumes everything is all floats
  }

  Mesh.prototype.drawNormals = function()
  {
    var ret = new Mesh();

    for (var i = 0; i < this.groups.length; ++i)
    {
      for (var p = 0; p < this.groups[i].parts.length; ++p)
      {
        var part = this.groups[i].parts[p];

        var verts = [];
        for (var v = 0; v < part.verts.length; v += 8)
        {
          verts.push(part.verts[v]);
          verts.push(part.verts[v + 1]);
          verts.push(part.verts[v + 2]);
          verts.push(part.verts[v]     + part.verts[v + 5] *0.1 / this.scale);
          verts.push(part.verts[v + 1] + part.verts[v + 6] *0.1 / this.scale);
          verts.push(part.verts[v + 2] + part.verts[v + 7] *0.1 / this.scale);
        }

        ret.loadFromArrays(verts, null, { 'POS': 0 }, gl.LINES, verts.length / 3.0, 0, part.uniforms.localTransform);
      }
    }

    return ret;
  }

  Mesh.prototype.drawBB = function ()
  {
    var ret = new Mesh();
    var verts = [];

    for (var i = 0; i < this.boundingbox.length; ++i)
    {
      var bb = this.boundingbox[i];
      verts.push(bb.min[0]); verts.push(bb.min[1]); verts.push(bb.min[2]);
      verts.push(bb.max[0]); verts.push(bb.min[1]); verts.push(bb.min[2]);
      verts.push(bb.max[0]); verts.push(bb.min[1]); verts.push(bb.min[2]);
      verts.push(bb.max[0]); verts.push(bb.max[1]); verts.push(bb.min[2]);
      verts.push(bb.max[0]); verts.push(bb.max[1]); verts.push(bb.min[2]);
      verts.push(bb.min[0]); verts.push(bb.max[1]); verts.push(bb.min[2]);
      verts.push(bb.min[0]); verts.push(bb.max[1]); verts.push(bb.min[2]);
      verts.push(bb.min[0]); verts.push(bb.min[1]); verts.push(bb.min[2]);
      verts.push(bb.min[0]); verts.push(bb.min[1]); verts.push(bb.max[2]);
      verts.push(bb.max[0]); verts.push(bb.min[1]); verts.push(bb.max[2]);
      verts.push(bb.max[0]); verts.push(bb.min[1]); verts.push(bb.max[2]);
      verts.push(bb.max[0]); verts.push(bb.max[1]); verts.push(bb.max[2]);
      verts.push(bb.max[0]); verts.push(bb.max[1]); verts.push(bb.max[2]);
      verts.push(bb.min[0]); verts.push(bb.max[1]); verts.push(bb.max[2]);
      verts.push(bb.min[0]); verts.push(bb.max[1]); verts.push(bb.max[2]);
      verts.push(bb.min[0]); verts.push(bb.min[1]); verts.push(bb.max[2]);
      verts.push(bb.min[0]); verts.push(bb.min[1]); verts.push(bb.min[2]);
      verts.push(bb.min[0]); verts.push(bb.min[1]); verts.push(bb.max[2]);
      verts.push(bb.min[0]); verts.push(bb.max[1]); verts.push(bb.min[2]);
      verts.push(bb.min[0]); verts.push(bb.max[1]); verts.push(bb.max[2]);
      verts.push(bb.max[0]); verts.push(bb.max[1]); verts.push(bb.min[2]);
      verts.push(bb.max[0]); verts.push(bb.max[1]); verts.push(bb.max[2]);
      verts.push(bb.max[0]); verts.push(bb.min[1]); verts.push(bb.min[2]);
      verts.push(bb.max[0]); verts.push(bb.min[1]); verts.push(bb.max[2]);

      var t = mat4.create();
      mat4.identity(t);
      ret.loadFromArrays(verts, null, { 'POS': 0 }, gl.LINES, verts.length / 3.0, 0, t);
    }

    return ret;
  }

  Mesh.prototype.drawWireframe = function ()
  {
    var ret = new Mesh();

    for (var i = 0; i < this.groups.length; ++i) {
      for (var p = 0; p < this.groups[i].parts.length; ++p) {
        var part = this.groups[i].parts[p];

        var verts = [];
        for (var v = 0; v < part.indexs.length; v += 3)
        {
          var v1 = part.indexs[v] * 8;
          var v2 = part.indexs[v + 1] * 8;
          var v3 = part.indexs[v + 2] * 8;

          verts.push(part.verts[v1]);
          verts.push(part.verts[v1 + 1]);
          verts.push(part.verts[v1 + 2]);

          verts.push(part.verts[v2]);
          verts.push(part.verts[v2 + 1]);
          verts.push(part.verts[v2 + 2]);

          verts.push(part.verts[v2]);
          verts.push(part.verts[v2 + 1]);
          verts.push(part.verts[v2 + 2]);

          verts.push(part.verts[v3]);
          verts.push(part.verts[v3 + 1]);
          verts.push(part.verts[v3 + 2]);

          verts.push(part.verts[v3]);
          verts.push(part.verts[v3 + 1]);
          verts.push(part.verts[v3 + 2]);

          verts.push(part.verts[v1]);
          verts.push(part.verts[v1 + 1]);
          verts.push(part.verts[v1 + 2]);
        }

        ret.loadFromArrays(verts, null, { 'POS': 0 }, gl.LINES, verts.length / 3.0, 0, part.uniforms.localTransform);
      }
    }

    return ret;
  }

  Mesh.prototype.flip = function (axis1, axis2)
  {
    for (var i = 0; i < this.groups.length; ++i) {
      for (var p = 0; p < this.groups[i].parts.length; ++p) {
        var part = this.groups[i].parts[p];

        for (var v = 0; v < part.verts.length; v += 8)
        {
          let tmp = part.verts[v + axis1];
          part.verts[v + axis1] = part.verts[v + axis2];
          part.verts[v + axis2] = tmp;

          tmp = part.verts[v+5 + axis1];
          part.verts[v+5 + axis1] = part.verts[v+5 + axis2];
          part.verts[v+5 + axis2] = tmp;
        }

        for (var n = 0; n < part.indexs.length; n += 6)
        {
          let tmp = part.indexs[v+1];
          part.indexs[v+1] = part.indexs[v+2];
          part.indexs[v+2] = tmp;
          tmp = part.indexs[v+4];
          part.indexs[v+4] = part.indexs[v+5];
          part.indexs[v+5] = tmp;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, part.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(part.verts), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, part.indexbuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(part.indexs), gl.STATIC_DRAW);
      }
    }    
  }

  Mesh.prototype.negate = function (axis1)
  {
    for (var i = 0; i < this.groups.length; ++i)
    {
      for (var p = 0; p < this.groups[i].parts.length; ++p)
      {
        var part = this.groups[i].parts[p];

        for (var v = 0; v < part.verts.length; v += 8)
        {
          part.verts[v + axis1] *= -1.0;
          part.verts[v + 5 + axis1] *= -1.0;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, part.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(part.verts), gl.STATIC_DRAW);
      }
    }
  }

  Mesh.prototype.rotate = function (axis)
  {
    for (var i = 0; i < this.groups.length; ++i)
    {
      for (var p = 0; p < this.groups[i].parts.length; ++p)
      {
        var part = this.groups[i].parts[p];

        let m = mat4.create();
        mat4.identity(m);
        if (axis == 0) mat4.rotateX(m, m, 3.14159 / 2.0);
        if (axis == 1) mat4.rotateY(m, m, 3.14159 / 2.0);
        if (axis == 2) mat4.rotateZ(m, m, 3.14159 / 2.0);
        mat4.multiply(part.uniforms.defaultTransform, part.uniforms.defaultTransform, m);
      }
    }
  }

  // make a copy of the mesh where the normal is the face normal, let shader do the rest
  Mesh.prototype.drawExploded = function () {
    var ret = new Mesh();

    for (var i = 0; i < this.groups.length; ++i) {
      for (var p = 0; p < this.groups[i].parts.length; ++p) {
        var part = this.groups[i].parts[p];
        var verts = [];

        var n = vec3.create();

        for (var v = 0; v < part.indexs.length; v += 3)
        {
          var v1 = part.indexs[v] * 8;
          var v2 = part.indexs[v + 1] * 8;
          var v3 = part.indexs[v + 2] * 8;

          n[0] = part.verts[v1 + 5] + part.verts[v2 + 5] + part.verts[v3+ 5];
          n[1] = part.verts[v1 + 6] + part.verts[v2 + 6] + part.verts[v3+ 6];
          n[2] = part.verts[v1 + 7] + part.verts[v2 + 7] + part.verts[v3 + 7];
          vec3.normalize(n, n);
          verts.push(part.verts[v1 + 0]);
          verts.push(part.verts[v1 + 1]);
          verts.push(part.verts[v1 + 2]);
          verts.push(part.verts[v1 + 3]);
          verts.push(part.verts[v1 + 4]);
          verts.push(n[0]);
          verts.push(n[1]);
          verts.push(n[2]);
          verts.push(part.verts[v2 + 0]);
          verts.push(part.verts[v2 + 1]);
          verts.push(part.verts[v2 + 2]);
          verts.push(part.verts[v2 + 3]);
          verts.push(part.verts[v2 + 4]);
          verts.push(n[0]);
          verts.push(n[1]);
          verts.push(n[2]);
          verts.push(part.verts[v3 + 0]);
          verts.push(part.verts[v3 + 1]);
          verts.push(part.verts[v3 + 2]);
          verts.push(part.verts[v3 + 3]);
          verts.push(part.verts[v3 + 4]);
          verts.push(n[0]);
          verts.push(n[1]);
          verts.push(n[2]);
        }

        ret.loadFromArrays(verts, null, part.attributes, gl.TRIANGLES, verts.length/8, 0, part.uniforms.localTransform);
      }
    }

    return ret;
  }

  mx.Material = Material;
  mx.Mesh = Mesh;
})();
