(function ()
{
    const CommandState = {
        Failed: 0,
        Triggered: 1,
        Progressing: 2
    }

    const StrokeState = {
        Good: 0,
        Bad: 1,
        Wait: 2
    }

    const DigitalStrokeState = {
        Up: 0,
        Down: 1
    }

    const KeyStrokeState = {
        Up: 0,
        Down: 1
    }

    const AnalogStrokeState = {
        Over: 0,
        Under: 1,
        Dead: 2,
        Squeezing: 3,
        Releasing: 4
    }

    class Event
    {
        constructor(i, n)
        {
            this.id = i;
            this.name = n;
            this.codes = [];
            this.assigns = [];
        }
    }

    class EventCode
    {
      constructor(c, p, t)
      {
          this.cmd = c;
          this.param = p ? p : 0;
          this.target = t ? t : 0;
      }
    }

    class Assign
    {
      constructor(c, s)
      {
          this.config = c;
          this.set = s;
      }
    }

    class CommandConfigGroup
    {
        constructor()
        {
            this.configs = [];
            this.events = [];
        }

        addConfig(c)
        {
            this.configs.push(c);
        }

        addEvent(e)
        {
            this.events.push(e);
        }
    }

    class CommandConfig
    {
        constructor(n, i, t, c)
        {
            this.name = n;
            this.class = c ? c : 0;
            this.id = i;
            this.type = t;
            this.commands = [];
            this.activeCommands = [];
        }

        addCommand(c)
        {
            this.commands.push(c);
        }

        pump(controller)
        {
            if (this.activeCommands.length > 0)
            {
              let ret = 0;
              let i = this.activeCommands.length;
              while(i--)
              {
                let c = this.activeCommands[i];                
                switch (c.check(controller))
                {
                  case CommandState.Triggered:
                    {
                      let ret = c.event;
                      this.activeCommands = [];
                      return ret;
                    }
                  case CommandState.Progressing:
                    ret = -1;
                    break;
                  case CommandState.Failed:
                    this.activeCommands.splice(i,1);
                    break;
                }
              }
              if (ret == -1) return ret;
            }
      
            let ret = 0;
            for (let cID in this.commands)
            {
              let c = this.commands[cID];
              switch (c.check(controller))
              {
                case CommandState.Triggered:
                  return c.event;
                case CommandState.Progressing:
                  this.activeCommands.push(c);
                  ret = -1;
                case CommandState.Failed:
                  break;
              }
            }
            return ret;      
        }
    }
    
    class Command
    {
      constructor(e)
      {
        this.event = e;
        this.strokes = [];
        this.reset();
      }

      addStroke(s)
      {
        this.strokes.push(s);
      }

      reset()
      {
        this.done = 0;
        this.time = 0;
        this.started = false;
      }

      check(controller)
      {
        // sanity check - no work to be done
        if (this.strokes.length == 0) return CommandState.Failed;
        // sanity check - in case its corrupt, so we dont crash
        if (this.done > this.strokes.length) this.reset();
        // if a stroke is started, begin counting time between strokes
        let s = this.strokes[this.done];  

        // timeout?
        if (this.started && (mx.Game.time - this.time > s.maxWaitTime))
        {
//          console.log("Time out");
          this.reset();
        }

        switch (s.isStroked(controller))
        {
          case StrokeState.Good:
//            console.log("good stroke");
            this.done++;
            this.started = true;
            this.time = mx.Game.time; // save the stroke time for wait timeout
            if (this.done == this.strokes.length)
            {
//              console.log("strokes complete - trigger!");
              this.reset();
              return CommandState.Triggered;
            }
            return CommandState.Progressing;

          case StrokeState.Bad:
//            console.log("stroking ended - bad");
            this.reset();
            break;

          case StrokeState.Wait:
            if (this.done > 0) return CommandState.Progressing;  
            break;
        }
      }
    }

    class Stroke 
    {
        constructor(t)
        {
            // if we are waiting for this stroke to happen, we dont wait forever
            this.maxWaitTime = t ? t : 500;
            this.holdTime = 0;
        }

        isStroked(controller)
        {
        }
    }

    class StrokeDigital extends Stroke
    {
        constructor(b, s, t, h)
        {
            super(t);
            this.startHoldTime = 0;
            this.buttons = b;
            this.state = s;
            this.holdTime = h ? h : 0;
        }

        isStroked(controller)
        {
            // if holding, check for unchanged buttons
            // if time is up, we are good
            // else waiting
            if (this.startHoldTime)
            {
              if (controller.isButtonUnchanged(this.buttons) == false) return StrokeState.Bad;
              if (mx.Game.time - this.startHoldTime >= this.holdTime)
              {
                this.startHoldTime = 0;
                return StrokeState.Good;
              }
              return StrokeState.Wait;
            }

            if (controller.unchangedDigital())
            {
              if (this.state == DigitalStrokeState.Unchanged) return StrokeState.Good;
              return StrokeState.Wait;
            }

            switch(this.state)
            {
              case DigitalStrokeState.Down:
                if (controller.wasButtonPressed(this.buttons)) 
                {
                  if (!this.holdTime) return StrokeState.Good;

                    // change to hold mode
                    this.startHoldTime = mx.Game.time;
                    return StrokeState.Wait; // waiting for hold to end
                  }
                break;
              case DigitalStrokeState.Up:
                if (controller.wasButtonReleased(this.buttons)) 
                {
                  return StrokeState.Good;
                }
                break;
            }
            return StrokeState.Bad;
        }
    }

    class StrokeAnalog extends Stroke
    {
        constructor(b, s, v, t)
        {
            super(t);
            this.axes = b;
            this.state = s;
            this.value = v;
        }

        isStroked(controller)
        {
            let same = true;
            for (let i in this.axes)
            {
              let axis = this.axes[i];
              let last = controller.lastState.axes[axis];
              let curr = controller.currState.axes[axis];
              if (this.isSame(last, curr) == false) { same = false; break; }
            }
            if (same) return StrokeState.Wait;

            for (let i in this.axes)
            {
              let axis = this.axes[i];
              let last = controller.lastState.axes[axis];
              let curr = controller.currState.axes[axis];
              if (this.check(last, curr) == false) { return StrokeState.Bad; }
            }
            return StrokeState.Good;
        }

        check(valLast, valCurr)
        {
            switch (this.state)
            {
                case AnalogStrokeState.Over:
                    if (valLast <= this.value && valCurr > this.value) return true;
                    break;
                case AnalogStrokeState.Under:
                    if (valLast >= this.value && valCurr < this.value) return true;
                    break;
                case AnalogStrokeState.Dead:
                    if (Math.abs(valLast) > this.value && Math.abs(valCurr) < this.value) return true;
                    break;
                case AnalogStrokeState.Squeezing:
                    if (valLast < valCurr) return true;
                    break;
                case AnalogStrokeState.Squeezing:
                    if (valLast > valCurr) return true;
                    break;
            }
            return false;
        }

        isSame(valLast, valCurr)
        {
          switch (this.state)
          {
              case AnalogStrokeState.Over:
                if (valLast > this.value && valCurr > this.value) return true;
                break;
              case AnalogStrokeState.Under:
                if (valLast < this.value && valCurr < this.value) return true;
                break;
              case AnalogStrokeState.Dead:
                  if (Math.abs(valLast) > this.value && Math.abs(valCurr) > this.value) return true;
                  if (Math.abs(valLast) < this.value && Math.abs(valCurr) < this.value) return true;
                  break;
              case AnalogStrokeState.Squeezing:
                  if (valLast < valCurr) return true;
                  break;
              case AnalogStrokeState.Squeezing:
                  if (valLast > valCurr) return true;
                  break;
            }
          return false;
        }
    }

    class StrokeKey extends Stroke
    {
        constructor(k, s, t, h)
        {
            super(t);
            this.startHoldTime = 0;
            this.keys = k;
            this.state = s;
            this.holdTime = h ? h : 0;
        }

        isKeyUp(state, key)
        {
            if (key in state.keys)
            {
                return !state.keys[key];
            }
            return true;
        }

        isKeyDown(state, key)
        {
            if (key in state.keys)
            {
                return state.keys[key];
            }
            return false;
        }

        isStroked(controller)
        {
            let same = true;
            for (let i in this.keys)
            {
                if (this.isKeyUp(controller.lastState, this.keys[i]) && this.isKeyUp(controller.currState, this.keys[i])) continue;
                if (this.isKeyDown(controller.lastState, this.keys[i]) && this.isKeyDown(controller.currState, this.keys[i])) continue;
                same = false;
                break;
            }
            if (same)
            {
                return StrokeState.Wait;
            }
    
          for (let i in this.keys)
          {
              switch (this.state)
              {
              case KeyStrokeState.Down:
                  if (!(this.isKeyUp(controller.lastState, this.keys[i]) && this.isKeyDown(controller.currState, this.keys[i]))) return StrokeState.Bad;
                  break;
              case KeyStrokeState.Up:
                  if (!(this.isKeyDown(controller.lastState, this.keys[i]) && this.isKeyUp(controller.currState, this.keys[i]))) return StrokeState.Bad;
                  break;
              }
          }
          return StrokeState.Good;
        }
    }

    class StrokeMouse extends Stroke
    {
        constructor(b, s, t, h)
        {
            super(t);
            this.startHoldTime = 0;
            this.button = b;
            this.state = s;
            this.holdTime = h ? h : 0;
        }

        isKeyUp(state, button)
        {
            if (button in state.buttons)
            {
                return !state.buttons[button];
            }
            return true;
        }

        isKeyDown(state, button)
        {
            if (button in state.buttons)
            {
                return state.buttons[button];
            }
            return false;
        }

        isStroked(controller)
        {
          if (this.isKeyUp(controller.lastState, this.button) && this.isKeyUp(controller.currState, this.button)) 
            return StrokeState.Wait;
          if (this.isKeyDown(controller.lastState, this.button) && this.isKeyDown(controller.currState, this.button)) 
            return StrokeState.Wait;
    
          switch (this.state)
          {
          case KeyStrokeState.Down:
              if (!(this.isKeyUp(controller.lastState, this.button) && this.isKeyDown(controller.currState, this.button))) return StrokeState.Bad;
              break;
          case KeyStrokeState.Up:
              if (!(this.isKeyDown(controller.lastState, this.button) && this.isKeyUp(controller.currState, this.button))) return StrokeState.Bad;
              break;
          }
          return StrokeState.Good;
        }
    }

    mx.CommandState = CommandState;
    mx.StrokeState = StrokeState;
    mx.DigitalStrokeState = DigitalStrokeState;
    mx.AnalogStrokeState = AnalogStrokeState;
    mx.KeyStrokeState = KeyStrokeState;
    mx.Event = Event;
    mx.Assign = Assign;
    mx.EventCode = EventCode;
    mx.CommandConfigGroup = CommandConfigGroup;
    mx.CommandConfig = CommandConfig;
    mx.Command = Command;
    mx.Stroke = Stroke;
    mx.StrokeDigital = StrokeDigital;
    mx.StrokeAnalog = StrokeAnalog;
    mx.StrokeKey = StrokeKey;
    mx.StrokeMouse = StrokeMouse;
}
)();