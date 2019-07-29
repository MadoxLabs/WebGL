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
		
		plus(t)
		{
			this.x += t.x;
			this.y += t.y;
			this.z += t.z;
			this.w += t.w;
			return this;
		}

		minus(t)
		{
			if (t.isPoint() && this.isVector()) throw "subtracting point from a vector";
			this.x -= t.x;
			this.y -= t.y;
			this.z -= t.z;
			this.w -= t.w;
			return this;
		}

		static add(t1, t2)
		{
			return new rTouple(t1.x + t2.x, t1.y + t2.y, t1.z + t2.z, t1.w + t2.w);
		}

		static subtract(t1, t2)
		{
			let ret = new Touple(t1.x, t1.y, t1.z, t1.w);
			return ret.minus(t2);
		}

		// tests
		static getTests()
		{
			return [rTouple.test1, rTouple.test2, rTouple.test3, rTouple.test4, rTouple.test5];
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

		static test5()
		{
			return {name: "Check that adding touples works", test: function() {
				let t1 = new ray.Touple(4, -4, 3, 1);
				let t2 = new ray.Touple(-1, 2, 4, 0);
				let t3 = ray.Touple.add(t1,t2);
				t1.plus(t2);
				if (t3.x != 3) return false;
				if (t3.y != -2) return false;
				if (t3.z != 7) return false;
				if (t3.w != 1.0) return false;
				if (t3.isPoint() != true) return false;
				if (t3.isVector() != false) return false;
				if (t1.x != 3) return false;
				if (t1.y != -2) return false;
				if (t1.z != 7) return false;
				if (t1.w != 1.0) return false;
				if (t1.isPoint() != true) return false;
				if (t1.isVector() != false) return false;
				return true;
			}};
		}
	}

	ray.Touple = rTouple;
	ray.Point = function(x,y,z) { return new rTouple(x,y,z,1.0); }
	ray.Vector = function(x,y,z) { return new rTouple(x,y,z,0.0); }
	ray.epsilon = 0.00001;
	ray.isEqual = function(a,b) { return Math.abs(a-b) < ray.epsilon; }
})();
