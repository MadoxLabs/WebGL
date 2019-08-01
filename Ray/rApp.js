(function (){

	class App
	{
		constructor() 
		{
		}

		init()
		{
			console.log("App init!");

      var out = document.getElementById("message");
      out.innerHTML = "Ready";

      this.tester = new ray.Tester();
      this.drawTOC("tests");

      changeHead(1);
      changeTab(0);
		}

    renderTOCButton(name, id, active)
    {
      return "<div id=\"tab"+id+"\" class=\"mxButton "+(active ? "active" : "inactive")+"\" onclick=\"changeTab("+id+");\">"+name+"</div>";
    }

    drawTOC(type)
    {
      let ret = "";
      if (type == "tests")
      {
        ret = this.renderTOCButton("All", 0, true);
        for (let i in this.tester.names)
        {
          ret += this.renderTOCButton(this.tester.names[i], (i | 0) + 1, false);
        }
      }
      if (type == "chapters")
      {
        for (let i = 0; i < 2; ++i)
        {
          ret += this.renderTOCButton("Chapter "+(i+1), i, (i == 0));
        }
      }

      var out = document.getElementById("TOC");
      out.innerHTML = ret;
    }

    runTest(test)
    {
      this.tester.prepare();

      let output = [];
      if (test == 0) {
        output = this.tester.run();
      } else {
        output = this.tester.runSuite(test-1);
      }

      let buf = "<div class='mxText'>Test Results: "+this.tester.total+" Total, "+this.tester.success+" Success, "+(this.tester.total - this.tester.success)+" Fail</div>";
      buf += "<div style='width: 80%; height: 80%; overflow-x: hidden; overflow-y: scroll;'><table class=\"blueTable\"><tbody><tr>";
      for (let i in output)
        buf += "<tr><td>"+output[i]+"</td></tr>";
      buf += "</tbody></table></div>";
      document.getElementById("tests").innerHTML = buf;
    }

    runChapter(ch)
    {
      ray.chapters[ch].run();
    }
    

    runTests()
		{
			tester.run();
		}
	}

  class Chapter1
  {
    constructor()
    {
      this.template = `
<p>Chapter 1 - Simple Cannon</p>
<table>
<tr><td><p>Gravity:</td><td><input type=text id="grav" value=-0.1></td></tr>
<tr><td><p>Wind:</td><td><input type=text id="wind" value=-0.01></td></tr>
<tr><td><p>Power</td><td><input type=text id="powerX" value=1> <input type=text id="powerY" value=1></td></tr>
</table>
<button id="fire" onclick="obj.fire()" value="Fire">Fire</button>
<p>Projectile coordinates:</p>
<table id="coords" class="blueTable"><tbody></tbody></table>
`;
    }

    run()
    {
      document.getElementById("chapters").innerHTML = this.template;
      document.getElementById("fire").obj = this;
    }

    fire()
    {
      document.getElementById("coords").innerHTML = "";
      this.grav = ray.Vector(0, parseFloat(document.getElementById("grav").value), 0);
      this.wind = ray.Vector(parseFloat(document.getElementById("wind").value), 0, 0);
      this.position = ray.Point(0, 1, 0);
      this.velocity = ray.Vector(parseFloat(document.getElementById("powerX").value), parseFloat(document.getElementById("powerY").value), 0);
      this.logPosition();
      let obj = this;
      setTimeout(function () { obj.tick(); }, 0.1);
    }

    tick()
    {
      this.position.plus(this.velocity);
      this.velocity.plus(this.grav).plus(this.wind);
      this.logPosition();
      let obj = this;
      if (this.position.y > 0) setTimeout(function () { obj.tick(); }, 0.1);
    }

    logPosition()
    {
      let table = document.getElementById("coords");
      let row = table.insertRow(table.rows.length);
      let cell1 = row.insertCell(0);
      cell1.innerHTML = this.position.x;
      let cell2 = row.insertCell(1);
      cell2.innerHTML = this.position.y;
    }
  }

  class Chapter2
  {
    constructor()
    {
      this.template = `
<p>Chapter 2 - Visible Simple Cannon</p>
<table>
  <tr><td><p>Gravity:</td><td><input type=text id="grav" value=-0.1></td></tr>
  <tr><td><p>Wind:</td><td><input type=text id="wind" value=-0.01></td></tr>
  <tr><td><p>Power</td><td><input type=text id="powerX" value=1> <input type=text id="powerY" value=1></td></tr>
</table>
<button id="fire" onclick="obj.fire()" value="Fire">Fire</button>
<div><canvas id='surface' width="800" height="600"></div>
`;
    }

    run()
    {
      document.getElementById("chapters").innerHTML = this.template;
      document.getElementById("fire").obj = this;
      this.canvas = document.getElementById("surface");
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.context = this.canvas.getContext("2d");
      this.context.fillStyle = "black";
      this.context.fillRect(0, 0, this.width, this.height);
      this.map = this.context.getImageData(0, 0, this.width, this.height);

//      this.pixel = this.context.createImageData(1, 1);
//      this.pixel.data[0] = 255;
//      this.pixel.data[1] = 255;
//      this.pixel.data[2] = 255;
//      this.pixel.data[3] = 255;
    }

    fire()
    {
      this.grav = ray.Vector(0, parseFloat(document.getElementById("grav").value), 0);
      this.wind = ray.Vector(parseFloat(document.getElementById("wind").value), 0, 0);
      this.position = ray.Point(0, 1, 0);
      this.velocity = ray.Vector(parseFloat(document.getElementById("powerX").value), parseFloat(document.getElementById("powerY").value), 0);
      this.logPosition();
      let obj = this;
      setTimeout(function () { obj.tick(); }, 0.1);
    }

    tick()
    {
      this.position.plus(this.velocity);
      this.velocity.plus(this.grav).plus(this.wind);
      this.logPosition();
      let obj = this;
      if (this.position.y > 0 && this.position.x >= 0 && this.position.x <= this.width) setTimeout(function () { obj.tick(); }, 0.1);
    }

    logPosition()
    {
//      this.context.putImageData(this.pixel, this.position.x, this.map.height-this.position.y);

      let red = (this.height-Math.floor(this.position.y)) * (this.width * 4) + Math.floor(this.position.x) * 4;
      this.map.data[red + 0] = 255;
      this.map.data[red + 1] = 255;
      this.map.data[red + 2] = 255;
      this.map.data[red + 3] = 255;

      this.context.putImageData(this.map, 0, 0);
    }
  }

  ray.chapters[1] = new Chapter1();
  ray.chapters[2] = new Chapter2();
	ray.App = new App();
})();
