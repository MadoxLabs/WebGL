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
      if (type == "stages")
      {
        for (let i = 1; i < 30; ++i)
        {
          if (ray.stages[i])
            ret += this.renderTOCButton("Stage "+i, (i-1), (i == 1));
        }
      }

      var out = document.getElementById("TOC");
      out.innerHTML = ret;
    }

    runTest(test)
    {
      this.tester.prepare();

      let output = [];
      if (test == 0)
      {
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

    runStage(ch)
    {
      for (let c in ray.stages)
        if (ray.stages[c].stop) ray.stages[c].stop();
      ray.stages[ch].run();
    }
    

    runTests()
		{
			tester.run();
		}
	}

	ray.App = new App();
})();
