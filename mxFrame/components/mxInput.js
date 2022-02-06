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
        Down: 1,
        Unchanged: 2
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
            this.activeCommand = null;
        }

        addCommand(c)
        {
            this.commands.push(c);
        }

        pump(laststate, currstate)
        {
            if (this.activeCommand != null)
            {
              switch (this.activeCommand.check(laststate, currstate, time))
              {
                case CommandState.Triggered:
                  {
                    let ret = this.activeCommand.event;
                    if (this.activeCommand.repeat == false)
                        this.activeCommand = null;
                    return ret;
                  }
                case CommandState.Progressing:
                  return 0;
                case CommandState.Failed:
                    this.activeCommand = null;
                  break;
              }
            }
      
            for (let c in this.commands)
            {
              switch (c.check(laststate, currstate, time))
              {
                case CommandState.Triggered:
                  return c.Event;
                case CommandState.Progressing:
                  this.activeCommand = c;
                  return 0;
                case CommandState.Failed:
                  break;
              }
            }
            return 0;      
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
        this.repeating = false;
        this.started = false;
      }

      check(lastState, currState)
      {
        if (this.strokes.length == 0) return CommandState.Failed;
        if (!this.repeating && this.done > this.strokes.length) this.reset();
        let s = this.strokes[this.repeating ? this.strokes.length-1 : this.done];  
        if (this.started)
        {
          this.time = 
        }

        switch (s.isStroked(lastState, currState))
        {
          case 
        }
      }
    }

    class Stroke 
    {
        constructor(t)
        {
            this.time = t ? t : 500;
        }

        isStroked(lastState, currState)
        {
        }
    }

    class StrokeDigital extends Stroke
    {
        constructor(b, s, t)
        {
            super(t);
            this.buttons = b;
            this.state = s;
        }

        isStroked(lastState, currState)
        {
            if (currState.unchangedFrom(lastState))
            {
                if (this.state == DigitalStrokeState.Unchanged) return StrokeState.Good;
                return StrokeState.Wait;
            }

            switch(this.state)
            {
              case DigitalStrokeState.Down:
                if (lastState.isButtonUp(this.buttons) && currState.isButtonDown(this.buttons)) return StrokeState.Good;
                break;
              case DigitalStrokeState.Up:
                if (lastState.isButtonDown(this.buttons) && currState.isButtonUp(this.buttons)) return StrokeState.Good;
                break;
              case DigitalStrokeState.Unchanged:
                if (lastState.isButtonDown(this.buttons) && currState.isButtonDown(this.buttons)) return StrokeState.Good;
                if (lastState.isButtonUp(this.buttons) && currState.isButtonUp(this.buttons)) return StrokeState.Good;
                break;
            }

            return StrokeState.Bad;
        }
    }
}
)();