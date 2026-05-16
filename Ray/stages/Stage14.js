(function (){

  class Stage14
  {
    constructor()
    {
      this.template = `
<p>Stage 14 - Groups and Bounding boxes</p>
<p>A scene showing off groups and AABBs</p>
<p>This scene contains 16 groups of 4 hexagons. Each hexagon contains 6 spheres and 6 cylinders. <br>
That is 768 shapes in all. Without AABB, this renders 23x slower on my computer.</p>
<table><tr><td>
<div><canvas id='surface' width="800" height="800"></div>
</td><td><p>
Antialias:  <input type="range" min="0" max="2" value="0" onInput="obj.transform()" step="1" class="slider" id="aa"> <br>
<br>
Camera:<br>
FOV:  <input type="range" min="0.1" max="2.0" value="0.4" onInput="obj.transform()" step="0.01" class="slider" id="fov"> <br>
Camera distance:  <input type="range" min="-5" max="5" value="0" onInput="obj.transform()" step="0.1" class="slider" id="zCamera"> <br>
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

      if (this.renderY >= 800 && this.thread)
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
      this.rows = new Array(800);
      for (let i = 0; i < 800; ++i)
        this.rows[i] = i;
      this.shuffle(this.rows);

      // world data
      this.setupDef = JSON.parse(`

        {
          "renderOptions": {
            "antialias": 0,
            "maxReflections": 10,
            "regroup": true
          },
          "cameras": [
            {
              "name": "main",
              "width": 800,
              "height": 800,
              "fov": 1.2566,
              "origfrom": [0, 12, 0],
              "from": [0, 12, 0],
              "to": [0, 1, 0],
              "up": [0, 0, 1]
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
      "transforms":[
         { "name":"q1", "series":[{"type": "T", "value" : [-1,0,-1]} ]},
         { "name":"q2", "series":[{"type": "T", "value" : [ 1,0,-1]} ]},
         { "name":"q3", "series":[{"type": "T", "value" : [-1,0, 1]} ]},
         { "name":"q4", "series":[{"type": "T", "value" : [ 1,0, 1]} ]},

         { "name":"g11", "series":[{"type": "T", "value" : [-6,0,-6]} ]},
         { "name":"g12", "series":[{"type": "T", "value" : [-6,0,-2]} ]},
         { "name":"g13", "series":[{"type": "T", "value" : [-6,0, 2]} ]},
         { "name":"g14", "series":[{"type": "T", "value" : [-6,0, 6]} ]},

         { "name":"g21", "series":[{"type": "T", "value" : [-2,0,-6]} ]},
         { "name":"g22", "series":[{"type": "T", "value" : [-2,0,-2]} ]},
         { "name":"g23", "series":[{"type": "T", "value" : [-2,0, 2]} ]},
         { "name":"g24", "series":[{"type": "T", "value" : [-2,0, 6]} ]},

         { "name":"g31", "series":[{"type": "T", "value" : [ 2,0,-6]} ]},
         { "name":"g32", "series":[{"type": "T", "value" : [ 2,0,-2]} ]},
         { "name":"g33", "series":[{"type": "T", "value" : [ 2,0, 2]} ]},
         { "name":"g34", "series":[{"type": "T", "value" : [ 2,0, 6]} ]},

         { "name":"g41", "series":[{"type": "T", "value" : [6,0,-6]} ]},
         { "name":"g42", "series":[{"type": "T", "value" : [6,0,-2]} ]},
         { "name":"g43", "series":[{"type": "T", "value" : [6,0, 2]} ]},
         { "name":"g44", "series":[{"type": "T", "value" : [6,0, 6]} ]}

       ],

          "widgets": [
	{ "type": "hexagon", "name": "h1", "transform": "q1" },
	{ "type": "hexagon", "name": "h2", "transform": "q2" },
	{ "type": "hexagon", "name": "h3", "transform": "q3" },
	{ "type": "hexagon", "name": "h4", "transform": "q4" }
          ],

          "objects": [
{ "type": "group", "transform": "g11", "children": ["h1", "h2", "h3", "h4"] },
{ "type": "group", "transform": "g12", "children": ["h1", "h2", "h3", "h4"] },
{ "type": "group", "transform": "g13", "children": ["h1", "h2", "h3", "h4"] },
{ "type": "group", "transform": "g14", "children": ["h1", "h2", "h3", "h4"] },
{ "type": "group", "transform": "g21", "children": ["h1", "h2", "h3", "h4"] },
{ "type": "group", "transform": "g22", "children": ["h1", "h2", "h3", "h4"] },
{ "type": "group", "transform": "g23", "children": ["h1", "h2", "h3", "h4"] },
{ "type": "group", "transform": "g24", "children": ["h1", "h2", "h3", "h4"] },
{ "type": "group", "transform": "g31", "children": ["h1", "h2", "h3", "h4"] },
{ "type": "group", "transform": "g32", "children": ["h1", "h2", "h3", "h4"] },
{ "type": "group", "transform": "g33", "children": ["h1", "h2", "h3", "h4"] },
{ "type": "group", "transform": "g34", "children": ["h1", "h2", "h3", "h4"] },
{ "type": "group", "transform": "g41", "children": ["h1", "h2", "h3", "h4"] },
{ "type": "group", "transform": "g42", "children": ["h1", "h2", "h3", "h4"] },
{ "type": "group", "transform": "g43", "children": ["h1", "h2", "h3", "h4"] },
{ "type": "group", "transform": "g44", "children": ["h1", "h2", "h3", "h4"] }

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
          this.buffers[i] = new Uint8ClampedArray(800 * 4);
          this.workers[i] = new Worker('stages/worker2.js');
          this.workers[i].addEventListener('message', function (e) { obj.receivePixels(e); }, false);
        }
      }
      else
      {
        this.buffer = new Uint8ClampedArray(800 * 4);
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
      let v = ray.Touple.subtract(to, from).normalize().times(num);
      from.plus(v);
      this.setupDef.cameras[0].from[0] = from.x;
      this.setupDef.cameras[0].from[1] = from.y;
      this.setupDef.cameras[0].from[2] = from.z;

      this.restart = true;
      if (this.renderY >= 800) this.begin();
    }

    renderRow(id)
    {
      if (this.renderY >= 800)
      {
        this.end = performance.now();
        let ms = (this.end - this.start);
        let mspp = Math.floor((ms / (800 * 800)) * 1000) / 1000;
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

  ray.stages[14] = new Stage14();
})();
