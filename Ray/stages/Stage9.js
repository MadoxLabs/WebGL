(function (){

  class Stage9
  {
    constructor()
    {
      this.template = `
<p>Stage 9 - Planes</p>
<p>Adding infinite and finite plane primitives</p>
<table><tr><td>
<div><canvas id='surface' width="400" height="400"></div>
</td><td><p>
Antialias:  <input type="range" min="0" max="1" value="0" onInput="obj.transform()" step="1" class="slider" id="aa"> <br>
Camera:<br>
FOV:  <input type="range" min="0.1" max="1.0" value="0.4" onInput="obj.transform()" step="0.01" class="slider" id="fov"> <br>
Camera distance:  <input type="range" min="2" max="10.0" value="5" onInput="obj.transform()" step="0.1" class="slider" id="zCamera"> <br>
</p></td></tr></table>`;
      this.load = navigator.hardwareConcurrency;
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

      if (this.renderY >= 400 && this.thread)
      {
        for (let i = 0; i < this.load; ++i)
          this.workers[i].terminate();
      }
    }

    run()
    {
      this.kill = false;
      document.getElementById("stages").innerHTML = this.template;
      document.getElementById("aa").obj = this;
      document.getElementById("fov").obj = this;
      document.getElementById("zCamera").obj = this;

      this.canvas = new ray.Canvas();
      this.canvas.fromElement("surface");
      this.canvas.tvstatic();
      this.canvas.draw();
      this.thread = 1;

      // scramble rows
      this.rows = new Array(400);
      for (let i = 0; i < 400; ++i)
        this.rows[i] = i;
      this.shuffle(this.rows);

      // world data
      this.setupDef = {
        renderOptions: {
          jigglePoints: 0,
          antialias: 0
        },
        cameras: [
          {
            name: "main",
            width: 400,
            height: 400,
            fov: Math.PI * 0.4,
            from: [0, 3, -5],
            to: [0, 1, 0],
            up: [0, 1, 0]
          }
        ],
        materials: [
          {
            name: "ball",
            shininess: 50,
            colour: [1, 0.2, 0.2]
          },
          {
            name: "ball2",
            shininess: 50,
            colour: [0.2, 1, 0.2]
          },
          {
            name: "floor",
            shininess: 200,
            colour: [1,1,1]
          },
          {
            name: "room",
            shininess: 200,
            colour: [1, 0.55, 0]
          }
        ],
        transforms: [
          {
            name: "ball",
            series: [{ type: "T", value: [3, 0.8, 0.5] }, { type: "S", value: [0.8, 0.8, 0.8] }]
          },
          {
            name: "roomtop",
            series: [{ type: "T", value: [2, 2, 0] }]
          },
          {
            name: "roomback",
            series: [{ type: "T", value: [2, 0, 1] }, { type: "Rx", value: Math.PI / -2.0 }]
          },
          {
            name: "roomleft",
            series: [{ type: "T", value: [2, 0, 0] }, { type: "Rz", value: Math.PI / 2.0 }]
          },
          {
            name: "roomright",
            series: [{ type: "T", value: [4, 0, 0] }, { type: "Rz", value: Math.PI / 2.0 }]
          },
          {
            name: "ball2",
            series: [{ type: "T", value: [0, 2, 2] },{ type: "S", value: [2,2,2] }]
          },
          {
            name: "ball3",
            series: [{ type: "T", value: [-3, 1.5, 0] }, { type: "S", value: [1.5, 1.5, 1.5] }]
          }

        ],
        lights: [
          {
            type: "pointlight",
            position: [-10, 10, -10],
            intensityDiffuse: 0.9,
            intensityAmbient: 0.4,
            colour: [1, 1, 1],
          },
          {
            type: "pointlight",
            position: [10, 10, -10],
            colour: [0, 0, 1],
          },
        ],
        objects: [
          {
            type: "plane",
            material: "floor",
          },
          {
            type: "plane",
            transform: "roomleft",
            material: "room",
            xMin: 0,
            yMin: 0,
            xMax: 2,
            yMax: 1
          },
          {
            type: "plane",
            transform: "roomright",
            material: "room",
            xMin: 0,
            yMin: 0,
            xMax: 2,
            yMax: 1
          },
          {
            type: "plane",
            transform: "roomback",
            material: "room",
            xMin: 0,
            yMin: 0,
            xMax: 2,
            yMax: 2
          },
          {
            type: "plane",
            transform: "roomtop",
            material: "room",
            xMin: 0,
            yMin: 0,
            xMax: 2,
            yMax: 1
          },
          {
            type: "sphere",
            transform: "ball",
            material: "ball"
          },
          {
            type: "sphere",
            transform: "ball3",
          },
          {
            type: "sphere",
            material: "ball2",
            transform: "ball2",
          }
        ]
      };

      if (this.thread)
      {
        // workers setup
        let obj = this;
        this.workers = new Array(4);
        this.buffers = new Array(4);
        for (let i = 0; i < this.load; ++i)
        {
          this.buffers[i] = new Uint8ClampedArray(400 * 4);
          this.workers[i] = new Worker('stages/worker2.js');
          this.workers[i].addEventListener('message', function (e) { obj.receivePixels(e); }, false);
        }
      }
      else
      {
        this.buffer = new Uint8ClampedArray(400 * 4);
        ray.World.loadFromJSON(this.setupDef);
      }

      this.begin();
    }

    begin()
    {
      if (this.thread)
      {
        for (let i = 0; i < this.load; ++i)
          this.workers[i].postMessage({ 'cmd': 'setup', 'id': i, 'definition': this.setupDef });
      }
      // begin!
      this.kill = false;
      this.restart = false;
      this.renderY = 0;
      this.start = performance.now();
      for (let i = 0; i < this.load; ++i) this.renderRow(i);
    }

    transform()
    {
      this.setupDef.renderOptions.antialias = parseFloat(document.getElementById("aa").value);
      this.setupDef.cameras[0].fov = Math.PI * parseFloat(document.getElementById("fov").value);
      this.setupDef.cameras[0].from[2] = -parseFloat(document.getElementById("zCamera").value);

      this.restart = true;
      if (this.renderY >= 400) this.begin();
    }

    renderRow(id)
    {
      if (this.renderY >= 400)
      {
        this.end = performance.now();
        let ms = (this.end - this.start);
        let mspp = Math.floor((ms / (400 * 400)) * 1000) / 1000;
        let seconds = Math.floor((ms / 1000.0) * 100) / 100;
        ray.App.setMessage("Elapsed time: " + seconds + " seconds. " + mspp + " ms/pixel");

        if (this.restart) this.begin();

        if (this.kill && this.thread)
        {
          for (let i = 0; i < this.load; ++i)
            this.workers[i].terminate();
        }

        return;
      }

      ray.App.setMessage("Rendering row " + this.renderY);
      if (this.thread)
        this.workers[id].postMessage({ cmd: 'render', y: this.rows[this.renderY], buffer: this.buffers[id] }, [this.buffers[id].buffer]);
      else
      {
        ray.usePool = true;
        ray.World.renderRowToBuffer("main", this.renderY, this.buffer);
        ray.usePool = false;
        this.canvas.bltData(this.buffer, 0, this.renderY);
        this.canvas.draw();
        let obj = this;
        setTimeout(function () { obj.renderRow(0); }, 0);
      }

      this.renderY += 1;

      if (this.kill && this.thread)
      {
        for (let i = 0; i < this.load; ++i)
          this.workers[i].terminate();
      }
    }

    receivePixels(msg)
    {
      this.buffers[msg.data.id] = msg.data.buffer;
      this.canvas.bltData(this.buffers[msg.data.id], 0, msg.data.y);
      this.canvas.draw();
      this.renderRow(msg.data.id);
    }
  }

  ray.stages[9] = new Stage9();
})();
