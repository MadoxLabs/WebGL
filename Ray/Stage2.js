(function (){

  class Stage2
  {
    constructor()
    {
      this.template = `
<p>Stage 2 - Rendering to canvas</p>
<p>Test that we're able to render to a canvas by drawing the simple cannon's firing trajectory</p>
<table>
  <tr><td><p>Gravity:</td><td><input type=text id="grav" value=-0.1></td></tr>
  <tr><td><p>Wind:</td><td><input type=text id="wind" value=-0.015></td></tr>
  <tr><td><p>Power</td><td><input type=text id="powerX" value=5> <input type=text id="powerY" value=10></td></tr>
</table>
<button id="fire" onclick="obj.fire()" value="Fire">Fire</button>
<div><canvas id='surface' width="800" height="600"></div>
`;
    }

    run()
    {
      document.getElementById("stages").innerHTML = this.template;
      document.getElementById("fire").obj = this;
      this.canvas = new ray.Canvas();
      this.canvas.fromElement("surface");
      this.dot = new ray.Colour(1, 1, 1);
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
      if (this.position.y > 0 && this.position.x >= 0 && this.position.x <= this.canvas.width) setTimeout(function () { obj.tick(); }, 0.1);
    }

    logPosition()
    {
      this.canvas.set(this.dot, this.position.x, this.position.y);
      this.canvas.draw();
    }
  }

  ray.stages[2] = new Stage2();
})();
