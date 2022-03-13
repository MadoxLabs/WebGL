(function () {

    class Container extends mx.ParentWidget
    {
        #mBorder;
        #mLargeBorder;
        #mBackground;
        #mCompNames;
        #mCommandConfig;

        //protected bool mBorder;
        //protected bool mLargeBorder;
        //protected bool mBackground;
        //protected Dictionary<string, string> mCompNames;
        //protected int mCommandConfig;

        #mScrollbar;
        #mMouse;

        //public bool mHasScrollbar;
        //protected mxScrollbar mScrollbar;
        //protected mxComponentLink mMouse;
    
        public bool Scrollbar {
          set { 
            if (value == false) {
              mHasScrollbar = false;
              mScrollbar = null;          
            } else {
              mHasScrollbar = true;
              FixScrollbar();
            }
          }
        }
    
        public mxComponentLink Mouse
        {
          set { mMouse = value; }
          get { return mMouse; }
        }
        
        protected void FixScrollbar()
        {
          if (mHasScrollbar == false)
          {
            mScrollbar = null;
            return;
          }
    
          if (mScrollbar == null)
          {
            foreach (mxWidget w in mChilds)
            {
              if (w.WidgetType == mxWidgetType.Scrollbar)
              {
                mScrollbar = (mxScrollbar)w;
                mScrollbar.mTopLeft.SetX(mxPlace.RightAlign, null, -20);
                mScrollbar.mTopLeft.SetY(mxPlace.TopAlign, null, 0);
                mScrollbar.mBottomRight.SetX(mxPlace.Fixed, null, 20);
                mScrollbar.mBottomRight.SetY(mxPlace.BottomAlign, null, 0);
                mScrollbar.Current = 0;
                mScrollbar.DocSize = 600;
                break;
              }
            }
          }
        }
    
        public int CommandConfig 
        {
          get { return mCommandConfig; } 
          set 
          {
            if (mCommandConfig > 0) mxUIManager.Object.UnsetCommand(mCommandConfig, 15);
            mCommandConfig = value;
            if (mVisible && mActive) mxUIManager.Object.SetCommand(mCommandConfig, 15);
          }
        }
        public bool Border { get { return mBorder; } set { mBorder = value; } }
        public bool Background { get { return mBackground; } set { mBackground = value; } }
        public bool LargeBorder 
        { 
          get { return mLargeBorder; } 
          set 
          { 
            mLargeBorder = value;
            mCompNames.Clear();
            if (mLargeBorder)
            {
              mClipRect = new Rectangle(12, 5, 12, 5);
              mCompNames.Add("BORDER_TOPLEFT", "Window_LargeBorder_TopLeft");
              mCompNames.Add("BORDER_TOPRIGHT", "Window_LargeBorder_TopRight");
              mCompNames.Add("BORDER_BOTTOMLEFT", "Window_LargeBorder_BottomLeft");
              mCompNames.Add("BORDER_BOTTOMRIGHT", "Window_LargeBorder_BottomRight");
              mCompNames.Add("BORDER_TOP", "Window_LargeBorder_Top");
              mCompNames.Add("BORDER_LEFT", "Window_LargeBorder_Left");
              mCompNames.Add("BORDER_RIGHT", "Window_LargeBorder_Right");
              mCompNames.Add("BORDER_BOTTOM", "Window_LargeBorder_Bottom");
              mCompNames.Add("BACKGROUND", "Window_LargeBorder_Center");
            }
            else 
            {
              mClipRect = new Rectangle(3, 3, 3, 3);
              mCompNames.Add("BORDER_TOPLEFT", "Window_ThinBorder_TopLeft");
              mCompNames.Add("BORDER_TOPRIGHT", "Window_ThinBorder_TopRight");
              mCompNames.Add("BORDER_BOTTOMLEFT", "Window_ThinBorder_BottomLeft");
              mCompNames.Add("BORDER_BOTTOMRIGHT", "Window_ThinBorder_BottomRight");
              mCompNames.Add("BORDER_TOP", "Window_ThinBorder_Top");
              mCompNames.Add("BORDER_LEFT", "Window_ThinBorder_Left");
              mCompNames.Add("BORDER_RIGHT", "Window_ThinBorder_Right");
              mCompNames.Add("BORDER_BOTTOM", "Window_ThinBorder_Bottom");
              mCompNames.Add("BACKGROUND", "Window_ThinBorder_Center");
            }
            Bake();
          } 
        }
    
        constructor(id)
        {
            super(id);
            this.#mWidgetType = mx.WidgetType.Container;
            this.#mCompNames = {};
            this.Border = true;
            this.Background = true;
            this.LargeBorder = true;
            this.#mCommandConfig = 0;
            this.#mScrollbar = null;
            this.mHasScrollbar = false;
        }
    
        public override void AddChild(mxWidget child)
        {
          base.AddChild(child);
          FixScrollbar();
        }
    
        public void DefineComponent(string name, string comp)
        {
          mCompNames.Remove(name);
          mCompNames.Add(name, comp);
        }
    
        public void Bake()
        {
          List<mxComponentLink> unbaked = new List<mxComponentLink>();
          foreach (mxComponentLink cl in mComponents) if (!cl.mBaked) unbaked.Add(cl);
          RemoveAllComponents();
    
          mxComponentLink comp;
          mxComponentLink topleft = null;
          mxComponentLink bottomright = null;
          mxComponentLink topright = null;
          mxComponentLink bottomleft = null;
    
          if (Border) {
            topleft = AddBakedComponent(mCompNames["BORDER_TOPLEFT"]);
            topleft.mTopLeft.SetX(mxPlace.LeftAlign, null, 0);
            topleft.mTopLeft.SetY(mxPlace.TopAlign, null, 0);
    
            topright = AddBakedComponent(mCompNames["BORDER_TOPRIGHT"]);
            topright.mTopLeft.SetX(mxPlace.RightAlign, null, 0);
            topright.mTopLeft.SetY(mxPlace.TopAlign, null, 0);
    
            bottomleft = AddBakedComponent(mCompNames["BORDER_BOTTOMLEFT"]);
            bottomleft.mTopLeft.SetX(mxPlace.LeftAlign, null, 0);
            bottomleft.mTopLeft.SetY(mxPlace.BottomAlign, null, 0);
    
            bottomright = AddBakedComponent(mCompNames["BORDER_BOTTOMRIGHT"]);
            bottomright.mTopLeft.SetX(mxPlace.RightAlign, null, 0);
            bottomright.mTopLeft.SetY(mxPlace.BottomAlign, null, 0);
    
            comp = AddBakedComponent(mCompNames["BORDER_TOP"]);
            comp.mTopLeft.SetX(mxPlace.RightOf, topleft, 0);
            comp.mTopLeft.SetY(mxPlace.TopAlign, null, 0);
            comp.mBottomRight.SetX(mxPlace.LeftAlign, topright, 0);
    
            comp = AddBakedComponent(mCompNames["BORDER_LEFT"]);
            comp.mTopLeft.SetX(mxPlace.LeftAlign, null, 0);
            comp.mTopLeft.SetY(mxPlace.Below, topleft, 0);
            comp.mBottomRight.SetY(mxPlace.TopAlign, bottomleft, 0);
    
            comp = AddBakedComponent(mCompNames["BORDER_BOTTOM"]);
            comp.mTopLeft.SetX(mxPlace.RightOf, bottomleft, 0);
            comp.mTopLeft.SetY(mxPlace.BottomAlign, null, 0);
            comp.mBottomRight.SetX(mxPlace.LeftAlign, bottomright, 0);
    
            comp = AddBakedComponent(mCompNames["BORDER_RIGHT"]);
            comp.mTopLeft.SetX(mxPlace.RightAlign, null, 0);
            comp.mTopLeft.SetY(mxPlace.Below, topright, 0);
            comp.mBottomRight.SetY(mxPlace.TopAlign, bottomright, 0);
          }
    
          if (Background) {
            comp = AddBakedComponent(mCompNames["BACKGROUND"]);
            if (Border)
            {
              comp.mTopLeft.SetX(mxPlace.RightOf, topleft, 0);
              comp.mTopLeft.SetY(mxPlace.Below, topleft, 0);
              comp.mBottomRight.SetX(mxPlace.LeftAlign, bottomright, 0);
              comp.mBottomRight.SetY(mxPlace.TopAlign, bottomright, 0);
            } 
            else 
            {
              comp.mTopLeft.SetX(mxPlace.LeftAlign, null, 0);
              comp.mTopLeft.SetY(mxPlace.TopAlign, null, 0);
              comp.mBottomRight.SetX(mxPlace.RightAlign, null, 0);
              comp.mBottomRight.SetY(mxPlace.BottomAlign, null, 0);
            }
          }
    
          foreach (mxComponentLink cl in unbaked) AddComponent(cl);
    
          mCompLayout.Arrange();
          mLayout.Arrange();
          if (mParent != null) mParent.Arrange();
        }
    
        // The container widget doesnt display focuses no matter what right now
        public override void onFocusIn(mxFocusPlayerDef focus)
        {
        }
    
        public override void onFocusOut(mxFocusPlayerDef focus)
        {
        }
    
        public override void onParentChange(bool active, bool visible)
        {
          if (!active || !visible) mxUIManager.Object.UnsetCommand(mCommandConfig, 15);
          else
          {
            if (mActive && mCommandConfig != 0) 
              mxUIManager.Object.SetCommand(mCommandConfig, 15);
          }
        }
    
        public override void onVisible()
        {
          base.onVisible();
          if (mActive && mCommandConfig != 0) mxUIManager.Object.SetCommand(mCommandConfig, 15);
        }
    
        public override void onInvisible()
        {
          base.onInvisible();
          if (mCommandConfig != 0)
            mxUIManager.Object.UnsetCommand(mCommandConfig, 15);
        }
    
        public override void onActive()
        {
          base.onActive();
          if (mVisible && mCommandConfig != 0) mxUIManager.Object.SetCommand(mCommandConfig, 15);
        }
    
        public override void onInactive()
        {
          base.onInactive();
          if (mCommandConfig != 0)
            mxUIManager.Object.UnsetCommand(mCommandConfig, 15);
        }
    }
    
    mx.Container = Container;
})();
