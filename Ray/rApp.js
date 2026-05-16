(function (){

	class App
	{
		constructor() 
		{
		}

		init()
		{
			console.log("App init!");

      this.setMessage("Ready");

      this.tester = new ray.Tester();
      this.drawTOC("tests");

      changeHead(0);
      changeTab(0);
		}

    setMessage(m)
    {
      var out = document.getElementById("message");
      out.innerText = m;
    }

    renderTestButton(name, id, active)
    {
      return "<div id=\"tab"+id+"\" class=\"mxButton "+(active ? "active" : "inactive")+"\" onclick=\"changeTab("+id+");\">"+name+"</div>";
    }

    renderStageButton(name, id, stage, active)
    {
      return "<div id=\"tab" + id + "\" class=\"mxButton " + (active ? "active" : "inactive") + "\" onclick=\"changeTab(" + id + "," + stage + ");\">" + name + "</div>";
    }

    drawTOC(type)
    {
      let ret = "";
      if (type == "tests")
      {
        ret = this.renderTestButton("All", 0, true);
        for (let i in this.tester.names)
        {
          ret += this.renderTestButton(this.tester.names[i], (i | 0) + 1, false);
        }
      }
      if (type == "stages")
      {
        ret += this.renderStageButton("Info", 0, 999, true);
        let id = 1;
        for (let i = 30; i > 0; --i)
        {
          if (ray.stages[i])
          {
            ret += this.renderStageButton(ray.stages[i].name ? ray.stages[i].name : "Stage " + i, id, i, false);
            id++;
          }
        }
      }

      var out = document.getElementById("TOC");
      out.innerHTML = ret;
    }

    runTest(test, onlyFails)
    {
      this.tester.prepare();

      let output = [];
      if (test == 0)
      {
        output = this.tester.run(onlyFails);
      } else {
        output = this.tester.runSuite(test-1, onlyFails);
      }

      let buf = "<div class='mxText'>Test Results: " + this.tester.total + " Total, " + this.tester.success + " Success, " + (this.tester.total - this.tester.success) + " Fail";
      buf += " <button onclick='ray.App.runTest("+test+")'>Run Again</button>";
      buf += " <button onclick='ray.App.runTest("+test+", true)'>Show Fails</button></div > ";
      buf += "<table class=\"blueTable\"><tbody><tr>";
      for (let i in output)
        buf += "<tr><td>"+output[i]+"</td></tr>";
      buf += "</tbody></table>";
      document.getElementById("tests").innerHTML = buf;
    }

    runStage(ch)
    {
      if (!ch || ch == 999)
      {
        let info = `
<p>Info</p>
<p>This is a landing page so the site won't immediately fire off an intensive ray tracing job.</p>
<p>Your computer can handle `+ navigator.hardwareConcurrency + ` web workers</p>
`;
        document.getElementById("stages").innerHTML = info;
        return;
      }

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
