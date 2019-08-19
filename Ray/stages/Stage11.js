(function (){

  class Stage11
  {
    constructor()
    {
      this.template = `
<p>Stage 11 - Reflection and Refraction</p>
<p>The good stuff!</p>
<table><tr><td>
<div><canvas id='surface' width="800" height="800"></div>
</td><td><p>
Scene:  <input type="range" min="0" max="2" value="2" onInput="obj.transform()" step="1" class="slider" id="scene"> <br>
<br>
Antialias:  <input type="range" min="0" max="2" value="2" onInput="obj.transform()" step="1" class="slider" id="aa"> <br>
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
      document.getElementById("scene").obj = this;
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
      this.scenes = [
        {
          renderOptions: {
            antialias: 4,
            maxReflections: 10
          },
          cameras: [
            {
              name: "main",
              width: 800,
              height: 800,
              fov: Math.PI * 0.4,
              from: [0, 3, -5],
              origfrom: [0, 3, -5],
              to: [0, 1, 0],
              up: [0, 1, 0]
            }
          ],
          transforms: [
            {
              name: "ball1",
              series: [{ type: "T", value: [-1.25, 1, 0] }]
            },
            {
              name: "ball2",
              series: [{ type: "T", value: [1.25, 1, 0] }]
            },
            {
              name: "back",
              series: [{ type: "T", value: [0, 0, 4] }, { type: "Rx", value: Math.PI / -2 }]
            },
            {
              name: "back2",
              series: [{ type: "T", value: [0, 0, -6] }, { type: "Ry", value: Math.PI },{ type: "Rx", value: Math.PI / -2 }]
            }
          ],
          patterns: [
            {
              name: "brown",
              type: "solid",
              colours: [111 / 255, 78 / 255, 12 / 255]
            },
            {
              name: "black",
              type: "solid",
              colours: [0,0,0]
            },
            {
              name: "floor",
              type: "checker",
              colours: ["brown","black"]
            }
          ],
          materials: [
            {
              name: "floor",
              shininess: 300,
              pattern: "floor",
              reflective: 0.3
            },
            {
              name: "ball1",
              shininess: 5,
              specular: 0.3,
              colour: [1,0,0]
            },
            {
              name: "ball2",
              shininess: 300,
              colour: [0.2, 0.2, 0.2],
              reflective: 0.9
            },
            {
              name: "back",
              shininess: 300,
              colour: [0.1, 0.1, 0.1],
              reflective: 0.99
            }
          ],
          lights: [
            {
              type: "pointlight",
              position: [-10, 10, -10],
              intensityDiffuse: 1.1,
              intensityAmbient: 0.4,
              colour: [1, 1, 1],
            }
          ],
          objects: [
            {
              type: "sphere",
              material: "ball1",
              transform: "ball1"
            },
            {
              type: "sphere",
              material: "ball2",
              transform: "ball2"
            },
            {
              type: "plane",
              transform: "back",
              material: "back",
              xMin: -4,
              xMax: 4,
              yMin: 0,
              yMax: 4
            },
            {
              type: "plane",
              transform: "back2",
              material: "back",
              xMin: -4,
              xMax: 4,
              yMin: 0,
              yMax: 4
            },
            {
              type: "plane",
              material: "floor"
            }
          ]
        },
        
        {
          renderOptions: {
            antialias: 0,
            maxReflections: 5,
            shadowing: true
          },
          cameras: [
            {
              name: "main",
              width: 800,
              height: 800,
              fov: 1.152,
              from: [-2.6, 1.5, -3.9],
              origfrom: [-2.6, 1.5, -3.9],
              to: [-0.6, 1, -0.8],
              up: [0, 1, 0]
            }
          ],
          transforms: [
            {
              name: "pWall",
              series: [{ type: "Ry", value: 1.5708 }, { type: "S", value: [0.25,0.25,0.25] }]
            },
            {
              name: "floor",
              series: [{ type: "Ry", value: 0.31415 }]
            },
            {
              name: "ceiling",
              series: [{ type: "T", value: [0,5,0] }]
            },
            {
              name: "west",
              series: [{ type: "T", value: [-5,0,0] }, { type: "Rz", value: 1.5708 }, { type: "Ry", value: 1.5708}]
            },
            {
              name: "east",
              series: [{ type: "T", value: [5, 0, 0] }, { type: "Rz", value: 1.5708 }, { type: "Ry", value: 1.5708 }]
            },
            {
              name: "north",
              series: [{ type: "T", value: [0, 0, 5] }, { type: "Rx", value: 1.5708 }]
            },
            {
              name: "south",
              series: [{ type: "T", value: [0, 0, -5] }, { type: "Rx", value: 1.5708 }]
            },
            {
              name: "bg1",
              series: [{ type: "T", value: [4.6, 0.4, 1] }, { type: "S", value: [0.4, 0.4, 0.4] }]
            },
            {
              name: "bg2",
              series: [{ type: "T", value: [4.7, 0.3, 0.4] }, { type: "S", value: [0.3, 0.3, 0.3] }]
            },
            {
              name: "bg3",
              series: [{ type: "T", value: [-1, 0.5,4.5] }, { type: "S", value: [0.5, 0.5, 0.5] }]
            },
            {
              name: "bg4",
              series: [{ type: "T", value: [-1.7, 0.3, 4.7] }, { type: "S", value: [0.3, 0.3, 0.3] }]
            },
            {
              name: "fg1",
              series: [{ type: "T", value: [-0.6, 1, 0.6] }]
            },
            {
              name: "fg2",
              series: [{ type: "T", value: [0.6, 0.7, -0.6] }, { type: "S", value: [0.7, 0.7, 0.7] }]
            },
            {
              name: "fg3",
              series: [{ type: "T", value: [-0.7, 0.5, -0.8] }, { type: "S", value: [0.5, 0.5, 0.5] }]
            }
          ],
          patterns: [
            {
              name: "wall",
              type: "stripe",
              colours: [[0.45, 0.45, 0.45], [0.55, 0.55, 0.55]],
              transform: "pWall"
            },
            {
              name: "floor",
              type: "checker",
              colours: [[0.35, 0.35, 0.35], [0.65, 0.65, 0.65]]
            }
          ],
          materials: [
            {
              name: "wall",
              specular: 0,
              ambient: 0,
              diffuse: 0.4,
              pattern: "wall",
              reflective: 0.3
            },
            {
              name: "floor",
              specular: 0,
              reflective: 0.4,
              pattern: "floor",
            },
            {
              name: "ceiling",
              specular: 0,
              ambient: 0.3,
              colour: [0.8, 0.8, 0.8]
            },
            {
              name: "bg1",
              shininess: 50,
              colour: [0.8, 0.5, 0.3]
            },
            {
              name: "bg2",
              shininess: 50,
              colour: [0.9, 0.4, 0.5]
            },
            {
              name: "bg3",
              shininess: 50,
              colour: [0.4, 0.9, 0.6]
            },
            {
              name: "bg4",
              shininess: 50,
              colour: [0.4, 0.6, 0.9]
            },
            {
              name: "fg1",
              shininess: 5,
              specular: 0.4,
              colour: [1, 0.3, 0.2]
            },
            {
              name: "fg2",
              ambient: 0,
              diffuse: 0.4,
              shininess: 300,
              specular: 0.9,
              reflective: 0.9,
              transparency: 0.9,
              refraction: 1.5,
              colour: [0, 0, 0.2]
            },
            {
              name: "fg3",
              ambient: 0,
              diffuse: 0.4,
              shininess: 300,
              specular: 0.9,
              reflective: 0.9,
              transparency: 0.9,
              refraction: 1.5,
              colour: [0, 0.2, 0]
            }
          ],
          lights: [
            {
              type: "pointlight",
              position: [-4.9, 4.9, -1],
              colour: [1, 1, 1]
            }
          ],
          objects: [
            {
              type: "plane",
              transform: "floor",
              material: "floor"
            },
            {
              type: "plane",
              transform: "ceiling",
              material: "ceiling"
            },
            {
              type: "plane",
              transform: "west",
              material: "wall"
            },
            {
              type: "plane",
              transform: "east",
              material: "wall"
            },
            {
              type: "plane",
              transform: "north",
              material: "wall"
            },
            {
              type: "plane",
              transform: "south",
              material: "wall"
            },
            {
              type: "sphere",
              transform: "bg1",
              material: "bg1"
            },
            {
              type: "sphere",
              transform: "bg2",
              material: "bg2"
            },
            {
              type: "sphere",
              transform: "bg3",
              material: "bg3"
            },
            {
              type: "sphere",
              transform: "bg4",
              material: "bg4"
            },
            {
              type: "sphere",
              transform: "fg1",
              material: "fg1"
            },
            {
              type: "sphere",
              transform: "fg2",
              material: "fg2"
            },
            {
              type: "sphere",
              transform: "fg3",
              material: "fg3"
            }
          ]
        },

        {
          renderOptions: {
            antialias: 0,
            maxReflections: 5,
            shadowing: true
          },
          cameras: [
            {
              name: "main",
              width: 800,
              height: 800,
              fov: Math.PI/3,
              from: [0,2.5,0],
              origfrom: [0,2.5,0],
              to: [0,0,0],
              up: [0, 0, 1]
            }
          ],
          transforms: [
            {
              name: "floor",
              series: [{ type: "T", value: [0, -10.1, 0] }]
            },
            {
              name: "pfloor",
              series: [{ type: "T", value: [0, 0.1, 0] }]
            },
            {
              name: "ball2",
              series: [{ type: "S", value: [0.5,0.5,0.5] }]
            }
          ],
          patterns: [
            {
              name: "floor",
              type: "checker",
              transform: "pfloor",
              colours: [[0,0,0], [1,1,1]]
            }
          ],
          materials: [
            {
              name: "floor",
              pattern: "floor"
            },
            {
              name: "ball",
              diffuse: 0.1,
              shininess: 300,
              specular: 0.9,
              reflective: 1,
              transparency: 1,
              refraction: 1.52
            },
            {
              name: "ball2",
              diffuse: 0.1,
              shininess: 300,
              specular: 0.9,
              reflective: 1,
              transparency: 1,
              refraction: 1
            }
          ],
          lights: [
            {
              type: "pointlight",
              position: [20,10,0],
              colour: [1, 1, 1]
            }
          ],
          objects: [
            {
              type: "plane",
              transform: "floor",
              material: "floor"
            },
            {
              type: "sphere",
              material: "ball"
            },
            {
              type: "sphere",
              transform: "ball2",
              material: "ball2"
            }
          ]
        }

      ];

      this.setupDef = this.scenes[1];

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
      let scene = parseFloat(document.getElementById("scene").value);
      this.setupDef = this.scenes[scene];

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

  ray.stages[11] = new Stage11();
})();
