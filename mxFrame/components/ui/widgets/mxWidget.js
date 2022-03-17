(function () {

    // PROTECTED
    // this is the support code that makes protected members possible
    let id = 1;
    function getID() { return id++; }

    let dataStore = {};
    function getData(id) {  return (id in dataStore) ? dataStore[id] : null; }
    function saveData(data) { if (data.id) dataStore[data.id] = data; }
    // END PROTECTED


    // Placeable is a base class for things that have a position and can be
    // placed via a layout
    class Placeable extends mx.LayoutDef 
    {    
        #private;    

        get Rect()
        {
            let _protected = getData(this.#private.id);
            return _protected ? _protected.mRect : null;
        }

        constructor() 
        {
            super();
            this.isPlaceable = true;
            this.#private = {};

            this.mObject = this;
        }

        init(data)
        {
            if (this.#private.id) return;

            if (!data) data = { id: mx.getID() };
            this.#private.id = data.id;

            data.mRect = null;
            saveData(data);
        }

        Place(rect) 
        {
            if (!rect.isRect) return;
            
            let _protected = getData(this.#private.id);
            if (!_protected) return;

            _protected.mRect = rect;
        }
    }

    // ComponentLink refers to a Ui skin componant and gives it a placeable 
    // position in a widget
    class ComponentLink extends Placeable 
    {
        #private;

        get Baked() 
        { 
            let _protected = getData(this.#private.id);
            return _protected ? _protected.mBaked : null;
        }

        get CompID() 
        { 
            let _protected = getData(this.#private.id);
            return _protected ? _protected.mCompID : null;
        }
        set CompID(value) 
        { 
            let _protected = getData(this.#private.id);
            if (!_protected) return;
            _protected.mCompID = value; 
            this.SetSize(); 
        }

        get Scale()
        { 
            let _protected = getData(this.#private.id);
            return _protected ? _protected.mScale : null;
        }
        set Scale(value)
        { 
            let _protected = getData(this.#private.id);
            if (!_protected) return;
            _protected.mScale = value; 
            this.SetSize(_protected.mName); 
        }

        get Name()
        { 
            let _protected = getData(this.#private.id);
            return _protected ? _protected.mName : null;
        }

        constructor(name, baked) 
        {
            super();
            this.mObject = this;

            this.isComponentLink = true;
            this.#private = {};
            this.#private.params = { name: name ? ""+name : null, baked: baked ? true : false };

            this.mStretch = false;
            this.mSkip = false;
        }

        init(data)
        {
            if ( this.#private.id) return;

            if (!data) data = { id: mx.getID() };
            this.#private.id = data.id;

            super.init(data);
            data.mCompID = 0;
            data.mScale = 1.0;
            data.mBaked = this.#private.params.baked;
            data.mName = this.#private.params.name;
            saveData(data);

            if (data.name) this.SetSize(data.name);
        }

        SetSize(name) 
        {
            let comp = null;

            let _protected = getData(this.#private.id);
            if (!_protected) return;

            if (!name || !name.length) 
            {
                comp = mx.SkinManager.GetComponentByIndex(_protected.mCompID);
                if (comp == null) return;
                _protected.mName = comp.name;
            }
            else
            {
                comp = mx.SkinManager.GetComponentByName(name);
                if (comp == null) return;
                _protected.mCompID = comp.id;    
            }
            if (comp)
            {
                _protected.mRect.Width = Math.floor(comp.rect.Width * _protected.mScale);
                _protected.mRect.Height = Math.floor(comp.rect.Height * _protected.mScale);    
            }
        }
    }

    const WidgetType = {
        Widget: 1,
        ParentWidget: 2,
        Container: 3,
        Label: 4,
        Button: 5,
        TabControl: 6,
        Slider: 7,
        Scrollbar: 8,
        Dropdown: 9
    };
        
    // Widget is the base class for all UI widgets. It made up UI componants that
    // get placed using a layout
    //
    // all widgets start off not visible. when they go visible, their command config 
    // gets added to the players in the parent mask
    class Widget extends Placeable
    {
        #private;

        set Tinted(value) 
        { 
            let _protected = getData(this.#private.id);
            if (!_protected) return;
            _protected.mTinted = value ? true : false; 
        }
        get Tinted() 
        { 
            let _protected = getData(this.#private.id);
            if (!_protected) return null;
            
            if (!_protected.mTinted && _protected.mParent != null) return _protected.mParent.Tinted; 
            else return _protected.mTinted; 
        }

        get Tint()
        {
            let _protected = getData(this.#private.id);
            if (!_protected) return null;

            if (_protected.mParent != null && _protected.mParent.Tinted) 
                return _protected.mParent.Tint;
            else
                return _protected.mTint[_protected.mTint.length - 1];
        }
        set Tint(value) 
        { 
            if (!value.isColor) return;

            let _protected = getData(this.#private.id);
            if (!_protected) return;

            if (!_protected.mTint) 
            {
                _protected.mTint = []; 
                _protected.mTint.push(value);
            }
            else
                _protected.mTint[0] = value; 
        }

        get ID()  
        { 
            let _protected = getData(this.#private.id);
            return _protected ? _protected.mId : null;
        }

        get WidgetType() 
        { 
            let _protected = getData(this.#private.id);
            return _protected ? _protected.mWidgetType : null;
        }

        get Visible() 
        {
            let _protected = getData(this.#private.id);
            if (!_protected) return null;

            if (_protected.mVisible && _protected.mParent != null) return _protected.mParent.Visible;
            return _protected.mVisible;    
        }
        set Visible(value) 
        {
            let _protected = getData(this.#private.id);
            if (!_protected) return;

            if (value && !_protected.mVisible) this.onVisible();
            else if (!value && _protected.mVisible) this.onInvisible();    
        }

        get Active() 
        {
            let _protected = getData(this.#private.id);
            if (!_protected) return null;

            if (_protected.mActive && _protected.mParent != null) return _protected.mParent.Active;
            return _protected.mActive;    
        }
        set Active(value) 
        {
            let _protected = getData(this.#private.id);
            if (!_protected) return;

            if (value && !_protected.mActive) this.onActive();
            else if (!value && _protected.mActive) this.onInactive();    
        }

        constructor(id)
        {
            super();
            this.mObject = this;

            this.isWidget = true;
            this.#private = {};
            this.#private.params = { id: id };

            this.mClipRect = new mx.Rectangle(0, 0, 0, 0);
            this.mColorBG = new mx.Color(0,0,0,0);
            this.mColorFG = new mx.Color(1,1,1,1);
            this.mCmdFocus = 0;  // the command config to give while focused
            // for use by mxUISurface Render
            this.mDepth = 100;                 // default topmost depth
        }

        init(data)
        {
            if ( this.#private.id) return;

            if (!data) data = { id: mx.getID() };
            this.#private.id = data.id;

            super.init(data);
            data.mWidgetType = WidgetType.Widget;
            data.mId = this.#private.params.id;
            data.mVisible = false;                  // bool
            data.mActive = false;                   // bool
            data.mTinted = false;                   // bool
            data.mParent = null;                    // mxParentWidget
            data.mCompLayout = new mx.Layout(this); // mxLayout
            data.mTint = [];                        // List<Vector4>
            data.mTint.push(new mx.Color(1,1,1,1)); // 
            data.mComponents = [];                  // List<mxComponentLink>
            data.mFocusComponents = [];             // List<mxComponentLink>
            saveData(data);
            
            mx.UIManager.Register(this);
        }

        // this is the clip rect in screen cords - left, top, right, bottom
        // not width, height
        get AbsClipRect() 
        { 
            let _protected = getData(this.#private.id);
            if (!_protected) return;

            let r = this.AbsRect;
            return new mx.Rectangle(r.X + this.mClipRect.X, r.Y + this.mClipRect.Y, r.X + _protected.mRect.Width - this.mClipRect.Width, r.Y + _protected.mRect.Height - this.mClipRect.Height); 
        }
    
        get OffsetRect()
        {
            let _protected = getData(this.#private.id);
            if (!_protected) return;

            if (_protected.mParent != null && _protected.mWidgetType != WidgetType.Scrollbar) 
                return new mx.Rectangle(_protected.mRect.X, _protected.mRect.Y - _protected.mParent.mOffset, _protected.mRect.Width, _protected.mRect.Height);
            else 
                return _protected.mRect.copy();    
        }

        get AbsRect()
        {
            let _protected = getData(this.#private.id);
            if (!_protected) return;

            if (_protected.mParent == null)
            {
                return _protected.mRect.copy();
            }
            else
            {
                  let r = this.OffsetRect;
                  r.X += _protected.mParent.AbsRect.X;
                  r.Y += _protected.mParent.AbsRect.Y;
                  return r;
            }
        }

        Place(rect) 
        { 
            let _protected = getData(this.#private.id);
            if (!_protected) return;

            super.Place(rect); 
            _protected.mCompLayout.Arrange(); 
        }
    
        Arrange()
        {
            let _protected = getData(this.#private.id);
            if (!_protected) return;

            _protected.mCompLayout.Arrange(); 
        }

        get Parent() 
        { 
            let _protected = getData(this.#private.id);
            return _protected ? _protected.mParent : null; 
        }
        set Parent(value) 
        { 
            if (!value.isParentWidget) return;

            let _protected = getData(this.#private.id);
            if (!_protected) return;

            if (_protected.mParent != null) _protected.mParent.RemoveChild(this);
            _protected.mParent = value;
            this.PropegateDepth();
            this.OnParent();
        }

        PropegateDepth()
        {
            let _protected = getData(this.#private.id);
            if (!_protected) return;
            this.mDepth = _protected.mParent.mDepth - 1;
        }

        OnParent() { }

        HasChild() { return false; }

        Contains(w) { return false; }

        HasChild(w) { return false; }

        RemoveAllComponents()
        {
            let _protected = getData(this.#private.id);
            if (!_protected) return;

            _protected.mComponents = [];
            _protected.mCompLayout.mObjects = [];
        }

        RemoveComponent(comp) // mxComponentLink
        {
            if (!comp.isComponentLink) return;

            let _protected = getData(this.#private.id);
            if (!_protected) return;

            let index = this.mComponents.indexOf(comp);
            if (index > -1) this.mComponents.splice(index, 1);

            _protected.mCompLayout.Remove(comp);
        }

        AddComponent(comp) // mxComponentLink
        {
            if (!comp.isComponentLink) return;

            let _protected = getData(this.#private.id);
            if (!_protected) return;

            this.mComponents.push(comp);
            _protected.mCompLayout.Add(comp);
        }

        AddFocusComponent(comp) // mxComponentLink
        {
            if (!comp.isComponentLink) return;

            let _protected = getData(this.#private.id);
            if (!_protected) return;

            this.mFocusComponents.push(comp);
            _protected.mCompLayout.Add(comp);
        }

        RemoveFocusComponent(comp) // mxComponentLink
        {
            if (!comp.isComponentLink) return;

            let _protected = getData(this.#private.id);
            if (!_protected) return;

            let index = this.mFocusComponents.indexOf(comp);
            if (index > -1) this.mFocusComponents.splice(index, 1);
            _protected.mCompLayout.Remove(comp);
        }

        AddBakedComponent(name) // string
        {
            let _protected = getData(this.#private.id);
            if (!_protected) return;

            let comp = new mx.ComponentLink(""+name, true); 
            this.mComponents.push(comp);
            _protected.mCompLayout.Add(comp);
            return comp;
        }

        AddComponent(name) // string
        {
            let _protected = getData(this.#private.id);
            if (!_protected) return;

            let comp = new mx.ComponentLink(""+name); 
            this.mComponents.push(comp);
            _protected.mCompLayout.Add(comp);
            return comp;
        }

        GetComponent(name)
        {
            for (let i in this.mComponents)
            {
                let comp = this.mComponents[i];
                if (comp.Name == name) return comp;
            }
            for (let i in this.mFocusComponents)
            {
                let comp = this.mFocusComponents[i];
                if (comp.Name == name) return comp;
            }
            return null;
        }

        GetComponent(i) // int
        {
            if (i < this.mFocusComponents.length) return this.mFocusComponents[i];
            i -= this.mFocusComponents.length;
            if (i < this.mComponents.length) return this.mComponents[i];
            return null;
        }

        get NumComponents() { return this.mFocusComponents.length + this.mComponents.length; }

        onCallMe() {  }

        onFocusIn(focus) // mxFocusPlayerDef
        {
            if (!focus.isFocusPlayerDef) return;

            let _protected = getData(this.#private.id);
            if (!_protected) return;

            let arrange = false;
            let parentarrange = false;

              // set dynamic cc on player
            if (this.mCmdFocus > 0) mx.UIManager.SetCommand(this.mCmdFocus, focus.mPlayers);

            // apply focus changes from parent
            for (let i in focus.mElements)
            {
                let elem = focus.mElements[i]; // mxFocusElement
                switch (elem.mType) 
                {
                case mxFocusType.Color:
                    _protected.mTint.push(elem.mColor);
                    _protected.mTinted = true;
                    break;
                case mxFocusType.Component:
                    this.AddFocusComponent(elem.mComponent);
                    arrange = true;
                    break;
                case mxFocusType.ParentComponent:
                    if (_protected.mParent != null) 
                    {
                        elem.mComponent.mTopLeft.xRelativeTo = this;
                        elem.mComponent.mTopLeft.yRelativeTo = this;
                        if (elem.mComponent.mTopLeft.xPlace != mxPlace.None) elem.mComponent.mBottomRight.xRelativeTo = this;
                        if (elem.mComponent.mTopLeft.yPlace != mxPlace.None) elem.mComponent.mBottomRight.yRelativeTo = this;
                        _protected.mParent.AddComponent(elem.mComponent);
                        parentarrange = true;
                    }
                    break;
                }
            }
            if (arrange) _protected.mCompLayout.Arrange();
            if (parentarrange) _protected.mParent.Arrange();
        }

        onFocusOut(focus) // mxFocusPlayerDef
        {
            if (!focus.isFocusPlayerDef) return;

            let _protected = getData(this.#private.id);
            if (!_protected) return;

            let arrange = false;
            let parentarrange = false;

            // pop CC form players
            if (this.mCmdFocus > 0) mx.UIManager.UnsetCommand(this.mCmdFocus, focus.mPlayers);
            // remove focus changes from parent
            for (let i in focus.mElements)
            {
                let elem = focus.mElements[i]; // mxFocusElement
                switch (elem.mType)
                {
                case mx.FocusType.Color:
                    let index = _protected.mTint.indexOf(elem.mColor);
                    if (index > -1) _protected.mTint.splice(index, 1);
                    _protected.mTinted = false;
                    break;
                case mx.FocusType.Component:
                    this.RemoveFocusComponent(elem.mComponent);
                    arrange = true;
                    break;
                case mx.FocusType.ParentComponent:
                    if (_protected.mParent != null)
                    {
                        _protected.mParent.RemoveComponent(elem.mComponent);
                        parentarrange = true;
                    }
                    break;
                }
            }
            if (arrange) _protected.mCompLayout.Arrange();
            if (parentarrange) _protected.mParent.Arrange();
        }

        onParentChange(active, visible)
        {
        }

        onActive()
        {
            let _protected = getData(this.#private.id);
            if (!_protected) return;
            _protected.mActive = true;
        }

        onInactive()
        {
            let _protected = getData(this.#private.id);
            if (!_protected) return;
            _protected.mActive = false;
        }

        onVisible()
        {
            let _protected = getData(this.#private.id);
            if (!_protected) return;
            _protected.mVisible = true;
        }

        onInvisible()
        {
            let _protected = getData(this.#private.id);
            if (!_protected) return;
            _protected.mVisible = false;    
        }

        handleCommand(o, e)
        {

        }
    }

    // ParentWidget is a widget that is able to have other widgets placed inside its
    // client area
    class ParentWidget extends Widget
    {
        #private;

        constructor(id)
        {
            super(id);
            this.mObject = this;

            this.isParentWidget = true;
            this.#private = {};

            this.mOffset = 0;
        }

        init(data)
        {
            if ( this.#private.id) return;

            if (!data) data = { id: mx.getID() };
            this.#private.id = data.id;

            super.init(data);
            data.mWidgetType = mx.WidgetType.ParentWidget;
            data.mLayout = new mx.Layout(this);
            data.mChilds = [];                               // List<mxWidget>
            saveData(data);
        }
        
        Place(rect) 
        { 
            let _protected = getData(this.#private.id);
            if (!_protected) return;

            super.Place(rect); 
            _protected.mLayout.Arrange(); 
        }
    
        Arrange()
        {
            let _protected = getData(this.#private.id);
            if (!_protected) return;

            _protected.mLayout.Arrange();
            _protected.mCompLayout.Arrange();
        }
    
        AddChild(child) // mxWidget
        {
            if (!child.isWidget) return;

            let _protected = getData(this.#private.id);
            if (!_protected) return;

            _protected.mLayout.Add(child);
            _protected.mChilds.push(child);
            child.Parent = this;
            _protected.mLayout.Arrange();
            if (_protected.mVisible) child.onActive();
        }
    
        RemoveChild(c) // Widget
        {
            if (!child.isWidget) return;

            let _protected = getData(this.#private.id);
            if (!_protected) return;

            for (let i in _protected.mChilds)
            {
                let child = _protected.mChilds[i];
                if (child == c) 
                {
                    let index = _protected.mChilds.indexOf(child);
                    if (index > -1) _protected.mChilds.splice(index, 1);

                    child.onInactive();
                    c.Parent = null;
                    break;
                }
            }
    
            _protected.mLayout.Remove(c);
            _protected.mLayout.Arrange();
        }
    
        HasChild() 
        {
            let _protected = getData(this.#private.id);
            if (!_protected) return null;

            return (_protected.mChilds.length > 0) ;
        }
    
        HasChild(w) // mxWidget
        { 
            if (!child.isWidget) return null;

            let _protected = getData(this.#private.id);
            if (!_protected) return null;

            for (let i in _protected.mChilds)
            {
                let child = _protected.mChilds[i];
                if ((child == w) || child.HasChild(w)) {
                    return true;
                }
            }
            return false;
        }
    
        Contains(w) // mxWidget
        {
            if (!child.isWidget) return null;

            let _protected = getData(this.#private.id);
            if (!_protected) return null;
            
            if (this.HasChild(w)) return true;
    
            for (let i in _protected.mChilds)
            {
                let child = _protected.mChilds[i];
                if (child.Contains(w)) return true;
            }
            return false;
        }
    
        GetChild(i)
        {
            let _protected = getData(this.#private.id);
            if (!_protected) return null;

            if (i >= _protected.mChilds.length) return null;
            return _protected.mChilds[i];
        }
    
        onFocusIn(focus) // mxFocusPlayerDef
        {
            super.onFocusIn(focus);
        }
    
        onFocusOut(focus) // mxFocusPlayerDef
        {
            super.onFocusOut(focus);
        }
    
        PropegateDepth()
        {
            let _protected = getData(this.#private.id);
            if (!_protected) return null;

            for (let child in _protected.mChilds) _protected.mChilds[child].PropegateDepth();
        }
    
        onVisible()
        {
            let _protected = getData(this.#private.id);
            if (!_protected) return null;

            super.onVisible();
            for (let child in _protected.mChilds) _protected.mChilds[child].onParentChange(_protected.mActive, _protected.mVisible);
        }
    
        onInvisible()
        {
            let _protected = getData(this.#private.id);
            if (!_protected) return null;

            super.onInvisible();
            for (let child in _protected.mChilds) _protected.mChilds[child].onParentChange(_protected.mActive, _protected.mVisible);
        }
    
        onActive()
        {
            let _protected = getData(this.#private.id);
            if (!_protected) return null;

            super.onActive();
            for (let child in _protected.mChilds) _protected.mChilds[child].onParentChange(_protected.mActive, _protected.mVisible);
        }
    
        onInactive()
        {
            let _protected = getData(this.#private.id);
            if (!_protected) return null;

            super.onInactive();
            for (let child in _protected.mChilds) _protected.mChilds[child].onParentChange(_protected.mActive, _protected.mVisible);
        }
    }

    mx.getID = getID;

    mx.createPlaceable = function() { let ret = new Placeable(); ret.init(); return ret; };
    mx.Placeable = Placeable;

    mx.createComponentLink = function(name, baked) { let ret = new ComponentLink(name, baked); ret.init(); return ret; };
    mx.ComponentLink = ComponentLink;

    mx.WidgetType = WidgetType;

    mx.createWidget = function(id) { let ret = new Widget(id); ret.init(); return ret; };
    mx.Widget = Widget;

    mx.createParentWidget = function(id) { let ret = new ParentWidget(id); ret.init(); return ret; };
    mx.ParentWidget = ParentWidget;
})();
