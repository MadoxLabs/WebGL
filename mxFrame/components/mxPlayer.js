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
        }

        update()
        {
            if (this.controller) this.controller.update();
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
            this.lastUpdate = 0;
            this.updateFreq = 50; // ms
            this.nextPlayerID = 1;
            this.players = {};      // listof all players
            this.controllers = {};  // map to find what player is on what controller
            this.init();
        }

        init()
        {
            let obj = this;
            window.addEventListener("gamepadconnected", function(e) { obj.onPlayerConnected(e); });
            window.addEventListener("gamepaddisconnected", function(e) { obj.onPlayerDisconnected(e); });
            this.detectMouseKeyboard();
            console.log(this);
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

            console.log(this);
        }

        onPlayerDisconnected(e)
        {
            console.log("Gamepad disconnected at index %d: %s.", e.gamepad.index, e.gamepad.id);
            let c = this.controllers[e.gamepad.index];

            if (c && c.player) delete this.players[c.player.id];
            delete this.controllers[c.id];

            console.log(this);
        }
        
        assignPlayer(p, c)
        {
            if (!p || !c) return;
            if (p.controller) p.controller.player = null;
            if (c.player) c.player.controller = null;
            p.controller = c;
            c.player = p;
        }

        update(timestamp)
        {
            if (this.lastUpdate + this.updateFreq >= timestamp) return;
            this.lastUpdate = timestamp;

            for (let p in this.players)
            {
                this.players[p].update();
            }
        }
    }

    mx.PlayerManager = new PlayerManager();
})();