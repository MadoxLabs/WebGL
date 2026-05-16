(function () {

    // PROTECTED
    // this is the support code that makes protected members possible
    let dataStore = {};
    function getData(id) {  return (id in dataStore) ? dataStore[id] : null; }
    function saveData(data) { if (data.id) dataStore[data.id] = data; }
    // END PROTECTED
    
    class Container extends mx.ParentWidget
    {
        #private;

        constructor(id)
        {
            super(id);
            this.mObject = this;

            this.isContainer = true;
            this.#private = {};

            this.mHasScrollbar = false;
        }

        init(data)
        {
            if ( this.#private.id) return;
  
            if (!data) data = { id: mx.getID() };
            this.#private.id = data.id;
  
            super.init(data);
            data.mWidgetType = mx.WidgetType.Container;
            data.mCompNames = {};     // Dictionary<string, string
            data.mBorder = true;      // bool
            data.mBackground = true;  // bool
            data.mLargeBorder = true; // bool
            data.mCommandConfig = 0;
            data.mScrollbar = null;   // mxScrollbar
            data.mMouse = null;       // mxComponentLink
            saveData(data);
        }
    
        set Scrollbar(value) 
        {
          if (!value) {
            let _protected = getData(this.#private.id);
            if (!_protected) return null;

            this.mHasScrollbar = false;
            _protected.mScrollbar = null;          
          } else {
            this.mHasScrollbar = true;
            this.#FixScrollbar();
          }
        }
    
        get Mouse() 
        {
          let _protected = getData(this.#private.id);
          return _protected ? _protected.mMouse : null;
        }
        set Mouse(value) 
        {
          if (!value.isComponentLink) return;
          let _protected = getData(this.#private.id);
          if (!_protected) return;

          _protected.mMouse = value;
        }
        
        #FixScrollbar()
        {
          let _protected = getData(this.#private.id);
          if (!_protected) return;

          if (this.mHasScrollbar == false)
          {
            _protected.mScrollbar = null;
            return;
          }
    
          if (_protected.mScrollbar == null)
          {
            for (let i in _protected.mChilds)
            {
              let w = _protected.mChilds[i];

              if (w.WidgetType == mx.WidgetType.Scrollbar)
              {
                _protected.mScrollbar = w;
                _protected.mScrollbar.mTopLeft.SetX(mx.Place.RightAlign, null, -20);
                _protected.mScrollbar.mTopLeft.SetY(mx.Place.TopAlign, null, 0);
                _protected.mScrollbar.mBottomRight.SetX(mx.Place.Fixed, null, 20);
                _protected.mScrollbar.mBottomRight.SetY(mx.Place.BottomAlign, null, 0);
                _protected.mScrollbar.Current = 0;
                _protected.mScrollbar.DocSize = 600;
                break;
              }
            }
          }
        }
    
        get CommandConfig()
        {
          let _protected = getData(this.#private.id);
          return _protected ? _protected.mCommandConfig : null;          
        }
        set CommandConfig(value)
        {
          let _protected = getData(this.#private.id);
          if (!_protected) return;

          if (_protected.mCommandConfig > 0) mxUIManager.Object.UnsetCommand(_protected.mCommandConfig, 15);
          _protected.mCommandConfig = value;
          if (_protected.mVisible && _protected.mActive) mxUIManager.Object.SetCommand(_protected.mCommandConfig, 15);
        }
            
        get Border()
        {
          let _protected = getData(this.#private.id);
          return _protected ? _protected.mBorder : null;          
        }
        set Border(value)
        {
          let _protected = getData(this.#private.id);
          if (!_protected) return;
          _protected.mBorder = value ? true : false;
        }

        get Background()
        {
          let _protected = getData(this.#private.id);
          return _protected ? _protected.mBackground : null;          
        }
        set Background(value)
        {
          let _protected = getData(this.#private.id);
          if (!_protected) return;
          _protected.mBackground = value ? true : false;
        }

        get LargeBorder()
        {
          let _protected = getData(this.#private.id);
          return _protected ? _protected.mLargeBorder : null;          
        }
        set LargeBorder(value)
        {
          let _protected = getData(this.#private.id);
          if (!_protected) return;
          _protected.mLargeBorder = value ? true : false;
          _protected.mCompNames.Clear();
          if (_protected.mLargeBorder)
          {
            _protected.mClipRect = new Rectangle(12, 5, 12, 5);
            _protected.CompNames.push("BORDER_TOPLEFT", "Window_LargeBorder_TopLeft");
            _protected.CompNames.push("BORDER_TOPRIGHT", "Window_LargeBorder_TopRight");
            _protected.CompNames.push("BORDER_BOTTOMLEFT", "Window_LargeBorder_BottomLeft");
            _protected.CompNames.push("BORDER_BOTTOMRIGHT", "Window_LargeBorder_BottomRight");
            _protected.CompNames.push("BORDER_TOP", "Window_LargeBorder_Top");
            _protected.CompNames.push("BORDER_LEFT", "Window_LargeBorder_Left");
            _protected.CompNames.push("BORDER_RIGHT", "Window_LargeBorder_Right");
            _protected.CompNames.push("BORDER_BOTTOM", "Window_LargeBorder_Bottom");
            _protected.CompNames.push("BACKGROUND", "Window_LargeBorder_Center");
          }
          else 
          {
            _protected.mClipRect = new Rectangle(3, 3, 3, 3);
            _protected.mCompNames.push("BORDER_TOPLEFT", "Window_ThinBorder_TopLeft");
            _protected.mCompNames.push("BORDER_TOPRIGHT", "Window_ThinBorder_TopRight");
            _protected.mCompNames.push("BORDER_BOTTOMLEFT", "Window_ThinBorder_BottomLeft");
            _protected.mCompNames.push("BORDER_BOTTOMRIGHT", "Window_ThinBorder_BottomRight");
            _protected.mCompNames.push("BORDER_TOP", "Window_ThinBorder_Top");
            _protected.mCompNames.push("BORDER_LEFT", "Window_ThinBorder_Left");
            _protected.mCompNames.push("BORDER_RIGHT", "Window_ThinBorder_Right");
            _protected.mCompNames.push("BORDER_BOTTOM", "Window_ThinBorder_Bottom");
            _protected.mCompNames.push("BACKGROUND", "Window_ThinBorder_Center");
          }
          this.Bake();
        }
        
        AddChild(/*mxWidget*/ child)
        {
          super.AddChild(child);
          this.FixScrollbar();
        }
    
        DefineComponent(name, comp)
        {
          let _protected = getData(this.#private.id);
          if (!_protected) return;

          let index = _protected.mCompNames.indexOf(name);
          if (index > -1) _protected.mCompNames.splice(name, 1);
          _protected.mCompNames.push(name, comp);
        }
    
        Bake()
        {
          let _protected = getData(this.#private.id);
          if (!_protected) return;

          let unbaked = {}; //new List<mxComponentLink>();
          for (let cl in _protected.mComponents) if (!_protected.mComponents[cl].Baked) unbaked.push(cl);
          this.RemoveAllComponents();
    
          // all componentlinks
          let comp;
          let topleft = null;
          let bottomright = null;
          let topright = null;
          let bottomleft = null;
    
          if (this.Border) {
            topleft = this.AddBakedComponent(_protected.mCompNames["BORDER_TOPLEFT"]);
            topleft.mTopLeft.SetX(mx.Place.LeftAlign, null, 0);
            topleft.mTopLeft.SetY(mx.Place.TopAlign, null, 0);
    
            topright = AddBakedComponent(_protected.mCompNames["BORDER_TOPRIGHT"]);
            topright.mTopLeft.SetX(mx.Place.RightAlign, null, 0);
            topright.mTopLeft.SetY(mx.Place.TopAlign, null, 0);
    
            bottomleft = AddBakedComponent(_protected.mCompNames["BORDER_BOTTOMLEFT"]);
            bottomleft.mTopLeft.SetX(mx.Place.LeftAlign, null, 0);
            bottomleft.mTopLeft.SetY(mx.Place.BottomAlign, null, 0);
    
            bottomright = AddBakedComponent(_protected.mCompNames["BORDER_BOTTOMRIGHT"]);
            bottomright.mTopLeft.SetX(mx.Place.RightAlign, null, 0);
            bottomright.mTopLeft.SetY(mx.Place.BottomAlign, null, 0);
    
            comp = AddBakedComponent(_protected.mCompNames["BORDER_TOP"]);
            comp.mTopLeft.SetX(mx.Place.RightOf, topleft, 0);
            comp.mTopLeft.SetY(mx.Place.TopAlign, null, 0);
            comp.mBottomRight.SetX(mx.Place.LeftAlign, topright, 0);
    
            comp = AddBakedComponent(_protected.mCompNames["BORDER_LEFT"]);
            comp.mTopLeft.SetX(mx.Place.LeftAlign, null, 0);
            comp.mTopLeft.SetY(mx.Place.Below, topleft, 0);
            comp.mBottomRight.SetY(mx.Place.TopAlign, bottomleft, 0);
    
            comp = AddBakedComponent(_protected.mCompNames["BORDER_BOTTOM"]);
            comp.mTopLeft.SetX(mx.Place.RightOf, bottomleft, 0);
            comp.mTopLeft.SetY(mx.Place.BottomAlign, null, 0);
            comp.mBottomRight.SetX(mx.Place.LeftAlign, bottomright, 0);
    
            comp = AddBakedComponent(_protected.mCompNames["BORDER_RIGHT"]);
            comp.mTopLeft.SetX(mx.Place.RightAlign, null, 0);
            comp.mTopLeft.SetY(mx.Place.Below, topright, 0);
            comp.mBottomRight.SetY(mx.Place.TopAlign, bottomright, 0);
          }
    
          if (this.Background) {
            comp = this.AddBakedComponent(_protected.mCompNames["BACKGROUND"]);
            if (this.Border)
            {
              comp.mTopLeft.SetX(mx.Place.RightOf, topleft, 0);
              comp.mTopLeft.SetY(mx.Place.Below, topleft, 0);
              comp.mBottomRight.SetX(mx.Place.LeftAlign, bottomright, 0);
              comp.mBottomRight.SetY(mx.Place.TopAlign, bottomright, 0);
            } 
            else 
            {
              comp.mTopLeft.SetX(mx.Place.LeftAlign, null, 0);
              comp.mTopLeft.SetY(mx.Place.TopAlign, null, 0);
              comp.mBottomRight.SetX(mx.Place.RightAlign, null, 0);
              comp.mBottomRight.SetY(mx.Place.BottomAlign, null, 0);
            }
          }
    
          for (let cl in unbaked) this.AddComponent(unbaked[cl]);
    
          _protected.mCompLayout.Arrange();
          _protected.mLayout.Arrange();
          if (_protected.mParent != null) _protected.mParent.Arrange();
        }
    
        // The container widget doesnt display focuses no matter what right now
        onFocusIn(/*mxFocusPlayerDef*/ focus)
        {
        }
    
        onFocusOut(/*mxFocusPlayerDef*/ focus)
        {
        }
    
        onParentChange(active, visible)
        {
          let _protected = getData(this.#private.id);
          if (!_protected) return;

          if (!active || !visible) mx.UIManager.Object.UnsetCommand(_protected.mCommandConfig, 15);
          else
          {
            if (_protected.mActive && _protected.mCommandConfig != 0) 
              mx.UIManager.Object.SetCommand(_protected.mCommandConfig, 15);
          }
        }
    
        onVisible()
        {
          let _protected = getData(this.#private.id);
          if (!_protected) return;

          super.onVisible();
          if (_protected.mActive && _protected.mCommandConfig != 0) mx.UIManager.Object.SetCommand(_protected.mCommandConfig, 15);
        }
    
        onInvisible()
        {
          let _protected = getData(this.#private.id);
          if (!_protected) return;

          super.onInvisible();
          if (_protected.mCommandConfig != 0)
            mx.UIManager.Object.UnsetCommand(_protected.mCommandConfig, 15);
        }
    
        onActive()
        {
          let _protected = getData(this.#private.id);
          if (!_protected) return;

          super.onActive();
          if (_protected.mVisible && _protected.mCommandConfig != 0) mx.UIManager.Object.SetCommand(_protected.mCommandConfig, 15);
        }
    
        onInactive()
        {
          let _protected = getData(this.#private.id);
          if (!_protected) return;

          super.onInactive();
          if (_protected.mCommandConfig != 0)
            mx.UIManager.Object.UnsetCommand(_protected.mCommandConfig, 15);
        }
    }
    
    mx.createContainer = function(id) { let ret = new Container(id); ret.init(); return ret; };
    mx.Container = Container;
})();
