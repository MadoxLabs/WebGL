(function ()
{
  // Internal Helpers
  function getOffsetLeft(obj)
  {
    if (!obj || obj.offsetLeft == undefined) return 0;
    return obj.offsetLeft + getOffsetLeft(obj.parentNode);
  }

  function getOffsetTop(obj)
  {
    if (!obj || obj.offsetTop == undefined) return 0;
    return obj.offsetTop + getOffsetTop(obj.parentNode);
  }

  mx.MouseEvent = { 'Down': 0, 'Up': 1, 'Move': 2, 'In': 3, 'Out': 4, 'Grab': 5, 'Release': 6, 'NoGrab': 7, 'Wheel': 8, 'Swipe': 9, 'Tap': 10, 'PinchIn': 11, 'PinchOut': 12 };

  // mxMouse class
  function Mouse(obj)
  {
    this.active = false;
    this.down = false;
    this.grabbed = false;
    this.pendingout = false;
    this.X = 0;
    this.Y = 0;

    this.toss = 0;
    this.hammer = null;
    this.surface = obj;
    var mouseObj = this;

    //  console.log(typeof (Hammer));
    if (typeof (Hammer) === "function")
    {
      this.hammer = Hammer(this.surface);
      this.hammer.on('tap', function (event) { mx.Game.fireMouseEvent(mx.MouseEvent.Tap, event); });
      this.hammer.on('hold', function (event) {  });
      this.hammer.on('rotate', function (event) { });
      this.hammer.on('pinchin', function (event) { mx.Game.fireMouseEvent(mx.MouseEvent.PinchIn, event); });
      this.hammer.on('pinchout', function (event) { mx.Game.fireMouseEvent(mx.MouseEvent.PinchOut, event); });
      this.hammer.on('swipe', function (event) { mx.Game.fireMouseEvent(mx.MouseEvent.Swipe, event); });
    }

    document.addEventListener('pointerlockchange', function (e) { mouseObj.pointerLockChange(e); }, false);
    document.addEventListener('mozpointerlockchange', function (e) { mouseObj.pointerLockChange(e); }, false);
    document.addEventListener('webkitpointerlockchange', function (e) { mouseObj.pointerLockChange(e); }, false);
    document.addEventListener('pointerlockerror', function () { mouseObj.pointerLockError(); }, false);
    document.addEventListener('mozpointerlockerror', function () { mouseObj.pointerLockError(); }, false);
    document.addEventListener('webkitpointerlockerror', function () { mouseObj.pointerLockError(); }, false);
    document.addEventListener("mousewheel", function (e) { mouseObj.mouseWheel(e); }, false);

    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
    obj.requestPointerLock = obj.requestPointerLock || obj.mozRequestPointerLock || obj.webkitRequestPointerLock;

    obj.onmouseover = function (event) { mouseObj.mouseOver(event); };
    obj.onmouseout = function (event) { mouseObj.mouseOut(event); };
    obj.onmousemove = function (event) { mouseObj.mouseMove(event); };
    obj.onmouseup = function (event) { mouseObj.mouseUp(event); };
    obj.onmousedown = function (event) { mouseObj.mouseDown(event); };

    obj.onclick = function (e) { e.preventDefault(); }
    obj.oncontextmenu = function (e) { e.preventDefault(); }

    this.offsetLeft = getOffsetLeft(obj.parentNode);
    this.offsetTop = getOffsetTop(obj.parentNode);
  }

  Mouse.prototype.grab = function ()
  {
    if (!this.active) return;
    console.log("grab");
    this.surface.requestPointerLock();
  }

  Mouse.prototype.release = function ()
  {
    console.log("no grab");
    document.exitPointerLock();
  }

  Mouse.prototype.pointerLockChange = function (e)
  {
    console.log("mouse grab result");
    if (document.pointerLockElement === this.surface || document.mozPointerLockElement === this.surface || document.webkitPointerLockElement === this.surface)
    {
      console.log(" on");
      this.grabbed = true;
      this.toss = 1;
      this.lastMoveX = 0;
      this.lastMoveY = 0;
      this.X = 0;
      this.Y = 0;
      mx.Game.fireMouseEvent(mx.MouseEvent.Grab, this);
    }
    else
    {
      console.log(" off");
      this.toss = 2;
      this.grabbed = false;
      mx.Game.fireMouseEvent(mx.MouseEvent.Release, this);
    }
  }

  Mouse.prototype.pointerLockError = function ()
  {
    console.log(" error");
    this.grabbed = false;
    Game.fireMouseEvent(mx.MouseEvent.NoGrab, this);
  }

  // normal mouse mode tracks the following:
  //   X, Y - current mouse loc
  //   lastDownX,Y - the loc of the mouse recent down event
  //   lastMoveX,Y - the loc of the mouse prev move event
  //   moveOffsetX,Y - the change in mouse position from last move event
  //   button - button most recently pressed
  // grabbed mouse mode will only track:
  //   moveOffsetX,Y - the change in mouse position from last move event
  //   button - button most recently pressed

  Mouse.prototype.mouseWheel = function (e)
  {
    if (event.target.type) return;
    e.preventDefault();
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    this.wheel = delta;
    mx.Game.fireMouseEvent(mx.MouseEvent.Wheel, this);
  }

  Mouse.prototype.mouseDown = function (event)
  {
    if (!this.active) return;
    this.button = event.button;
    this.down = true;
    if (!this.grabbed)
    {
      this.lastDownX = event.pageX - this.offsetLeft;
      this.lastDownY = event.pageY - this.offsetTop;
      this.X = event.pageX - this.offsetLeft;
      this.Y = event.pageY - this.offsetTop;
    }
    mx.Game.fireMouseEvent(mx.MouseEvent.Down, this);
  }

  Mouse.prototype.mouseUp = function (event)
  {
    if (!this.active) return;
    this.button = event.button;
    if (!this.grabbed)
    {
      this.X = event.pageX - this.offsetLeft;
      this.Y = event.pageY - this.offsetTop;
    }
    this.down = false;
    mx.Game.fireMouseEvent(mx.MouseEvent.Up, this);
    if (this.pendingout == true)
    {
      if (this.grabbed) this.release();
      this.out = true;
      mx.Game.fireMouseEvent(mx.MouseEvent.Out, this);
    }
    this.pendingout = false;
  }

  Mouse.prototype.mouseOver = function (event)
  {
    if (this.active) return;
    this.active = true;
    mx.Game.fireMouseEvent(mx.MouseEvent.In, this);
  }

  Mouse.prototype.mouseOut = function (event)
  {
//    if (this.down) this.pendingout = true;
//    else
    {
      if (this.grabbed) this.release();
      this.active = false;
      mx.Game.fireMouseEvent(mx.MouseEvent.Out, this);
    }
  }

  Mouse.prototype.mouseMove = function (event)
  {
    if (!this.active) { this.mouseOver(event); }

    if (this.grabbed)
    {
      if (this.toss) { this.toss -= 1; return; }
      this.moveOffsetX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      this.moveOffsetY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
    }
    else
    {
      this.lastMoveX = this.X;
      this.lastMoveY = this.Y;
      this.X = event.pageX - this.offsetLeft;
      this.Y = event.pageY - this.offsetTop;
      if (this.toss)
      {
        this.toss -= 1; return;
      }
      this.moveOffsetX = this.X - this.lastMoveX;
      this.moveOffsetY = this.Y - this.lastMoveY;
    }

    if (!this.moveOffsetX && !this.moveOffsetY) { return; }

    mx.Game.fireMouseEvent(mx.MouseEvent.Move, this);
  }

  mx.Mouse = Mouse;
})();
