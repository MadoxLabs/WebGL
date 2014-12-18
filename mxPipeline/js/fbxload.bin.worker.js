importScripts('pako.js');
importScripts('glMatrix.js');

onmessage = function(oEvent)
{
  process(oEvent.data);
}

var States = {FindObjects: 1, FindTag: 2, ParseGeometry: 3, ParseModel: 4, ParseMaterial: 5, ParseConnections: 6, ParseTexture: 7 };
var groups = [];
var objects = { };
var curmesh = { type: "mesh" };
var curmodel = { type: "model" };
var curmaterial = { type: "material", models: [] };
var curTexture = { type: "texture" };

function log(msg)
{
  postMessage({ type: 2, result: msg });
}
function debug(msg)
{
  postMessage({ type: 3, result: indent + msg });
}

var indent = "";

var intbuffer = new ArrayBuffer(Uint8Array.BYTES_PER_ELEMENT * 4);
var intbytes = new Int8Array(intbuffer);
var intview = new Int32Array(intbuffer);

function getInteger(cursor)
{
  intbytes[0] = cursor.data[cursor.offset + 0];
  intbytes[1] = cursor.data[cursor.offset + 1];
  intbytes[2] = cursor.data[cursor.offset + 2];
  intbytes[3] = cursor.data[cursor.offset + 3];
  cursor.offset += 4;
  return intview[0];
}

var floatbuffer = new ArrayBuffer(Uint8Array.BYTES_PER_ELEMENT * 4);
var floatbytes = new Uint8Array(floatbuffer);
var floatview = new Float32Array(floatbuffer);

function getFloat(cursor)
{
  floatbytes[0] = cursor.data[cursor.offset + 0];
  floatbytes[1] = cursor.data[cursor.offset + 1];
  floatbytes[2] = cursor.data[cursor.offset + 2];
  floatbytes[3] = cursor.data[cursor.offset + 3];
  cursor.offset += 4;
  return floatview[0];
}

var wfloatbuffer = new ArrayBuffer(Uint8Array.BYTES_PER_ELEMENT * 8);
var wfloatbytes = new Uint8Array(wfloatbuffer);
var wfloatview = new Float64Array(wfloatbuffer);

function getWideFloat(cursor)
{
  wfloatbytes[0] = cursor.data[cursor.offset + 0];
  wfloatbytes[1] = cursor.data[cursor.offset + 1];
  wfloatbytes[2] = cursor.data[cursor.offset + 2];
  wfloatbytes[3] = cursor.data[cursor.offset + 3];
  wfloatbytes[4] = cursor.data[cursor.offset + 4];
  wfloatbytes[5] = cursor.data[cursor.offset + 5];
  wfloatbytes[6] = cursor.data[cursor.offset + 6];
  wfloatbytes[7] = cursor.data[cursor.offset + 7];
  cursor.offset += 8;
  return wfloatview[0];
}

function getShort(cursor)
{
  ret = cursor.data[cursor.offset];
  cursor.offset += 1;
  return ret;
}

function getChar(cursor)
{
  ret = cursor.data[cursor.offset];
  cursor.offset += 1;
  return String.fromCharCode(ret)[0];
}

function getString(cursor)
{
  var len = getShort(cursor);
  var result = "";
  for (var i = 0; i < len; i++)
    result += String.fromCharCode(cursor.data[cursor.offset+i]);

  cursor.offset += len;
  return result;
}

function getLongString(cursor)
{
  var len = getInteger(cursor);
  var result = "";
  for (var i = 0; i < len; i++)
    result += String.fromCharCode(cursor.data[cursor.offset + i]);

  cursor.offset += len;
  return result;
}

var wintbuffer = new ArrayBuffer(Uint8Array.BYTES_PER_ELEMENT * 4);
var wintbytes = new Uint8Array(wintbuffer);
var wintview = new Uint32Array(wintbuffer);

