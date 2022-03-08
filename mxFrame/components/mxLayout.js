(function()
{
    class Color
    {
        constructor(r, g, b, a)
        {
            this.isColor = true;
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }
    };

    const FocusType = {
        Color: 0,
        Componant: 1,
        ParentComponant: 2
    };

    const ShiftDir = {
        North: 0,
        South: 1,
        East: 2,
        West: 3
    };

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

    // Defines a single element on a focus definition.
    // An element contains the parameters for a given focus type
    class FocusElement
    {
        //        public mxFocusType mType;
        //        public Vector4 mColor;
        //        public mxComponantLink mComponant;

        constructor(c)
        {
            this.isFocusElement = true;
            this.mColor = c.isColor ? c : new Color(0, 0, 0, 1);
            this.mComponant = null;
            this.mType = FocusType.Color;
        }

        constructor(c, parent)
        {
            this.mComponant = c;
            this.mColor = new Color(0, 0, 0, 0);
            this.mType = parent ? FocusType.ParentComponant : FocusType.Componant;
        }
    }

    // Focus definition holds all the focus elements that get applied for a given player(s)
    class FocusPlayerDef
    {
        //        public int mPlayers; // mask for which players this affects
        //        public List < mxFocusElement > mElements; // the UI componantlinks that define the focus visual element
        //        public int mCommands; // global commands that this focus gives 

        //        public mxWidget mTarget;
        //        public int mCount;

        constructor(pmask)
        {
            this.isFocusPlayerDef = true;
            this.mCount = 0;
            this.mTarget = null;
            this.mPlayers = pmask;
            this.mElements = [];
            this.mCommands = 0;
        }
    }

    // A parent widgets can define a focus, which alters a UI element for a specific player(s)
    // Different players have have different focus effects defined.
    class FocusDef
    {
        //public List<mxFocusPlayerDef> mDefs;
        //protected Dictionary<int, mxFocusPlayerDef> mDefsByPlayer;
        //protected int mID;

        get ID()
        {
            return this.mID;
        }

        constructor(id)
        {
            this.isFocusDef = true;
            this.mID = id;
            this.mDefsByPlayer = {};
            this.mDefs = [];
        }

        Initialize( /*mxFocusDef*/ def)
        {
            for (let i in this.mDefs)
            {
                let pdef = this.mDefs[i];

                pdef.mTarget = null;
                pdef.mCount = 0;
                if ((pdef.mPlayers & 1) > 0 && mx.PlayerManager.players[5]) pdef.mCount++;
                if ((pdef.mPlayers & 2) > 0 && mx.PlayerManager.players[1]) pdef.mCount++;
                if ((pdef.mPlayers & 4) > 0 && mx.PlayerManager.players[2]) pdef.mCount++;
                if ((pdef.mPlayers & 8) > 0 && mx.PlayerManager.players[3]) pdef.mCount++;
                if ((pdef.mPlayers & 16) > 0 && mx.PlayerManager.players[4]) pdef.mCount++;
            }
            if (def && def.isFocusDef)
            {
                this.CopyFocus(def, 1);
                this.CopyFocus(def, 2);
                this.CopyFocus(def, 3);
                this.CopyFocus(def, 4);
                this.CopyFocus(def, 5);
            }
        }

        CopyFocus(def, p)
        {
            if (!def || !def.isFocusDef) return;

            let newdef = this.GetFocusDef(p);
            let olddef = def.GetFocusDef(p);

            if (!newdef) return;
            if (!olddef) return;
            if (newdef.mTarget != null) return;
            newdef.mTarget = olddef.mTarget;
        }

        GetFocusDef(p)
        {
            let def = null; // mxFocusPlayerDef
            let i = mx.PlayerManager.IndexToMask(p);
            if (i in this.mDefsByPlayer) def = this.mDefsByPlayer[i];
            return def;
        }

        AddFocusDef(def) // mxFocusPlayerDef
            {
                if (!def || !def.isFocusPlayerDef) return;

                this.mDefs.Add(def);
                if ((def.mPlayers & 1) > 0) this.mDefsByPlayer[1] = def;
                if ((def.mPlayers & 2) > 0) this.mDefsByPlayer[2] = def;
                if ((def.mPlayers & 4) > 0) this.mDefsByPlayer[4] = def;
                if ((def.mPlayers & 8) > 0) this.mDefsByPlayer[8] = def;
            }
    }

    // defines which widgets are adjacent to a given widget for purposes of moving
    // the focus
    class ShiftElement
    {
        //public int mWidgetID;
        //public Dictionary < mxShiftDir, int > mShifts;

        constructor(widgetid)
        {
            this.isShiftElement = true;
            this.mWidgetID = widgetid;
            this.mShifts = {};
        }
    }

    class ShiftPlayerDef
    {
        //public int mPlayers;                      // mask for which players this affects
        //public int mFirstChild;
        //public Dictionary<int, mxShiftElement> mFocusShifts; // defines the widgets 'tab order'

        constructor(pmask, first)
        {
            this.isShiftPlayerDef = true;
            this.mFirstChild = first;
            this.mPlayers = pmask;
            this.mFocusShifts = {};
        }

        AddElement(elem)
        {
            if (!elem || !elem.isShiftElement) return;
            this.mFocusShifts[elem.mWidgetID] = elem;
        }

        GetNextChild(widgetid, dir)
        {
            if (widgetid in this.mFocusShifts)
            {
                let se = this.mFocusShifts[widgetid];
                if (dir in se.mShifts) return se.mShifts[dir];
            }
            return 0;
        }
    }

    class ShiftDef
    {
        //protected int mWidgetID;
        //public int WidgetID { get { return mWidgetID; } }
        //public Dictionary<int, mxShiftPlayerDef> mDefs;

        constructor(widgetid)
        {
            this.isShiftDef = true;
            this.mWidgetID = widgetid;
            this.mDefs = {};
        }

        GetShiftDefByIndex(p)
        {
            let def = null; // mxShiftPlayerDef
            let i = mx.PlayerManager.IndexToMask(p);
            if (i in this.mDefs) def = this.mDefs[i];
            return def;
        }

        GetShiftDefByMask(pmask)
        {
            let def = null; // mxShiftPlayerDef
            if (((pmask & 1) > 0) && (1 in this.mDefs)) def = this.mDefs[1];
            if (((pmask & 2) > 0) && (2 in this.mDefs)) def = this.mDefs[2];
            if (((pmask & 4) > 0) && (4 in this.mDefs)) def = this.mDefs[4];
            if (((pmask & 8) > 0) && (8 in this.mDefs)) def = this.mDefs[8];
            if (((pmask & 16) > 0) && (16 in this.mDefs)) def = this.mDefs[16];
            return def;
        }

        AddShiftDef(def)
        {
            if (!def || !def.isShiftPlayerDef) return;

            if ((def.mPlayers & 1) > 0) this.mDefs[1] = def;
            if ((def.mPlayers & 2) > 0) this.mDefs[2] = def;
            if ((def.mPlayers & 4) > 0) this.mDefs[4] = def;
            if ((def.mPlayers & 8) > 0) this.mDefs[8] = def;
            if ((def.mPlayers & 16) > 0) this.mDefs[16] = def;
        }
    }

    // These values are used to position the corners of a widget during layout
    const Place = {
        LeftOf: 0,
        LeftAlign: 1,
        RightOf: 2,
        RightAlign: 3,
        Below: 4,
        BottomAlign: 5,
        Above: 6,
        TopAlign: 7,
        Center: 8,
        CenterAlign: 9,
        Fixed: 10,
        None: 11
    };

    // simple Point object
    class Point
    {
        constructor(x, y)
        {
            thie.x = x;
            this.y = y;
        }

        copy() { return new Point(this.x, this.y); }
    };

    class Rectangle
    {
        constructor(x, y, w, h)
        {
            thie.X = x;
            this.Y = y;
            thie.Width = w;
            this.Height = h;
        }
        copy() { return new Rectangle(this.X, this.Y, this.Width, this.Height); }
    };

    // A corner object determines how a given corner is placed. The corner can
    // be relative to an object and/or have an offset
    class Corner
    {
        constructor()
        {
            this.xRelativeTo = null; //mxPlaceable
            this.yRelativeTo = null; //mxPlaceable
            this.mOffset = new Point(0, 0); // mxPoint
            this.xPlace = Place.None;
            this.yPlace = Place.None;
        }

        SetX(p, obj, o)
        {
            this.xRelativeTo = obj;
            this.xPlace = p;
            this.mOffset.x = o;
        }

        SetY(p, obj, o)
        {
            this.yRelativeTo = obj;
            this.yPlace = p;
            this.mOffset.y = o;
        }
    }

    // A LayoutDef defines where a certain object will be positioned 
    //  in relation to other objects or its parent.
    // mObject is the object the layout is applied to
    // The two corner objects determine to behaviour of placing those corners.
    class LayoutDef
    {
        constructor()
        {
            this.mObject = null; // mxPlaceable
            this.mTopLeft = new Corner(0, 0); // mxCorner
            this.mBottomRight = new Corner(0, 0); // mxCorner    
        }
    }

    // Objects that contain elements to be laid out should use this class
    // to perform the layout. Each placable element is added and then arranged. 
    // Arrange will move and resize each object into its proper position.
    class Layout
    {
        //    public mxWidget mWidget = null;
        //    public List<mxPlaceable> mObjects = new List<mxPlaceable>();

        constructor(obj)
        {
            this.mWidget = obj; // widget
            this.mObjects = [];
        }

        Add(obj)
        {
            this.mObjects.push(obj);
        }

        Remove(obj)
        {
            let index = this.mObjects.indexOf(obj);
            if (index > -1) {
                this.mObjects.splice(index, 1);
            }
        }

        Arrange()
        {
            if (this.mWidget == null) return;

            let winSize = this.mWidget.Rect;

            for (let i in this.mObjects)
            {
                let layout = this.mObjects[i]; // Placeable

                let objSize = layout.Rect;
                let objLayout = new Rectangle(winSize.X, winSize.Y, objSize.Width, objSize.Height);

                let rect = new Rectangle(0,0,0,0);

                // if the size is fixed, lets set that now so it can be used in placement
                if (layout.mBottomRight.xPlace == Place.Fixed)
                    objSize.Width = layout.mBottomRight.mOffset.x;
                if (layout.mBottomRight.yPlace == Place.Fixed)
                    objSize.Height = layout.mBottomRight.mOffset.y;

                // determine X coord
                if (layout.mTopLeft.xRelativeTo == null)
                    rect = new Rectangle(0,0,0,0);  
                else
                    rect = layout.mTopLeft.xRelativeTo.Rect;

                switch (layout.mTopLeft.xPlace)
                {
                    case Place.LeftOf:
                        objLayout.X = rect.Left - objSize.Width;
                        break;
                    case Place.Fixed:
                    case Place.LeftAlign:
                        if (layout.mTopLeft.xRelativeTo == null)
                            objLayout.X = 0;
                        else
                            objLayout.X = rect.Left;
                        break;
                    case Place.RightOf:
                        objLayout.X = rect.Right;
                        break;

                    case Place.RightAlign:
                        if (layout.mTopLeft.xRelativeTo != null)
                            objLayout.X = rect.Right - objSize.Width;
                        else
                            objLayout.X = winSize.Width - objSize.Width;
                        break;

                    case Place.Center:
                        if (layout.mTopLeft.xRelativeTo != null)
                            objLayout.X = rect.Left + ((rect.Right - rect.Left) / 2) - (objSize.Width / 2);
                        else
                            objLayout.X = (winSize.Width - objSize.Width) / 2;
                        break;

                    case Place.CenterAlign:
                        if (layout.mTopLeft.xRelativeTo != null)
                            objLayout.X = rect.Left + ((rect.Right - rect.Left) / 2);
                        else
                            objLayout.X = winSize.Width / 2;
                        break;
                }

                // determine Y coord
                if (layout.mTopLeft.yRelativeTo == null)
                    rect = new Rectangle(0,0,0,0);
                else
                    rect = layout.mTopLeft.yRelativeTo.Rect;

                switch (layout.mTopLeft.yPlace)
                {
                    case Place.Below:
                        objLayout.Y = rect.Bottom;
                        break;

                    case Place.BottomAlign:
                        if (layout.mTopLeft.yRelativeTo != null)
                            objLayout.Y = rect.Bottom - objSize.Height;
                        else
                            objLayout.Y = winSize.Height - objSize.Height;
                        break;

                    case Place.Above:
                        objLayout.Y = rect.Top - objSize.Height;
                        break;

                    case Place.Fixed:
                    case Place.TopAlign:
                        if (layout.mTopLeft.yRelativeTo != null)
                            objLayout.Y = rect.Top;
                        else
                            objLayout.Y = 0;
                        break;

                    case Place.Center:
                        if (layout.mTopLeft.yRelativeTo != null)
                            objLayout.Y = rect.Top + ((rect.Bottom - rect.Top) / 2) - (objSize.Height / 2);
                        else
                            objLayout.Y = (winSize.Height - objSize.Height) / 2;
                        break;

                    case Place.CenterAlign:
                        if (layout.mTopLeft.yRelativeTo != null)
                            objLayout.Y = rect.Top + ((rect.Bottom - rect.Top) / 2);
                        else
                            objLayout.Y = winSize.Height / 2;
                        break;
                }

                objLayout.X += layout.mTopLeft.mOffset.x;
                objLayout.Y += layout.mTopLeft.mOffset.y;

                // determine bottom right x coord
                if (layout.mBottomRight.xRelativeTo == null)
                    rect = new Rectangle(0,0,0,0);
                else
                    rect = layout.mBottomRight.xRelativeTo.Rect;

                switch (layout.mBottomRight.xPlace)
                {
                    case Place.CenterAlign:
                        if (layout.mBottomRight.xRelativeTo != null)
                            objLayout.Width = rect.Left + (rect.Width / 2) - objLayout.X;
                        else
                            objLayout.Width = winSize.Width / 2 - objLayout.X;
                        break;

                    case Place.LeftAlign:
                        if (layout.mBottomRight.xRelativeTo != null)
                            objLayout.Width = rect.Left - objLayout.X;
                        else
                            objLayout.Width = 0;
                        break;

                    case Place.RightAlign:
                        if (layout.mBottomRight.xRelativeTo != null)
                            objLayout.Width = rect.Right - objLayout.X;
                        else
                            objLayout.Width = winSize.Width - objLayout.X;
                        break;

                    case Place.Fixed:
                        objLayout.Width = 0;
                        break;
                }

                // determine bottom right y coord
                if (layout.mBottomRight.yRelativeTo == null)
                    rect = new Rectangle(0,0,0,0);
                else
                    rect = layout.mBottomRight.yRelativeTo.Rect;

                switch (layout.mBottomRight.yPlace)
                {
                    case Place.CenterAlign:
                        if (layout.mBottomRight.yRelativeTo != null)
                            objLayout.Height = rect.Top + (rect.Height / 2) - objLayout.Y;
                        else
                            objLayout.Height = winSize.Height / 2 - objLayout.Y;
                        break;

                    case Place.TopAlign:
                        if (layout.mBottomRight.yRelativeTo != null)
                            objLayout.Height = rect.Top - objLayout.Y;
                        else
                            objLayout.Height = 0;
                        break;

                    case Place.BottomAlign:
                        if (layout.mBottomRight.yRelativeTo != null)
                            objLayout.Height = rect.Top + rect.Height - objLayout.Y;
                        else
                            objLayout.Height = winSize.Height - objLayout.Y;
                        break;

                    case Place.Fixed:
                        objLayout.Height = 0;
                        break;
                }

                objLayout.Width += layout.mBottomRight.mOffset.x;
                objLayout.Height += layout.mBottomRight.mOffset.y;

                // send the new position, size to the object
                layout.Place(objLayout);
            }
        }
    }

    mx.UIGroup = UIGroup;
    mx.ShiftDir = ShiftDir;
    mx.FocusType = FocusType;
    mx.FocusElement = FocusElement;
    mx.FocusPlayerDef = FocusPlayerDef;
    mx.FocusDef = FocusDef;
    mx.ShiftElement = ShiftElement;
    mx.ShiftPlayerDef = ShiftPlayerDef;
    mx.ShiftDef = ShiftDef;
    mx.Color = Color;
    mx.Place = Place;
    mx.Rectangle = Rectangle;
    mx.Point = Point;
    mx.Corner = Corner;
    mx.LayoutDef - LayoutDef;
    mx.Layout = Layout;

})();
