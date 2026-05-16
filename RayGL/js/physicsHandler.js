function PhysicsWorker()
{
  this.worker = new Worker("js/physicsWorker.js");;
  this.sendTime = 0;
  this.dt = 1 / 60;
  this.liveobjects = 20;
  this.positions = new Float32Array(3 * this.liveobjects);

  var self = this;
  this.worker.onmessage = function (event) { self.fromWorker(event); };
  this.worker.onerror = function (event) { console.log("ERROR: " + event.message + " (" + event.filename + ":" + event.lineno + ")"); };
  this.toWorker();
}

PhysicsWorker.prototype.toWorker = function ()
{
  this.sendTime = Date.now();
  this.worker.postMessage({
    dt: this.dt,
    positions: this.positions
  }, [this.positions.buffer]);
}

PhysicsWorker.prototype.fromWorker = function (e)
{
  this.handlePhysicsUpdate(e.data.positions);
}

PhysicsWorker.prototype.handlePhysicsUpdate = function (positions)
{
  // Get fresh data from the worker
  this.positions = positions;
  for (let i = 0; i < 20; ++i)
  {
    let pos = Matrix.translation(this.positions[3 * i + 0], this.positions[3 * i + 1], this.positions[3 * i + 2])
    let size = Matrix.scale(0.25, 0.25, 0.25);
    Game.World.objects[i + 1].transform = size.times(pos);
  }
  this.nextPhysicsTick();
}

PhysicsWorker.prototype.nextPhysicsTick = function (index, name)
{
  // If the worker was faster than the time step (dt seconds), we want to delay the next timestep
  var delay = this.dt * 1000 - (Date.now() - this.sendTime);
  var self = this;
  if (delay < 0) delay = 0;
  setTimeout(function () { self.toWorker(); }, delay);
}
