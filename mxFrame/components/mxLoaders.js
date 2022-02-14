(function (){

    class Loader
    {
        constructor()
        {
            this.linenum = 0;
            this.text = "";            
            this.name = "";
        }

        error(text)
        {
            console.log(this.name+" File: line " +this.linenum+" : "+text);
        }

        parse(text)
        {
            this.text = text;
            this.lines = this.text.replace("\r","").split("\n");
            this.linenum = 0;
        }

        nextLine()
        {
            if (this.linenum == this.lines.length) return null;
            this.linenum += 1;
            return this.lines[this.linenum-1].trim();
        }

        process(text) { }
    }

    class SkinLoader extends Loader
    {
        constructor()
        {
            super(); 
            this.name = "Skin";
        }
        
        process(text)
        {
            let skin = new mx.Skin();

            this.parse(text);
            let line = null;
            while ((line = this.nextLine()) !== null)
            {
                if (line[0] == '#') continue;

                let words = line.split(" ");
                if (!words || !words.length) continue;

                else if (words[0] == "Texture") 
                {
                    if (words.length < 2) { this.error("bad texture line"); continue; }
                    let file = words[1];
                    let name = file.split('.')[0];
                    mx.Game.loadTextureFile(name, file, false);

                    skin.textureLoading = true;
                    skin.msPerFrame = 0;
                    skin.numFrames = 1;
                }

                else if (words[0] == "Name") 
                {
                    if (words.length < 2) { this.error("bad name line"); continue; }
                    skin.name = words[1];
                }

                else if (words[0] == "Size")
                {
                  if (words.length < 3) { this.error("bad size line"); continue; }
        
                  let x = parseInt(words[1]);
                  let y = parseInt(words[2]);
                  skin.size = {w: x, h: y};
                }
        
                else if (words[0] == "MSPerFrame")
                {
                  if (words.length < 2) { this.error("bad MXPerFrame line"); continue; }
        
                  let x = parseInt(words[1]);
                  skin.msPerFrame = x;
                }
        
                else if (words[0] == "Frames")
                {
                  if (words.length < 2) { this.error("bad frames line"); continue; }
        
                  let x = parseInt(words[1]);
                  skin.numFrames = x;
                }
        
                else if ((words[0] == "Component") || (words[0] == "Componant"))
                {
                  if (words.length < 6) { this.error("bad component line"); continue; }
        
                  let name = words[1];
                  let x = parseInt(words[2]);
                  let y = parseInt(words[3]);
                  let w = parseInt(words[4]);
                  let h = parseInt(words[5]);       
                  let rect = {x:x, y:y, w:w, h:h};
        
                  if (name in skin.names)
                  {
                      this.error(name + " already exists!");
                  }
                  else
                  {
                      skin.names[name] = skin.components.length;
                      skin.components.push(rect);
                  }
                }
            }

            if (!skin.name) this.error("Missing name");
            else if (!skin.textureLoading) this.error("Missing texture");
            else if (!skin.components.length) this.error("Missing components");
            else mx.SkinManager.addSkin(skin);
        }
    }

    class InputLoader extends Loader
    {
        constructor()
        {
            super(); 
            this.name = "Input";
        }

        resolveNumber(word, ids)
        {
            let id = parseInt(word);
            if (isNaN(id))  
            {
                if (word in ids) 
                    id = ids[word];
                else 
                {
                    this.error("Non numeric value '" +word+ "'"); 
                    return false; 
                }
            }
            return id;
        }
        
        resolveFloat(word, ids)
        {
            let id = parseFloat(word);
            if (isNaN(id))  
            {
                if (word in ids) 
                    id = ids[word];
                else 
                {
                    this.error("Non numeric value '" +word+ "'"); 
                    return false; 
                }
            }
            return id;
        }

        process(text)
        {
            let ids = {};
            let events = [];
            let lastEvent = null;
            let configs = [];
            let lastConfig = null;
            let lastCommand = null;

            // preload
            ids['Unknown'] = 0;
            ids['KeyboardMouse'] = 1;
            ids['Touch'] = 2;
            ids['Gamepad'] = 3;
            ids['Up'] = 0;
            ids['Down'] = 1;
            ids['Over'] = 0;
            ids['Under'] = 1;
            ids['Dead'] = 2;
            ids['Squeezing'] = 3;
            ids['Releasing'] = 4;
            ids['A'] = 0;
            ids['B'] = 1;
            ids['X'] = 2;
            ids['Y'] = 3;
            ids['ShoulderLeft'] = 4;
            ids['ShoulderRight'] = 5;
            ids['LeftTrigger'] = 6;
            ids['RightTrigger'] = 7;
            ids['Start'] = 9;
            ids['Back'] = 8;
            ids['LeftStick'] = 10;
            ids['RightStick'] = 11;
            ids['DPadUp'] = 12;
            ids['DPadDown'] = 13;
            ids['DPadLeft'] = 14;
            ids['DPadRight'] = 15;
            ids['LeftXAxis'] = 0;
            ids['LeftYAxis'] = 1;
            ids['RightXAxis'] = 2;
            ids['RightYAxis'] = 3;
            ids['LeftStickAxis'] = 4;
            ids['RightStickAxis'] = 5;

            this.parse(text);
            let line = null;
            while ((line = this.nextLine()) !== null)
            {
                if (line[0] == '#') continue;

                let words = line.split(" ");
                if (!words || !words.length) continue;

                if (words[0] == "ID")
                {
                    if (words.length != 3) { this.error("Bad ID definition"); continue; }
                    let id = parseInt(words[1]);
                    if (!id)  { this.error("Non numeric ID"); continue; }
                    if (ids[id]) { this.error("Duplicate ID definition"); continue; }
                    ids[words[2]] = id;
                    continue;
                }

                if (words[0] == "Event")
                {
                    lastEvent = null;
                    if (words.length != 2) { this.error("Bad Event definition"); continue; }
                    let id = this.resolveNumber(words[1], ids);
                    if (id === false) continue;
                    lastEvent = new mx.Event(id, words[1]);
                    events.push(lastEvent);
                    continue;
                }

                if (words[0] == "EventCode")
                {
                    if (!lastEvent) { this.error("EventCode without a previous Event"); continue; }
                    if (words.length < 3 || words.length > 4) { this.error("Bad EventCode definition"); continue; }

                    let id = this.resolveNumber(words[1], ids);
                    if (id === false) continue;

                    let param = this.resolveNumber(words[2], ids);
                    if (param === false) continue;

                    let target = 0;
                    if (words.length == 4)
                    {
                        target = this.resolveNumber(words[3], ids);
                        if (target === false) continue;
                    }
                    lastEvent.codes.push(new mx.EventCode(id, param, target));
                    continue;
                }

                if (words[0] == "Assign")
                {
                    if (!lastEvent) { this.error("Assign without a previous Event"); continue; }
                    if (words.length != 3) { this.error("Bad Assign definition"); continue; }

                    let id = this.resolveNumber(words[1], ids);
                    if (id === false) continue;

                    let set = words[2];
                    if (set == "Set") set = true;
                    else if (set == "Unset") set = false;
                    else { this.error("Assign must use Set or Unset"); continue; }

                    lastEvent.assigns.push(new mx.Assign(id, set));
                    continue;
                }

                if (words[0] == "CommandConfig")
                {
                    lastConfig = null;
                    if (words.length < 3 || words.length > 4) { this.error("Bad CommandConfig definition"); continue; }
                    let id = this.resolveNumber(words[1], ids);
                    if (id === false) continue;

                    let type = this.resolveNumber(words[2], ids);
                    if (type === false) continue;
                    if (type > 3) { this.error("Bad type number"); continue ; }

                    let name = words[1];

                    let klass = 0;
                    if (words.length == 4)
                    {
                        klass = this.resolveNumber(words[3], ids);
                        if (klass === false) continue;
                    }

                    lastConfig = new mx.CommandConfig(name, id, type, klass);
                    configs.push(lastConfig);
                    continue;
                }
                
                if (words[0] == "Command")
                {
                    lastCommand = null;
                    if (!lastConfig) { this.error("Command without a previous CommandConfig"); continue; }
                    if (words.length != 2) { this.error("Bad Command definition"); continue; }
                    let id = this.resolveNumber(words[1], ids);
                    if (id === false) continue;

                    lastCommand = new mx.Command(id);
                    lastConfig.commands.push(lastCommand);
                    continue;
                }

                if (words[0] == "StrokeDigital")
                {
                    if (!lastCommand) { this.error("StrokeDigital without a previous Command"); continue; }
                    if (words.length < 3 || words.length > 5) { this.error("Bad StrokeDigital definition"); continue; }

                    let buttondefs = words[1].split(",");
                    let buttons = [];
                    for (let b in buttondefs)
                    {
                        let id = this.resolveNumber(buttondefs[b], ids);
                        if (id === false) continue;
                        if (id > 15)  { this.error("Bad button number"); continue; }
                        buttons.push(id);    
                    }

                    let state = this.resolveNumber(words[2], ids);
                    if (state === false) continue;
                    if (state > 1)  { this.error("Bad state number"); continue; }

                    let time = 0;
                    if(words.length > 3) 
                    {
                        let time = this.resolveNumber(words[3], ids);
                        if (time === false) continue;
                    }

                    let hold = 0;
                    if(words.length == 5) 
                    {
                        let hold = this.resolveNumber(words[4], ids);
                        if (hold === false) continue;
                    }
                    lastCommand.strokes.push( new mx.StrokeDigital(buttons, state, time, hold) );
                    continue;
                }

                if (words[0] == "StrokeAnalog")
                {
                    if (!lastCommand) { this.error("StrokeAnalog without a previous Command"); continue; }
                    if (words.length < 4 || words.length > 5) { this.error("Bad StrokeAnalog definition"); continue; }

                    let buttondefs = words[1].split(",");
                    let buttons = [];
                    for (let b in buttondefs)
                    {
                        let id = this.resolveNumber(buttondefs[b], ids);
                        if (id === false) continue;
                        if (id > 15)  { this.error("Bad button number"); continue; }
                        buttons.push(id);    
                    }

                    let state = this.resolveNumber(words[2], ids);
                    if (state === false) continue;
                    if (state > 2)  { this.error("Bad state number"); continue; }

                    let value = this.resolveFloat(words[3], ids);
                    if (value === false) continue;

                    let time = 0;
                    if(words.length == 5) 
                    {
                        let time = this.resolveNumber(words[4], ids);
                        if (time === false) continue;
                    }
                    lastCommand.strokes.push( new mx.StrokeAnalog(buttons, state, value, time) );
                    continue;
                }

                if (words[0] == "StrokeKey")
                {
                    if (!lastCommand) { this.error("StrokeKey without a previous Command"); continue; }
                    if (words.length < 3 || words.length > 5) { this.error("Bad StrokeKey definition"); continue; }

                    let keys = words[1].split(",");

                    let state = this.resolveNumber(words[2], ids);
                    if (state === false) continue;
                    if (state > 1)  { this.error("Bad state number"); continue; }

                    let time = 0;
                    if(words.length > 3) 
                    {
                        let time = this.resolveNumber(words[3], ids);
                        if (time === false) continue;
                    }

                    let hold = 0;
                    if(words.length == 5) 
                    {
                        let hold = this.resolveNumber(words[4], ids);
                        if (hold === false) continue;
                    }
                    lastCommand.strokes.push( new mx.StrokeKey(keys, state, time, hold) );
                    continue;                    
                }

                if (words[0] == "StrokeMouse")
                {
                    if (!lastCommand) { this.error("StrokeMouse without a previous Command"); continue; }
                    if (words.length < 3 || words.length > 5) { this.error("Bad StrokeMouse definition"); continue; }

                    let button = this.resolveNumber(words[1], ids);
                    if (button === false) continue;
                    if (button > 2)  { this.error("Bad button number"); continue; }

                    let state = this.resolveNumber(words[2], ids);
                    if (state === false) continue;
                    if (state > 1)  { this.error("Bad state number"); continue; }

                    let time = 0;
                    if(words.length > 3) 
                    {
                        let time = this.resolveNumber(words[3], ids);
                        if (time === false) continue;
                    }

                    let hold = 0;
                    if(words.length == 5) 
                    {
                        let hold = this.resolveNumber(words[4], ids);
                        if (hold === false) continue;
                    }
                    lastCommand.strokes.push( new mx.StrokeMouse(button, state, time, hold) );
                    continue;                    
                }
            }

            let group = new mx.CommandConfigGroup();
            group.events = events;
            group.configs = configs;
            mx.PlayerManager.addConfigGroup(group);
        }
    }

    mx.InputLoader = new InputLoader();
    mx.SkinLoader = new SkinLoader();
})();