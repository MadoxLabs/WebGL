importScripts('pako.js');

onmessage = function(oEvent)
{
  log("Got model data, size " + oEvent.data.length);
  log("Starting");
  process(oEvent.data);
}

var States = {FindObjects: 1, FindTag: 2, ParseGeometry: 3, ParseModel: 4, ParseMaterial: 5, ParseConnections: 6, ParseTexture: 7 };
var groups = [];
var objects = { };
var curmesh = { type: "mesh" };
var curmodel = { type: "model" };
var curmaterial = { type: "material", models: [] };
var curTexture = { type: "texture" };

function done()
{
  for (id in objects) 
  {
    if (objects[id].type === "material") groups[groups.length] = objects[id];
    else if (objects[id].type === "model" && objects[id].mesh)
    {
      if (!objects[id].mesh.vertexs) { log(objects[id].name + " does not have vertex data."); continue; }
      if (!objects[id].mesh.indexes) { log(objects[id].name + " does not have index data."); continue; }
      if (!objects[id].mesh.uvindex) { log(objects[id].name + " does not have uvindex data."); continue; }
      if (!objects[id].mesh.normals) { log(objects[id].name + " does not have normals data."); continue; }

      objects[id].mesh = bake(objects[id].name, objects[id].mesh);
      objects[id].boundingbox = getBB(objects[id])
    }
  }

  var file = {};
  file.attributes = { 'POS': 0, 'TEX0': 12, 'NORM': 20 };
  file.groups = groups;

  // get full bb
  var bb = { };
  for (var g = 0; g < groups.length; ++g)
    for (var m = 0; m < groups[g].models.length; ++m)
    {
      var mbb = groups[g].models[m].boundingbox;
      if (!mbb) continue;
      if (!bb.min) bb.min = [mbb.min[0], mbb.min[1], mbb.min[2]];
      else
      {
        if (mbb.min[0] < bb.min[0]) bb.min[0] = mbb.min[0];
        if (mbb.min[1] < bb.min[1]) bb.min[1] = mbb.min[1];
        if (mbb.min[2] < bb.min[2]) bb.min[2] = mbb.min[2];
      }
      if (!bb.max) bb.max = [mbb.max[0], mbb.max[1], mbb.max[2]];
      else
      {
        if (mbb.max[0] > bb.max[0]) bb.max[0] = mbb.max[0];
        if (mbb.max[1] > bb.max[1]) bb.max[1] = mbb.max[1];
        if (mbb.max[2] > bb.max[2]) bb.max[2] = mbb.max[2];
      }
    }
  file.boundingbox = bb;

  log("Creating data stream");
//  var result = JSON.stringify(file);
  var result = pako.deflate(JSON.stringify(file), { to: "string" });
  log("Done. Resulting data size " + result.length);
  postMessage({ type: 1, result: result });
}

  // bake mesh
  // create non-indexed vertex lists using the given data
  // determine how many verts are exactly the same via hashing?
  // if it is worth it, generate index buffer to optimize
Array.prototype.unique = function ()
{
  var unique = [];
  for (var i = 0; i < this.length; i++) {
    if (unique.indexOf(this[i]) == -1) unique.push(this[i]);
  }
  return unique;
};

function getBB(model)
{
  if (!model.translation) model.translation = [0, 0, 0];
  if (!model.rotation) model.rotation = [0, 0, 0];
  if (!model.scale) model.scale = [1, 1, 1];

  var bb = { min: [model.mesh.vertexs[0], model.mesh.vertexs[1], model.mesh.vertexs[2]], max: [model.mesh.vertexs[0], model.mesh.vertexs[1], model.mesh.vertexs[2]] };
  for (var i = 8; i < model.mesh.vertexs.length; i += 8)
  {
    if (model.mesh.vertexs[i + 0] < bb.min[0]) bb.min[0] = model.mesh.vertexs[i + 0];
    if (model.mesh.vertexs[i + 1] < bb.min[1]) bb.min[1] = model.mesh.vertexs[i + 1];
    if (model.mesh.vertexs[i + 2] < bb.min[2]) bb.min[2] = model.mesh.vertexs[i + 2];
    if (model.mesh.vertexs[i + 0] > bb.max[0]) bb.max[0] = model.mesh.vertexs[i + 0];
    if (model.mesh.vertexs[i + 1] > bb.max[1]) bb.max[1] = model.mesh.vertexs[i + 1];
    if (model.mesh.vertexs[i + 2] > bb.max[2]) bb.max[2] = model.mesh.vertexs[i + 2];
  }
  bb.min[0] = bb.min[0] * model.scale[0] + model.translation[0];
  bb.min[1] = bb.min[1] * model.scale[1] + model.translation[1];
  bb.min[2] = bb.min[2] * model.scale[2] + model.translation[2];
  bb.max[0] = bb.max[0] * model.scale[0] + model.translation[0];
  bb.max[1] = bb.max[1] * model.scale[1] + model.translation[1];
  bb.max[2] = bb.max[2] * model.scale[2] + model.translation[2];
  return bb;
}

