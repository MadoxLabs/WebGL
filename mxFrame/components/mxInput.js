(function ()
{
    const CommandState = {
        Failed = 0,
        Triggered = 1,
        Progressing = 2
    }

    class CommandConfigGroup
    {
        constructor()
        {
            this.configs = [];
            this.events = [];
        }

        addCommand(c)
        {
            this.configs.push(c);
        }

        addEvent(e)
        {
            this.events.push(e);
        }
    }

    class CommandConfigGroup
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

        pump(laststate, currstate, time)
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
    
}
)();