class CaptureState
{
  constructor()
  {
    this.nextID = 1;
    this.song = "";
    this.channels = 5;
    this.active = false;
    this.step = 0;
    this.speed = 100; // pixels scrolled per second
    this.cursor = 0;
    this.notes = [];
  }
}

// these cant be members functions because stuff's stupid
function state_getNextID()
{
  let ret = Game.state.nextID;
  Game.state.nextID += 1;
  return ret;
}

function state_reset()
{
  Game.state.cursor = 0;
  Game.state.notes = [];
}

Game.init = function ()
{
  Game.Ready = false;              // are we ready to begin the run loop?
  Game.canvas = document.getElementById("surface");
  Game.canvas.width = 800;
  Game.canvas.height = 600;
  Game.context = Game.canvas.getContext("2d");
  Game.mouse = new Mouse(Game.canvas);
  Game.state = new CaptureState();
  Game.songs = {};
  Game.hammer = new Hammer(Game.canvas);
  Game.lastupdate = Date.now();
  
  var dropZone = document.getElementById('drop_zone');
  dropZone.addEventListener('dragover', handleDragOver, false);
  dropZone.addEventListener('drop', handleFileSelect, false);

  Game.hammer.on("tap press pressup", function (ev)
  {
    console.log(ev.type + " gesture detected.");
  });
};

Game.run = function ()
{
  let now = Date.now();
  let elapsed = now - Game.lastupdate;
  Game.lastupdate = now;

  if (!Game.Ready)
  {
    Game.postInit();
  }
  else
  {
    Game.update(elapsed);
    Game.render(elapsed);
  }	
  window.requestAnimationFrame(Game.run);
  
};

Game.postInit = function ()
{
  if (localStorage.getItem("RF") !== null)
  {
    var saveData = JSON.parse(localStorage["RF"]);
    if (saveData)
    {
      for (var s in saveData["songs"]) Game.songs[s] = saveData["songs"][s];
    }
  }
  Game.bindSongList();

  document.getElementById("loading").style.display = "none";
  document.getElementById("game").style.display = "inline";

  Game.Ready = true;
};

var hoverNoteID = 0;
var hoverTailID = 0;
var hoverX = 0;
var hoverY = 0;
var hoverDraw = false;
var noteCache = {};
var currentNote = null;
var dragging = false;
var movingID = 0;
var movingOrig = 0;
var movingOrigEnd = 0;
var addMode = false;

Game.bindSongList = function()
{
  var widget = document.getElementById("saves");
    // blank it out
    for (var j = widget.options.length - 1; j >= 0; j--) widget.remove(j);
    // create new options for the data
    let list = Object.keys(Game.songs);
    for (var v in list)
    {
      var opt = document.createElement('option');
      opt.value = list[v];
      opt.innerHTML = list[v];
      widget.appendChild(opt);
    }
}

// time in ms
Game.timeToCursorPos = function (time)
{
  // speed is in pix/s
  let x = time * Game.state.speed;  // x is 
  x = (x / 1000.0) | 0;
  return x;
};

// returns seconds
Game.cursorPosToTime = function (pos)
{
  let x = pos / Game.state.speed;
  return x;
};

