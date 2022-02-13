(function (){

    class Skin
    {
        #texture;

        constructor()
        {
            this.#texture = null;
            this.name = null;
            this.components = [];
            this.names = {};
            this.size = { w:0, h:0 };
            this.msPerFrame = 0;
            this.numFrames = 0;
            this.active = true;
            this.curFrame = 0;
            this.curTime = 0;
            this.location = {x:0, y:0, w:0, h:0 };
        }

        get texture()
        {
            if (!this.#texture)
            {
                this.#texture = mx.AssetManager.assets[this.name];
                if (this.#texture)
                {
                    this.size.w = this.#texture.width;
                    this.size.h = this.#texture.height;
                }
            }
            return this.#texture;
        }
    }

    // TODO live skin

    let idsource = 1;

    class Component
    { 
        constructor()
        {
            this.skin = 0;
            this.rect = { x:0, y:0, w:0, h:0 };
            this.name = "";
            this.stretch = false;
            this.id = idsource++;
        }
    }

    class SkinManager
    {
        constructor()
        {
            this.skins = {};           // string to skin
            this.animatedSkins = {};   // string to skin
            this.surface = null;
            this.components = {};    // int to component
            this.originalComponents = {} // int to rect
            this.names = {} // string to int
        }

        addSkin(name, skin)
        {
            this.skins[name] = skin;
            if (skin.numFrames != 1) this.animatedSkins[name] = skin;
        }

        // todo add live skin

        setSkin(name, active)
        {
            if (name in this.skins)
            {
                this.skins[name].active = active;
            }
        }

        bakeSkins(sizeHint, rects)
        {
            if (!sizeHint) sizeHint = 512;
            
        }
    }

    mx.SkinManager = new SkinManager();
    mx.Skin = Skin;
    //mx.LiveSkin = LiveSkin
})();