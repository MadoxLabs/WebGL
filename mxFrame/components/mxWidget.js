(function () {

    // Placeable is a base class for things that have a position and can be
    // placed via a layout
    class Placeable extends mx.LayoutDef 
    {
        #mRect;

        get Rect() {return this.#mRect; }

        constructor() 
        {
            this.mObject = this;
            this.#mRect = null;
        }

        Place(rect) 
        {
            this.#mRect = rect;
        }
    }

    // ComponentLink refers to a Ui skin componant and gives it a placeable 
    // position in a widget
    class ComponentLink extends mx.Placeable 
    {
        //    public bool mStretch;
        //    public bool mSkip;

        //    protected long mCompID;
        get CompID() { return this.#mCompID; };
        set CompID(value) { this.#mCompID = value; this.SetSize(); }

        //    protected float mScale;
        get Scale() { return this.#mScale; }
        set Scale(value) { this.#mScale = value; this.SetSize(this.#mName); }

        //    protected string mName;
        get Name() { return this.#mName; }

        //    internal bool mBaked;

        #mBaked;
        #mCompID;
        #mScale;
        #mName;

        constructor(name, baked) 
        {
            super();
            this.#mCompID = 0;
            this.#mName = null;
            this.mStretch = false;
            this.mSkip = false;
            this.mObject = this;
            this.#mScale = 1.0;
            this.#mBaked = baked ? true : false;
            if (name) {
                this.#mName = name;
                this.SetSize(name);
            }
        }

        SetSize(name) 
        {
            let comp = null;

            if (!name || !name.length) 
            {
                comp = mx.SkinManager.GetComponentByIndex(this.#mCompID);
                if (comp == null) return;
                this.#mName = comp.name;
            }
            else
            {
                comp = mx.SkinManager.GetComponentByName(name);
                if (comp == null) return;
                this.#mCompID = comp.id;    
            }
            if (comp)
            {
                this.#mRect.Width = Math.floor(comp.rect.Width * this.#mScale);
                this.#mRect.Height = Math.floor(comp.rect.Height * this.#mScale);    
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
        #mTinted; // bool
        set Tinted(value) { this.#mTinted = value; }
        get Tinted() { if (!this.#mTinted && this.#mParent != null) return this.#mParent.Tinted; else return this.#mTinted; }

        #mTint; // color
        get Tint()
        {
            if (this.#mParent != null && this.#mParent.Tinted) 
                return this.#mParent.Tint;
            else
                return this.#mTint[this.#mTint.length - 1];
        }
        set Tint(value) 
        { 
            if (!this.#mTint) 
            {
                this.#mTint = []; 
                this.#mTint.push(value);
            }
            else
                this.#mTint[0] = value; 
        }

        #mID;
        get ID()  { return this.#mID; }

        #mWidgetType;
        get WidgetType() { return this.#mWidgetType; }

        #mVisible;
        get Visible() 
        {
            if (this.#mVisible && this.#mParent != null) return this.#mParent.Visible;
            return this.#mVisible;    
        }
        set Visible(value) 
        {
            if (value && !this.#mVisible) this.onVisible();
            else if (!value && this.#mVisible) this.onInvisible();    
        }

        #mActive;
        get Active() 
        {
            if (this.#mActive && this.#mParent != null) return this.#mParent.Active;
            return this.#mActive;    
        }
        set Active(value) 
        {
            if (value && !this.#mActive) this.onActive();
            else if (!value && this.#mActive) this.onInactive();    
        }

//    protected mxWidgetType mWidgetType;
//    protected bool mVisible = true;
//    protected bool mActive = true;
//    protected int mId;
//    protected List<Vector4> mTint;
//    protected bool mTinted;

        #mParent;
        #mCompLayout;
        #mComponents;
        #mFocusComponents;
//  protected mxParentWidget mParent = null;
//  protected mxLayout mCompLayout = null;
//  protected List<mxComponentLink> mComponents = new List<mxComponentLink>();
//protected List<mxComponentLink> mFocusComponents = new List<mxComponentLink>();

//    public Rectangle mClipRect = new Rectangle(0, 0, 0, 0);
//    public Vector4 mColorFG;
//    public Vector4 mColorBG;
//    public int mCmdFocus = 0;  // the command config to give while focused
    
    // for use by mxUISurface Render
//    public int mDepth;

        constructor(id)
        {
            super();
            this.mClipRect = new mx.Rectangle(0, 0, 0, 0);
            this.#mWidgetType = WidgetType.Widget;
            this.#mId = id;
            this.#mTinted = false;
            this.#mParent = null;
            this.mObject = this;
            this.#mCompLayout = new mx.Layout(this);
            this.#mTint = [];
            this.#mTint.push(new mx.Color(1,1,1,1));
            this.mColorBG = new mx.Color(0,0,0,0);
            this.mColorFG = new mx.Color(1,1,1,1);
            this.mDepth = 100;                 // default topmost depth
            this.#mComponents = [];
            this.#mFocusComponents = [];

            mx.UIManager.Register(this);
        }

        // this is the clip rect in screen cords - left, top, right, bottom
        // not width, height
        get AbsClipRect() 
        { 
            let r = this.AbsRect;
            return new mx.Rectangle(r.X + this.mClipRect.X, r.Y + this.mClipRect.Y, r.X + this.#mRect.Width - this.mClipRect.Width, r.Y + this.#mRect.Height - this.mClipRect.Height); 
        }
    
        get OffsetRect()
        {
            if (this.#mParent != null && this.#mWidgetType != WidgetType.Scrollbar) 
                return new mx.Rectangle(this.#mRect.X, this.#mRect.Y - this.#mParent.mOffset, this.#mRect.Width, this.#mRect.Height);
            else 
                return this.#mRect.copy();    
        }

        get AbsRect()
        {
            if (this.#mParent == null)
            {
                return this.#mRect.copy();
            }
            else
            {
                  let r = this.OffsetRect;
                  r.X += this.#mParent.AbsRect.X;
                  r.Y += this.#mParent.AbsRect.Y;
                  return r;
            }
        }

        Place(rect) { super.Place(rect); this.#mCompLayout.Arrange(); }
    
        get Parent() { return this.#mParent; }
        set Parent(value) 
        { 
            if (this.#mParent != null) this.#mParent.RemoveChild(this);
            this.#mParent = value;
            this.PropegateDepth();
            this.OnParent();
        }

        PropegateDepth()
        {
          this.mDepth = this.#mParent.mDepth - 1;
        }

        OnParent() { }

        HasChild() { return false; }

        Contains(w) { return false; }

        HasChild(w) { return false; }

        RemoveAllComponents()
        {
            this.#mComponents = [];
            this.#mCompLayout.mObjects = [];
        }

        RemoveComponent(comp) // mxComponentLink
        {
            let index = this.mComponents.indexOf(comp);
            if (index > -1) {
                this.mComponents.splice(index, 1);
            }

            this.#mCompLayout.Remove(comp);
        }

        AddComponent(comp) // mxComponentLink
        {
            this.mComponents.push(comp);
            this.#mCompLayout.Add(comp);
        }

        AddFocusComponent(comp) // mxComponentLink
        {
            this.mFocusComponents.push(comp);
            this.#mCompLayout.Add(comp);
        }

        RemoveFocusComponent(comp) // mxComponentLink
        {
            let index = this.mFocusComponents.indexOf(comp);
            if (index > -1) {
                this.mFocusComponents.splice(index, 1);
            }
            this.#mCompLayout.Remove(comp);
        }

        AddBakedComponent(name) // string
        {
            let comp = new mx.ComponentLink(name, true); 
            this.mComponents.push(comp);
            this.#mCompLayout.Add(comp);
            return comp;
        }

        AddComponent(name) // string
        {
            let comp = new mx.ComponentLink(name); 
            this.mComponents.push(comp);
            this.#mCompLayout.Add(comp);
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

        onCallMe()
        {  

        }

        onFocusIn(focus) // mxFocusPlayerDef
        {
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
                    this.#mTint.Add(elem.mColor);
                    this.#mTinted = true;
                    break;
                case mxFocusType.Component:
                    this.AddFocusComponent(elem.mComponent);
                    arrange = true;
                    break;
                case mxFocusType.ParentComponent:
                    if (this.#mParent != null) 
                    {
                        elem.mComponent.mTopLeft.xRelativeTo = this;
                        elem.mComponent.mTopLeft.yRelativeTo = this;
                        if (elem.mComponent.mTopLeft.xPlace != mxPlace.None) elem.mComponent.mBottomRight.xRelativeTo = this;
                        if (elem.mComponent.mTopLeft.yPlace != mxPlace.None) elem.mComponent.mBottomRight.yRelativeTo = this;
                        this.#mParent.AddComponent(elem.mComponent);
                        parentarrange = true;
                    }
                    break;
                }
            }
            if (arrange) this.#mCompLayout.Arrange();
            if (parentarrange) this.#mParent.#mCompLayout.Arrange();
        }

        onFocusOut(focus) // mxFocusPlayerDef
        {
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
                    this.#mTint.Remove(elem.mColor);
                    this.#mTinted = false;
                    break;
                case mx.FocusType.Component:
                    this.RemoveFocusComponent(elem.mComponent);
                    arrange = true;
                    break;
                case mx.FocusType.ParentComponent:
                    if (this.#mParent != null)
                    {
                        this.#mParent.RemoveComponent(elem.mComponent);
                        parentarrange = true;
                    }
                    break;
                }
            }
            if (arrange) this.#mCompLayout.Arrange();
            if (parentarrange) this.#mParent.#mCompLayout.Arrange();
        }

        onParentChange(active, visible)
        {
        }

        onActive()
        {
            this.#mActive = true;
        }

        onInactive()
        {
            this.#mActive = false;
        }

        onVisible()
        {
            this.#mVisible = true;
        }

        onInvisible()
        {
            this.#mVisible = false;    
        }

        handleCommand(o, e)
        {

        }
    }

    // ParentWidget is a widget that is able to have other widgets placed inside its
    // client area
    class ParentWidget extends Widget
    {
        #mLayout;
        #mChilds;
//        protected mxLayout mLayout = null;
//        protected List<mxWidget> mChilds = new List<mxWidget>();
    
        constructor(id)
        {
            super(id);
            this.mOffset = 0;
            this.#mWidgetType = mx.WidgetType.ParentWidget;
            this.#mLayout = new mx.Layout(this);
            this.#mChilds = [];
        }
    
        Place(rect) { super.Place(rect); this.#mLayout.Arrange(); }
    
        Arrange()
        {
          this.#mLayout.Arrange();
          this.#mCompLayout.Arrange();
        }
    
        AddChild(child) // mxWidget
        {
          this.#mLayout.Add(child);
          this.#mChilds.push(child);
          child.Parent = this;
          this.#mLayout.Arrange();
          if (this.#mVisible) child.onActive();
        }
    
        RemoveChild(c) // Widget
        {
            for (let i in this.#mChilds)
            {
                let child = this.#mChilds[i];
                if (child == c) 
                {
//                    this.#mChilds.Remove(child);
                    let index = this.#mChilds.indexOf(child);
                    if (index > -1) {
                        this.#mChilds.splice(index, 1);
                    }

                    child.onInactive();
                    c.Parent = null;
                    break;
                }
            }
    
            this.#mLayout.Remove(c);
            this.#mLayout.Arrange();
        }
    
        HasChild() 
        {
          return (this.#mChilds.length > 0) ;
        }
    
        HasChild(w) // mxWidget
        { 
          for (let i in this.#mChilds)
          {
              let child = this.#mChilds[i];
              if ((child == w) || child.HasChild(w)) {
                  return true;
            }
          }
          return false;
        }
    
        Contains(w) // mxWidget
        {
          if (this.HasChild(w)) return true;
    
          for (let i in this.#mChilds)
          {
              let child = this.#mChilds[i];
              if (child.Contains(w)) return true;
          }
          return false;
        }
    
        GetChild(i)
        {
          if (i >= this.#mChilds.length) return null;
          return this.#mChilds[i];
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
            for (let child in this.#mChilds) this.#mChilds[child].PropegateDepth();
        }
    
        onVisible()
        {
            super.onVisible();
            for (let child in this.#mChilds) this.#mChilds[child].onParentChange(this.#mActive, this.#mVisible);
        }
    
        onInvisible()
        {
            super.onInvisible();
            for (let child in this.#mChilds) this.#mChilds[child].onParentChange(this.#mActive, this.#mVisible);
        }
    
        onActive()
        {
            super.onActive();
            for (let child in this.#mChilds) this.#mChilds[child].onParentChange(this.#mActive, this.#mVisible);
        }
    
        onInactive()
        {
            super.onInactive();
            for (let child in this.#mChilds) this.#mChilds[child].onParentChange(this.#mActive, this.#mVisible);
        }
    }

    mx.Placeable = Placeable;
    mx.ComponentLink = ComponentLink;
    mx.WidgetType = WidgetType;
    mx.Widget = Widget;
    mx.ParentWidget = ParentWidget;
})();