function bake(name, mesh)
{
  var vertexs = [];
  var indexes = [];

  // first build a list of all the normals by vertex index.
  // some vertexes have multiple normals that need merging
  var normalsets = {  };  
  var index = 0;
  var normalIndex = 0;
  do {
    var vertIndex = parseFloat(mesh.indexes[index]);
    if (!normalsets[vertIndex])
    {
      normalsets[vertIndex] = { merged: [], sets: [] };
    }
    var normal = [];
    if (mesh.mapping == 0)
    {
      normal.push(parseFloat(mesh.normals[normalIndex]));
      normal.push(parseFloat(mesh.normals[normalIndex + 1]));
      normal.push(parseFloat(mesh.normals[normalIndex + 2]));
    }
    else
    {
      normal.push(parseFloat(mesh.normals[vertIndex]));
      normal.push(parseFloat(mesh.normals[vertIndex + 1]));
      normal.push(parseFloat(mesh.normals[vertIndex + 2]));
    }
    normalsets[vertIndex].sets.push(normal);
    index += 1;
    normalIndex += 3;
  } while (index != mesh.indexes.length);
  
  // go through all the normal sets and merge them to get a true vertex normal
  for (let n in normalsets)
  {
    let x = 0, y = 0, z = 0;
    for (let s = 0; s < normalsets[n].sets.length; ++s)
    {
      x += normalsets[n].sets[s][0];
      y += normalsets[n].sets[s][1];
      z += normalsets[n].sets[s][2];
    }
    x /= normalsets[n].sets.length;
    y /= normalsets[n].sets.length;
    z /= normalsets[n].sets.length;
    let mag = Math.sqrt(x*x + y*y + z*z);
    normalsets[n].merged[0] = x / mag;
    normalsets[n].merged[1] = y / mag;
    normalsets[n].merged[2] = z / mag;
  }

  // as we bake the verts, compare the normal to the vert's merged normal
  // if its less than a threshold off, (30 degrees?), use the merged one
  var vertexstring = [];  // the stringified vertex list uniq to cull duplicate verts
  index = 0;
  normal = 0;
  let mCount = 0, nCount = 0;
  do {
    var vert = []
    var v = parseFloat(mesh.indexes[index]) * 3;
    vert.push(mesh.vertexs[v]);
    vert.push(mesh.vertexs[v + 1]);
    vert.push(mesh.vertexs[v + 2]);
    var v2 = mesh.uvindex[index] * 2;
    vert.push(mesh.uv[v2]);
    vert.push(mesh.uv[v2 + 1]);

    let tmpNormal = [];
    if (mesh.mapping == 0)
    {
      tmpNormal.push(parseFloat(mesh.normals[normal]));
      tmpNormal.push(parseFloat(mesh.normals[normal + 1]));
      tmpNormal.push(parseFloat(mesh.normals[normal + 2]));
    }
    else
    {
      tmpNormal.push(parseFloat(mesh.normals[v]));
      tmpNormal.push(parseFloat(mesh.normals[v + 1]));
      tmpNormal.push(parseFloat(mesh.normals[v + 2]));
    }
    let merged = normalsets[ parseFloat(mesh.indexes[index]) ].merged;
    let dot = merged[0]*tmpNormal[0] + merged[1]*tmpNormal[1] + merged[2]*tmpNormal[2];
    if (Math.acos(dot) < 0.52)
    {
      mCount++;
      vert.push(merged[0]);
      vert.push(merged[1]);
      vert.push(merged[2]);
    }
    else
    {
      nCount++;
      vert.push(tmpNormal[0]);
      vert.push(tmpNormal[1]);
      vert.push(tmpNormal[2]);
    }

    index += 1;
    normal += 3;
    vertexstring.push(JSON.stringify(vert));
  } while (index != mesh.indexes.length);

  // how many are the same?
  var uniq = vertexstring.unique();
  log("Processing " + name + ". Creating index for " + vertexstring.length + " verts. Result is " + uniq.length + " unique verts");
  log("Smoothed normals: " + mCount + ". Normal normals: " + nCount);
  // convert this to an actual vertex list
  var vertexobj = [];
  for (var i = 0; i < uniq.length; ++i) vertexobj.push(JSON.parse(uniq[i]));
  for (var i = 0; i < vertexobj.length; ++i) for (var j = 0; j < 8; ++j) vertexs.push(parseFloat(vertexobj[i][j]));

  // use the vertexstring list as a key to build the index list
  //   to do this we need a convenience reverse lookup array
  var reverse = {};
  for (var i = 0; i < uniq.length; ++i) reverse[uniq[i]] = i;
  for (var i = 0; i < vertexstring.length; ++i) indexes.push(reverse[vertexstring[i]]);

  var ret = { vertexs: vertexs, indexes: indexes };
  return ret;
}

