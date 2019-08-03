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
    }
  }

  ray.stages[5] = new Stage5();
})();
