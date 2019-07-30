(function (){

	class Tester
	{		
		constructor()
		{
			this.suites = [];
			this.suites.push(this.populate(ray.Touple));
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

    run()
		{
			let total = 0;
			let success = 0;

			for (let s in this.suites)
			{
				let suite = this.suites[s];
				for (let s in suite)
				{
					let test = suite[s]();
					total += 1;
					console.log(test.name)
					let result = false;
					try { 
						result = test.test();
						if (result) success += 1;
					} catch(e) { console.log(" - crash: " +e); }
					console.log(" - " + result);
				}
			}

			console.log("RESULT: " + total +" tests. " + success + " OK. " + (total - success) +" BAD.");
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
			doneLoading();
		}

		runTests()
		{
			let tester = new ray.Tester();
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