function getWideInteger(cursor)
{
  wintbytes[0] = cursor.data[cursor.offset + 0];
  wintbytes[1] = cursor.data[cursor.offset + 1];
  wintbytes[2] = cursor.data[cursor.offset + 2];
  wintbytes[3] = cursor.data[cursor.offset + 3];
//  wintbytes[4] = cursor.data[cursor.offset + 4];
//  wintbytes[5] = cursor.data[cursor.offset + 5];
//  wintbytes[6] = cursor.data[cursor.offset + 6];
//  wintbytes[7] = cursor.data[cursor.offset + 7];
  cursor.offset += 8;
  return wintview[0];
}

function getSmallInteger(cursor)
{
  var i = 0, v;
  i = i * 256; v = cursor.data[cursor.offset + 1]; i += v;
  i = i * 256; v = cursor.data[cursor.offset + 0]; i += v;
  cursor.offset += 2;
  return i;
}

function getBool(cursor)
{
  ret = cursor.data[cursor.offset];
  cursor.offset += 1;
  return ret ? 1 : 0;
}

function getData(cursor)
{
  var len = getInteger(cursor);
  cursor.offset += len;
  return " (" + len + " bytes)";
}

function getArrayFloat(cursor)
{
  var len = getInteger(cursor);
  var encoding = getInteger(cursor);
  var encodelen = getInteger(cursor);

  var mycursor = cursor;
  if (encoding) {
    var zip = new Uint8Array(encodelen);
    for (var i = 0; i < encodelen; ++i) zip[i] = cursor.data[cursor.offset + i];
    var unzip = pako.inflate(zip);
    cursor.offset += encodelen;
    mycursor = { data: unzip, offset: 0 }
  }

  var ret = [];
  for (var i = 0; i < len; ++i) {
    ret.push(getFloat(mycursor));
  }
  return ret;
}

function getArrayWideFloat(cursor)
{
  var len = getInteger(cursor);
  var encoding = getInteger(cursor);
  var encodelen = getInteger(cursor);

  var mycursor = cursor;
  if (encoding) {
    var zip = new Uint8Array(encodelen);
    for (var i = 0; i < encodelen; ++i) zip[i] = cursor.data[cursor.offset + i];
    var unzip = pako.inflate(zip);
    cursor.offset += encodelen;
    mycursor = { data: unzip, offset: 0 }
  }

  var ret = [];
  for (var i = 0; i < len; ++i) {
    ret.push(getWideFloat(mycursor));
  }
  return ret;
}

function getArrayInteger(cursor)
{
  var len = getInteger(cursor);
  var encoding = getInteger(cursor);
  var encodelen = getInteger(cursor);

  var mycursor = cursor;
  if (encoding)
  {
    var zip = new Uint8Array(encodelen);
    for (var i = 0; i < encodelen; ++i) zip[i] = cursor.data[cursor.offset + i];
    var unzip = pako.inflate(zip);
    cursor.offset += encodelen;
    mycursor = { data: unzip, offset: 0 }
  }

  var ret = [];
  for (var i = 0; i < len; ++i) {
    ret.push(getInteger(mycursor));
  }
  return ret;
}

function getArrayWideInteger(cursor)
{
  var len = getInteger(cursor);
  var encoding = getInteger(cursor);
  var encodelen = getInteger(cursor);

  var mycursor = cursor;
  if (encoding) {
    var zip = new Uint8Array(encodelen);
    for (var i = 0; i < encodelen; ++i) zip[i] = cursor.data[cursor.offset + i];
    var unzip = pako.inflate(zip);
    cursor.offset += encodelen;
    mycursor = { data: unzip, offset: 0 }
  }

  var ret = [];
  for (var i = 0; i < len; ++i) {
    ret.push(getWideInteger(mycursor));
  }
  return ret;
}

function getArrayBool(cursor)
{
  var len = getInteger(cursor);
  var encoding = getInteger(cursor);
  var encodelen = getInteger(cursor);

  var mycursor = cursor;
  if (encoding) {
    var zip = new Uint8Array(encodelen);
    for (var i = 0; i < encodelen; ++i) zip[i] = cursor.data[cursor.offset + i];
    var unzip = pako.inflate(zip);
    cursor.offset += encodelen;
    mycursor = { data: unzip, offset: 0 }
  }

  var ret = [];
  for (var i = 0; i < len; ++i) {
    ret.push(getBool(mycursor));
  }
  return ret;
}

