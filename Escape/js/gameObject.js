function GameObject(model, name)
{
//  this.id = Game.world.objects.length;
  if (name)
  {
    this.name = name;
    Game.world.objects[name] = this;
  }

  this.Model = model;
  this.LocalPosition = vec3.fromValues(0, 0, 0);
  this.Position = vec3.fromValues(0, 0, 0);
  this.Rotation = quat.create(); quat.identity(this.Rotation);
  this.Velocity = vec3.create();

  this.Trans = mat4.create(); mat4.identity(this.Trans);
  this.Orient = mat4.create(); mat4.identity(this.Orient);

  this.uniform = {};
  this.uniform.uWorld = mat4.create();

  this.dirty = false;
}

GameObject.prototype.Place = function (x,y,z)
{
  vec3.set(this.LocalPosition, x, y, z);
  this.dirty = true;
}

GameObject.prototype.Rotate = function (x, y, z, w)
{
  quat.set(this.Rotation, x, y, z, w);
  this.dirty = true;
}

GameObject.prototype.Update = function ()
{
  if (!this.dirty && !this.mover) return;

  this.dirty = false;
  vec3.copy(this.Position, this.LocalPosition);
  if (this.mover) {
    this.mover.update();
    this.mover.apply(this);
  }
  mat4.fromQuat(this.Orient, this.Rotation);
  mat4.identity(this.Trans);
  mat4.translate(this.Trans, this.Trans, this.Position);
  mat4.multiply(this.uniform.uWorld, this.Trans, this.Orient);
}

GameObject.prototype.setMover = function(m)
{
  this.mover = m;
}