function save()
{
  if (curmesh.id)
  {
    objects[curmesh.id] = curmesh;
    curmesh = { type: "mesh" };
  }
  if (curmodel.id)
  {
    objects[curmodel.id] = curmodel;
    curmodel = { type: "model" };
  }
  if (curTexture.id)
  {
    objects[curTexture.id] = curTexture;
    curTexture = { type: "texture" };
  }
  if (curmaterial.id)
  {
    objects[curmaterial.id] = curmaterial;
    curmaterial = { type: "material", models: [] };
  }

}

function log(msg)
{
  postMessage({ type: 2, result: msg });
}

function datalog(msg)
{
  postMessage({ type: 3, result: msg });
}

var lastmapping = 0;

function process(data)
{
  var lines = data.replace(/\r/g, "").split("\n");
  var state = States.FindObjects; 

  // scan the lines looking for "Objects:"
  // also be on the lookout for the version
  var version = "";
  for (var i = 0; i < lines.length; ++i)
  {
    if (lines[i].indexOf("FBXVersion: ") != -1) { version = lines[i].split(":")[1].trim(); }
    if (lines[i].indexOf("Objects: ") != -1) { state = States.FindTag; break; }
  }
  if (state == States.FindObjects) { log("ERROR: File is not an FBX file."); return; }
  if (version == "6100") process6100(lines);
  else if (version == "7300") process7300(lines);
  else log("ERROR: Madox Pipline does not support FBX ascii " + version);
}

