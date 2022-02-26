(function (){

    class Loader
    {
        constructor()
        {
            this.linenum = 0;
            this.text = "";            
            this.name = "";
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

    const mxParseState = {
        None: 0,
        ShiftDef: 1,
        FocusDef: 2,
        Widget: 3
    }

    // Used by the layout importer. Repsents a collection of UI objects
    class UIGroup
    {
        constructor()
        {
            this.mInitialFocus = 0; // int
            this.mFocusDefs = []; // focus defs
            this.mShiftDefs = []; // shift defs
            this.mWidgets = []; // widgets
            this.mPublish = {}; // string to string
        }
    }

    class LayoutLoader extends Loader
    {
        constructor()
        {
            super(); 
            this.name = "Layout";
            this.init();
        }

        init()
        {
            this.fdef = null;  // focus def
            this.sdef = null; // shift def
            this.group = new UIGroup();

            this.mTypes = {};
            this.mIDs = {};
            this.mState = mxParseState.None;
            this.mSubState = 0;
            this.mConstants = "";

            this.mTypes["North"] = 0;
            this.mTypes["South"] = 1;
            this.mTypes["East"] = 2;
            this.mTypes["West"] = 3;

            this.mTypes["Componant"] = 0;
            this.mTypes["Label"] = 1;
            this.mTypes["Container"] = 2;
            this.mTypes["Button"] = 3;
            this.mTypes["TabControl"] = 4;
            this.mTypes["Slider"] = 5;
            this.mTypes["Scrollbar"] = 6;
            this.mTypes["Dropdown"] = 7;

            this.mTypes["True"] = 1;
            this.mTypes["False"] = 0;

            this.mTypes["Large"] = 0;
            this.mTypes["Small"] = 1;
            this.mTypes["None"] = 2;

            this.mTypes["ButtonImage"] = 1;
            this.mTypes["ButtonText"] = 2;

            this.mTypes["Clear"] = 0;
            this.mTypes["Solid"] = 1;

            this.mTypes["FG"] = 0;
            this.mTypes["BG"] = 1;
            this.mTypes["ActiveFG"] = 2;
            this.mTypes["InactiveFG"] = 3;

            this.mTypes["LeftOf"] = 0;
            this.mTypes["LeftAlign"] = 1;
            this.mTypes["Fixed"] = 2;
            this.mTypes["RightOf"] = 3;
            this.mTypes["RightAlign"] = 4;
            this.mTypes["Center"] = 5;
            this.mTypes["CenterAlign"] = 6;
            this.mTypes["Below"] = 7;
            this.mTypes["BottomAlign"] = 8;
            this.mTypes["Above"] = 9;
            this.mTypes["TopAlign"] = 10;
        }
        
        saveAll()
        {
          if (this.fdef != null) this.group.mFocusDefs.push(this.fdef);
          this.fdef = null;
    
          if (this.sdef != null) this.group.mShiftDefs.push(this.sdef);
          this.sdef = null;
        }

        process(text)
        {
            this.init();

            this.parse(text);
            let line = null;
            while ((line = this.nextLine()) !== null)
            {
                if (line[0] == '#') continue;

                let words = line.split(" ");
                if (!words || !words.length) continue;

                else if (words[0] == "END") break;
                else if (words[0] == "ID")
                {
                    mState = mxParseState.None;
                    mSubState = 0;

                    if (words.length != 3) { this.error("Bad ID definition"); continue; }
                    let id = parseInt(words[1]);
                    if (!id)  { this.error("Non numeric ID"); continue; }
                    if (this.mIDs[id]) { this.error("Duplicate ID definition"); continue; }
                    this.mIDs[words[2]] = id;
                }                
                else if (words[0] == "Assign")
                {
                    mState = mxParseState.None;
                    mSubState = 0;

                    if (words.length == 3) 
                    { 
                        let players = this.resolveNumber(words[1], this.mIDs);
                        if (players === false) continue;

                        let cmd = this.resolveNumber(words[2], this.mIDs);
                        if (cmd === false) continue;

                        mx.UIManager.setCommand(cmd, players);

                    }
                    else if (words.length == 2) 
                    { 
                        let focus = this.resolveNumber(words[1], this.mIDs);
                        if (focus === false) continue;

                        this.group.mInitialFocus = focus;
                    }
                    else
                    {
                        this.error("Bad Assign definition"); continue; 
                    }
                }
                else if (words[0] == "Publish")
                {
                    if (words.length != 3) { this.error("Bad Publish definition"); continue; }
                    let line = "";
                    for (let i = 2; i < words.length; ++i) line += words[i] + " ";
                    this.mPublish[words[1]] = line.trim();
                }
                else if (words[0] == "ShiftDef")
                {
                    this.mState = mxParseState.ShiftDef;
                    this.mSubState = 100;
                }
                else if (words[0] == "FocusDef")
                {
                    this.mState = mxParseState.FocusDef;
                    this.mSubState = 200;
                }
                else if (words[0] == "Widget")
                {
                    if (words.length != 3) { this.error("Bad Widget definition"); continue; }
                    let id = this.resolveNumber(words[1], this.mIDs);
                    if (id === false) continue;

                    let type = this.resolveNumber(words[2], this.mTypes);
                    if (type === false) continue;

                    this.mState = mxParseState.Widget;
                    this.mSubState = 300+type;        
                    
                    // TODO
                }

                else if (this.mState == mxParseState.ShiftDef)
                {
                    if (words[0] == "Player") 
                    { 
                        if (words.length != 3) { this.error("Bad Player definition"); continue; }
                        let mask = this.resolveNumber(words[1], this.mIDs);
                        if (mask === false) continue;
    
                        let firstchild_id = this.resolveNumber(words[2], this.mIDs);
                        if (firstchild_id === false) continue;

                        mSubState = 101; 
                    }
                    else if (words[0] == "Element" && ((mSubState == 102) || (mSubState == 101))) 
                    { 
                        if (words.length != 2) { this.error("Bad Element definition"); continue; }
                        let widget_id = this.resolveNumber(words[1], this.mIDs);
                        if (widget_id === false) continue;

                        mSubState = 102; 
                    }
                    else if (words[0] == "Direction" && mSubState == 102) 
                    {
                        if (words.length != 3) { this.error("Bad Direction definition"); continue; }
                        let dir = this.resolveNumber(words[1], this.mTypes);
                        if (dir === false) continue;

                        let widget = this.resolveNumber(words[1], this.mIDs);
                        if (widget === false) continue;

                        WriteCodeNumber(5, words);
                    }          
                }

                else if (this.mState == mxParseState.FocusDef)
                {
                    if (words[0] == "Player") 
                    { 
                        if (words.length != 3) { this.error("Bad Player definition"); continue; }
                        let mask = this.resolveNumber(words[1], this.mIDs);
                        if (mask === false) continue;
    
                        let firstchild_id = this.resolveNumber(words[2], this.mIDs);
                        if (firstchild_id === false) continue;

                        mSubState = 201; 
                    }
                    else if (words[0] == "Element" && (mSubState == 201)) 
                    { 
                        if (words.length < 2) { this.error("Bad Element definition"); continue; }
                        if (words.length == 2)
                        {
                            let widget_id = this.resolveNumber(words[1], this.mIDs);
                            if (widget_id === false) continue;    
                        }
                        else if (words.length == 5)
                        {
                            let r = this.resolveNumber(words[1], this.mIDs);
                            if (r === false) continue;    
                            let g = this.resolveNumber(words[1], this.mIDs);
                            if (g === false) continue;    
                            let b = this.resolveNumber(words[1], this.mIDs);
                            if (b === false) continue;    
                            let a = this.resolveNumber(words[1], this.mIDs);
                            if (a === false) continue;    
                        }
                        else if (words.length == 3 && words[1] == "Parent")
                        {
                            let widget_id = this.resolveNumber(words[1], this.mIDs);
                            if (widget_id === false) continue;    
                        }
                    }

                    else if (this.mState == mxParseState.Widget)
                    {

                    }

                }

                else if (this.mState == mxParseState.Widget)
                {
                  // Componant commands
                  if (mSubState == 300) 
                  {
                    if (words[0] == "Componant")
                    {
                        let name = words[2];
                        if (name === false) continue;
                    }
                    else if (words[0] == "Stretch")
                    {
                        let val = this.resolveNumber(words[1], this.mTypes);
                        if (val === false) continue;
                    }
                    else if (words[0] == "Scale")
                    {
                        let val = this.resolveNumber(words[1], this.mIDs);
                        if (val === false) continue;
                    }   
                  }
                }
            }

            this.saveAll();

            
            mx.UIManager.processGroup(group);
        }
    }
    class InputLoader extends Loader
    {
        constructor()
        {
            super(); 
            this.name = "Input";
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