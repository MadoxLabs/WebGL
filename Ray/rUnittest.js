(function (){

	class Tester
	{		
		constructor()
		{
			this.suites = [];
			this.suites.push(ray.Touple.getTests());
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
		}
	}

	ray.App = new App();
	ray.Tester = Tester;
})();
