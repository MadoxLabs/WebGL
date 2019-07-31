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
      let ret = [];
      let suite = this.suites[s];
      for (let s in suite)
      {
        let test = suite[s]();
        this.total += 1;
        ret.push(test.name);
//        console.log(test.name)
        let result = false;
        try
        {
          result = test.test();
          if (result) this.success += 1;
        } catch (e) { ret.push(" - crash: " + e); }
        ret.push(" - " + result)
      }
      return ret;
    }

    run()
		{
      let ret = [];
			for (let s in this.suites)
      {
        ret.concat( this.runSuite(s) );
			}

      console.log("RESULT: " + this.total + " tests. " + this.success + " OK. " + (this.total - this.success) +" BAD.");
      return ret;
		}
	}

	ray.Tester = Tester;
})();