Game.fireMouseEvent = function (type, mouse)
{
  if (type == MouseEvent.Wheel)
  {
  }

  if (type == MouseEvent.Down && mouse.button == 0)
  {		
    if (Game.state.mode == 3)
    {
      if (mouse.X >= 790)
      {
        dragging = true;
        Game.state.cursor = mouse.Y*20;
      }
      if (addMode)
      {
        let channelWidth = (800 / Game.state.channels) | 0;
        let channel = (mouse.X / channelWidth) | 0;
        currentNote = { id: state_getNextID(), startTime: mouse.Y + (Game.state.cursor - 500), endTime: mouse.Y + (Game.state.cursor - 500), channel: channel };
      }
    }
    else if (Game.state.active)
    {
      // quantize X based on channels
      let channelWidth = (800 / Game.state.channels) |0;
      let channel = (mouse.X / channelWidth)|0;

      // save the click spot as a note
      currentNote = { id: state_getNextID(), startTime: Game.state.cursor, endTime: Game.state.cursor, channel: channel };
    }

    if (hoverDraw && Math.abs(mouse.X - (hoverX - 15)) < 10 && Math.abs(mouse.Y - (hoverY + 15)) < 10)
    {
      movingID = hoverNoteID ? hoverNoteID : hoverTailID;
      movingOrig = hoverNoteID ? noteCache[movingID].startTime : 0;
      movingOrigEnd = noteCache[movingID].endTime;

      hoverDraw = false;
      hoverNoteID = 0;
      hoverTailID = 0;
      return;
    }
  }

  if (type == MouseEvent.Up)
  {
    if (Game.state.active)
    {
      Game.state.notes.push(currentNote);
      currentNote = null;
    }
    if (addMode)
    {
			addMode = false;
			if (addSpecial)
			{
				addSpecial = false;
				currentNote.endTime = 1000000000 + ((document.getElementById("specialType").value) |0);
			}
      Game.state.notes.push(currentNote);
      noteCache[currentNote.id] = currentNote;
      currentNote = null;
    }
    if (dragging) dragging = false;
    if (movingID) movingID = 0;

    if (hoverDraw)
    {
      if (Math.abs(mouse.X - (hoverX)) < 10 && Math.abs(mouse.Y - (hoverY + 30)) < 10)
      {
        noteCache[hoverNoteID ? hoverNoteID : hoverTailID].endTime += 40;
      }
      if (Math.abs(mouse.X - (hoverX + 15)) < 10 && Math.abs(mouse.Y - (hoverY + 15)) < 10)
      {
        // delete note
        if (hoverNoteID) noteCache[hoverNoteID].deleted = true;
        else if (hoverTailID) noteCache[hoverTailID].endTime = noteCache[hoverTailID].startTime;
        hoverDraw = false;
        hoverNoteID = 0;
        hoverTailID = 0;	
        return;
      }
    }

    if (hoverNoteID || hoverTailID)
    {
      if (hoverDraw) hoverDraw = false;
      else
      {
        hoverDraw = true;
        hoverX = mouse.X;
        hoverY = mouse.Y;
      }
    }
  }

  if (type == MouseEvent.Move)
  {
    if (dragging)
    {
      Game.state.cursor = mouse.Y*20;
    }

    if (addMode && currentNote)
    {
      let channelWidth = (800 / Game.state.channels) | 0;
      currentNote.channel = (mouse.X / channelWidth) | 0;
      currentNote.startTime = mouse.Y + (Game.state.cursor - 500);
      currentNote.endTime = currentNote.startTime;
    }

    if (movingID)
    {
      if (movingOrig) noteCache[movingID].startTime = movingOrig + (mouse.Y - mouse.lastDownY);
      noteCache[movingID].endTime = movingOrigEnd + (mouse.Y - mouse.lastDownY);
    }

    if (Game.state.mode == 3 && !hoverDraw && !addMode)
    {
      // detect mouse over a note, or tail and draw handles
      hoverNoteID = 0;
      hoverTailID = 0;	
      for (let n in visibleNotes)
      {
        let note = noteCache[visibleNotes[n]];				
        if (Math.abs(mouse.X - note.x) < 20 && Math.abs(mouse.Y - note.y) < 20) 
        {
          hoverNoteID = note.id;
          break;
        }
        if (Math.abs(mouse.X - note.x) < 20 && mouse.Y > note.y && mouse.Y < note.y + note.tail) 
        {
          hoverTailID = note.id;
          break;
        }
      }
    }
  }
};

// main update function
Game.update = function (elapsed)
{
  if (Game.state.mode == 1)
  {
    Game.state.speed = document.getElementById("speed").value |0;	
    Game.state.channels = document.getElementById("channels").value |0;
  }
  if (Game.state.mode == 2)
  {
    var slider = document.getElementById("speed2");
    Game.state.speed = Game.state.realSpeed * slider.value;	
    Game.music.setSpeed(slider.value);
  }

  if (Game.state.active)
  {
		if (Game.music.getSpeed() == 1.0)
		{
			Game.state.cursor = Game.timeToCursorPos(Game.music.getTime() * 1000.0);
		}
		else
		{
			Game.state.cursor += Game.timeToCursorPos(elapsed);
		}
//console.log((Game.music.getTime() * 1000.0) + " - " + Game.state.cursor);
}
  if (currentNote && !addMode)
  {
    currentNote.endTime = Game.state.cursor;
  }
};

var visibleNotes = [];

function drawLine(fromX, fromY, toX, toY, color)
{
  Game.context.strokeStyle = color;
  Game.context.beginPath();
  Game.context.moveTo(fromX, fromY);
  Game.context.lineTo(toX, toY);
  Game.context.stroke();
}

