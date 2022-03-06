(function()
{

    // Placeable is a base class for things that have a position and can be
    // placed via a layout
    class Placeable extends LayoutDef
    {
        #mRect;
        
        get Rect()
        {
            return this.#mRect;
        }

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


})();
