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
            this.config = [];         // CommandConfig object LIFO

            this.lockedConfig = null;
        }

        addConfig(c)
        {
            this.config.push(c);
            console.log("player "+this.id+": add config '"+c.name+"'");
        }

        removeConfig(cID)
        {
            for (let i in this.config)
            {
                if (this.config[i].id == cID)
                {
                    console.log("player "+this.id+": remove config '"+this.config[i].name+"'");
                    this.config.splice(i, 1);
                    return;
                }
            }
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
                let ret = 0;
                let pumped = 0;

                // a config is locked? give it first crack, until it fails or triggers
                if (this.lockedConfig)
                {
                    ret = this.lockedConfig.pump(this.controller);
                    if (!ret) 
                    {
                        this.lockedConfig = null;
                    }
                    else if (ret > 0) 
                    {
                        this.lockedConfig = null;
                        return ret;
                    }
                    else return 0;
                }

                for (let i = this.config.length-1; i >= 0; --i)
                {
                    let c = this.config[i];
                    if ((pumped & c.class) != 0) continue;
                    ret = c.pump(this.controller);
                    if (ret == -1) // a command is progressing, dont let other configs run for now - lock it for next time
                    {
                        this.lockedConfig = c;
                        break;
                    }
                    else if (ret) // a command triggered!
                        return ret;
                    pumped = pumped | c.class;
                }
            }
            return 0;
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
            this.update();    
        }

        unchangedDigital()
        {
            for (let i in this.lastState.buttons)
            {
                if (this.lastState.buttons[i] != this.currState.buttons[i]) return false;
            }
            return true;
        }

        wasButtonPressed(buttons)
        {
            if (buttons.length)
            {
                let ret = true;
                for (let bID in buttons)
                {
                    let b = buttons[bID];
                    if ((this.currState.buttons[b] == 1.0 && this.lastState.buttons[b] != 1.0) == false) 
                    {
                        ret = false;
                        break;
                    }
                }    
                return ret;
            }

            if (this.currState.buttons[buttons] == 1.0 && this.lastState.buttons[buttons] != 1.0) return true;
            return false;
        }

        wasButtonReleased(buttons)
        {
            if (buttons.length)
            {
                let ret = true;
                for (let bID in buttons)
                {
                    let b = buttons[bID];
                    if ((this.currState.buttons[b] == 0.0 && this.lastState.buttons[b] != 0.0) == false) 
                    {
                        ret = false;
                        break;
                    }
                }    
                return ret;
            }

            if (this.currState.buttons[buttons] == 0.0 && this.lastState.buttons[buttons] != 0.0) return true;
            return false;
        }

        isButtonUnchanged(buttons)
        {
            if (buttons.length)
            {
                let ret = true;
                for (let b in buttons)
                {
                    if ((this.currState.buttons[b] == this.lastState.buttons[b]) == false) 
                    {
                        ret = false;
                        break;
                    }
                }    
                return ret;
            }

            if (this.currState.buttons[b] == this.lastState.buttons[b]) return true;
            return false;
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

        update()
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
            this.configs[ControllerType.Gamepad] = {};
            this.configs[ControllerType.KeyboardMouse] = {};
            this.configs[ControllerType.Touch] = {};
            this.configs[ControllerType.Unknown] = {};
        }

        init()
        {
            let obj = this;
            window.addEventListener("gamepadconnected", function(e) { obj.onPlayerConnected(e); });
            window.addEventListener("gamepaddisconnected", function(e) { obj.onPlayerDisconnected(e); });
            this.detectMouseKeyboard();
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
        }

        assignConfigToPlayer(pID, cID)
        {
            let p = pID.id ? pID : this.players[pID]; // were we passed a player?
            if (!p || !p.controller) return;
            let c = this.configs[p.controller.type][cID];
            if (!c) return;
            p.addConfig(c);
        }

        assignConfigToAll(cID)
        {
            for (let pID in this.players)
            {
                let p = this.players[pID];
                if (!p || !p.controller) continue;
                let c = this.configs[p.controller.type][cID];
                if (!c) continue;
                p.addConfig(c);    
            }
        }

        removeConfigFromPlayer(pID, cID)
        {
            let p = pID.id ? pID : this.players[pID];
            if (!p || !p.controller) return;
            p.removeConfig(cID);
        }

        removeConfigFromAll(cID)
        {
            for (let pID in this.players)
            {
                let p = this.players[pID];
                if (!p || !p.controller) continue;
                p.removeConfig(cID);
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
            let e = this.events[eID];
            console.log("fire event " + eID + " ("+e.name+")");

            if (mx.Game.handleEvent)
            {
                for (let i in e.codes)
                {
                    mx.Game.handleEvent(p, e.codes[i]);
                }    
            }
            for (let i in e.assigns)
            {
                if (e.assigns[i].set)
                    this.assignConfigToPlayer(p, e.assigns[i].config);
                else
                    this.removeConfigFromPlayer(p, e.assigns[i].config);
            }
        }
    }

    mx.PlayerManager = new PlayerManager();
    mx.ControllerType = ControllerType;
    mx.Player = Player;
    mx.Controller = Controller;
    mx.ControllerGamePad = ControllerGamePad;
    mx.ControllerKeyboardMouse = ControllerKeyboardMouse;
})();