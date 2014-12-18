

// camera can be in:
//   free mode - camera has position and orientation
//   offset target mode - camera only has offset, using a target object as reference. Has orientation
//                      - act like on a string, user can still make slight adjustments like Z axis
//   free target mode - camera has position and orientation but always faces target object
//                    - set which axis to lock, x or y or none

var CAMERA_LEFTEYE = 1;
var CAMERA_RIGHTEYE = 2;
var CAMERA_MAIN = 3;

function CameraEye(c, t)
{
  this.ipd = 0.0;
  this.camera = c;
  this.type = t;
  this.viewport = vec4.create();
  this.view = mat4.create();
  this.projection = mat4.create();

  this.uniforms = {};
  this.uniforms.camera = c.position;
  this.uniforms.view = this.view;
  this.uniforms.projection = this.projection;

  this.handleSizeChange();
}

CameraEye.prototype.handleSizeChange = function()
{
  if (this.type == CAMERA_MAIN)
  {
    this.ipd = 0;
    this.viewport[0] = 0;
    this.viewport[1] = 0;
    this.viewport[2] = this.camera.width;
    this.viewport[3] = this.camera.height;
    this.fsq = "fsq";
    this.center = vec2.fromValues(0.5, 0.5);
    this.lenscenter = vec2.fromValues(0.5, 0.5);
  }
  else if (this.type == CAMERA_LEFTEYE)
  {
    this.ipd = Game.oculus.interpupillaryDistance / 2.0;
    this.viewport[0] = 0;
    this.viewport[1] = 0;
    this.viewport[2] = (this.camera.width / 2) | 0;
    this.viewport[3] = this.camera.height;
    this.fsq = "fsqleft";
    this.center = vec2.fromValues(0.25, 0.5);
    this.lenscenter = vec2.fromValues(0.5 - Game.oculus.lensSeparationDistance / Game.oculus.hScreenSize, 0.5);
  }
  else if (this.type == CAMERA_RIGHTEYE)
  {
    this.ipd = Game.oculus.interpupillaryDistance / -2.0;
    this.viewport[0] = (this.camera.width / 2) | 0;
    this.viewport[1] = 0;
    this.viewport[2] = (this.camera.width / 2) | 0;
    this.viewport[3] = this.camera.height;
    this.fsq = "fsqright";
    this.center = vec2.fromValues(0.75, 0.5);
    this.lenscenter = vec2.fromValues(0.5 + Game.oculus.lensSeparationDistance / Game.oculus.hScreenSize, 0.5);
  }
}

CameraEye.prototype.update = function (q)
{
  this.camera.offset[0] += this.ipd;

  if (this.ipd)
  {
    var aspectRatio = Game.oculus.hResolution * 0.5 / Game.oculus.vResolution;
    var halfScreenDistance = (Game.oculus.vScreenSize / 2.0);
    var yfov = 2.0 * Math.atan(halfScreenDistance / Game.oculus.eyeToScreenDistance);

    var viewCenter = Game.oculus.hScreenSize * 0.25;
    var eyeProjectionShift = viewCenter - Game.oculus.lensSeparationDistance * 0.5;
    var projectionCenterOffset = 4.0 * eyeProjectionShift / Game.oculus.hScreenSize;
    if (this.type == CAMERA_RIGHTEYE) projectionCenterOffset *= -1;

    mat4.perspective(this.projection, yfov, aspectRatio, this.camera.near, this.camera.far);
    var offset = mat4.create();
    mat4.identity(offset);
    mat4.translate(offset, offset, vec3.fromValues(projectionCenterOffset,0,0));
    mat4.multiply(this.projection, offset, this.projection);
  }
  else   
  {
    if (this.camera.type = CameraType.perspective)
      mat4.perspective(this.projection, this.camera.fov, this.viewport[2] / this.viewport[3], this.camera.near, this.camera.far);
    else
      mat4.ortho(this.projection, -200, 200, -200, 200, this.camera.near, this.camera.far);
  }

  mat4.lookAt(this.view, this.camera.position, this.camera.target.Position, this.camera.up)
  this.camera.offset[0] -= this.ipd;

  this.uniforms.camera = this.camera.position;
  this.uniforms.view = this.view;
  this.uniforms.projection = this.projection;
}

