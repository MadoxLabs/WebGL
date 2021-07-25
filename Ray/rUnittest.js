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

    runSuite(s, onlyFails)
    {
      let ret = [];
      let suite = this.suites[s];
      for (let s in suite)
      {
        let test = suite[s]();
        this.total += 1;
        let result = false;
        try
        {
          result = test.test();
          if (result) this.success += 1;
          if (!onlyFails || !result)
          {
            ret.push(test.name);
            ret.push(" - " + result);
          }
        } catch (e) { ret.push(test.name); ret.push(" - crash: " + e); }
      }
      return ret;
    }

    run(onlyFails)
    {
      let ret = [];
      for (let s in this.suites)
      {
        let lines = this.runSuite(s, onlyFails);
        ret = [].concat( ret, lines );
      }

      return ret;
    }
  }

  ray.Tester = Tester;
})();
