function loadscene(n)
{
  if (n == 1) 
  {
    document.getElementById("code").value = `

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
              "from": [0, 3, -3],
              "to": [0, 1, 0],
              "up": [0, 1, 0]
            }
          ],
          "lights": [
            {
              "type": "pointlight",
              "position": [0, 5, -1],
              "intensityDiffuse": 0.5,
              "intensityAmbient": 0.2,
              "colour": [1, 1, 1]
            },
            {
              "type": "pointlight",
              "position": [0, 2, -15],
              "intensityDiffuse": 1,
              "intensityAmbient": 0.7,
              "colour": [1, 1, 1]
            }
          ],
"materials" :[
            {
              "name": "glass",
              "ambient": 0,
              "diffuse": 0.4,
              "shininess": 300,
              "specular": 0.9,
              "reflective": 0.9,
              "transparency": 0.9,
              "transmit": 0.7,
              "refraction": 1.5,
              "colour": [0.2, 0.2, 0.2]
            },
           {
              "name": "air",
              "ambient": 0,
              "diffuse": 0.4,
              "shininess": 300,
              "specular": 0.9,
              "reflective": 0.9,
              "transparency": 0.9,
              "transmit": 1,
              "refraction": 1.0,
              "colour": [0.2, 0.2, 0.2]
            }
],
"transforms": [
{ "name": "air", "series" : [{"type": "S", "value" : [0.98,0.98,0.98]}] }, 
{ "name": "floor", "series" : [{"type": "T", "value" : [0,-1,0]}] }, 
{ "name": "left", "series" : [{"type": "T", "value" : [-2.2,0,0]}] }, 
{ "name": "back", "series" : [{"type": "T", "value" : [0,0,2]}] }, 
{ "name": "right", "series" : [{"type": "T", "value" : [2.2,0,0]}] }
],
          "objects": [
{ "type": "plane", "transform": "floor"},
{ "type": "sphere", "transform": "right" },
{ "type": "sphere", "transform": "left" },
{ "skip": true, "type": "sphere", "transform": "back" },
{ "type": "sphere", "material": "glass" },
{ "type": "sphere", "transform": "air" , "material": "air" }
          ]
        }
`;
  }

  if (n == 2) 
  {
    document.getElementById("code").value = `

        {
          "renderOptions": {
            "antialias": 0,
            "maxReflections": 10, "caustics": false
          },
          "cameras": [
            {
              "name": "main",
              "width": 400,
              "height": 400,
              "fov": 1.2566,
              "from": [0, 3, -3],
              "to": [0, 1, 0],
              "up": [0, 1, 0]
            }
          ],
          "lights": [
            {
              "type": "pointlight",
              "position": [0, 5, -1],
              "intensityDiffuse": 0.5,
              "intensityAmbient": 0.2,
              "colour": [1, 1, 1]
            }
          ],
"materials" :[
            {
              "name": "glass",
              "ambient": 0,
              "diffuse": 0.4,
              "shininess": 300,
              "specular": 0.9,
              "reflective": 0.9,
              "transparency": 0.9,
              "transmit": 0.7,
              "refraction": 1.5,
              "colour": [0.2, 0.2, 0.2]
            },
           {
              "name": "air",
              "ambient": 0,
              "diffuse": 0.4,
              "shininess": 300,
              "specular": 0.9,
              "reflective": 0.9,
              "transparency": 0.9,
              "transmit": 1,
              "refraction": 1.0,
              "colour": [0.2, 0.2, 0.2]
            }
],
"transforms": [
{ "name": "air", "series" : [{"type": "S", "value" : [0.98,0.98,0.98]}] }, 
{ "name": "floor", "series" : [{"type": "T", "value" : [0,-1,0]}] }, 
{ "name": "left", "series" : [{"type": "T", "value" : [-2.2,0,0]}] }, 
{ "name": "back", "series" : [{"type": "T", "value" : [0,0,2]}] }, 
{ "name": "right", "series" : [{"type": "T", "value" : [2.2,0,0]}] }
],
          "objects": [
{ "type": "plane", "transform": "floor"},
{ "type": "cylinder", "material": "glass", "min": -1, "max": 1, "closed": true}
          ]
        }
`;
  }
}