function process6100(lines)
{
  // watch for geometry, model, material, connections
  var state = States.FindTag;
  var objectMode = false;
  for (var i = 0; i < lines.length; ++i)
  {
    datalog(lines[i]);

    if (objectMode)
    {
      if (lines[i].indexOf("ShadingModel: ") != -1) { }
      else if (lines[i].indexOf("Model: ") != -1)
      {
        save();
        curmodel.name = lines[i].replace("::", ",").split(":")[1].split(",")[1].replace(/\"/g, "").trim();
        curmodel.id = curmodel.name;
        curmodel.mesh = curmesh;
        curmesh.id = curmodel.name + ".mesh";
        lastmapping = 0;
        log("Found model: " + curmodel.name);
        state = States.ParseModel;
      }
      else if (lines[i].indexOf("LayerElementMaterial: ") != -1) { }
      else if (lines[i].indexOf("Material: ") != -1)
      {
        save();
        curmaterial.name = lines[i].replace("::", ",").split(":")[1].split(",")[1].replace(/\"/g, "").trim();
        curmaterial.id = curmaterial.name;
        log("Found material: " + curmaterial.name);
        state = States.ParseMaterial;
      }
      else if (lines[i].indexOf("Texture: ") != -1) // TODO
      {
        save();
        curTexture.id = lines[i].split(":")[1].split(",")[0].trim();
        state = States.ParseTexture;
      }
      else if (lines[i].indexOf("Relations:") != -1) 
      {
        objectMode = false;
      }
    }
    else if (lines[i].indexOf("Objects:") != -1) 
    {
      objectMode = true;
    }
    else if (lines[i].indexOf("Connections: ") != -1)
    {
      save();
      state = States.ParseConnections;
    }

    if (state == States.ParseModel)
    {
      if (lines[i].indexOf("Lcl Rotation") != -1)
      {
        var values = lines[i].trim().split(",");
        curmodel.rotation = [parseFloat(values[3]), parseFloat(values[4]), parseFloat(values[5])];
      }
      else if (lines[i].indexOf("Lcl Translation") != -1)
      {
        var values = lines[i].trim().split(",");
        curmodel.translation = [parseFloat(values[3]), parseFloat(values[4]), parseFloat(values[5])];
      }
      else if (lines[i].indexOf("Lcl Scaling") != -1)
      {
        var values = lines[i].trim().split(",");
        curmodel.scale = [parseFloat(values[3]), parseFloat(values[4]), parseFloat(values[5])];
      }
      else if (lines[i].indexOf("Vertices: ") != -1)
      {
        if (curmesh.vertexs) { log("ERROR: multiple vertexes at line " + i); continue; }

        var values = [];
        values = values.concat(lines[i].split(":")[1].split(","));
        for (++i; i < lines.length; ++i)
        {
          if (lines[i].indexOf(':') != -1) break;
          values.pop();
          values = values.concat(lines[i].split(","));
        }
        --i; // redo the line that ended us
        curmesh.vertexs = values;
      }
      else if (lines[i].indexOf("PolygonVertexIndex: ") != -1)
      {
        if (curmesh.indexs) { log("ERROR: multiple indexes at line " + i); continue; }

        var values = [];
        values = values.concat(lines[i].split(":")[1].split(","));
        for (++i; i < lines.length; ++i)
        {
          if (lines[i].indexOf(':') != -1) break;
          values.pop();
          values = values.concat(lines[i].split(","));
        }
        --i; // redo the line that ended us
        // check that its trilist and flip the negative ones
        for (var j = 2; j < values.length; j += 3)
        {
          if (values[j] >= 0) { log("ERROR: mesh is not a triangle list at line " + i); break; }
          values[j] = (values[j] * -1) - 1;
        }
        curmesh.indexes = values;
      }
      else if (lines[i].indexOf("MappingInformationType: ") != -1)
      {
        if (lines[i].indexOf("ByVertice") != -1) lastmapping = 1;
        else lastmapping = 0;
      }
      else if (lines[i].indexOf("Normals: ") != -1)
      {
        if (curmesh.normals) { log("ERROR: multiple normals at line " + i); continue; }

        var values = [];
        values = values.concat(lines[i].split(":")[1].split(","));
        for (++i; i < lines.length; ++i)
        {
          if (lines[i].indexOf(':') != -1) break;
          values.pop();
          values = values.concat(lines[i].split(","));
        }
        --i; // redo the line that ended us
        curmesh.normals = values;
        curmesh.mapping = lastmapping;
      }
      else if (lines[i].indexOf("LayerElementUV: ") != -1) { }
      else if (lines[i].indexOf("UV: ") != -1)
      {
        if (curmesh.uv) { log("ERROR: multiple UVs at line " + i); continue; }

        var values = [];
        values = values.concat(lines[i].split(":")[1].split(","));
        for (++i; i < lines.length; ++i)
        {
          if (lines[i].indexOf(':') != -1) break;
          values.pop();
          values = values.concat(lines[i].split(","));
        }
        --i; // redo the line that ended us
        curmesh.uv = values;
      }
      else if (lines[i].indexOf("UVIndex: ") != -1)
      {
        var values = [];
        values = values.concat(lines[i].split(":")[1].split(","));
        for (++i; i < lines.length; ++i)
        {
          if (lines[i].indexOf(':') != -1) break;
          values.pop();
          values = values.concat(lines[i].split(","));
        }
        --i; // redo the line that ended us
        curmesh.uvindex = values;
      }
    }
    else if (state == States.ParseMaterial)
    {
      if (lines[i].indexOf("Property: ") != -1)
      {
        var values = lines[i].split(":")[1].trim().split(",");
        curmaterial[values[0].replace(/\"/g, "")] = values.slice(3, 6);
      }
    }
    else if (state == States.ParseTexture) // TODO
    {
      if (lines[i].indexOf("RelativeFilename") != -1)
      {
        var values = lines[i].trim().split("\"");
        var parts = values[1].trim().split("\\");
        curTexture.file = parts[parts.length - 1];
        log("Found texture: " + curTexture.file);
      }
    }
    else if (state == States.ParseConnections)
    {
      if (lines[i].indexOf("Connect: ") != -1)
      {
        var values = lines[i].replace(/::/g, ",").split(",");
        var obj1 = objects[values[2].replace(/\"/g, "").trim()];
        var obj2 = objects[values[4].replace(/\"/g, "").trim()];
        if (!obj1 || !obj2) continue;

        if (obj1.type === "material" && obj2.type === "model") obj1.models[obj1.models.length] = obj2;
        else if (obj2.type === "material" && obj1.type === "texture") obj2.texture = obj1.file;
      }
    }
  }

  save();
  done();
}

function process7300(lines)
{
  // watch for geometry, model, material, connections
  var state = States.FindTag;
  for (var i = 0; i < lines.length; ++i)
  {
    datalog(lines[i]);

    if (lines[i].indexOf("Geometry: ") != -1)
    {
      save();
      curmesh.id = lines[i].split(":")[1].split(",")[0].trim();
      lastmapping = 0;
      state = States.ParseGeometry;
    }
    else if (lines[i].indexOf("ShadingModel: ") != -1) {}
    else if (lines[i].indexOf("Model: ") != -1)
    {
      save();
      curmodel.id = lines[i].split(":")[1].split(",")[0].trim();
      curmodel.name = lines[i].replace("::", ",").split(":")[1].split(",")[2].replace(/\"/g, "").trim();
      log("Found model: " + curmodel.name);
      state = States.ParseModel;
    }
    else if (lines[i].indexOf("LayerElementMaterial: ") != -1) { }
    else if (lines[i].indexOf("Material: ") != -1)
    {
      save();
      curmaterial.id = lines[i].split(":")[1].split(",")[0].trim();
      curmaterial.name = lines[i].replace("::",",").split(":")[1].split(",")[2].replace(/\"/g,"").trim();
      log("Found material: " + curmaterial.name);
      state = States.ParseMaterial;
    }
    else if (lines[i].indexOf("Connections: ") != -1)
    {
      save();
      state = States.ParseConnections;
    }
    else if (lines[i].indexOf("Texture: ") != -1)
    {
      save();
      curTexture.id = lines[i].split(":")[1].split(",")[0].trim();
      state = States.ParseTexture;
    }

    if (state == States.ParseConnections)
    {
      if (lines[i].indexOf("C: ") != -1)
      {
        var values = lines[i].split(",");
        var obj1 = objects[values[1].trim()];
        var obj2 = objects[values[2].trim()];
        if (!obj1 || !obj2) continue;

        if (obj1.type === "mesh" && obj2.type === "model") { log("Model " + obj2.name + " has geometry"); obj2.mesh = obj1; }
        else if (obj1.type === "material" && obj2.type === "model") obj1.models[obj1.models.length] = obj2;
        else if (obj2.type === "material" && obj1.type === "texture") obj2.texture = obj1.file;
    }
    }

    else if (state == States.ParseTexture)
    {
      if (lines[i].indexOf("RelativeFilename") != -1)
      {
        var values = lines[i].trim().split("\"");
        var parts = values[1].trim().split("\\");
        curTexture.file = parts[parts.length-1];
        log("Found texture: " + curTexture.file);
      }
    }
    else if (state == States.ParseModel)
    {
      if (lines[i].indexOf("Lcl Rotation") != -1) {
        var values = lines[i].trim().split(",");
        curmodel.rotation = [parseFloat(values[4]), parseFloat(values[5]), parseFloat(values[6])];
      }
      if (lines[i].indexOf("Lcl Translation") != -1)
      {
        var values = lines[i].trim().split(",");
        curmodel.translation = [parseFloat(values[4]), parseFloat(values[5]), parseFloat(values[6])];
      }
      else if (lines[i].indexOf("Lcl Scaling") != -1)
      {
        var values = lines[i].trim().split(",");
        curmodel.scale = [parseFloat(values[4]), parseFloat(values[5]), parseFloat(values[6])];
      }
    }

    else if (state == States.ParseMaterial)
    {
      if (lines[i].indexOf("P: ") != -1)
      {
        var values = lines[i].split(":")[1].trim().split(",");
        curmaterial[values[0].replace(/\"/g, "")] = values.slice(4, 7);
      }
    }

    else if (state == States.ParseGeometry)
    {
      if (lines[i].indexOf("Vertices: ") != -1)
      {
        if (curmesh.vertexs) { log("ERROR: multiple vertexes at line " + i); continue; }

        var num = lines[i].split("*")[1].split(" ")[0];
        var values = [];
        // get lines until values is num
        for (++i; i < lines.length; ++i)
        {
          if (lines[i].indexOf('}') != -1) break;
          var a = lines[i].indexOf('a:');
          if (a != -1) lines[i] = lines[i].substr(a + 3);
          values.pop();
          values = values.concat(lines[i].split(","));
          if (values.length == num) break;
        }
        curmesh.vertexs = values;
      }
      else if (lines[i].indexOf("PolygonVertexIndex: ") != -1)
      {
        if (curmesh.indexs) { log("EROR: multiple indexes at line " + i); continue; }

        var num = lines[i].split("*")[1].split(" ")[0];
        var values = [];
        // get lines until values is num
        for (++i; i < lines.length; ++i)
        {
          if (lines[i].indexOf('}') != -1) break;
          var a = lines[i].indexOf('a:');
          if (a != -1) lines[i] = lines[i].substr(a + 3);
          values.pop();
          values = values.concat(lines[i].split(","));
          if (values.length == num) break;
        }
        // check that its trilist and flip the negative ones
        for (var j = 2; j < values.length; j += 3)
        {
          if (values[j] >= 0) { log("ERROR: mesh is not a triangle list at line " + i); break; }
          values[j] = (values[j] * -1) - 1;
        }
        curmesh.indexes = values;
      }
      else if (lines[i].indexOf("MappingInformationType: ") != -1)
      {
        if (lines[i].indexOf("ByVertice") != -1) lastmapping = 1;
        else lastmapping = 0;
      }
      else if (lines[i].indexOf("Normals: ") != -1)
      {
        if (curmesh.normals) { log("ERROR: multiple normals at line " + i); continue; }

        var num = lines[i].split("*")[1].split(" ")[0];
        var values = [];
        // get lines until values is num
        for (++i; i < lines.length; ++i)
        {
          if (lines[i].indexOf('}') != -1) break;
          var a = lines[i].indexOf('a:');
          if (a != -1) lines[i] = lines[i].substr(a + 3);
          values.pop();
          values = values.concat(lines[i].split(","));
          if (values.length == num) break;
        }
        curmesh.normals = values;
        curmesh.mapping = lastmapping;
      }
      else if (lines[i].indexOf("LayerElementUV: ") != -1) { }
      else if (lines[i].indexOf("UV: ") != -1)
      {
        if (curmesh.uv) { log("ERROR: multiple UVs at line " + i); continue; }

        var num = lines[i].split("*")[1].split(" ")[0];
        var uvvalues = [];
        var values = [];
        // get lines until values is num
        for (++i; i < lines.length; ++i)
        {
          if (lines[i].indexOf('}') != -1) break;
          var a = lines[i].indexOf('a:');
          if (a != -1) lines[i] = lines[i].substr(a + 3);
          uvvalues.pop();
          uvvalues = uvvalues.concat(lines[i].split(","));
          if (uvvalues.length == num) break;
        }
        curmesh.uv = uvvalues;
      }
      else if (lines[i].indexOf("UVIndex: ") != -1)
      {
        num = lines[i].split("*")[1].split(" ")[0];
        // get lines until values is num
        for (++i; i < lines.length; ++i)
        {
          if (lines[i].indexOf('}') != -1) break;
          var a = lines[i].indexOf('a:');
          if (a != -1) lines[i] = lines[i].substr(a + 3);
          values.pop();
          values = values.concat(lines[i].split(","));
          if (values.length == num) break;
        }
        curmesh.uvindex = values;
      }
    }
  }
  save();
  done();
}