function parseObjectRecord(obj, cursor)
{
  var buf = "";

  var start = cursor.offset;
  var end = getInteger(cursor);    // end offset
  var len = getInteger(cursor);    // num properties
  var bytelen = getInteger(cursor); // properties byte length

  var name = getString(cursor);
  buf += name;
  if (obj[name])
  {
    if (Array.isArray(obj[name]) == false)
    {
      var tmp = obj[name];
      obj[name] = [];
      obj[name].push(tmp);
    }
    var tmp = {};
    obj[name].push(tmp);
    obj = tmp;
  }
  else
  {
    obj[name] = {};
    obj = obj[name];
  }

  for (var i = 0; i < len; ++i)
  {
    if (buf.length > 1000)  {     debug(buf);     buf = "";    }
    if (!i) buf += ": ";
    if (i) buf += ", ";
    var val = parsePropertyRecord(cursor);
    buf += val.toString();
    obj[i] = val;
  }
  debug(buf);

  if (!end)    return false;

  if (cursor.offset != end)
  {
    debug("{");
    indent += "  ";
    while (cursor.offset != end)
    {
      parseObjectRecord(obj, cursor);
      if (end - cursor.offset == 13)
      {
        for (var i = 0; i < 13; ++i)
          if (cursor.data[cursor.offset + i] != 0) debug("< expected null >");
        cursor.offset += 13;
      }
    }

    indent = indent.substr(0, indent.length - 2);
    debug("}");
  }

  return true;
}

function parsePropertyRecord(cursor)
{
  var type = getChar(cursor);
  if (type == 'Y')      return (/* "(small integer) "  + */ getSmallInteger(cursor));
  else if (type == 'C') return (/* "(bool) "           + */ getBool(cursor));
  else if (type == 'I') return (/* "(integer) "        + */ getInteger(cursor));
  else if (type == 'F') return (/* "(float) "          + */ getFloat(cursor));
  else if (type == 'D') return (/* "(wide float) "     + */ getWideFloat(cursor));
  else if (type == 'L') return (/* "(wide integer) "   + */ getWideInteger(cursor));
  else if (type == 'f') return (/* "(float[]) "        + */ getArrayFloat(cursor));
  else if (type == 'd') return (/* "(wide float[]) "   + */ getArrayWideFloat(cursor));
  else if (type == 'l') return (/* "(wide integer[]) " + */ getArrayWideInteger(cursor));
  else if (type == 'i') return (/* "(integer[]) "      + */ getArrayInteger(cursor));
  else if (type == 'b') return (/* "(bool[]) "         + */ getArrayBool(cursor));
  else if (type == 'S') return (/* "(string) "         + */ getLongString(cursor));
  else if (type == 'R') return (/* "(data) "           + */ getData(cursor));
  else
    return "(missing type)";
}

var root = {};

