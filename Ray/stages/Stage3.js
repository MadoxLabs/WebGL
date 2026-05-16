(function (){

  class Stage3
  {
    constructor()
    {
      this.template = `
<p>Stage 3 - Matrix Library</p>
<p>There is no real test application for the matrix code. The unit tests are sufficient</p>
`;
    }

    run()
    {
      document.getElementById("stages").innerHTML = this.template;
    }
  }
  ray.stages[3] = new Stage3();
})();
