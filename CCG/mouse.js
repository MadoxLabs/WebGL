var MouseEvent = { 'Down': 0, 'Up': 1, 'Move': 2, 'In': 3, 'Out': 4, 'Grab': 5, 'Release': 6, 'NoGrab': 7, 'Wheel': 8, 'Swipe': 9, 'Tap': 10, 'PinchIn': 11, 'PinchOut': 12 };

// mxMouse class
class Mouse 
{
  constructor(obj)
  {
    this.active = false;
    this.down = false;
    this.click = false;
    this.grabbed = false;
    this.pendingout = false;
    this.X = 0;
    this.Y = 0;

    this.toss = 0;
    this.hammer = null;
    this.surface = obj;
    var mouseObj = this;

    if (typeof (Hammer) === "function")
    {
      this.hammer = Hammer(this.surface);
      this.hammer.on('tap', function (event) { Game.fireMouseEvent(MouseEvent.Tap, event); });
      this.hammer.on('hold', function (event) { });
      this.hammer.on('rotate', function (event) { });
      this.hammer.on('pinchin', function (event) { Game.fireMouseEvent(MouseEvent.PinchIn, event); });
      this.hammer.on('pinchout', function (event) { Game.fireMouseEvent(MouseEvent.PinchOut, event); });
      this.hammer.on('swipe', function (event) { Game.fireMouseEvent(MouseEvent.Swipe, event); });
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

    var rect = obj.getBoundingClientRect();

    this.offsetLeft = rect.left;
    this.offsetTop = rect.top;
  }

  grab()
  {
    if (!this.active) return;
    console.log("grab");
    this.moveOffsetX = 0;
    this.moveOffsetY = 0;
    this.surface.requestPointerLock();
  }

  release()
  {
    console.log("no grab");
    document.exitPointerLock();
  }

  pointerLockChange(e)
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
      Game.fireMouseEvent(MouseEvent.Grab, this);
    }
    else
    {
      console.log(" off");
      this.toss = 2;
      this.grabbed = false;
      Game.fireMouseEvent(MouseEvent.Release, this);
    }
  }

  pointerLockError()
  {
    console.log(" error");
    this.grabbed = false;
    Game.fireMouseEvent(MouseEvent.NoGrab, this);
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

  mouseWheel(e)
  {
    e.preventDefault();
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    this.wheel = delta;
    if (this.click) this.click = false;
    Game.fireMouseEvent(MouseEvent.Wheel, this);
  }

  mouseDown(event)
  {
    if (!this.active) return;
    this.button = event.button;
    this.down = true;
    this.click = true;
    if (!this.grabbed)
    {
      this.lastDownX = event.pageX - this.offsetLeft;
      this.lastDownY = event.pageY - this.offsetTop;
      this.X = event.pageX - this.offsetLeft;
      this.Y = event.pageY - this.offsetTop;
    }
    Game.fireMouseEvent(MouseEvent.Down, this);
  }

  mouseUp(event)
  {
    if (!this.active) return;
    this.button = event.button;
    if (!this.grabbed)
    {
      this.X = event.pageX - this.offsetLeft;
      this.Y = event.pageY - this.offsetTop;
    }
    this.down = false;
    if (this.click) this.click = false;
    Game.fireMouseEvent(MouseEvent.Up, this);
    if (this.pendingout == true)
    {
      if (this.grabbed) this.release();
      this.out = true;
      Game.fireMouseEvent(MouseEvent.Out, this);
    }
    this.pendingout = false;
  }

  mouseOver(event)
  {
    if (this.active) return;
    this.active = true;
    if (this.click) this.click = false;
    Game.fireMouseEvent(MouseEvent.In, this);
  }

  mouseOut(event)
  {
    if (this.down) this.pendingout = true;
    else
    {
      if (this.grabbed) this.release();
      this.active = false;
      if (this.click) this.click = false;
      Game.fireMouseEvent(MouseEvent.Out, this);
    }
  }

  isClick()
  {
    let ret = this.click;
    this.click = false;
    return ret;
  }

  mouseMove(event)
  {
    if (!this.active) { this.mouseOver(event); }

    if (this.click) this.click = false;

    if (this.grabbed)
    {
      if (this.toss) { this.toss -= 1; return; }
      this.moveOffsetX += event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      this.moveOffsetY += event.movementY || event.mozMovementY || event.webkitMovementY || 0;
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

    Game.fireMouseEvent(MouseEvent.Move, this);
  }
}