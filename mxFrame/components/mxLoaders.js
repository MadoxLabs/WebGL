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

    const ParseState = {
        None: 0,
        ShiftDef: 1,
        FocusDef: 2,
        Widget: 3
    };

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
            this.fdef = null; // focus def
            this.fpdef = null // focus player def
            this.sdef = null; // shift def
            this.spdef = null // shift player def
            this.selem = null // shift element
            this.group = new mx.UIGroup();
    
            this.curComponantId = 0;
            this.curPlaceable = null;
    
            this.mPlaces = {}; // id to place
            this.mComponants = {}; // id = component
            this.mWidgets = {}; // id to widget
    
            this.mTypes = {};
            this.mIDs = {};
            this.mState = ParseState.None;
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
                    mState = ParseState.None;
                    mSubState = 0;
    
                    if (words.length != 3) { this.error("Bad ID definition"); continue; }
                    let id = parseInt(words[1]);
                    if (!id) { this.error("Non numeric ID"); continue; }
                    if (this.mIDs[id]) { this.error("Duplicate ID definition"); continue; }
                    this.mIDs[words[2]] = id;
                }
                else if (words[0] == "Assign")
                {
                    mState = ParseState.None;
                    mSubState = 0;
    
                    if (words.length == 3) // code 28
                    {
                        this.saveAll();
                        let players = this.resolveNumber(words[1], this.mIDs);
                        if (players === false) continue;
    
                        let cmd = this.resolveNumber(words[2], this.mIDs);
                        if (cmd === false) continue;
    
                        mx.UIManager.setCommand(cmd, players);
    
                    }
                    else if (words.length == 2) // code 30
                    {
                        this.saveAll();
                        let focus = this.resolveNumber(words[1], this.mIDs);
                        if (focus === false) continue;
    
                        this.group.mInitialFocus = focus;
                    }
                    else
                    {
                        this.error("Bad Assign definition");
                        continue;
                    }
                }
                else if (words[0] == "Publish") // code 1
                {
                    if (words.length != 3) { this.error("Bad Publish definition"); continue; }
                    this.saveAll();
                    let line = "";
                    for (let i = 2; i < words.length; ++i) line += words[i] + " ";
                    this.group.mPublish[words[1]] = line.trim();
                }
                else if (words[0] == "ShiftDef") // code 2
                {
                    if (words.length != 3) { this.error("Bad ShiftDef definition"); continue; }
                    this.saveAll();
                    let id = this.resolveNumber(words[1], this.mIDs);
                    if (id === false) continue;
    
                    this.mState = ParseState.ShiftDef;
                    this.mSubState = 100;
    
                    this.sdef = new mx.ShiftDef(id);
                }
                else if (words[0] == "FocusDef") // code 6
                {
                    if (words.length != 3) { this.error("Bad FocusDef definition"); continue; }
                    this.saveAll();
                    let id = this.resolveNumber(words[1], this.mIDs);
                    if (id === false) continue;
    
                    this.mState = ParseState.FocusDef;
                    this.mSubState = 200;
    
                    this.fdef = new mx.FocusDef(id);
                }
                else if (words[0] == "Widget") // code 11
                {
                    if (words.length != 3) { this.error("Bad Widget definition"); continue; }
                    let id = this.resolveNumber(words[1], this.mIDs);
                    if (id === false) continue;
    
                    let type = this.resolveNumber(words[2], this.mTypes);
                    if (type === false) continue;
    
                    this.mState = ParseState.Widget;
                    this.mSubState = 300 + type;
    
                    switch (type)
                    {
                        case 0:
                            this.curComponantID = id;
                            break;
                        case 2:
                            {
                                let w = new mx.Container(id);
                                this.curComponantID = 0;
                                this.curPlaceable = w;
                                this.mWidgets[id] = w;
                            }
                            break;
                        default:
                            // todo all the widgets
                    }
                }
    
                else if (this.mState == ParseState.ShiftDef)
                {
                    if (words[0] == "Player") // code 3
                    {
                        if (words.length != 3) { this.error("Bad Player definition"); continue; }
                        let mask = this.resolveNumber(words[1], this.mIDs);
                        if (mask === false) continue;
    
                        let firstchild_id = this.resolveNumber(words[2], this.mIDs);
                        if (firstchild_id === false) continue;
    
                        this.spdef = new mx.ShiftPlayerDef(mask, child);
                        this.sdef.AddShiftDef(this.spdef);
    
                        mSubState = 101;
                    }
                    else if (words[0] == "Element" && ((mSubState == 102) || (mSubState == 101))) // code 4
                    {
                        if (words.length != 2) { this.error("Bad Element definition"); continue; }
                        let widget_id = this.resolveNumber(words[1], this.mIDs);
                        if (widget_id === false) continue;
    
                        this.selem = new mx.ShiftElement(widget_id);
                        this.spdef.AddElement(selem);
                        mSubState = 102;
                    }
                    else if (words[0] == "Direction" && mSubState == 102) // code 5
                    {
                        if (words.length != 3) { this.error("Bad Direction definition"); continue; }
                        let dir = this.resolveNumber(words[1], this.mTypes);
                        if (dir === false) continue;
    
                        let widget = this.resolveNumber(words[1], this.mIDs);
                        if (widget === false) continue;
    
                        switch (dir)
                        {
                            case 0: this.selem.mShifts[mx.ShiftDir.North] = widget; break;
                            case 1: this.selem.mShifts[mx.ShiftDir.South] = widget; break;
                            case 2: this.selem.mShifts[mx.ShiftDir.East ] = widget; break;
                            case 3: this.selem.mShifts[mx.ShiftDir.West ] = widget; break;
                        }    
                    }
                }
    
                else if (this.mState == ParseState.FocusDef)
                {
                    if (words[0] == "Player") // code 7
                    {
                        if (words.length != 3) { this.error("Bad Player definition"); continue; }
                        let mask = this.resolveNumber(words[1], this.mIDs);
                        if (mask === false) continue;
    
                        let cmd = this.resolveNumber(words[2], this.mIDs);
                        if (cmd === false) continue;
    
                        this.fpdef = new mx.FocusPlayerDef(mask);
                        this.fpdef.mCommands = cmd;
                        this.fdef.AddFocusDef(this.fpdef);
    
                        mSubState = 201;
                    }
                    else if (words[0] == "Element" && (mSubState == 201))
                    {
                        if (words.length < 2) { this.error("Bad Element definition"); continue; }
                        if (words.length == 2) // code 8
                        {
                            let comp = this.resolveNumber(words[1], this.mIDs);
                            if (comp === false) continue;
    
                            if (comp in this.mComponants)
                            {
                                let link = this.mComponants[comp];
                                let elem = new mx.FocusElement(link);
                                this.fpdef.mElements.push(elem);
                            }
                        }
                        else if (words.length == 5) // code 10
                        {
                            let r = this.resolveNumber(words[1], this.mIDs);
                            if (r === false) continue;
                            let g = this.resolveNumber(words[1], this.mIDs);
                            if (g === false) continue;
                            let b = this.resolveNumber(words[1], this.mIDs);
                            if (b === false) continue;
                            let a = this.resolveNumber(words[1], this.mIDs);
                            if (a === false) continue;
    
                            let elem = new mx.FocusElement(new mx.Color(r,g,b,a));
                            this.fpdef.mElements.push(elem);
                        }
                        else if (words.length == 3 && words[1] == "Parent") // code 9
                        {
                            let comp = this.resolveNumber(words[1], this.mIDs);
                            if (comp === false) continue;
    
                            if (comp in this.mComponants)
                            {
                                let link = this.mComponants[comp];
                                let elem = new mx.FocusElement(link, true);
                                this.fpdef.mElements.push(elem);
                            }
                        }
                    }
                }
    
                else if (this.mState == ParseState.Widget)
                {
                    // Componant commands
                    if (this.mSubState == 300)
                    {
                        if (words[0] == "Component" || words[0] == "Componant") // code 16
                        {
                            let name = words[2];
                            if (name === false) continue;
    
                            let link = new mx.ComponantLink(name);
                            this.mComponants.add(this.curComponantID, link);
                            this.curPlaceable = link;
                        }
                        else if (words[0] == "Stretch")
                        {
                            let val = this.resolveNumber(words[1], this.mTypes); // code 17
                            if (val === false) continue;
                            this.mComponants[this.curComponantID].mStretch = (val == 0 ? false : true);
                        }
                        else if (words[0] == "Scale")
                        {
                            let val = this.resolveNumber(words[1], this.mIDs); // code 29
                            if (val === false) continue;
    
                            if (this.curComponantID != 0)
                                this.mComponants[this.curComponantID].scale = val;
                            else
                            {
                                let widget = this.curPlaceable;
                                widget.scale = val;
                            }
                        }
                    }
                    // all widgets
                    if (this.mSubState > 300)
                    {
                        //                    if (words[0] == "Clip") Write4Numbers(19, words);
                        //                    else if (words[0] == "Color") WriteCodeColor(20, words);
                        if (words[0] == "Parent") // code 21
                        {
                            let id = this.resolveNumber(words[1], this.mIDs);
                            if (id === false) continue;
    
                            let widget = this.curPlaceable;
                            if (id in this.mWidgets)
                            {
                                let parent = this.mWidgets[id];
                                parent.addChild(widget);
                            }
                        }
                        else if (words[0] == "Componant") // code 22
                        {
                            let id = this.resolveNumber(words[1], this.mIDs);
                            if (id === false) continue;
    
                            let widget = this.curPlaceable;
                            if (id in this.mComponants)
                            {
                                widget.addComponant(this.mComponants[id]);
                            }
                        }
                    }
                    // Containers
                    if (this.mSubState == 302)
                    {
                        if (words[0] == "Border") // code 25
                        {
                            let border = this.resolveNumber(words[1], this.mIDs);
                            if (border === false) continue;
    
                            let widget = this.curPlaceable;
                            switch (border)
                            {
                                case 0:
                                    widget.border = true;
                                    widget.largeBorder = true;
                                    break;
                                case 1:
                                    widget.border = true;
                                    widget.largeBorder = false;
                                    break;
                                case 2:
                                    widget.border = false;
                                    break;
                            }
                            widget.bake();
                        }
                        else if (words[0] == "Background") // code 26
                        {
                            let bg = this.resolveNumber(words[1], this.mIDs);
                            if (bg === false) continue;
    
                            let widget = this.curPlaceable;
                            switch (bg)
                            {
                                case 0:
                                    widget.background = false;
                                    break;
                                case 1:
                                    widget.background = true;
                                    break;
                            }
                            widget.bake();
                        }
                        else if (words[0] == "Skin") // code 27
                        {
                            let id = this.resolveNumber(words[1], this.mIDs);
                            if (id === false) continue;
                        }
    
                        else if (words[0] == "Cmd") // code 33
                        {
                            let id = this.resolveNumber(words[1], this.mIDs);
                            if (id === false) continue;
    
                            let widget = this.curPlaceable;
                            widget.commandConfig = id;
                        }
    
                        //                    else if (words[0] == "Scrollbar") WriteCode(45, words);
                        //                    else if (words[0] == "Mouse") WriteNumber(50, words);
                    }
    
                    // all objects
                    if (words[0] == "TopLeftX") // code 12
                    {
                        let place = this.resolveNumber(words[1], this.mTypes);
                        if (place === false) continue;
    
                        let id = this.resolveNumber(words[1], this.mIDs);
                        if (id === false) continue;
    
                        let offset = this.resolveNumber(words[1], this.mIDs);
                        if (offset === false) continue;
    
                        let relative = null;
                        if (id in this.mComponants) relative = this.mComponants[id];
                        if (id in this.mWidgets) relative = this.mWidgets[id];
    
                        this.curPlaceable.mTopLeft.SetX(this.mPlaces[place], relative, offset);
                    }
                    else if (words[0] == "TopLeftY") // code 13
                    {
                        let place = this.resolveNumber(words[1], this.mTypes);
                        if (place === false) continue;
    
                        let id = this.resolveNumber(words[1], this.mIDs);
                        if (id === false) continue;
    
                        let offset = this.resolveNumber(words[1], this.mIDs);
                        if (offset === false) continue;
    
                        let relative = null;
                        if (id in this.mComponants) relative = this.mComponants[id];
                        if (id in this.mWidgets) relative = this.mWidgets[id];
    
                        this.curPlaceable.mTopLeft.SetY(this.mPlaces[place], relative, offset);
                    }
                    else if (words[0] == "BottomRightX") // code 14
                    {
                        let place = this.resolveNumber(words[1], this.mTypes);
                        if (place === false) continue;
    
                        let id = this.resolveNumber(words[1], this.mIDs);
                        if (id === false) continue;
    
                        let offset = this.resolveNumber(words[1], this.mIDs);
                        if (offset === false) continue;
    
                        let relative = null;
                        if (id in this.mComponants) relative = this.mComponants[id];
                        if (id in this.mWidgets) relative = this.mWidgets[id];
    
                        this.curPlaceable.mBottomRight.SetX(this.mPlaces[place], relative, offset);
                    }
                    else if (words[0] == "BottomRightY") // code 15
                    {
                        let place = this.resolveNumber(words[1], this.mTypes);
                        if (place === false) continue;
    
                        let id = this.resolveNumber(words[1], this.mIDs);
                        if (id === false) continue;
    
                        let offset = this.resolveNumber(words[1], this.mIDs);
                        if (offset === false) continue;
    
                        let relative = null;
                        if (id in this.mComponants) relative = this.mComponants[id];
                        if (id in this.mWidgets) relative = this.mWidgets[id];
    
                        this.curPlaceable.mBottomRight.SetY(this.mPlaces[place], relative, offset);
                    }
                    else if (words[0] == "Visible") // code 18
                    {
                        let visible = this.resolveNumber(words[1], this.mTypes);
                        if (visible === false) continue;
    
                        if (this.curComponantID != 0)
                        {
                            this.mComponants[this.curComponantID].mSkip = (visible == 1 ? false : true);
                        }
                        else
                        {
                            let widget = this.curPlaceable;
                            widget.Visible = (visible == 0 ? false : true);
                        }
                    }
                    else if (words[0] == "Active") // code 38
                    {
                        let active = this.resolveNumber(words[1], this.mTypes);
                        if (active === false) continue;
    
                        if (this.curComponantID != 0)
                        {
                            this.mComponants[this.curComponantID].mSkip = (active == 1 ? false : true);
                        }
                        else
                        {
                            let widget = curPlaceable;
                            widget.Active = (active == 0 ? false : true);
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