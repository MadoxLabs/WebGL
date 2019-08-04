(function (){

  class Stage5
  {
    constructor()
    {
      this.template = `
<p>Stage 5 - Ray Casting</p>
<p>Test casting rays at a single sphere. The static is to better tell if the ray is hitting the sphere (red) or nothing (black).</p>
<div><canvas id='surface' width="400" height="400"></div>`;
    }

    run()
    {
      document.getElementById("stages").innerHTML = this.template;

      this.canvas = new ray.Canvas();
      this.canvas.fromElement("surface");
      this.canvas.tvstatic();
      this.canvas.draw();

      this.eye = ray.Point(0, 0, -5);
      this.wallDepth = 10;
      this.wallSize = 7;
      this.pixelSize = 7.0 / 400.0;
      this.half = this.wallSize / 2.0;
      this.renderY = 0;
      this.redDot = new ray.Colour(1, 0, 0);
      this.blackDot = new ray.Colour(0, 0, 0);
      this.ball = new ray.Sphere();
      this.ray = new ray.Ray(this.eye, ray.Vector(0,0,1));

      this.start = performance.now();
      this.renderRow();
    }

    renderRow()
    {
      if (this.renderY == 400)
      {
        this.end = performance.now();
        let ms = (this.end - this.start);
        let mspp = Math.floor((ms / (400 * 400)) * 1000) / 1000;
        let seconds = Math.floor((ms / 1000.0) * 10) / 10;
        ray.App.setMessage("Elapsed time: " + seconds +" seconds. " + mspp + " ms/pixel");
        return;
      }

      ray.App.setMessage("Rendering row " + this.renderY);
      let worldY = this.half - this.pixelSize * this.renderY;
      for (let renderX = 0; renderX < 400; ++renderX)
      {
        let worldX = -this.half + this.pixelSize * renderX;
        let pos = ray.Point(worldX, worldY, this.wallDepth);      
        this.ray.direction = pos.minus(this.eye).normalize();
        let points = this.ball.intersect(this.ray);
        if (points.hit())
          this.canvas.set(this.redDot, renderX, this.renderY);
        else
          this.canvas.set(this.blackDot, renderX, this.renderY);
      }
      this.renderY += 1;
      let obj = this;
      setTimeout(function () { obj.renderRow(); }, 0);
      this.canvas.draw();
    }
  }

  ray.stages[5] = new Stage5();
})();