function process(data)
{
  var bytes = new Uint8Array(data);
  log("Got model data, size " + bytes.length);
  log("Starting");

  // validate
  var header = "";
  for (var i = 0; i < 20; i++)
    header += String.fromCharCode(bytes[i]);

  if (header != "Kaydara FBX Binary  ") log("Missing valid header");
  if (bytes[20] != 0x0) log("Missing magic number");
  if (bytes[21] != 0x1A) log("Missing magic number");
  if (bytes[22] != 0x0) log("Missing magic number");

  // first step, just parse and output what we find
  var cursor = { data: bytes, offset: 23 };
  log("File version:" + getInteger(cursor));
  while (cursor.offset != bytes.length)
    if (!parseObjectRecord(root, cursor)) break;

  log("Decoded");

  // gather up the things we found into keyed arrays
  var objects = {};

  // materials
  if (!root.Objects.Material) log("ERROR: model is missing material");

  if (Array.isArray(root.Objects.Material))
    for (var m in root.Objects.Material)
      save(objects, outputMaterial(root.Objects.Material[m]));
  else
    save(objects, outputMaterial(root.Objects.Material));

  // textures
  if (Array.isArray(root.Objects.Texture))
    for (var m in root.Objects.Texture)
      save(objects, outputTexture(root.Objects.Texture[m]));
  else
    save(objects, outputTexture(root.Objects.Texture));

  // models
  if (Array.isArray(root.Objects.Model))
    for (var m in root.Objects.Model)
      save(objects, outputModel(root.Objects.Model[m]));
  else
    save(objects, outputModel(root.Objects.Model));

  // geometry
  if (Array.isArray(root.Objects.Geometry))
    for (var m in root.Objects.Geometry)
      save(objects, outputGeometry(root.Objects.Geometry[m]));
  else
    save(objects, outputGeometry(root.Objects.Geometry));

  // do connections
  var modeldone = {};
  for (var c in root.Connections.C)
  {
    var con = root.Connections.C[c];
    var obj1 = objects[con[1]];
    var obj2 = objects[con[2]];
    if (!obj1 || !obj2) continue;

    if (obj1.type == "texture")
    {
      if (obj2.type != "material") { log("ERROR: Texture " + obj1.name + " linked to non-material"); continue; }
      if (con[3] != "DiffuseColor") { log("WARNING: Texture " + obj1.name + " linked to parameter " + con[3] +" not supported"); continue; }
      if (obj2.texture) { log("ERROR: Material " + obj2.name + " linked to extra texture " + obj1.name); continue; }
      obj2.texture = obj1.file;
      log("material " + obj2.name + " has texture " + obj1.name + ".");
    }
    else if (obj1.type == "material" && obj2.type == "model")
    {
      if (modeldone[obj2.id]) { log("ERROR: Model " + obj2.name + " linked to extra material " + obj1.name); continue; }
      if (!obj1.models) obj1.models = [];
      obj1.models.push(obj2);
      log("model "+obj2.name + " has material " + obj1.name + ".");
      modeldone[obj2.id] = 1;
    }
    else if (obj1.type == "mesh" && obj2.type == "model")
    {
      if (obj2.mesh) { log("ERROR: Model " + obj1.name + " linked to multiple meshes"); continue; }
      obj2.mesh = bake(obj1);
      obj2.boundingbox = getBB(obj2)
      log("model " + obj2.name + " has mesh " + obj1.name +".");
    }
    else log("WARNING: Linking " + obj1.type + " " + obj1.name + " to " + obj2.type + " " + obj2.name + " not supported");
  }

  // create output
  var file = {};
  file.attributes = { 'POS': 0, 'TEX0': 12, 'NORM': 20 };
  file.groups = [];
  for (var o in objects) if (objects[o].type == "material") file.groups.push(objects[o]);

  // get full bb
  var bb = {};
  for (var g = 0; g < file.groups.length; ++g)
    for (var m = 0; m < file.groups[g].models.length; ++m) {
      var mbb = file.groups[g].models[m].boundingbox;
      if (!bb.min) bb.min = [mbb.min[0], mbb.min[1], mbb.min[2]];
      else {
        if (mbb.min[0] < bb.min[0]) bb.min[0] = mbb.min[0];
        if (mbb.min[1] < bb.min[1]) bb.min[1] = mbb.min[1];
        if (mbb.min[2] < bb.min[2]) bb.min[2] = mbb.min[2];
      }
      if (!bb.max) bb.max = [mbb.max[0], mbb.max[1], mbb.max[2]];
      else {
        if (mbb.max[0] > bb.max[0]) bb.max[0] = mbb.max[0];
        if (mbb.max[1] > bb.max[1]) bb.max[1] = mbb.max[1];
        if (mbb.max[2] > bb.max[2]) bb.max[2] = mbb.max[2];
      }
    }
  file.boundingbox = bb;

  // encode for transmission
  var result = pako.deflate(JSON.stringify(file), { to: "string" });
  log("result is size " + result.length);
  log("Done");
  postMessage({ type: 1, result: result });
}

function save(objects, obj)
{
  if (obj) objects[obj.id] = obj;
}

