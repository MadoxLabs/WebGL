(function (){

  class Stage4
  {
    constructor()
    {
      this.template = `
<p>Stage 4 - Transforms</p>
<p>Test that transforms work by transforming some points around</p>
<p>IN PROGRESS</p>
`;
    }

    run()
    {
      document.getElementById("stages").innerHTML = this.template;
    }
  }

  ray.stages[4] = new Stage4();
})();
