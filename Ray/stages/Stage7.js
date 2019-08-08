(function (){

  class Stage7
  {
    constructor()
    {
      this.template = `
<p>Stage 7 - World Management</p>
<p>Adding a manager to take care of complex scenes, and cameras</p>
<table><tr><td>
<div><canvas id='surface' width="400" height="400"></div>
</td><td><p>
X:  <input type="range" min="-20" max="20" value="-3" onInput="obj.transform()" step="0.1" class="slider" id="xTrans"> <br>
FOV:  <input type="range" min="0.1" max="1.0" value="0.5" onInput="obj.transform()" step="0.01" class="slider" id="fov"> <br>
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

      if (this.renderY >= 400)
      {
        for (let i = 0; i < this.load; ++i)
          this.workers[i].terminate();
      }
    }

    run()
    {
      this.kill = false;
      document.getElementById("stages").innerHTML = this.template;
      document.getElementById("xTrans").obj = this;
      document.getElementById("zCamera").obj = this;
      document.getElementById("fov").obj = this;

      this.canvas = new ray.Canvas();
      this.canvas.fromElement("surface");
      this.canvas.tvstatic();
      this.canvas.draw();

      // scramble rows
      this.rows = new Array(400);
      for (let i = 0; i < 400; ++i)
        this.rows[i] = i;
      this.shuffle(this.rows);

      // world data
      this.setupDef = {
        cameras: [
          {
            name: "main",
            width: 400,
            height: 400,
            fov: Math.PI * 0.5,
            from: [0, 2, -5],
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
          }
        ],
        transforms: [
          {
            name: "floor",
            series: [{ type: "T", value: [0, -1.1, 0] }, {type:"S", value: [20,0.1,20]}]
          },
          {
            name: "wall1",
            series: [{ type: "T", value: [5, 0, 9] }, {type:"Ry", value: Math.PI/4.0 }, { type: "S", value: [20, 20, 0.1] }]
          },
          {
            name: "wall2",
            series: [{ type: "T", value: [-5, 0, 9] }, { type: "Ry", value: -Math.PI / 4.0 }, { type: "S", value: [20, 20, 0.1] }]
          },
          {
            name: "ball",
            series: [{ type: "T", value: [2, 0, 0] }]
          },
          {
            name: "ball2",
            series: [{ type: "T", value: [0, 1, 2] },{ type: "S", value: [2,2,2] }]
          },
          {
            name: "ball3",
            series: [{ type: "T", value: [-3, 0.5, 0] }, { type: "S", value: [1.5, 1.5, 1.5] }]
          }

        ],
        lights: [
          {
            type: "pointlight",
            position: [10, 10, -10],
            colour: [0, 0, 1],
          },
          {
            type: "pointlight",
            position: [-10, 10, -10],
            colour: [1, 1, 1],
          }
        ],
        objects: [
          {
            type: "sphere",
            transform: "floor",
            material: "floor"
          },
          {
            type: "sphere",
            transform: "wall1",
            material: "floor"
          },
          {
            type: "sphere",
            transform: "wall2",
            material: "floor"
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

      this.begin();
    }

    begin()
    {
      for (let i = 0; i < this.load; ++i)
        this.workers[i].postMessage({ 'cmd': 'setup', 'id': i, 'definition': this.setupDef });

      // begin!
      this.kill = false;
      this.restart = false;
      this.renderY = 0;
      this.start = performance.now();
      for (let i = 0; i < this.load; ++i) this.renderRow(i);
    }

    transform()
    {
      this.setupDef.transforms[5].series[0].value[0] = parseFloat(document.getElementById("xTrans").value);
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

        if (this.kill)
        {
          for (let i = 0; i < this.load; ++i)
            this.workers[i].terminate();
        }

        return;
      }

      ray.App.setMessage("Rendering row " + this.renderY);
      this.workers[id].postMessage({ cmd: 'render', y: this.rows[this.renderY], buffer: this.buffers[id] }, [this.buffers[id].buffer]);
      this.renderY += 1;

      if (this.kill)
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

  ray.stages[7] = new Stage7();
})();
