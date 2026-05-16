(function (){

  class Stage10
  {
    constructor()
    {
      this.template = `
<p>Stage 10 - Patterns</p>
<p>Adding patterns to things</p>
<table><tr><td>
<div><canvas id='surface' width="400" height="400"></div>
</td><td><p>
Antialias:  <input type="range" min="0" max="2" value="0" onInput="obj.transform()" step="1" class="slider" id="aa"> <br>
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

      // scramble rows
      this.rows = new Array(400);
      for (let i = 0; i < 400; ++i)
        this.rows[i] = i;
      this.shuffle(this.rows);

      // world data
      this.setupDef = {
        renderOptions: {
          antialias: 1
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
        patterns: [
          {
            name: "green",
            type: "solid",
            colours: [34 / 255, 139 / 255, 34 / 255]
          },
          {
            name: "red",
            type: "solid",
            colours: [1, 0, 0]
          },
          {
            name: "white",
            type: "solid",
            colours: [1, 1, 1]
          },
          {
            name: "backGradient1",
            type: "stripe",
            transform: "back1",
            colours: ["green","red"]
          },
          {
            name: "backGradient2",
            type: "stripe",
            transform: "back2",
            colours: ["red", "green"]
          },
          {
            name: "back",
            type: "checker",
            colours: ["backGradient1", "backGradient2"]
          },

          {
            name: "floor",
            type: "stripe",
            colours: [[0.8,0.8,0.8], [0.8, 0, 0]]
          },
          {
            name: "disk",
            type: "ring",
            transform: "shrink",
            colours: [[0.8, 0.8, 0.8], [0.8, 0, 0]]
          },
          {
            name: "ball2",
            type: "stripe",
            transform: "shrink2",
            colours: [[0, 0.8, 0], [0.8, 0, 0], [0.8, 0.8, 0.8]]
          },
          {
            name: "ball2p",
            type: "perlin",
            colour: "ball2",
            seed: Math.random()
          },
          {
            name: "blend1",
            type: "stripe",
            transform: "blend1",
            colours: [[1,1,0], "white"]
          },
          {
            name: "blend2",
            type: "stripe",
            transform: "blend2",
            colours: [[1, 1, 0], "white"]
          },
          {
            name: "ball3",
            type: "blend",
            colour1: "blend1",
            colour2: "blend2"
          },
          {
            name: "ball",
            type: "gradient",
            transform: "grad",
            colour1: [1.0, 0.0, 0.0],
            colour2: [0.0, 1.0, 0.0]
          }
        ],
        materials: [
          {
            name: "ball3",
            shininess: 50,
            pattern: "ball3"
          },
          {
            name: "ball",
            shininess: 50,
            pattern: "ball"
          },
          {
            name: "ball2",
            shininess: 50,
            pattern: "ball2"
          },
          {
            name: "disk",
            shininess: 50,
            pattern: "disk"
          },
          {
            name: "floor",
            specular: 0,
            pattern: "floor"
          },
          {
            name: "back",
            specular: 0,
            pattern: "back"
          }
        ],
        transforms: [
          {
            name: "blend1",
            series: [{ type: "S", value: [0.2, 0.2, 0.2] }]
          },
          {
            name: "blend2",
            series: [{ type: "Ry", value: Math.PI / -2.0 }, { type: "S", value: [0.2, 0.2, 0.2] }]
          },
          {
            name: "back1",
            series: [{ type: "Ry", value: Math.PI / -4.0 }, { type: "S", value: [0.2, 1, 1] }]
          },
          {
            name: "back2",
            series: [{ type: "Ry", value: Math.PI / 4.0 }, { type: "S", value: [0.2, 1, 1] }]
          },
          {
            name: "back",
            series: [{ type: "T", value: [0, 0, 10] }, { type: "Rx", value: Math.PI / -2.0 }]
          },
          {
            name: "disk",
            series: [{ type: "T", value: [0, 0.1, 0] }, { type: "S", value: [2,0.1,2] }]
          },
          {
            name: "shrink",
            series: [{ type: "S", value: [0.1,0.1,0.1] } ]
          },
          {
            name: "shrink2",
            series: [{ type: "S", value: [0.67, 0.67, 0.67] }, { type: "T", value: [0.5, 0, 0] }]
          },
          {
            name: "grad",
            series: [{ type: "Rz", value: Math.PI / 4 }, { type: "S", value: [2, 1, 1] }, { type: "T", value: [0.5, 0, 0] }]
          },
          {
            name: "ball",
            series: [{ type: "T", value: [3, 0.8, 0.5] }, { type: "S", value: [0.8, 0.8, 0.8] }]
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
            intensityDiffuse: 1.1,
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
            material: "floor"
          },
          {
            type: "plane",
            transform: "back",
            material: "back"
          },
          {
            type: "sphere",
            transform: "ball",
            material: "ball"
          },
          {
            type: "sphere",
            material: "ball3",
            transform: "ball3"
          },
          {
            type: "sphere",
            material: "ball2",
            transform: "ball2"
          },
          {
            type: "sphere",
            transform: "disk",
            material: "disk"
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
      ray.World.loadFromJSON(this.setupDef);
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
      this.setupDef.renderOptions.antialias = Math.pow(2, parseFloat(document.getElementById("aa").value));
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

  ray.stages[10] = new Stage10();
})();
