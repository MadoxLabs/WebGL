function Importer()
{
  this.importPage = 0;
  if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
    document.getElementById('list').innerHTML = 'The File APIs are not fully supported in this browser.\nYou will not be able to import files.';
  }

  var dropZone = document.getElementById('drop_zone');
  dropZone.addEventListener('dragover', handleDragOver, false);
  dropZone.addEventListener('drop', handleFileSelect, false);

  var texDrop = document.getElementById('texDrop');
  texDrop.addEventListener('dragover', handleDragOver, false);
  texDrop.addEventListener('drop', handleTexDrop, false);

  this.curFile = "";
  this.models = {};
  this.datalogdata = "";
}

Importer.prototype.changePage = function(src)
{
  if (src != this.importPage) this.importPage = src;
  else return;

  document.getElementById("impBtnProcessing").className = "mxTab " + ["active", "inactive", "inactive"][this.importPage];
  document.getElementById("impBtnData").className = "mxTab " + ["inactive", "active", "inactive"][this.importPage];
  document.getElementById("impBtnResult").className = "mxTab " + ["inactive", "inactive", "active"][this.importPage];
  document.getElementById("impProcessing").className = "importapp " + ["", "hidden", "hidden"][this.importPage];
  document.getElementById("impData").className = "importapp " + ["hidden", "", "hidden"][this.importPage];
  document.getElementById("impResult").className = "importapp " + ["hidden", "hidden", ""][this.importPage];
}

Importer.prototype.clearlog = function ()
{
  document.getElementById('impLog').innerHTML = "";
}

Importer.prototype.log = function (text)
{
  document.getElementById('impLog').innerHTML = text + "<br>" + document.getElementById('impLog').innerHTML;
}

Importer.prototype.cleardatalog = function ()
{
  document.getElementById('impDatalog').innerHTML = "";
  this.datalogdata = "";
}

Importer.prototype.datalog = function (text)
{
  // document.getElementById('impDatalog').innerHTML += text + "<br>";
  this.datalogdata += text + "\n";
}

Importer.prototype.start = function ()
{
  document.getElementById("drop_zone").style.visibility = "hidden";
}

Importer.prototype.stop = function ()
{
  document.getElementById("drop_zone").style.visibility = "visible";
  document.getElementById('impDatalog').innerHTML = this.datalogdata;
}

Importer.prototype.import = function (text)
{
  this.start();
  var str = new Uint8Array(text);

  var myWorker;
  if (str[0] == 59) {
    text = "";
    var len = str.length;
    for (var i = 0; i < len; ++i) text += String.fromCharCode(str[i]);
    myWorker = new Worker("js/fbxload.worker.js");
  }
  else
    myWorker = new Worker("js/fbxload.bin.worker.js");
  myWorker.onmessage = fromWorker;
  myWorker.onerror = function (event) { importer.stop(); importer.log("ERROR: " + event.message + " (" + event.filename + ":" + event.lineno + ")"); };
  myWorker.postMessage(text);
}

Importer.prototype.encode = function(txt)
{
  var len = txt.length;
  var data = [];
  var j = 0;
  var skip = 0;
  for (var i = 0; i < len; ++i) {
    data[j++] = (txt.charCodeAt(i));
    ++skip;
    if (skip == 3) { skip = 0; data[j++] = 255; }
  }
  data[j++] = 0;
  ++skip;
  if (skip == 3) { skip = 0; data[j++] = 255; }

  // load all image data
  var img = document.createElement('canvas');
  var width = (Math.sqrt(j / 4) | 0) + 1;
  for (var i = j; i < width * width * 4; ++i) data[i] = 0;

  img.width = width;
  img.height = width;
  var context = img.getContext('2d');
  var map = context.createImageData(width, width);
  map.data.set(data);
  context.putImageData(map, 0, 0, 0, 0, width, width);

  var save = document.getElementById('save');
  save.src = img.toDataURL("image/png");

  var model = { file: this.curFile, data: this.datalogdata, image: save.src };
  if (!this.models[model.file]) document.getElementById("listModels").innerHTML += "<div onclick='importer.selectModel(\"" + model.file + "\");'><p style='cursor: pointer;'>" + model.file + "</p></div>"
  this.models[model.file] = model;
  this.changePage(2);
  this.stop();
}

Importer.prototype.selectModel = function(name)
{
  if (!this.models[name]) return;
  var save = document.getElementById('save');
  save.src = this.models[name].image;
  document.getElementById('impDatalog').innerHTML = this.models[name].data;

  Game.loadMeshPNG("sample", this.models[name].image);
}

function fromWorker(oEvent)
{
  if (!oEvent.data.type) return;
  if (oEvent.data.type == 1) importer.encode(oEvent.data.result);
  else if (oEvent.data.type == 2) importer.log(oEvent.data.result);
  else if (oEvent.data.type == 3) importer.datalog(oEvent.data.result);
};

function handleFileSelect(evt)
{
  evt.stopPropagation();
  evt.preventDefault();

  var files = evt.dataTransfer.files;
  var f = files[0];
  importer.clearlog();
  importer.cleardatalog();
  importer.log('Importing: ' + escape(f.name) + " ( " + f.size + " bytes ) </li>");
  importer.curFile = f.name;
  var reader = new FileReader();
  reader.onload = function (e) { importer.import(e.target.result); }
  reader.readAsArrayBuffer(f);
}

function handleDragOver(evt)
{
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy';
}

var impTextures = {};

function handleTexDrop(evt)
{
  evt.stopPropagation();
  evt.preventDefault();

  var files = evt.dataTransfer.files;
  for (var i = 0, f; f = files[i]; ++i)
  {
    var parts = f.name.split("."); 
    var name = parts[parts.length - 2];
    impTextures[name] = { color: "white" };
    var buf = "";
    for (var n in impTextures) buf += "<p style='color: "+impTextures[n].color+"'>" + n + "</p>"
    document.getElementById("listTextures").innerHTML = buf;

    if (parts[parts.length - 1] == "tga")
    {
      var reader = new FileReader();
      reader.onload = function (name) { return function (e) { importer.loadTGATexture(name, e.target.result); } }(name);
      reader.readAsArrayBuffer(f);
    }
    else
    {
      var reader = new FileReader();
      reader.onload = function (name) { return function (e) { importer.loadTexture(name, e.target.result); } }(name);
      reader.readAsDataURL(f);
    }
  }
}

Importer.prototype.loadTexture = function(name, data)
{
  loadingTextures = true;
  Game.loadTextureData(name, data, true);
}

Importer.prototype.loadTGATexture = function(name, data)
{
  var tga_data = new Uint8Array(data); 
  var tga = new TGA();
  tga.load(tga_data);
  data = tga.getDataURL('image/png');

  loadingTextures = true;
  Game.loadTextureData(name, data, true);
}