function drawBox(fromX, fromY, sizeX, sizeY, color)
{
  Game.context.fillStyle = color;
  Game.context.fillRect(fromX, fromY, sizeX, sizeY);
}

Game.drawNote = function (note)
{
  let top = Game.state.cursor - 500;

  if (!note) return;
  if (note.deleted) return;

  let channelWidth = (800 / Game.state.channels) | 0;
  note.x = note.channel * channelWidth + (channelWidth / 2.0) | 0;
  let offset = Game.state.cursor - note.startTime;
  note.y = 500 - offset;
  note.tail = note.endTime - note.startTime

  if ((note.y > 0 && note.y < 600) || (note.y + note.tail > 0 && note.y + note.tail < 600))
  {
    visibleNotes.push(note.id);
  }

	// the tail
	if (note.endTime < 1000000000)
	{
		if (note.id == hoverTailID)
    Game.context.fillStyle = "#ffff00";		
  else	
    Game.context.fillStyle = "#00ffff";		
  Game.context.fillRect(note.x-10, note.y-10, 20, note.tail);			
	}
  // the note
  if (note.id == hoverNoteID)
    Game.context.fillStyle = "#ffff00";		
	else if (note.endTime < 1000000000)
		Game.context.fillStyle = "#00ffff";		
	else {
		Game.context.fillStyle = "#0000ff";		
	}
	Game.context.fillRect(note.x-20, note.y-20, 40, 40);			
	if (note.endTime > 1000000000)
	{
		Game.context.fillStyle = "white";
		Game.context.font = "bold 16px Arial";
		Game.context.fillText("" + (note.endTime - 1000000000), note.x+30, note.y);			
	}
  // the miniview
  Game.context.fillStyle = "#000000";
  Game.context.fillRect(790 + note.x / 80, note.startTime / 20, 1, 1);			
  Game.context.fillStyle = "#777777";			
  Game.context.fillRect(790 + note.x/80, note.startTime/20, 1, note.tail/20);			
};

// main render function
Game.render = function (elapsed)
{
  Game.context.lineWidth = 2;

  // clear
  drawBox(0, 0, 800, 600, "#21375f");

  if (!Game.Ready) return;

  // draw the channels
  let width = (800/Game.state.channels) |0;
  for (let i = 1; i <= Game.state.channels; ++i)
    drawLine(width * i, 0, width * i, 600, "#aa0000");
  // draw the cursor
  drawLine(0, 500, 800, 500, "#00aa00");

  // history area
  drawBox(790, 0, 10, 600, "#999999");		

  // scrolling bars
  let top = Game.state.cursor - 500;
  for (let x = 0; x < 800; x += 1) // TOOD replace this with math
  {
    if ((x + top) % 200 == 0) drawLine(0, x, 800, x, "#aaaaaa");
  }

  // notes
  visibleNotes = [];
  for (let n in Game.state.notes)
  {
    let note = Game.state.notes[n];
    Game.drawNote(note);
  }
  Game.drawNote(currentNote);

  // history cursor
  drawLine(790, Game.state.cursor / 20, 800, Game.state.cursor / 20, "#000000");

  // edit controls
  if (hoverDraw)
  {
    drawBox(hoverX + 15, 20 + hoverY - 5, 10, 10, "#ee0000");			
    drawBox(hoverX - 25, 20 + hoverY - 5, 10, 10, "#00ee00");			
    drawBox(hoverX, 35 + hoverY - 5, 10, 10, "#ee00ee");			
  }
};

Game.startSync = function()
{
  Game.channels = document.getElementById("channels").value;
  Game.state.active = true;
  Game.state.mode = 1;
  state_reset();
  Game.state.song = document.getElementById("song").value;

  Game.music = new buzz.sound(Game.state.song, { formats: ["mp3"] });
  Game.music.setVolume(20);
  Game.music.play();
};

Game.stopSync = function()
{
  Game.state.active = false;
  Game.state.cursor = 0;
  Game.state.notes = [];
  Game.music.stop();
};

Game.lockSync = function()
{
  Game.state.active = false;
  Game.state.mode = 2;
  Game.state.realSpeed = Game.state.speed;
  Game.music.stop();
  state_reset();

  document.getElementById("step1").style.display = "none";
  document.getElementById("step2").style.display = "inline";
};

