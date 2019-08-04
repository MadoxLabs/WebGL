(function (){

  class Stage5
  {
    constructor()
    {
      this.template = `
<p>Stage 5 - Ray Casting</p>
<p>Test casting rays at a single sphere. The static is to better tell if the ray is hitting the sphere (red) or nothing (black).</p>
<div><canvas id='surface' width="400" height="400"></div>`;
      this.load = navigator.hardwareConcurrency;
    }

    run()
    {
      document.getElementById("stages").innerHTML = this.template;

      this.canvas = new ray.Canvas();
      this.canvas.fromElement("surface");
      this.canvas.tvstatic();
      this.canvas.draw();

      // world data
      let setupDef = {
        eye: [0, 0, -5],
        wallDepth: 10,
        wallSize: 7,
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
        this.workers[i].postMessage({ 'cmd': 'setup', 'id': i, 'definition': setupDef });
      }

      // begin!
      this.renderY = 0;
      this.start = performance.now();
      for (let i = 0; i < this.load; ++i) this.renderRow(i);
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
        return;
      }

      ray.App.setMessage("Rendering row " + this.renderY);
      this.workers[id].postMessage({ cmd: 'render', y: this.renderY, buffer: this.buffers[id] }, [this.buffers[id].buffer]);
      this.renderY += 1;
    }

    receivePixels(msg)
    {
      this.buffers[msg.data.id] = msg.data.buffer;
      this.canvas.bltData(this.buffers[msg.data.id], 0, msg.data.y);

      let obj = this;
      setTimeout(function () { obj.renderRow(msg.data.id); }, 0);

      this.canvas.draw();
    }
  }

  ray.stages[5] = new Stage5();
})();
