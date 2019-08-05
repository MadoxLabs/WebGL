(function (){

  class Stage5
  {
    constructor()
    {
      this.template = `
<p>Stage 5 - Ray Casting</p>
<p>Test casting rays at a single sphere. The static is to better tell if the ray is hitting the sphere (red) or nothing (black).</p>
<table><tr><td>
<div><canvas id='surface' width="400" height="400"></div>
</td><td><p>
Move the ball around:<br>
X:  <input type="range" min="-5" max="5" value="0" onInput="obj.transform()" step="0.1" class="slider" id="xTrans"> <br>
Y:  <input type="range" min="-5" max="5" value="0" onInput="obj.transform()" step="0.1" class="slider" id="yTrans"><br>
Z:  <input type="range" min="-5" max="5" value="0" onInput="obj.transform()" step="0.1" class="slider" id="zTrans"><br>
Stretch the ball:<br>                             
X: <input type="range" min="0.1" max="3" value="1" onInput="obj.transform()" step="0.1" class="slider" id="xScale"><br>
Y: <input type="range" min="0.1" max="3" value="1" onInput="obj.transform()" step="0.1" class="slider" id="yScale"><br>
Z: <input type="range" min="0.1" max="3" value="1" onInput="obj.transform()" step="0.1" class="slider" id="zScale"><br>
</p>
</td></tr></table>`;
      this.load = navigator.hardwareConcurrency;
    }

    shuffle(arr)
    {
      for (var i, tmp, n = arr.length; n; i = Math.floor(Math.random() * n), tmp = arr[--n], arr[n] = arr[i], arr[i] = tmp);
      return arr;
    }

    run()
    {
      document.getElementById("stages").innerHTML = this.template;
      document.getElementById("xTrans").obj = this;
      document.getElementById("yTrans").obj = this;
      document.getElementById("zTrans").obj = this;
      document.getElementById("xScale").obj = this;
      document.getElementById("yScale").obj = this;
      document.getElementById("zScale").obj = this;

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
        eye: [0, 0, -5],
        wallDepth: 10,
        wallSize: 7,
        translate: [0, 0, 0],
        scale: [1, 1, 1],
        objects: [
          { type: "sphere" }
        ]
      };

      // workers setup
      let obj = this;
      this.workers = new Array(4);
      this.buffers = new Array(4);
      for (let i = 0; i < this.load; ++i)
      {
        this.buffers[i] = new Uint8ClampedArray(400 * 4);
        this.workers[i] = new Worker('worker.js');
        this.workers[i].addEventListener('message', function (e) { obj.receivePixels(e); }, false);
      }

      this.begin();
    }

    begin()
    {
      for (let i = 0; i < this.load; ++i)
        this.workers[i].postMessage({ 'cmd': 'setup', 'id': i, 'definition': this.setupDef });

      // begin!
      this.restart = false;
      this.renderY = 0;
      this.start = performance.now();
      for (let i = 0; i < this.load; ++i) this.renderRow(i);
    }

    transform()
    {
      this.setupDef.translate = [parseFloat(document.getElementById("xTrans").value),
                                 parseFloat(document.getElementById("yTrans").value), 
                                 parseFloat(document.getElementById("zTrans").value)];
      this.setupDef.scale = [parseFloat(document.getElementById("xScale").value),
                             parseFloat(document.getElementById("yScale").value), 
                             parseFloat(document.getElementById("zScale").value)];
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

        return;
      }

      ray.App.setMessage("Rendering row " + this.renderY);
      this.workers[id].postMessage({ cmd: 'render', y: this.rows[this.renderY], buffer: this.buffers[id] }, [this.buffers[id].buffer]);
      this.renderY += 1;
    }

    receivePixels(msg)
    {
      this.buffers[msg.data.id] = msg.data.buffer;
      this.canvas.bltData(this.buffers[msg.data.id], 0, msg.data.y);
      this.canvas.draw();
      this.renderRow(msg.data.id);
    }
  }

  ray.stages[5] = new Stage5();
})();
