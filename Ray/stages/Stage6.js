(function (){

  class Stage6
  {
    constructor()
    {
      this.template = `
<p>Stage 6 - Basic Lighting</p>
<p>Adding calculations for ambient, diffuse, and specular lighting to the renderer. </p>
<table><tr><td>
<div><canvas id='surface' width="400" height="400"></div>
</td><td><p>
Move one of the lights around:<br>
X:  <input type="range" min="-20" max="20" value="-10" onInput="obj.transform()" step="0.1" class="slider" id="xTrans"> <br>
Y:  <input type="range" min="-20" max="20" value="10" onInput="obj.transform()" step="0.1" class="slider" id="yTrans"><br>
Z:  <input type="range" min="-20" max="20" value="-10" onInput="obj.transform()" step="0.1" class="slider" id="zTrans"><br>
Light parameters:<br>                             
Ambient Intensityfactor: <input type="range" min="0" max="1" value="1.0" onInput="obj.transform()" step="0.1" class="slider" id="ambL"><br>
Diffuse Intensity: <input type="range" min="0" max="1" value="1.0" onInput="obj.transform()" step="0.1" class="slider" id="difL"><br>
Constant Atten: <input type="range" min="0.01" max="4" value="1.0" onInput="obj.transform()" step="0.1" class="slider" id="attenC"><br>
Linear Atten: <input type="range" min="0" max="1" value="0" onInput="obj.transform()" step="0.05" class="slider" id="attenL"><br>
Squared Atten: <input type="range" min="0" max="1" value="0" onInput="obj.transform()" step="0.05" class="slider" id="attenS"><br>
Color R: <input type="range" min="0" max="1" value="1" onInput="obj.transform()" step="0.1" class="slider" id="rL"><br>
Color G: <input type="range" min="0" max="1" value="1" onInput="obj.transform()" step="0.1" class="slider" id="gL"><br>
Color B: <input type="range" min="0" max="1" value="1" onInput="obj.transform()" step="0.1" class="slider" id="bL"><br>
</p></td><td><p>
Ball parameters:<br>
Ambient factor: <input type="range" min="0" max="1" value="0.1" onInput="obj.transform()" step="0.1" class="slider" id="amb"><br>
Diffuse factor: <input type="range" min="0" max="1" value="0.9" onInput="obj.transform()" step="0.1" class="slider" id="dif"><br>
Specular factor: <input type="range" min="0" max="1" value="0.9" onInput="obj.transform()" step="0.1" class="slider" id="spec"><br>
Shine: <input type="range" min="1" max="300" value="50" onInput="obj.transform()" step="1" class="slider" id="shine"><br>
Color R: <input type="range" min="0" max="1" value="1" onInput="obj.transform()" step="0.1" class="slider" id="rB"><br>
Color G: <input type="range" min="0" max="1" value="0" onInput="obj.transform()" step="0.1" class="slider" id="gB"><br>
Color B: <input type="range" min="0" max="1" value="0" onInput="obj.transform()" step="0.1" class="slider" id="bB"><br>
</p>
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
      document.getElementById("xTrans").obj = this;
      document.getElementById("yTrans").obj = this;
      document.getElementById("zTrans").obj = this;
      document.getElementById("ambL").obj = this;
      document.getElementById("difL").obj = this;
      document.getElementById("attenC").obj = this;
      document.getElementById("attenL").obj = this;
      document.getElementById("attenS").obj = this;
      document.getElementById("rL").obj = this;
      document.getElementById("gL").obj = this;
      document.getElementById("bL").obj = this;
      document.getElementById("amb").obj = this;
      document.getElementById("dif").obj = this;
      document.getElementById("spec").obj = this;
      document.getElementById("shine").obj = this;
      document.getElementById("rB").obj = this;
      document.getElementById("gB").obj = this;
      document.getElementById("bB").obj = this;

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
        wallDepth: 10,
        wallSize: 7,
        translate: [0, 0, 0],
        scale: [1, 1, 1],
        materials: [
          {
            name: "ball",
            shininess: 50,
            colour: [1, 0.2, 0.2]
          }
        ],
        objects: [
          {
            type: "sphere",
            material: "ball"
          },
          {
            type: "pointlight",
            position: [10, 10, -10],
            colour: [0.00000001, 0, 1],
          },
          {
            type: "pointlight",
            position: [-10, 10, -10],
            colour: [1, 1, 1],
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
        this.workers[i] = new Worker('stages/worker1.js');
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
      this.setupDef.objects[2].position = [parseFloat(document.getElementById("xTrans").value),
                                           parseFloat(document.getElementById("yTrans").value),
                                           parseFloat(document.getElementById("zTrans").value)];
      this.setupDef.objects[2].colour = [parseFloat(document.getElementById("rL").value),
                                         parseFloat(document.getElementById("gL").value),
                                         parseFloat(document.getElementById("bL").value)];
      this.setupDef.objects[2].intensityAmbient = parseFloat(document.getElementById("ambL").value);
      this.setupDef.objects[2].intensityDiffuse = parseFloat(document.getElementById("difL").value);
      this.setupDef.objects[2].attenuation = [parseFloat(document.getElementById("attenC").value),
                                              parseFloat(document.getElementById("attenL").value),
                                              parseFloat(document.getElementById("attenS").value)];
      this.setupDef.materials[0].ambient = parseFloat(document.getElementById("amb").value);
      this.setupDef.materials[0].diffuse = parseFloat(document.getElementById("dif").value);
      this.setupDef.materials[0].specular = parseFloat(document.getElementById("spec").value);
      this.setupDef.materials[0].shininess = parseFloat(document.getElementById("shine").value);
      this.setupDef.materials[0].colour = [parseFloat(document.getElementById("rB").value),
                                           parseFloat(document.getElementById("gB").value),
                                           parseFloat(document.getElementById("bB").value)];
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

  ray.stages[6] = new Stage6();
})();