function outputMaterial(mat)
{
  if (!mat) return;
  var obj = {};
  obj.id = mat[0];
  obj.type = "material";
  var parts = mat[1].split('\0');
  if (parts) obj.name = parts[0];
  log("Found material: " + obj.name);
  for (var p in mat.Properties70.P)
  {
    var prop = mat.Properties70.P[p];
    obj[prop[0]] = [];
    if (4 in prop) obj[prop[0]].push(prop[4]);
    if (5 in prop) obj[prop[0]].push(prop[5]);
    if (6 in prop) obj[prop[0]].push(prop[6]);
  }
  return obj;
}

function outputTexture(tex)
{
  if (!tex) return;
  var obj = {};
  obj.id = tex[0];
  obj.type = "texture";
  obj.name = tex[1].split('\0')[0];
  var parts = tex.FileName[0].trim().split("\\");
  obj.file = parts[parts.length - 1];
  log("Found texture: " + obj.name + " : " + obj.file);
  return obj;
}

function outputModel(model)
{
  if (!model) return;
  var obj = {};
  obj.id = model[0];
  obj.type = "model";
  obj.name = model[1].split('\0')[0];
  for (var p in model.Properties70.P)
  {
    // blender makes Y axis be up so add 90 degrees to counter it
    if (model.Properties70.P[p][0] == "Lcl Translation") obj.translation = [model.Properties70.P[p][4], model.Properties70.P[p][5], model.Properties70.P[p][6]];
    else if (model.Properties70.P[p][0] == "Lcl Rotation") obj.rotation = [model.Properties70.P[p][4], model.Properties70.P[p][5], model.Properties70.P[p][6]];
    else if (model.Properties70.P[p][0] == "Lcl Scaling") obj.scale = [model.Properties70.P[p][4], model.Properties70.P[p][5], model.Properties70.P[p][6]];
  }
  log("Found model: " + obj.name);
  return obj;
}

function outputGeometry(mesh)
{
  if (!mesh) return;
  var curmesh = {};
  curmesh.id = mesh[0];
  curmesh.type = "mesh";
  curmesh.name = mesh[1].split('\0')[0];
  log("Found mesh: " + curmesh.name);

  if (curmesh.vertexs) { log("WARNING: multiple vertex buffers"); return; }
  if (curmesh.indexs) { log("WARNING: multiple index buffers"); return; }
  if (curmesh.normals) { log("WARNING: multiple normals buffers"); return; }
  if (curmesh.uv) { log("WARNING: multiple uv buffers"); return; }
  if (curmesh.uvindex) { log("WARNING: multiple uv buffers"); return; }

  curmesh.vertexs = mesh.Vertices[0];
  if (mesh.LayerElementUV) curmesh.uv = mesh.LayerElementUV.UV[0];

  curmesh.normalmapping = mesh.LayerElementNormal.ReferenceInformationType[0] == "Direct" ? 1 : 0;
  curmesh.indexmapping = mesh.LayerElementUV.ReferenceInformationType[0] == "Direct" ? 1 : 0;

  // new way: get all indexes until the negative one, reverse the negative one
  // push triangles from this group: 1,2,3 1,3,4 1,4,5 etc until done
  // this auto triangulates any size face
  //
  // to deal wioth normals, we assume normals are always 'Direct'
  // copy the three normals matching the 3 indexed verts.  3 componant each - 9 floats
    var faceindexes = [];
    curmesh.indexes = [];
    curmesh.normals = [];
    curmesh.uvindex = [];

    for (var j = 0; j < mesh.PolygonVertexIndex[0].length; ++j) {
      if (mesh.PolygonVertexIndex[0][j] < 0) {
        // end of list
        faceindexes.push((mesh.PolygonVertexIndex[0][j] * -1) - 1);
        var start = j - faceindexes.length+1;
        for (var v = 1; v < faceindexes.length - 1; ++v) {
          curmesh.indexes.push(faceindexes[0]);
          curmesh.indexes.push(faceindexes[v]);
          curmesh.indexes.push(faceindexes[v + 1]);

          if (mesh.LayerElementNormal)
          {
            curmesh.normals.push(mesh.LayerElementNormal.Normals[0][3 * (start)]);
            curmesh.normals.push(mesh.LayerElementNormal.Normals[0][3 * (start) + 1]);
            curmesh.normals.push(mesh.LayerElementNormal.Normals[0][3 * (start) + 2]);
            curmesh.normals.push(mesh.LayerElementNormal.Normals[0][3 * (start + v)]);
            curmesh.normals.push(mesh.LayerElementNormal.Normals[0][3 * (start + v) + 1]);
            curmesh.normals.push(mesh.LayerElementNormal.Normals[0][3 * (start + v) + 2]);
            curmesh.normals.push(mesh.LayerElementNormal.Normals[0][3 * (start + v + 1)]);
            curmesh.normals.push(mesh.LayerElementNormal.Normals[0][3 * (start + v + 1) + 1]);
            curmesh.normals.push(mesh.LayerElementNormal.Normals[0][3 * (start + v + 1) + 2]);
          }
          if (mesh.LayerElementUV)
          {
            // 2 uv indexes per
            curmesh.uvindex.push(mesh.LayerElementUV.UVIndex[0][(start)]);
            curmesh.uvindex.push(mesh.LayerElementUV.UVIndex[0][(start + v)]);
            curmesh.uvindex.push(mesh.LayerElementUV.UVIndex[0][(start + v + 1)]);
          }
        }
        faceindexes = [];
      }
      else
        faceindexes.push(mesh.PolygonVertexIndex[0][j]);
    }


  return curmesh;
}

