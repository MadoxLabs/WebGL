(function (){

	class Tester
	{		
		constructor()
    {
      this.names = [];
      this.suites = [];
      for (let c in ray.classlist)
      {
        this.names.push(ray.classlist[c].name);
        this.suites.push(this.populate(ray.classlist[c]));
      }
		}

    populate(obj)
    {
      let list = Object.getOwnPropertyNames(obj);
      let ret = [];
      for (let i in list)
      {
        let n = list[i];
        if (!n.includes("test")) continue;
        ret.push(obj[n]);
      }
      return ret;
    }

    prepare()
    {
      this.total = 0;
      this.success = 0;
    }

    runSuite(s)
    {
      let suite = this.suites[s];
      for (let s in suite)
      {
        let test = suite[s]();
        this.total += 1;
        console.log(test.name)
        let result = false;
        try
        {
          result = test.test();
          if (result) this.success += 1;
        } catch (e) { console.log(" - crash: " + e); }
        console.log(" - " + result);
      }
    }

    run()
		{
			for (let s in this.suites)
      {
        this.runSuite(s);
			}

      console.log("RESULT: " + this.total + " tests. " + this.success + " OK. " + (this.total - this.success) +" BAD.");
		}
	}

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
	ray.Tester = Tester;
})();
