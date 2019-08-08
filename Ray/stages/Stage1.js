(function (){

  class Stage1
  {
    constructor()
    {
      this.template = `
<p>Stage 1 - Vector Library</p>
<p>Test that the vector classes work but simulating a simple cannon firing</p>
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
      document.getElementById("stages").innerHTML = this.template;
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
  
  ray.stages[1] = new Stage1();
})();