Game.startCapture = function()
{
  Game.state.active = true;
  Game.state.mode = 2;
  state_reset();
  
  document.getElementById("speed2").value = 1;
  Game.music.setSpeed(1);
  Game.music.setTime(0);
  Game.music.play();
};

Game.stopCapture = function()
{
  Game.state.active = false;
  Game.music.stop();
  Game.state.mode = 1;
  state_reset();
  document.getElementById("step2").style.display = "none";
  document.getElementById("step1").style.display = "inline";
};

Game.restartCapture = function()
{
  Game.state.active = false;
  state_reset();
  Game.music.stop();
};

Game.doneCapture = function()
{
  Game.state.active = false;
  Game.state.mode = 3;
  Game.state.cursor = 0;
  Game.music.stop();

  document.getElementById("step1").style.display = "none";
  document.getElementById("step2").style.display = "none";
  document.getElementById("step3").style.display = "inline";

  // create note cache for editing
  noteCache = {};
  for (let n in Game.state.notes)
  {
    if (!Game.state.notes[n].id) 
      Game.state.notes[n].id = state_getNextID();
    noteCache[Game.state.notes[n].id] = Game.state.notes[n];
  }
};

Game.save = function()
{
  Game.songs[document.getElementById("savename").value] = Game.state;

  var save = {};
  save["songs"] = Game.songs;
  localStorage["RF"] = JSON.stringify(save);
  
  Game.bindSongList();
};

Game.load = function()
{
  let e = document.getElementById("saves");
  Game.state = Game.songs[e.options[e.selectedIndex].value];
  Game.music = new buzz.sound(Game.state.song, { formats: ["mp3"] });
  document.getElementById("savename").value = e.options[e.selectedIndex].value;
  Game.doneCapture();
};

Game.delete = function()
{
  let e = document.getElementById("saves");
  delete Game.songs[e.options[e.selectedIndex].value];
  Game.bindSongList();

  var save = {};
  save["songs"] = Game.songs;
  localStorage["RF"] = JSON.stringify(save);
};

Game.playbackEdit = function()
{
  Game.state.active = true;
  Game.music.setSpeed(1);
  Game.music.setTime(Game.state.cursor / Game.state.realSpeed);
  Game.music.play();

  console.log("PLAY cursor " + Game.state.cursor + " mp3 " + Game.music.getTime());
};

Game.stopPlaybackEdit = function()
{
  Game.state.active = false;
  console.log("STOP cursor " + Game.state.cursor + " mp3 " + Game.music.getTime());
  Game.music.stop();
};

Game.exitEdit = function()
{
  Game.state.active = true;
  Game.state.mode = 2;
  
  document.getElementById("speed2").value = 1;
  Game.music.setSpeed(1);
  Game.music.setTime(Game.state.cursor / Game.state.realSpeed);
  Game.music.play();

  document.getElementById("step1").style.display = "none";
  document.getElementById("step3").style.display = "none";
  document.getElementById("step2").style.display = "inline";
};

Game.trimEdit = function ()
{
  for (let n in Game.state.notes)
  {
    if (Game.state.notes[n].endTime - Game.state.notes[n].startTime < 50)
      Game.state.notes[n].endTime = Game.state.notes[n].startTime;
  }
};

Game.addNote = function ()
{
  addMode = true;
};

Game.addSpecial = function ()
{
  addMode = true;
  addSpecial = true;
};

window.URL = window.URL || window.webkitURL;

Game.download = function ()
{
  var data = JSON.stringify(Game.state);
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
  element.setAttribute('download', document.getElementById("savename").value + ".json");

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};

function handleFileSelect(evt)
{
  evt.stopPropagation();
  evt.preventDefault();

  var files = evt.dataTransfer.files;
  var f = files[0];
  Game.curFile = f.name;
  var reader = new FileReader();
  reader.onload = function (e) { Game.import(e.target.result); }
  reader.readAsArrayBuffer(f);
}

function handleDragOver(evt)
{
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy';
}

Game.import = function (text)
{
  var str = new Uint8Array(text);
  text = "";
  var len = str.length;
  for (var i = 0; i < len; ++i) text += String.fromCharCode(str[i]);

  Game.state = JSON.parse(text);
  document.getElementById("savename").value = Game.curFile.split(".")[0];
  Game.music = new buzz.sound(Game.state.song, { formats: ["mp3"] });
  Game.doneCapture();
}
