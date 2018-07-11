class CaptureState
{
	constructor()
	{
		this.song = "";
		this.channels = 5;
		this.active = false;
		this.step = 0;
		this.speed = 100; // pixels scrolled per second
		this.cursor = 0;
		this.notes = [];
	}
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

	Game.lastupdate = Date.now();

};

Game.run = function ()
{
	let now = Date.now();
	let elapsed = now - Game.lastupdate;

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
	
	Game.lastupdate = now;
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

var noteID = 0;
var hoverNoteID = 0;
var hoverTailID = 0;
var hoverX = 0;
var hoverY = 0;
var hoverDraw = false;
var noteCache = {};
var currentNote = null;
var dragging = false;

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
		}
		else if (Game.state.active)
		{
			// quantize X based on channels
			let channelWidth = (800 / Game.state.channels) |0;
			let channel = (mouse.X / channelWidth)|0;
			let loc = channel * channelWidth + (channelWidth/2.0)|0;

			// save the click spot as a note
			noteID += 1;
			currentNote = { id: noteID, startTime: Game.state.cursor, endTime: Game.state.cursor, y: Game.state.cursor - (600 - mouse.Y), x: loc };
		}
  }
  if (type == MouseEvent.Up)
  {
		if (Game.state.active)
		{
			Game.state.notes.push(currentNote);
			currentNote = null;
		}
		if (dragging) dragging = false;
		if (hoverNoteID || hoverTailID)
		{
			hoverDraw = true;
			hoverX = mouse.X;
			hoverY = mouse.Y;	
		}
  }
  if (type == MouseEvent.Move)
  {
		if (dragging)
		{
			Game.state.cursor = mouse.Y*20;
		}

		if (Game.state.mode == 3)
		{
			// detect mouse over a note, or tail and draw handles
			let top = Game.state.cursor - 600;
			hoverNoteID = 0;
			hoverTailID = 0;	
		for (let n in visibleNotes)
			{
				let note = noteCache[visibleNotes[n]];				
				if (Math.abs(mouse.X - note.x) < 20 && Math.abs(mouse.Y + top - note.y) < 20) 
				{
					hoverNoteID = note.id;
					break;
				}
				if (Math.abs(mouse.X - note.x) < 20 && mouse.Y + top > note.y && mouse.Y + top < note.y + (note.endTime - note.startTime)) 
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
		// using speed, how many lines are we stepping? speed = lines / sec
		// elapsed is ms - 300 ms , 200 speed = 200 l/s = .2 l/ms = 300*.2 = 60
		Game.state.cursor += (elapsed * Game.state.speed / 1000.0) |0;
	}
	if (currentNote)
	{
		currentNote.endTime = Game.state.cursor;
	}
};

var visibleNotes = [];

Game.drawNote = function(note)
{
	let top = Game.state.cursor - 600;

	if (!note) return;

	if (note.y-top > 0 && note.y-top < 600)
	{
		visibleNotes.push(note.id);
	}

	// the tail
	if (note.id == hoverTailID)
		Game.context.fillStyle = "#ffff00";		
	else	
		Game.context.fillStyle = "#00ffff";		
	Game.context.fillRect(note.x-10, note.y-10-top, 20, -(note.startTime - note.endTime));			
	// the note
	if (note.id == hoverNoteID)
		Game.context.fillStyle = "#ffff00";		
	else	
		Game.context.fillStyle = "#00ffff";		
	Game.context.fillRect(note.x-20, note.y-20-top, 40, 40);			
	// the miniview
	Game.context.fillStyle = "#000000";			
	Game.context.fillRect(790 + note.x/80, note.y/20, 1, 1);			
	Game.context.fillStyle = "#777777";			
	Game.context.fillRect(790 + note.x/80, note.y/20, 1, -(note.startTime - note.endTime)/20);			
};

// main render function
Game.render = function (elapsed)
{
  // clear
  Game.context.fillStyle = "#21375f";
  Game.context.fillRect(0, 0, 800, 600);
  Game.context.strokeStyle = "black";
  Game.context.lineWidth = 2;
  Game.context.strokeRect(0, 0, 800, 600);

  if (!Game.Ready) return;

	// draw the channels
	Game.context.strokeStyle = "#aa0000";
	let width = (800/Game.state.channels) |0;
	for (let i = 1; i <= Game.state.channels; ++i)
	{
		Game.context.beginPath();
		Game.context.moveTo(width*i, 0);
		Game.context.lineTo(width*i, 600);
		Game.context.stroke();	
	}
	Game.context.strokeStyle = "#00aa00";
	Game.context.beginPath();
	Game.context.moveTo(0,500);
	Game.context.lineTo(800,500);
	Game.context.stroke();	

	// draw the scrolling bars
//	if (Game.state.active)
	{
		// history area
		Game.context.fillStyle = "#999999";
		Game.context.fillRect(790,0,10,600);		

		// scrolling bars
		let top = Game.state.cursor - 600;
		for (let x = 0; x < 800; x += 1)
		{
			if ((x+top) % 200 == 0)
			{
				Game.context.strokeStyle = "#aaaaaa";
				Game.context.beginPath();
				Game.context.moveTo(0, x);
				Game.context.lineTo(800, x);
				Game.context.stroke();
			}
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
		Game.context.strokeStyle = "#000000";
		Game.context.beginPath();
		Game.context.moveTo(790, Game.state.cursor/20);
		Game.context.lineTo(800, Game.state.cursor/20);
		Game.context.stroke();

		// edit controls
		if (hoverDraw)
		{
			Game.context.fillStyle = "#ee0000";
			Game.context.fillRect(hoverX+15, 20+hoverY-5, 10,10);			
			Game.context.fillStyle = "#00ee00";
			Game.context.fillRect(hoverX-25, 20+hoverY-5, 10,10);			
		}
	}
};

Game.startSync = function()
{
	Game.channels = document.getElementById("channels").value;
	Game.state.active = true;
	Game.state.mode = 1;
	Game.state.cursor = 0;
	Game.state.notes = [];
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

	document.getElementById("step1").style.display = "none";
	document.getElementById("step2").style.display = "inline";
};

Game.startCapture = function()
{
	Game.state.active = true;
	Game.state.mode = 2;
	Game.state.cursor = 0;
	Game.state.notes = [];
	
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
	document.getElementById("step2").style.display = "none";
	document.getElementById("step1").style.display = "inline";
};

Game.restartCapture = function()
{
	Game.state.active = false;
	Game.state.notes = [];
	Game.state.cursor = 0;
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
		{
			Game.state.notes[n].id = noteID;
			noteID += 1;
		}
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
};

Game.stopPlaybackEdit = function()
{
	Game.state.active = false;
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

Game.trimEdit = function()
{
	for (let n in Game.state.notes)
	{
		if (Game.state.notes[n].endTime - Game.state.notes[n].startTime < 50)
			Game.state.notes[n].endTime = Game.state.notes[n].startTime;
	}
}