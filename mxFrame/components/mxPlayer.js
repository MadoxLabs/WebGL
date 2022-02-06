(function (){

    const ControllerType = {
        Unknown: 0,
        KeyboardMouse: 1,
        Touch: 2,
        Gamepad: 3
    }
    
    class Player
    {
        constructor(id)
        {
            this.id = id;
            this.controller = null;
            this.commands = {};
        }

        addCommand(c)
        {
            this.commands[c.id] = id;
        }

        removeCommand(cID)
        {
            delete this.commands[cID];
        }

        // return any triggered event
        update()
        {
            if (this.controller) 
            {
                // update input state
                this.controller.update();
                // check for any strokes that are done
                // fire commands
            }
        }
    }

    class Controller
    {
        constructor(id, type)
        {
            this.player = null;
            this.id = id;
            this.type = type;
        }        

        update() { }
    }

    class ControllerGamePad extends Controller
    {
        constructor(id)
        {
            super(id, ControllerType.Gamepad);
            this.lastState = { buttons: [], axes: [] };
            this.currState = { buttons: [], axes: [] };        
            this.grabState();    
        }

        getGamepad()
        {
            var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
            if (gamepads.length <= this.id) return null;
            return gamepads[this.id];
        }

        vibrate(power, power2, dur)
        {
            let gamepad = this.getGamepad();
            if (!gamepad) return;
            if (!power) return;

            if (gamepad.vibrationActuator) {
                gamepad.vibrationActuator.playEffect("dual-rumble", {
                    duration: dur ? dur : 100,
                    strongMagnitude: power,
                    weakMagnitude: power2 ? power2 : power
                });
            }
        }

        grabState(state)
        {
            let gamepad = this.getGamepad();
            if (!gamepad) return;

            this.lastState.axes = this.currState.axes.slice();
            this.lastState.buttons = this.currState.buttons.slice();
            this.currState.axes = gamepad.axes.slice();
            for (let b in gamepad.buttons)
            {
                this.currState.buttons[b] = gamepad.buttons[b].value;
            }
            this.currState.axes[5] = this.currState.buttons[6];
            this.currState.axes[6] = this.currState.buttons[7];
        }

        update()
        {
            this.grabState();
            let power = 0;
            for (let b in this.currState.buttons)
            {
                if (this.currState.buttons[b] == 1.0 && this.lastState.buttons[b] != 1.0)
                {
                    console.log("Controller "+this.id+" Button "+b+" PRESSED");
                    power = 1.0;
                }
                else if (this.currState.buttons[b] == 0.0 && this.lastState.buttons[b] != 0.0)
                    console.log("Controller "+this.id+" Button "+b+" RELEASED");
            }
            for (let b in this.currState.axes)
            {
                if (b > 4 && this.currState.axes[b] == 1.0) power = 1.0;
                if (this.currState.axes[b] > this.lastState.axes[b])
                {
                    console.log("Controller "+this.id+" Axis "+b+" INCREASING");
                    if (b > 4) power = this.currState.axes[b] > power ? this.currState.axes[b] : power;
                }
                else if (this.currState.axes[b] < this.lastState.axes[b])
                {
                    console.log("Controller "+this.id+" Axis "+b+" DECREASING");
                    if (b > 4) power = this.currState.axes[b] > power ? this.currState.axes[b] : power;
                }
            }
            if (power > 0) this.vibrate(power);
        }
    }

    class ControllerKeyboardMouse extends Controller
    {
        constructor(id)
        {
            super(id, ControllerType.KeyboardMouse);
            this.lastState = null;
            this.currState = null;            
        }

        update()
        {

        }
    }

    // player manager detect players that connect/disconnect and what the controller is
    //  one player can be mouse/keyboard/touchscreen
    //  multiple players can be gamepads
    class PlayerManager
    {
        constructor()
        {
            // handles polling the controller states
            this.lastUpdate = 0;  // time of last controller poll
            this.updateFreq = 50; // time between controller polls
            // unique id for players, increment for each connection
            this.nextPlayerID = 1;
            // data
            this.players = {};      // map of all players
            this.controllers = {};  // map to find what player is on what controller
            this.configs = {};      // map of configs for each controller - { type : { id : config } }
            this.events = {};       // map of events that can be triggered - { id : event }
            this.init();
        }

        init()
        {
            let obj = this;
            window.addEventListener("gamepadconnected", function(e) { obj.onPlayerConnected(e); });
            window.addEventListener("gamepaddisconnected", function(e) { obj.onPlayerDisconnected(e); });
            this.detectMouseKeyboard();
            this.configs[ControllerType.Gamepad] = {};
            this.configs[ControllerType.KeyboardMouse] = {};
            this.configs[ControllerType.Touch] = {};
            this.configs[ControllerType.Unknown] = {};
        }

        addConfigGroup(g)
        {
            for (let i in g.configs) this.addConfig(g.configs[i]);
            for (let i in g.events) this.addEvent(g.events[i]);
        }

        addConfig(c)
        {
            this.configs[c.type][c.id] = c;
        }

        addEvent(e)
        {
            this.events[e.id] = e;
        }

        detectMouseKeyboard()
        {
            if (matchMedia('(pointer:fine)').matches) 
            {
                let c = new ControllerKeyboardMouse(999);
                let p = new Player( this.getNextPlayerID() );
                this.controllers[c.id] = c;
                this.players[p.id] = p;
                this.assignPlayer(p,c);
                if (mx.Game.handlePlayerConnected) mx.Game.handlePlayerConnected(p);
            }
        }

        getNextPlayerID()
        {
            let ret = this.nextPlayerID;
            this.nextPlayerID++;
            return ret;
        }

        onPlayerConnected(e)
        {
            console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.", e.gamepad.index, e.gamepad.id, e.gamepad.buttons.length, e.gamepad.axes.length);
            let p = new Player( this.getNextPlayerID() );
            let c = new ControllerGamePad(e.gamepad.index);
            this.controllers[c.id] = c;
            this.players[p.id] = p;
            this.assignPlayer(p,c);

            if (mx.Game.handlePlayerConnected) mx.Game.handlePlayerConnected(p);
        }

        onPlayerDisconnected(e)
        {
            console.log("Gamepad disconnected at index %d: %s.", e.gamepad.index, e.gamepad.id);
            let c = this.controllers[e.gamepad.index];

            if (c && c.player) 
            {
                if (c.player)
                {
                    delete this.players[c.player.id];
                    if (mx.Game.handlePlayerDisconnected) mx.Game.handlePlayerDisconnected(c.player);    
                }
                delete this.controllers[c.id];
            }
        }
        
        assignPlayer(p, c)
        {
            if (!p || !c) return;
            if (p.controller) p.controller.player = null;
            if (c.player) c.player.controller = null;
            p.controller = c;
            c.player = p;
            // assign the commands for this controller
            for (let i in this.configs[c.type]) p.addCommand(this.configs[c.type][i]);
        }

        assignConfigToPlayer(pID, cID)
        {
            let p = this.players[pID];
            if (!p || !p.controller) return;
            let c = this.configs[p.controller.type][cID];
            if (!c) return;
            p.addCommand(c);
        }

        assignConfigToAll(cID)
        {
            for (let pID in this.players)
            {
                let p = this.players[pID];
                if (!p || !p.controller) continue;
                let c = this.configs[p.controller.type][cID];
                if (!c) continue;
                p.addCommand(c);    
            }
        }

        removeConfigFromPlayer(pID, cID)
        {
            let p = this.players[pID];
            if (!p || !p.controller) return;
            p.removeCommand(cID);
        }

        removeConfigFromAll(cID)
        {
            for (let pID in this.players)
            {
                let p = this.players[pID];
                if (!p || !p.controller) continue;
                p.removeCommand(cID);
            }
        }

        update(timestamp)
        {
            if (this.lastUpdate + this.updateFreq >= timestamp) return;
            this.lastUpdate = timestamp;

            for (let p in this.players)
            {
                let triggeredEvent = this.players[p].update();
                if (triggeredEvent)
                {
                    this.sendEvent(this.players[p], triggeredEvent);
                }
            }
        }

        sendEvent(p, eID)
        {
            if (!mx.Game.handleEvent) return;
            
            let e = this.events[eID];
            for (let i in e.codes)
            {
                mx.Game.handleEvent(p, e.codes[i]);
            }
        }
    }

    mx.PlayerManager = new PlayerManager();
})();