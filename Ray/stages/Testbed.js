(function ()
{

  class Testbed
  {
    constructor()
    {
      this.name = "Testbed";
      this.scenes = {};

      this.template = `
<p>Rendering testbed for creating test scenes on the fly</p>
<table><tr><td>
<div><canvas id='surface' width="400" height="400"></div>
</td><td>
<textarea cols='50' rows='20' id="code"></textarea>
<br>
<button id="render" onClick="obj.transform(false)">Render</button>
<button id="renderCaustics" onClick="obj.transform(true)">Render With Caustics</button>
<br>
<input id="sceneName" maxlength="20"/>
<input type="button" id="sceneSave" onClick="obj.saveScene()" value="Save Scene"></input><br>
<select id="sceneList"></select>
<input type="button" id="sceneLoad" onClick="obj.loadScene()" value="Load Scene"></input>
<input type="button" id="sceneDelete" onClick="obj.deleteScene()" value="Delete Scene"></input>
</td></tr></table>`;
      this.load = navigator.hardwareConcurrency;

      // load all the save games
      if (localStorage.getItem("RayTracer") !== null)
      {
        var saveData = JSON.parse(localStorage["RayTracer"]);
        if (saveData)
        {
          for (var s in saveData["scenes"]) this.scenes[s] = saveData["scenes"][s];
        }
      }

      if (!this.scenes["Default"])
      {
        let code = `
        {
          "renderOptions": {
            "antialias": 0,
            "maxReflections": 10
          },
          "cameras": [
            {
              "name": "main",
              "width": 400,
              "height": 400,
              "fov": 1.2566,
              "from": [0, 0, -5],
              "to": [0, 0, 0],
              "up": [0, 1, 0]
            }
          ],
          "lights": [
            {
              "type": "ambient",
              "intensityAmbient": 1.0,
              "colour": [1, 1, 0]
            },
            {
              "type": "pointlight",
              "position": [-10, 10, -10],
              "intensityDiffuse": 1.0,
              "intensityAmbient": 0.1,
              "colour": [1, 1, 1]
            }
          ],
          "objects": [
            { "type": "sphere" }
          ]
        }
          `;
        this.saveSceneAs("Default", code);
      }
    }

    saveScene()
    {
      var widget = document.getElementById("sceneName");
      this.saveSceneAs(widget.value, document.getElementById("code").value);
    }

    saveSceneAs(name, code)
    {
      this.scenes[name] = code;
      let save = {};
      save.scenes = this.scenes;
      localStorage["RayTracer"] = JSON.stringify(save);

      this.updateSceneList();
    }

    loadScene()
    {
      var e = document.getElementById("sceneList");
      document.getElementById("code").value = this.scenes[e.options[e.selectedIndex].text];

      var widget = document.getElementById("sceneName");
      widget.value = e.options[e.selectedIndex].text;
    }

    deleteScene()
    {
      var e = document.getElementById("sceneList");
      let name = this.scenes[e.options[e.selectedIndex].text];
      this.scenes[name] = null;
      delete this.scenes[name];

      let save = {};
      save.scenes = this.scenes;
      localStorage["RayTracer"] = JSON.stringify(save);

      this.updateSceneList();
    }

    updateSceneList()
    {
      var widget = document.getElementById("sceneList");
      if (!widget) return;
      // blank it out
      for (var j = widget.options.length - 1; j >= 0; j--) widget.remove(j);
      // create new options for the data
      for (var v in Object.keys(this.scenes))
      {
        var opt = document.createElement('option');
        opt.value = Object.keys(this.scenes)[v];
        opt.innerHTML = Object.keys(this.scenes)[v];
        widget.appendChild(opt);
      }      
    }

    shuffle(arr)
    {
      for (var i, tmp, n = arr.length; n; i = Math.floor(Math.random() * n), tmp = arr[--n], arr[n] = arr[i], arr[i] = tmp);
      return arr;
    }

    stop()
    {
      this.restart = false;
      this.kill = true;

      if (!this.canvas) return;

      if (this.renderY >= this.canvas.height && this.thread)
      {
        for (let i = 0; i < this.load; ++i)
          this.workers[i].terminate();
      }
    }

    run()
    {
      this.kill = false;
      document.getElementById("stages").innerHTML = this.template;
      document.getElementById("render").obj = this;
      document.getElementById("renderCaustics").obj = this;
      document.getElementById("sceneDelete").obj = this;
      document.getElementById("sceneSave").obj = this;
      document.getElementById("sceneLoad").obj = this;
      document.getElementById("code").value = "";

      this.updateSceneList();
      document.getElementById("code").value = this.scenes["Default"];

      this.canvas = new ray.Canvas();
      this.canvas.fromElement("surface");

      document.getElementById("surface").addEventListener("click", function (event)
      {
        let obj = this;
        let x = 0;
        let y = 0;

        var curleft = 0, curtop = 0;
        if (obj.offsetParent)
        {
          do
          {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
          } while (obj = obj.offsetParent);
          x = event.pageX - curleft;
          y = event.pageY - curtop;
        }
        let c = ray.World.renderPixel(x, y, ray.World.cameras["main"]);
        ray.App.setMessage("Colour at pixel (" + x + "," + y + ") = [" + Math.floor(c.redByte) + "," + Math.floor(c.greenByte) + "," + Math.floor(c.blueByte) + "]");
      });

      this.setupDef = {};

      // set up threads
      {
        // workers setup
        let obj = this;
        this.workers = new Array(this.load);
        for (let i = 0; i < this.load; ++i)
        {
          this.workers[i] = new Worker('stages/worker2.js');
          this.workers[i].addEventListener('message', function (e) { obj.receivePixels(e); }, false);
        }
      }

      // setup non threaded for clicking, and caustics!
      {
        this.buffer = new Uint8ClampedArray(this.canvas.width * 4);
      }
    }

    begin()
    {
      let self = this;
      ray.World.loadFromJSONWithMeshes(this.setupDef, function() { self.onLoadedCallback(); } );
    }

    onLoadedCallback()
    {
      // resize canvas?
      this.canvas.resizeTo(ray.World.cameras["main"].width, ray.World.cameras["main"].height);      
 
      // add to camera      
      ray.World.cameras["main"].canvas = this.canvas;
 
      // prep for rendering     
      // scramble rows
      this.rows = new Array(this.canvas.height);
      for (let i = 0; i < this.canvas.height; ++i)
        this.rows[i] = i;
      this.shuffle(this.rows);
      // worker buffers
      this.buffers = new Array(this.load);
      for (let i = 0; i < this.load; ++i)
      {
        this.buffers[i] = new Uint8ClampedArray(this.canvas.width * 4);
      }

      // init workers
      if (ray.World.options.threaded)
      {
        for (let i = 0; i < this.load; ++i)
        {
          for (let m in ray.World.meshes)
          {
            this.workers[i].postMessage({ 'cmd': 'mesh', 'id': i, 'name': ray.World.meshes[m].name, 'json': ray.World.meshes[m].meshdata });            
          }
          this.workers[i].postMessage({ 'cmd': 'setup', 'id': i, 'definition': this.setupDef });
        }
      }
      // begin!
      this.kill = false;
      this.restart = false;
      this.renderY = 0;
      this.start = performance.now();
      for (let i = 0; i < this.load; ++i) this.renderRow(i);
    }

    transform(withCaustics)
    {     
      this.setupDef = JSON.parse(document.getElementById("code").value);
      this.restart = true;

      if (!withCaustics)
      {
        this.autoCaustics = false;
        this.setupDef.renderOptions.caustics = false;  
      }
      else
      {
        if (!this.autoCaustics)
        {
          // set it up for pass 2
          this.autoCaustics = withCaustics;
        }
        else
        {
          this.autoCaustics = false;
          this.setupDef.renderOptions.caustics = true;  
        }
      }

      if (!this.renderY || this.renderY >= this.canvas.height) this.begin();
    }

    renderRow(id)
    {
      if (this.renderY >= this.canvas.height)
      {
        this.renderY++;
        if (this.renderY != this.canvas.height + this.load) return;

        this.end = performance.now();
        let ms = (this.end - this.start);
        let mspp = Math.floor((ms / (this.canvas.height * this.canvas.width)) * 1000) / 1000;
        let seconds = Math.floor((ms / 1000.0) * 100) / 100;
        ray.App.setMessage("Elapsed time: " + seconds + " seconds. " + mspp + " ms/pixel");

        if (this.kill && ray.World.options.threaded)
        {
          for (let i = 0; i < this.load; ++i)
            this.workers[i].terminate();
        }

        if (this.restart) this.begin();
        else if (this.autoCaustics)
        {
          this.transform(true);
        }

        return;
      }

      ray.App.setMessage("Rendering row " + this.renderY);
      if (ray.World.options.threaded)
      {
        this.workers[id].postMessage({ cmd: 'render', y: this.rows[this.renderY], buffer: this.buffers[id] }, [this.buffers[id].buffer]);
      }
      else
      {
        ray.usePool = false;
        ray.World.renderRowToBuffer("main", this.renderY, this.buffer);
        ray.usePool = false;
        if (!ray.World.modeCaustics)
          this.canvas.bltData(this.buffer, 0, this.renderY);
        this.canvas.draw();
        let obj = this;
        setTimeout(function () { obj.renderRow(0); }, 0);
      }

      this.renderY += 1;

      if (this.kill && ray.World.options.threaded)
      {
        for (let i = 0; i < this.load; ++i)
          this.workers[i].terminate();
      }
    }

    receivePixels(msg)
    {
      let id = msg.data.id;

      this.buffers[id] = msg.data.buffer;
      this.canvas.bltData(this.buffers[id], 0, msg.data.y);
      this.canvas.draw();
      this.renderRow(id);
    }
  }

  ray.stages[30] = new Testbed();
})();
