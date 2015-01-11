function MoverTranslate(from, to, t) // vec3 extent, float time
{
  this.from = from;
  this.to = to;
  this.time = t * 1000.0;

  this.step = vec3.create();
  this.pos = vec3.create();
  vec3.copy(this.pos, this.from);
  this.tmp = vec3.create();
}

MoverTranslate.prototype.start = function()
{
  if (this.startTime) return;
  this.startTime = Date.now();

  vec3.subtract(this.step, this.to, this.from);
  vec3.scale(this.step, this.step, 1.0 / this.time);
  this.timestep = 0;
  vec3.copy(this.pos, this.from);
}

MoverTranslate.prototype.stop = function ()
{
  this.startTime = 0;
  vec3.copy(this.pos, this.to);
  vec3.copy(this.tmp, this.from);
  vec3.copy(this.from, this.to);
  vec3.copy(this.to, this.tmp);
}

MoverTranslate.prototype.update = function ()
{
  if (!this.startTime) return;

  var now = Date.now();
  var elapsed = now - this.startTime;

  if (this.timestep + elapsed > this.time) { this.stop(); return; }
  this.timestep = this.timestep + elapsed;
  vec3.scale(this.tmp, this.step, elapsed);
  vec3.add(this.pos, this.pos, this.tmp);
}

MoverTranslate.prototype.apply = function (body)
{
  vec3.copy(body.Position, this.pos);
}



function MoverRotate(angle) 
{
  this.step = angle / 1000.0;  // angle per second
  this.quat = quat.create();
  this.angle = 0;
}

MoverRotate.prototype.start = function ()
{
  if (this.startTime) return;
  this.startTime = Date.now();
}

MoverRotate.prototype.stop = function ()
{
  this.startTime = 0;
}

MoverRotate.prototype.update = function ()
{
  if (!this.startTime) return;

  this.angle += this.step * Game.elapsed;
  quat.identity(this.quat);
  quat.rotateY(this.quat, this.quat, this.angle);
}

MoverRotate.prototype.apply = function (body)
{
  body.setOrientationQuat(this.quat);
}
