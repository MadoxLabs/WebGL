(function (){

  class Stage13
  {
    constructor()
    {
      this.template = `
<p>Stage 13 - Cylinders and Cones</p>
<p>A scene showing off cylinders and cones</p>
<table><tr><td>
<div><canvas id='surface' width="400" height="400"></div>
</td><td><p>
Antialias:  <input type="range" min="0" max="2" value="0" onInput="obj.transform()" step="1" class="slider" id="aa"> <br>
<br>
Camera:<br>
FOV:  <input type="range" min="0.1" max="1.0" value="0.4" onInput="obj.transform()" step="0.01" class="slider" id="fov"> <br>
Camera distance:  <input type="range" min="-10" max="5" value="0" onInput="obj.transform()" step="0.1" class="slider" id="zCamera"> <br>
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
      this.setupDef = JSON.parse(`
{
  "renderOptions": {
    "antialias": 0,
    "maxReflections": 4,
    "shadowDepth": 2
  },
  "cameras": [
    {
      "name": "main",
      "width": 400,
      "height": 400,
      "fov": 1.2566,
      "from": [-2, -4, -6],
      "origfrom": [-2, -4, -6],
      "to": [6, -4, 0],
      "up": [0, 1, 0]
    }
  ],
  "lights": [
    {
      "type": "pointlight",
      "position": [-10, 10, 10],
      "intensityDiffuse": 0.8,
      "intensityAmbient": 0.8,
      "colour": [1, 1, 1]
    },
    {
      "type": "pointlight",
      "position": [-10, 10, -10],
      "intensityDiffuse": 0.8,
      "intensityAmbient": 0.8,
      "colour": [1, 1, 1]
    },
    {
      "type": "pointlight",
      "position": [1, -4, 0],
      "intensityDiffuse": 1,
      "intensityAmbient": 1,
      "attenuation": [0,0.13,0],
      "colour": [1, 1, 0.2]
    }
  ],
  "materials" :[
      { "name": "desk", "ambient": 0.2, "diffuse": 1.0, "specular":0.5, "reflective": 0.1, "colour": [0.2,0.2,0.2] },
      { "name": "legs", "ambient": 0.2, "diffuse": 1.0, "specular":0.5, "reflective": 0.01, "colour": [0.2,0.2,0.2] },
            {
              "name": "glass",
              "ambient": 0.1,
              "diffuse": 0.4,
              "shininess": 300,
              "specular": 0.9,
              "reflective": 0.9,
              "transparency": 0.7,
              "transmit": 0.7,
              "refraction": 1.5,
              "colour": [0.2, 0.2, 0.2]
            },
           {
              "name": "water",
              "ambient": 0,
              "diffuse": 0.4,
              "shininess": 300,
              "specular": 0.9,
              "reflective": 0.9,
              "transparency": 0.7,
              "transmit": 1,
              "refraction": 1.333,
              "colour": [0.0, 0.0, 1]
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
              "refraction": 1,
              "colour": [0.2, 0.2, 0.2]
            }
  ],
  "transforms": [
  ],
  "objects": [
  {
    "name": "glass",
    "type": "cylinder",
    "max": 2,
    "min":0,
    "transform": {"series":[{ "type":"T", "value":[0,-5,-5] },{ "type":"S", "value":[0.8,0.8,0.8] }]}, 
    "material": "glass"
  },  
  {
    "name": "water",
    "type": "cylinder",
    "max": 1.6,
    "min":0,
    "transform": {"series":[{ "type":"T", "value":[0,-5.2,-5] },{ "type":"S", "value":[0.6,0.8,0.6] }]}, 
    "material": "water"
  },  
  {
    "name": "air",
    "type": "cylinder",
    "max": 1.6,
    "min":0,
    "transform": {"series":[{ "type":"T", "value":[0,-4.6,-5] },{ "type":"S", "value":[0.6,0.8,0.6] }]}, 
    "material": "air"
  },  
  {
    "name": "stick",
    "type": "cylinder",
    "max": 2.5,
    "min":0,
    "transform": {"series":[{ "type":"T", "value":[0,-4.8,-5] },{ "type":"Rz", "value":-0.4 },{ "type":"S", "value":[0.05,1,0.05] }]}, 
    "material": { "ambient": 0.2, "diffuse": 1.0, "specular":0,
                  "colour": [0.7,0.7,0.7]                  
                }
  },  
  {
    "name": "widget",
    "type": "cube",
    "transform": {"series":[{ "type":"T", "value":[-1.4,-4.5,3] },{ "type":"Ry", "value":-1.2 },{ "type":"S", "value":[0.5,0.3,0.5] }]}, 
    "material": { "ambient": 0.2, "diffuse": 1.0, "specular":0,
                  "colour": [0.7,0,0]                  
                }
  },
  {
    "name": "widget",
    "type": "cube",
    "transform": {"series":[{ "type":"T", "value":[0.5,-4.8,-3] },{ "type":"Ry", "value":1.1 },{ "type":"S", "value":[0.2,0.2,0.8] }]}, 
    "material": { "ambient": 0.2, "diffuse": 1.0, "specular":0,
                  "colour": [0,0.4,0.8]                  
                }
  },
  {
    "name": "paper",
    "type": "cube",
    "transform": {"series":[{ "type":"T", "value":[-1.4,-4.7,-1] },{ "type":"Ry", "value":1.8 },{ "type":"S", "value":[1,0.01,1.5] }]}, 
    "material": { "ambient": 0.2, "diffuse": 1.0, "specular":0,
                  "colour": [1,1,1]                  
                }
  },
  {
    "name": "lampshade",
    "type": "cube",
    "transform": {"series":[{ "type":"T", "value":[1,-1.4,0] },{ "type":"S", "value":[1,0.75,1] }]}, 
    "material": { "ambient": 0.2, "diffuse": 1.0, "specular":0,
                  "colour": [0.2,0.45,0.2]                  
                }
  },
  {
    "name": "lamppost",
    "type": "cube",
    "transform": {"series":[{ "type":"T", "value":[1,-4,0] },{ "type":"S", "value":[0.1,1,0.1] }]}, 
    "material": { "ambient": 0.2, "diffuse": 1.0, "specular":1,
                  "reflective": 0.1,
                  "colour": [0,0,0]                  
                }
  },
  {
    "name": "lamp",
    "type": "sphere",
    "transform": {"series":[{ "type":"T", "value":[1,-2,0] },{ "type":"S", "value":[1,1,1] }]}, 
    "material": { "ambient": 0.2, "diffuse": 1.0, "specular":1,
                  "reflective": 0.9, "transparency": 0.9, "transmit": 0.9,
                  "colour": [0.15,0.15,0.15]                  
                }
  },
  {
    "name": "desk",
    "type": "cube",
    "transform": {"series":[{ "type":"T", "value":[0,-5,0] },{ "type":"S", "value":[4,0.2,8] }]}, 
    "material": "desk"
  },
  {
    "name": "leg",
    "type": "cube",
    "transform": {"series":[{ "type":"T", "value":[-3.5,-10,-7.5] },{ "type":"S", "value":[0.3,5,0.3] }]}, 
    "material": "legs"
  },
  {
    "name": "leg",
    "type": "cube",
    "transform": {"series":[{ "type":"T", "value":[3.5,-10,7.5] },{ "type":"S", "value":[0.3,5,0.3] }]}, 
    "material": "legs"
  },
  {
    "name": "leg",
    "type": "cube",
    "transform": {"series":[{ "type":"T", "value":[3.5,-10,-7.5] },{ "type":"S", "value":[0.3,5,0.3] }]}, 
    "material": "legs"
  },
  {
    "name": "leg",
    "type": "cube",
    "transform": {"series":[{ "type":"T", "value":[-3.5,-10,7.5] },{ "type":"S", "value":[0.3,5,0.3] }]}, 
    "material": "legs"
  },
  {
    "name": "walls",
    "type": "cube",
    "transform": {"series":[{ "type":"S", "value":[16,16,16] }]}, 
    "material": { "ambient": 0.2, "diffuse": 1.0, "specular":0,                  
                  "pattern": { "type": "stripe",
                               "transform": {"series":[{ "type":"S", "value":[0.03,0.05,0.05] },{ "type":"Ry", "value":1 }]}, 
                               "colours" : [[0.37,0.21,0.10],[0.16, 0.16, 0.16]]
                             }
                }
  },
  {
    "name": "floor",
    "type": "cube",
    "transform": {"series":[{ "type":"S", "value":[17,15.5,17] }]}, 
    "material": { "ambient": 0.2, "diffuse": 1.0, "specular":0,                  
                  "pattern": { "type": "checker",
                               "transform": {"series":[{ "type":"S", "value":[0.315,0.315,0.315] }]}, 
                               "colours" : [[0.7, 0.6, 0.6],[0.16, 0.16, 0.16]]
                             }
                }
  }
  ]
}

`);

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

      let from = ray.Point(this.setupDef.cameras[0].origfrom[0], this.setupDef.cameras[0].origfrom[1], this.setupDef.cameras[0].origfrom[2]);
      let to = ray.Point(this.setupDef.cameras[0].to[0], this.setupDef.cameras[0].to[1], this.setupDef.cameras[0].to[2]);
      let val = document.getElementById("zCamera").value;
      let num = parseFloat(val);
      console.log(num);
      let v = ray.Touple.subtract(to, from).normalize().times(num);
      from.plus(v);
      this.setupDef.cameras[0].from[0] = from.x;
      this.setupDef.cameras[0].from[1] = from.y;
      this.setupDef.cameras[0].from[2] = from.z;

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

        if (ray.Origin.w == 0)
        {
          console.log("NOOOO");
        }
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

  ray.stages[13] = new Stage13();
})();
