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

    mx.SkinManager = new SkinManager();
    mx.Skin = Skin;
    //mx.LiveSkin = LiveSkin
})();