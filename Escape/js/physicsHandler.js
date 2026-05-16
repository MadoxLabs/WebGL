function PhysicsWorker()
{
  this.worker = new Worker("js/physicsWorker.js");;
  this.sendTime = 0;
  this.dt = 1 / 60;
  this.liveobjects = 100;
  this.positions = new Float32Array(3 * this.liveobjects);
  this.quaternions = new Float32Array(4 * this.liveobjects);
  this.bounds = new Float32Array(6 * this.liveobjects);

  var self = this;
  this.worker.onmessage = function (event) { self.fromWorker(event); };
  this.worker.onerror = function (event) { console.log("ERROR: " + event.message + " (" + event.filename + ":" + event.lineno + ")"); };
  this.toWorker();
}

PhysicsWorker.prototype.toWorker = function ()
{
  this.sendTime = Date.now();
  this.worker.postMessage({
    camera: Game.camera.target.rotation,
    forward: Game.camera.forward,
    dt: this.dt,
    positions: this.positions,
    quaternions: this.quaternions,
    bounds: this.bounds
  }, [this.positions.buffer, this.quaternions.buffer, this.bounds.buffer]);
}

PhysicsWorker.prototype.dropItem = function()
{
  // get camera forward, ahead 2 feet is drop location
  var loc = vec3.create();
  vec3.copy(loc, Game.camera.position);
  vec3.add(loc, loc, Game.camera.forward); 
  vec3.add(loc, loc, Game.camera.forward);
  vec3.add(loc, loc, Game.camera.forward);
//  vec3.add(loc, loc, Game.camera.forward);

  this.worker.postMessage({
    drop: true,
    droploc: { x: loc[0], y: loc[1], z: loc[2]}
  });
}

PhysicsWorker.prototype.queryPick = function (near, far)
{
  this.worker.postMessage({
    near: { x: near[0], y: near[1], z: near[2] },
    far: { x: far[0], y: far[1], z: far[2] }
  });
}

PhysicsWorker.prototype.fromWorker = function (e)
{
  if (over) return;
  if (e.data.collide) this.handleCollision(e.data.force, e.data.obj1, e.data.obj2);
  else if (e.data.hit) Game.itemClick(e.data.hit);
  else this.handlePhysicsUpdate(e.data.positions, e.data.quaternions, e.data.bounds, e.data.names, e.data.boundslen);
}

PhysicsWorker.prototype.handlePhysicsUpdate = function (positions,quaternions,bounds,names,boundslen)
{
  // Get fresh data from the worker
  this.positions = positions;
  this.quaternions = quaternions;
  this.bounds = bounds;

  for (var index in names) this.updateBody(index, names[index]);

  this.updateAABBs(boundslen);
  this.nextPhysicsTick();
}

PhysicsWorker.prototype.updateBody = function (index, name)
{
  var body = Game.world.objects[name];
  if (!body) return;
  if (body.name == Game.world.pickup) return;

  body.setPositionXYZ(this.positions[3 * index + 0], this.positions[3 * index + 1], this.positions[3 * index + 2]);

  if (body.name == 'lightswitch') return;
  body.setOrientationXYZW(this.quaternions[4 * index + 0], this.quaternions[4 * index + 1], this.quaternions[4 * index + 2], this.quaternions[4 * index + 3]);
}

PhysicsWorker.prototype.updateAABBs = function (boundslen)
{
  // make new bounding boxes if any were added
  for (var i = Game.world.uAABB.length; i < boundslen; ++i)
  {
    var w = { minBB: vec3.create(), maxBB: vec3.create() };
    Game.world.uAABB.push(w);
  }

  for (var index = 0; index < boundslen; ++index)
  {
    vec3.set(Game.world.uAABB[index].minBB, this.bounds[6 * index + 0], this.bounds[6 * index + 1], this.bounds[6 * index + 2]);
    vec3.set(Game.world.uAABB[index].maxBB, this.bounds[6 * index + 3], this.bounds[6 * index + 4], this.bounds[6 * index + 5]);
  }
}

PhysicsWorker.prototype.nextPhysicsTick = function (index, name)
{
  // If the worker was faster than the time step (dt seconds), we want to delay the next timestep
  var delay = this.dt * 1000 - (Date.now() - this.sendTime);
  var self = this;
  if (delay < 0) delay = 0;
  setTimeout(function () { self.toWorker(); }, delay);
}

PhysicsWorker.prototype.handleCollision = function (force, obj1, obj2)
{
  //    console.log("Collidion: " + obj1 + " hit " + obj2 + " at " + force);
  if (force < -0.01) Game.playHit();
}