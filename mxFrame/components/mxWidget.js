(function () {

    // Placeable is a base class for things that have a position and can be
    // placed via a layout
    class Placeable extends mx.LayoutDef {
        #mRect;

        get Rect() {
            return this.#mRect;
        }

        constructor() {
            this.mObject = this;
            this.#mRect = null;
        }

        Place(rect) {
            this.#mRect = rect;
        }
    }

    // ComponantLink refers to a Ui skin componant and gives it a placeable 
    // position in a widget
    class ComponentLink extends mx.Placeable {
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

        constructor(name, baked) {
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

        SetSize(name) {
            if (!name || !name.length) {
                let comp = mx.SkinManager.GetComponantByIndex(this.#mCompID);
                this.#mName = comp.name;
                this.mRect.Width = Math.floor(comp.rect.Width * this.#mScale);
                this.mRect.Height = Math.floor(comp.rect.Height * this.#mScale);
                return;
            }
            let comp = mx.SkinManager.GetComponantByName(name);
            if (comp == null) return;
            this.#mCompID = comp.id;
            this.mRect.Width = Math.floor(comp.rect.Width * this.#mScale);
            this.mRect.Height = Math.floor(comp.rect.Height * this.#mScale);
        }
    }

})();
