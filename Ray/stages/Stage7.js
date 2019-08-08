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
</td><td>
</td></tr></table>`;
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
        lighting: true,
        eye: [0, 0, -5],
        cameras: [
          {
            name: "main",
            width: 400,
            height: 400,
            fov: Math.PI / 2.0,
            from: [0, 0, -5],
            to: [0, 0, 0],
            up: [0, 1, 0]
          }
        ],
        materials: [
          {
            name: "ball",
            shininess: 50,
            colour: [1, 0.2, 0.2]
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
            material: "ball"
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
