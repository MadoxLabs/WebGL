(function (){

  class Stage4
  {
    constructor()
    {
      this.template = `
<p>Stage 4 - Transforms</p>
<p>Test that transforms work by transforming some points around</p>
<div><canvas id='surface' width="400" height="400"></div>`;
    }

    stop()
    {
      this.halt = true;
    }

    run()
    {
      this.halt = false;

      console.log("run!");
      document.getElementById("stages").innerHTML = this.template;

      this.canvas = new ray.Canvas();
      this.canvas.fromElement("surface");
      this.dot = ray.RGBColour(1, 1, 1);

      this.points = [];
      let step = (360.0/12.0) * 2.0 * Math.PI / 360.0;
      let angle = 0;
      for (let i = 0; i < 12; ++i)
      {
        let p = ray.Point(0, 0, 0);
        // translate up in Y
        let T = ray.Matrix.translation(0, 100, 0);
        p = T.times(p);
        // rotate around Z
        let R = ray.Matrix.zRotation(angle);
        p = R.times(p);
        // move to middle of screen
        let W = ray.Matrix.translation(200, 200, 0);
        p = W.times(p);

        this.points[i] = p;
        angle += step;
      }
      this.hand = 0;
      this.handStep = (360.0 / 60.0) * 2.0 * Math.PI / 360.0;

      this.tick();
    }

    tick()
    {
      // repeat
      if (!this.halt)
      {
        let obj = this;
        setTimeout(function () { obj.tick(); }, 1000);
      }

      // clear
      this.canvas.clear();
      // create clock points
      for (let i = 0; i < 12; ++i)
        this.canvas.set(this.dot, this.points[i].x, this.points[i].y);

      // draw hand
      for (let i = 0; i < 90; ++i)
      {
        let p = ray.Point(0, 0, 0); 
        // translate up in Y
        let T = ray.Matrix.translation(0, 90-i, 0);
        p = T.times(p);
        // rotate around Z
        let R = ray.Matrix.zRotation(-this.hand);
        p = R.times(p);
        // move to middle of screen
        let W = ray.Matrix.translation(200, 200, 0);
        p = W.times(p);
        this.canvas.set(this.dot, p.x, p.y);
      }
      this.hand += this.handStep;

      // draw
      this.canvas.draw();
    }
  }

  ray.stages[4] = new Stage4();
})();