(function ()
{

  class Testbed
  {
    constructor()
    {
      this.name = "Testbed";
      this.size = 400;

      this.template = `
<p>Rendering testbed for crating test scenes on the fly</p>
<table><tr><td>
<div><canvas id='surface' width="400" height="400"></div>
</td><td>
<textarea id="code"></textarea>
<br>
<button id="render" onClick="obj.transform()">Render</button>
<input type="button" id="scene1" onClick="loadscene(1)" value="Load Scene 1"></input>
<input type="button" id="scene2" onClick="loadscene(2)" value="Load Scene 2"></input>
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

      if (this.renderY >= this.size && this.thread)
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
      document.getElementById("code").value = `
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
              "to": [0, 1, 0],
              "up": [0, 1, 0]
            }
          ],
          "lights": [
            {
              "type": "pointlight",
              "position": [-10, 10, -10],
              "intensityDiffuse": 1.1,
              "intensityAmbient": 0.4,
              "colour": [1, 1, 1]
            }
          ],
          "objects": [
{ "type": "sphere" }
          ]
        }
`;

      this.canvas = new ray.Canvas();
      this.canvas.fromElement("surface");
//      this.thread = 1;

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
      this.rows = new Array(this.size);
      for (let i = 0; i < this.size; ++i)
        this.rows[i] = i;
      this.shuffle(this.rows);

      this.setupDef = {};
//      ray.World.loadFromJSON(this.setupDef);

//      if (ray.World.options.threaded)
    // set up threads
      {
        // workers setup
        let obj = this;
        this.workers = new Array(4);
        this.buffers = new Array(4);
        for (let i = 0; i < this.load; ++i)
        {
          this.buffers[i] = new Uint8ClampedArray(this.size * 4);
          this.workers[i] = new Worker('stages/worker2.js');
          this.workers[i].addEventListener('message', function (e) { obj.receivePixels(e); }, false);
        }
      }
//      else
    // setup non threaded
      {
        this.buffer = new Uint8ClampedArray(this.size * 4);
      }
    }

    begin()
    {
      let self = this;
      ray.World.loadFromJSON(this.setupDef, function() { self.begin2(); } );
    }

    begin2()
    {
      ray.World.cameras["main"].canvas = this.canvas;
      if (ray.World.options.threaded)
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
      this.setupDef = JSON.parse(document.getElementById("code").value);
      this.restart = true;
      if (!this.renderY || this.renderY >= this.size) this.begin();
    }

    renderRow(id)
    {
      if (this.renderY >= this.size)
      {
        this.end = performance.now();
        let ms = (this.end - this.start);
        let mspp = Math.floor((ms / (this.size * this.size)) * 1000) / 1000;
        let seconds = Math.floor((ms / 1000.0) * 100) / 100;
        ray.App.setMessage("Elapsed time: " + seconds + " seconds. " + mspp + " ms/pixel");

        if (this.restart) this.begin();

        if (this.kill && ray.World.options.threaded)
        {
          for (let i = 0; i < this.load; ++i)
            this.workers[i].terminate();
        }

        return;
      }

      ray.App.setMessage("Rendering row " + this.renderY);
      if (ray.World.options.threaded)
        this.workers[id].postMessage({ cmd: 'render', y: this.rows[this.renderY], buffer: this.buffers[id] }, [this.buffers[id].buffer]);
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
      this.buffers[msg.data.id] = msg.data.buffer;
      this.canvas.bltData(this.buffers[msg.data.id], 0, msg.data.y);
      this.canvas.draw();
      this.renderRow(msg.data.id);
    }
  }

  ray.stages[30] = new Testbed();
})();