CameraEye.prototype.engage = function ()
{
  gl.viewport(this.viewport[0], this.viewport[1], this.viewport[2], this.viewport[3]);
}

Direction = { forward: 1, back: 2, left: 4, right: 8, all: 15 };
CameraType = { perspective: 1, ortho: 2 };

function Camera(w, h)
{
  this.type = CameraType.perspective;

  this.orientX = mat4.create();
  this.quat = quat.create();

  this.ipd = 0.0;

  this.width = w;
  this.height = h;
  this.fov = Math.PI / 4.0;
  this.near = 0.1;
  this.far = 10000.0;

  this.angles = vec3.create();
  this.target = null;
  this.offset = vec3.fromValues(0, 5, -20);
  this.movedir = 0;
  this.speed = vec3.create();

  this.position = vec3.create();
  this.orientation = mat4.create();

  this.forward = vec3.create();
  this.left = vec3.create();
  this.up = vec3.create();

  this.splitscreen(false);
}

Camera.prototype.handleSizeChange = function(w, h)
{
  this.width = w;
  this.height = h;
  for (var eye in this.eyes) this.eyes[eye].handleSizeChange();
}

Camera.prototype.splitscreen = function (s)
{
  if (s)
  {
    this.eyes = [];
    this.eyes.push(new CameraEye(this, CAMERA_LEFTEYE));
    this.eyes.push(new CameraEye(this, CAMERA_RIGHTEYE));
  }
  else
  {
    this.eyes = [];
    this.eyes.push(new CameraEye(this, CAMERA_MAIN));
  }
  this.update();
}

Camera.prototype.setTarget = function (obj)
{
  this.target = obj;
  vec3.copy(this.position, this.target.Position);
  var off = vec3.create();
  vec3.transformMat4(off, this.offset, this.target.Orient);
  vec3.add(this.position, this.position, off);   // Initial position is the camera offset relative to the object's forward direction
}

Camera.prototype.move = function(dir, speed)
{
  this.movedir |= dir;
  // Determine the speed in X and Z 
  vec3.set(this.speed, 0, 0, 0);
  if ((this.movedir & 1) > 0) this.speed[2] += speed;
  if ((this.movedir & 2) > 0) this.speed[2] += -1.0 * speed;
  if ((this.movedir & 4) > 0) this.speed[0] += -1.0 * speed;
  if ((this.movedir & 8) > 0) this.speed[0] += speed;
}

Camera.prototype.stop = function(dir)
{
  this.movedir &= ~(dir);

  // Determine the speed in X and Z 
  if ((dir & 1) > 0) this.speed[2] = 0;
  if ((dir & 2) > 0) this.speed[2] = 0;
  if ((dir & 4) > 0) this.speed[0] = 0;
  if ((dir & 8) > 0) this.speed[0] = 0;
}

Camera.prototype.update = function ()
{
  if (this.target == null) return;

  mat4.identity(this.orientX);
  mat4.rotate(this.orientX, this.orientX, this.angles[1], yAxis);
  vec3.transformMat4(this.target.Velocity, this.speed, this.orientX);

  quat.fromYawPitchRoll(this.quat, this.angles[1], this.angles[0], 0.0);
  mat4.fromQuat(this.orientation, this.quat);

  vec3.transformMat4(this.position, this.offset, this.orientation);
  vec3.add(this.position, this.position, this.target.Position);

  vec3.transformMat4(this.up, vec3.fromValues(0, 1, 0), this.orientation);
  vec3.transformMat4(this.left, vec3.fromValues(-1, 0, 0), this.orientation);
  vec3.transformMat4(this.forward, vec3.fromValues(0, 0, 1), this.orientation);

  this.updateEyes();
}

Camera.prototype.updateEyes = function()   // optimize: forin in its own function
{
  for (var eye in this.eyes) this.eyes[eye].update();
}

Camera.prototype.engage = function()
{
  this.eyes[0].engage();
}
