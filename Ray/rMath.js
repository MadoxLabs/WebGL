(function (){

	class rTouple
	{
		constructor(x,y,z,w)
		{
			this.x = x;
			this.y = y;
			this.z = z;
			this.w = w;
		}

		isVector()
		{
			return (this.w == 0) ? true : false;
		}

		isPoint()
		{
			return (this.w == 1) ? true : false;
		}
		
		static getTests()
		{
			return [rTouple.test1, rTouple.test2, rTouple.test3, rTouple.test4];
		}

		static test1()
		{
			return {name: "Check that point touples work", test: function() {
				let t = new ray.Touple(4.3, -4.2, 3.1, 1.0);
				if (t.x != 4.3) return false;
				if (t.y != -4.2) return false;
				if (t.z != 3.1) return false;
				if (t.w != 1.0) return false;
				if (t.isPoint() != true) return false;
				if (t.isVector() != false) return false;
				return true;
			}};
		}

		static test2()
		{
			return {name: "Check that vector touples work", test: function() {
				let t = new ray.Touple(4.3, -4.2, 3.1, 0.0);
				if (t.x != 4.3) return false;
				if (t.y != -4.2) return false;
				if (t.z != 3.1) return false;
				if (t.w != 0.0) return false;
				if (t.isPoint() != false) return false;
				if (t.isVector() != true) return false;
				return true;
			}};
		}

		static test3()
		{
			return {name: "Check that vector ctor works", test: function() {
				let t = new ray.Vector(4.3, -4.2, 3.1);
				if (t.x != 4.3) return false;
				if (t.y != -4.2) return false;
				if (t.z != 3.1) return false;
				if (t.w != 0.0) return false;
				if (t.isPoint() != false) return false;
				if (t.isVector() != true) return false;
				return true;
			}};
		}

		static test4()
		{
			return {name: "Check that point ctor works", test: function() {
				let t = new ray.Point(4.3, -4.2, 3.1);
				if (t.x != 4.3) return false;
				if (t.y != -4.2) return false;
				if (t.z != 3.1) return false;
				if (t.w != 1.0) return false;
				if (t.isPoint() != true) return false;
				if (t.isVector() != false) return false;
				return true;
			}};
		}

	}

	ray.Point = function(x,y,z) { return new rTouple(x,y,z,1.0); }
	ray.Vector = function(x,y,z) { return new rTouple(x,y,z,0.0); }
	ray.Touple = rTouple;
})();
