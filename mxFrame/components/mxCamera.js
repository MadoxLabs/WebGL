// camera can be in:
//   free mode - camera has position and orientation
//   offset target mode - camera only has offset, using a target object as reference. Has orientation
//                      - act like on a string, user can still make slight adjustments like Z axis
//   free target mode - camera has position and orientation but always faces target object
//                    - set which axis to lock, x or y or none

mx.CAMERA_LEFTEYE = 1;
mx.CAMERA_RIGHTEYE = 2;
mx.CAMERA_MAIN = 3;

(function ()
{
  // Game object is going to be the new core of the framework.
  // This is an object that exists in the world and has speed, velocity, position etc
  // A game object can have things attached to it - lights, cameras, other game objects
     
  // Note if setting orientation by quat, velocity wont work. If you want velocity, use XYZ instead.

  // objects can be slaved to another object with an offset. if so, the orientation rotates it around the parent.
  // if slaved, can not use velocity, offset is valid
  // 

  var cacheMat = mat4.create();

  // Animation Cursors
  // each object can have N animations running. An animation is a cursor into a set of a list of matrixes
  // each animation has multiple layers that affect meshes in the model. 
  // all layers have the same number of keys
  // all affected meshes will get matrix #N from the list that affects them for this animation, and apply it.
  // a mesh might be affected by multiple animation, I dont know what this will look like but support it.
  
  function Animation(n,i)
  {
    // private
    this.index = i;
    this.name = n;
    this.playing = false;
    this.length = 0;
    this.time = 0;
    // public
    this.FPS = 24;
    this.cursor = 0;
    this.loop = false;
  }

  Animation.prototype.play = function()
  {
    if (this.playing) return;
    this.playing = true;
    this.time = +new Date();
  };

  Animation.prototype.stop = function()
  {
    this.playing = false;
    this.cursor = 0;
  };

  Animation.prototype.step = function ()
  {
    if (this.playing) this.pause();
    this.cursor += 1;
    if (this.cursor >= this.length)
      this.cursor = 0;
  };

  Animation.prototype.pause = function ()
  {
    this.playing = false;
  };

  Animation.prototype.update = function(t)
  {
    if (!this.playing) return;

    var elapsed = t - this.time;
    var perframe = 1000.0/this.FPS;
    var advance = (elapsed / perframe)|0;

    if (advance > 0)
    {
      this.time = t;
      this.cursor += advance;
      while (this.cursor >= this.length)
        this.cursor = this.cursor - this.length;
    }
  };

  /////////////

  function GameObject(name, model)
  {
    this.name = name;
    this.model = model;
    this.position = vec3.fromValues(0, 0, 0);
    this.rotation = quat.create(); quat.identity(this.rotation);
    this.angles = vec3.fromValues(0, 0, 0);

    this.target = null;
    this.offset = vec3.fromValues(0, 0, 0);
    this.targetlock = false;

    this.velocity = vec3.create();
    this.movedir = 0;

    this.translation = mat4.create(); mat4.identity(this.translation);
    this.orientation = mat4.create(); mat4.identity(this.orientation);
    this.scale = mat4.create(); mat4.identity(this.scale);

    this.uniforms = {};
    this.uniforms.uWorld = mat4.create();

    this.dirty = false;

    // populate animations for this model
    this.animations = {};
    if (model && model.animations)
    {
      for (var a in model.animations)
      {
        var obj = new Animation(model.animations[a].name, a);
        obj.length = model.animations[a].layers[0].keys.length;
        this.animations[obj.name] = obj;
      }
    }
  }

  GameObject.prototype.setScale = function(s)
  {
    mat4.scaleUniform(this.scale, this.scale, s);
    this.dirty = true;
  }

  GameObject.prototype.setTargetLock = function(l)
  {
    this.targetlock = l;
    this.dirty = true;
  }

  GameObject.prototype.setTarget = function (obj)
  {
    this.target = obj;
    this.target.update();
    vec3.copy(this.position, this.target.position);
    var off = vec3.create();
    vec3.transformMat4(off, this.offset, this.target.orientation);
    vec3.add(this.position, this.position, off);   // Initial position is the camera offset relative to the object's forward direction
  }

  GameObject.prototype.update = function ()
  {
    if (!this.target && !this.dirty && !this.mover) return;
    this.dirty = false;

    // if a mover exists, let it do its modifications
    if (this.mover)
    {
      this.mover.update();
      this.mover.apply(this);
    }

    if (this.movedir)
    {
      // apply any velocity, after converting it to local axes. (its global axes)
      mat4.identity(cacheMat);
      mat4.rotate(cacheMat, cacheMat, this.angles[1], mx.axis.y);
      vec3.transformMat4(cacheVec, this.velocity, cacheMat);
      vec3.add(this.position, this.position, cacheVec);
    }

    if (this.target)
    {
      mat4.fromQuat(this.orientation, this.rotation);
      if (this.targetlock) mat4.multiply(this.orientation, this.target.orientation, this.orientation);
      this.target.update();
      vec3.transformMat4(this.position, this.offset, this.orientation);
      vec3.add(this.position, this.position, this.target.position);
    }
    else
    {
      mat4.fromQuat(this.orientation, this.rotation);
    }

    mat4.identity(this.translation);
    mat4.translate(this.translation, this.translation, this.position);
    mat4.multiply(this.uniforms.uWorld, this.translation, this.orientation);
    mat4.multiply(this.uniforms.uWorld, this.uniforms.uWorld, this.scale);
 
    var now = +new Date();
    for (var a in this.animations)
    {
      this.animations[a].update(now);
    }
  }

  GameObject.prototype.setOrientationQuat = function (q)
  {
    this.dirty = true;
    if (q.x) quat.set(this.rotation, q.x, q.y, q.z, q.w);
    else quat.copy(this.rotation, q);
  }

  GameObject.prototype.setOrientationXYZW = function (x, y, z, w)
  {
    this.dirty = true;
    quat.set(this.rotation, x, y, z, w);
  }

  GameObject.prototype.setOrientationXYZ = function (x, y, z)
  {
    this.dirty = true;
    vec3.set(this.angles, x, y, z);
    quat.fromYawPitchRoll(this.rotation, y, x, z);
  }

  GameObject.prototype.updateOrientationXYZ = function (x, y, z)
  {
    this.dirty = true;
    vec3.set(this.angles, this.angles[0] + x, this.angles[1] + y, this.angles[2] + z);
    quat.fromYawPitchRoll(this.rotation, this.angles[1], this.angles[0], this.angles[2]);
  }

  GameObject.prototype.updateOrientationVec = function (delta)
  {
    this.dirty = true;
    vec3.add(this.angles, this.angles, delta);
    quat.fromYawPitchRoll(this.rotation, this.angles[1], this.angles[0], this.angles[2]);
  }

  GameObject.prototype.setPositionVec = function (pos)
  {
    if (this.target) return;
    this.dirty = true;
    vec3.copy(this.position, pos);
  }

  GameObject.prototype.setPositionXYZ = function (x, y, z)
  {
    if (this.target) return;
    this.dirty = true;
    vec3.set(this.position, x, y, z);
  }

  GameObject.prototype.updatePositionXYZ = function (x, y, z)
  {
    if (this.target) return;
    this.dirty = true;
    vec3.set(cacheVec, x, y, z);
    vec3.add(this.position, this.position, cacheVec);
  }

  GameObject.prototype.updatePositionVec = function (delta)
  {
    if (this.target) return;
    this.dirty = true;
    vec3.add(this.position, this.position, delta);
  }

  GameObject.prototype.move = function (dir, speed)
  {
    if (this.target) return;

    this.dirty = true;
    this.movedir |= dir;
    // Determine the speed in X and Z 
    vec3.set(this.velocity, 0, 0, 0);
    if ((this.movedir & 1) > 0) this.velocity[2] += speed;
    if ((this.movedir & 2) > 0) this.velocity[2] += -1.0 * speed;
    if ((this.movedir & 4) > 0) this.velocity[0] += -1.0 * speed;
    if ((this.movedir & 8) > 0) this.velocity[0] += speed;
  }

  GameObject.prototype.stop = function (dir)
  {
    if (this.target) return;

    this.dirty = true;
    this.movedir &= ~(dir);

    // Determine the speed in X and Z 
    if ((dir & 1) > 0) this.velocity[2] = 0;
    if ((dir & 2) > 0) this.velocity[2] = 0;
    if ((dir & 4) > 0) this.velocity[0] = 0;
    if ((dir & 8) > 0) this.velocity[0] = 0;
  }

  GameObject.prototype.setMover = function (m)
  {
    this.mover = m;
  }

  mx.GameObject = GameObject;
  mx.Animation = Animation;


  var cacheQuat = quat.create();
  var cacheVec = vec3.create();

  function CameraEye(c, t)
  {
    this.ipd = 0.0;
    this.camera = c;
    this.type = t;
    this.viewport = vec4.create();
    this.view = mat4.create();
    this.projection = mat4.create();

    this.uniforms = {};
    this.uniforms.camera = vec3.create();
    this.uniforms.view = this.view;
    this.uniforms.projection = this.projection;

    this.handleSizeChange();
  }

  CameraEye.prototype.handleSizeChange = function ()
  {
    if (this.type == mx.CAMERA_MAIN)
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
    else if (this.type == mx.CAMERA_LEFTEYE)
    {
      this.ipd = mx.Game.oculus.interpupillaryDistance / 2.0;
      this.viewport[0] = 0;
      this.viewport[1] = 0;
      this.viewport[2] = (this.camera.width / 2) | 0;
      this.viewport[3] = this.camera.height;
      this.fsq = "fsqleft";
      this.center = vec2.fromValues(0.25, 0.5);
      this.lenscenter = vec2.fromValues(0.5 - mx.Game.oculus.lensSeparationDistance / mx.Game.oculus.hScreenSize, 0.5);
    }
    else if (this.type == mx.CAMERA_RIGHTEYE)
    {
      this.ipd = mx.Game.oculus.interpupillaryDistance / -2.0;
      this.viewport[0] = (this.camera.width / 2) | 0;
      this.viewport[1] = 0;
      this.viewport[2] = (this.camera.width / 2) | 0;
      this.viewport[3] = this.camera.height;
      this.fsq = "fsqright";
      this.center = vec2.fromValues(0.75, 0.5);
      this.lenscenter = vec2.fromValues(0.5 + mx.Game.oculus.lensSeparationDistance / mx.Game.oculus.hScreenSize, 0.5);
    }
  }

  CameraEye.prototype.update = function (q)
  {
    if (this.ipd)
    {
      var aspectRatio = mx.Game.oculus.hResolution * 0.5 / mx.Game.oculus.vResolution;
      var halfScreenDistance = (mx.Game.oculus.vScreenSize / 2.0);
      var yfov = 2.0 * Math.atan(halfScreenDistance / mx.Game.oculus.eyeToScreenDistance);

      var viewCenter = mx.Game.oculus.hScreenSize * 0.25;
      var eyeProjectionShift = viewCenter - mx.Game.oculus.lensSeparationDistance * 0.5;
      var projectionCenterOffset = 4.0 * eyeProjectionShift / mx.Game.oculus.hScreenSize;
      if (this.type == mx.CAMERA_RIGHTEYE) projectionCenterOffset *= -1;

      mat4.perspective(this.projection, yfov, aspectRatio, this.camera.near, this.camera.far);
      var offset = mat4.create();
      mat4.identity(offset);
      mat4.translate(offset, offset, vec3.fromValues(projectionCenterOffset, 0, 0));
      mat4.multiply(this.projection, offset, this.projection);
    }
    else
    {
      if (this.camera.type == CameraType.perspective)
        mat4.perspective(this.projection, this.camera.fov, this.viewport[2] / this.viewport[3], this.camera.near, this.camera.far);
      else
        mat4.ortho(this.projection, -200, 200, -200, 200, this.camera.near, this.camera.far);
    }

    vec3.add(cacheVec, this.camera.position, this.camera.forward);
    if (this.ipd)
    {
      vec3.scale(this.uniforms.camera, this.camera.left, (this.type == mx.CAMERA_RIGHTEYE) ? this.ipd * -1.0 : this.ipd);
      vec3.add(this.uniforms.camera, this.uniforms.camera, this.camera.position);
    }
    else
      vec3.copy(this.uniforms.camera, this.camera.position);

    mat4.lookAt(this.view, this.uniforms.camera, cacheVec, this.camera.up)
    this.uniforms.view = this.view;
    this.uniforms.projection = this.projection;
  }

  CameraEye.prototype.engage = function ()
  {
    gl.viewport(this.viewport[0], this.viewport[1], this.viewport[2], this.viewport[3]);
  }

  Direction = { forward: 1, back: 2, left: 4, right: 8, all: 15 };
  CameraType = { perspective: 1, ortho: 2 };



  //
  // Camera base class - just supports having a camera properties

  function Camera(w, h)
  {
    this.type = CameraType.perspective;
    this.ipd = 0.0;

    this.width = w;
    this.height = h;
    this.fov = Math.PI / 4.0;
    this.near = 0.1;
    this.far = 10000.0;

    this.target = null;
    this.position = null;
    this.orientation = null;

    this.forward = vec3.create();
    this.left = vec3.create();
    this.up = vec3.create();

    this.splitscreen(false);
  }

  Camera.prototype.handleSizeChange = function (w, h)
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
      this.eyes.push(new CameraEye(this, mx.CAMERA_LEFTEYE));
      this.eyes.push(new CameraEye(this, mx.CAMERA_RIGHTEYE));
    }
    else
    {
      this.eyes = [];
      this.eyes.push(new CameraEye(this, mx.CAMERA_MAIN));
    }
    this.update();
  }

  Camera.prototype.updateEyes = function ()   // optimize: forin in its own function
  {
    for (var eye in this.eyes) this.eyes[eye].update();
  }

  Camera.prototype.engage = function ()
  {
    this.eyes[0].engage();
  }

  Camera.prototype.attachTo = function (target)
  {
    target.update();
    this.target = target;
    this.position = this.target.position;
    this.orientation = this.target.orientation;
    this.update();
  }

  Camera.prototype.update = function ()
  {
    if (!this.target) return;
    this.target.update();

    vec3.transformMat4(this.up, mx.axis.y, this.orientation);
    vec3.transformMat4(this.left, mx.axis.xNegative, this.orientation);
    vec3.transformMat4(this.forward, mx.axis.z, this.orientation);

    this.updateEyes();
  }

  mx.CameraEye = CameraEye;
  mx.Camera = Camera;
})();

