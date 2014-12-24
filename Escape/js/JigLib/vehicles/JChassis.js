
JigLib.JChassis = function(car, skin, width, depth, height)
{
	this._car = null; // JCar

		JigLib.JBox.apply(this, [ skin, width, depth, height ]);

		this._car = car;
		
}

JigLib.extend(JigLib.JChassis, JigLib.JBox);

JigLib.JChassis.prototype.get_car = function()
{

		return this._car;
		
}

JigLib.JChassis.prototype.postPhysics = function(dt)
{

		JigLib.JBox.prototype.postPhysics.apply(this, [ dt ]);
		this._car.addExternalForces(dt);
		this._car.postPhysics(dt);
		
}