function unique(a)
{
  var unique = [];
  for (var i = 0; i < a.length; i++) {
    if (unique.indexOf(a[i]) == -1) unique.push(a[i]);
  }
  return unique;
};

function bake(mesh)
{
  var vertexs = [];
  var indexes = [];

  var vertexstring = [];  // the stringified vertex list uniq to cull duplicate verts
  var index = 0;
  var normal = 0;
  do {
    var vert = []
    var v = mesh.indexes[index] * 3;
    vert.push(mesh.vertexs[v]);
    vert.push(mesh.vertexs[v + 1]);
    vert.push(mesh.vertexs[v + 2]);

    if (!mesh.uvindex || !mesh.uv) { vert.push(0); vert.push(0); }
    else
    {
      //    if (mesh.uvmapping == 1)  diect version??

      var v2 = mesh.uvindex[index] * 2;
      vert.push(mesh.uv[v2]);
      vert.push(mesh.uv[v2 + 1]);
    }

//    if (mesh.normalmapping == 1) {
      vert.push(mesh.normals[normal]);
      vert.push(mesh.normals[normal + 1]);
      vert.push(mesh.normals[normal + 2]);
//    } else indexed version??
    index += 1;
    normal += 3;
    vertexstring.push(JSON.stringify(vert));
  } while (index != mesh.indexes.length);

  // how many are the same?
  var uniq = unique(vertexstring);
  log("Processing " + mesh.name + ". Creating index for " + vertexstring.length + " verts. Result is " + uniq.length + " unique verts");
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

  // transform bb
  {
    var trans = mat4.create();
    var t = mat4.create();
    var r = mat4.create();
    var s = mat4.create();
    var rot = quat.create();
    mat4.identity(t); mat4.translate(t, t, model.translation);
    quat.identity(rot);
    quat.rotateX(rot, rot, model.rotation[0] * 2 * 3.14159 / 360.0);
    quat.rotateY(rot, rot, model.rotation[1] * 2 * 3.14159 / 360.0);
    quat.rotateZ(rot, rot, model.rotation[2] * 2 * 3.14159 / 360.0);
    mat4.fromQuat(r, rot);
    mat4.identity(s); mat4.scale(s, s, model.scale);
    mat4.identity(trans); mat4.multiply(trans, r, s); mat4.multiply(trans, t, trans);

    vec3.transformMat4(bb.min, bb.min, trans);
    vec3.transformMat4(bb.max, bb.max, trans);
  }

  return bb;
}
