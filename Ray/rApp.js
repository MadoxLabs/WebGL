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
      let output = [];
      if (test == 0) {
        console.log("Run all tests");
        output = this.tester.run();
      }
      else{
        console.log("Run Tests: " + test + " : " + this.tester.names[test-1]);
        output = this.tester.runSuite(test-1);
      }

      let buf = "";
      for (let i in output)
      {
        buf += output[i]+"<br>";
      }
      document.getElementById("tests").innerHTML = buf;
    }

    runChapter(ch)
    {
      console.log("Run Chapter: " + ch);
    }
    

    runTests()
		{
			tester.run();
		}

		run()
    {
      this.grav = ray.Vector(0, -0.1, 0);
      this.wind = ray.Vector(-0.01, 0, 0);
      this.position = ray.Point(0, 1, 0);
      this.velocity = ray.Vector(1, 1, 0);
      let obj = this;
      setTimeout(function () { obj.tick(); }, 0.1);
    }

    tick()
    {
      this.position.plus(this.velocity);
      this.velocity.plus(this.grav).plus(this.wind);
      console.log(this.position.x + " , " + this.position.y);
      let obj = this;
      if (this.position.y > 0) setTimeout(function () { obj.tick(); }, 0.1);
    }
	}

	ray.App = new App();
})();
