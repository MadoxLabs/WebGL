(function (){

    BinSorter = {};
    BinSorter.Sort = function(bin_width, rects)
    {
      // Sort by height.
      let data = {};
      data.rects = rects.slice();
      data.rects.sort( function(xrect,yrect)
      {
        if (xrect.h < yrect.h) return 1;
        if (xrect.h > yrect.h) return -1;
        if (xrect.w < yrect.w) return 1;
        if (xrect.w > yrect.w) return -1;
        return 0;
      });

      // Make variables to track and record the best solution.
      data.is_positioned = [];
      data.num_unpositioned = data.rects.length;

      // Fill by stripes.
      let max_y = 0;
      for (let i = 0; i <= rects.length - 1; i++)
      {
        // See if this rectangle is positioned.
        if (!data.is_positioned[i])
        {
          // Start a new stripe.
          data.num_unpositioned -= 1;
          data.is_positioned[i] = true;
          data.rects[i].x = 0;
          data.rects[i].y = max_y;

          if (data.rects[i].w > bin_width) break;
          BinSorter.FillBoundedArea(data.rects[i].w, bin_width, max_y, max_y + data.rects[i].h, data);

          if (data.num_unpositioned == 0) break;
          max_y += data.rects[i].h;
        }
      }

      // Save the best solution.
      //      Array.Copy(best_rects, rects, rects.length);
      //  We need to unsort the rects back to the original ordering
      let done = [];
      for (let i = 0; i <= data.rects.length - 1; i++)
      {
        for (let j = 0; j <= rects.length - 1; j++)
        {
          if (done[j] == false && rects[j].w == data.rects[i].w && rects[j].h == data.rects[i].h)
          {
            done[j] = true;
            rects[j].x = data.rects[i].x;
            rects[j].y = data.rects[i].y;
            break;
          }
        }
      }        
    }

    BinSorter.FillBoundedArea = function(xmin, xmax, ymin, ymax, data)
    {
      // See if every rectangle has been positioned.
      if (data.num_unpositioned <= 0) return;

      // Save a copy of the solution so far.
      let best_num_unpositioned = data.num_unpositioned;
      let best_rects = data.rects.slice();
      let best_is_positioned = data.is_positioned.slice();

      // Currently we have no solution for this area.
      let best_density = 0;

      // Some rectangles have not been positioned.
      // Loop through the available rectangles.
      for (let i = 0; i <= data.rects.length - 1; i++)
      {
        // See if this rectangle is not position and will fit.
        if ((!data.is_positioned[i]) && (data.rects[i].w <= xmax - xmin) && (data.rects[i].h <= ymax - ymin))
        {
          // It will fit. Try it.
          // **************************************************
          // Divide the remaining area horizontally.
          let test1 = {};
          test1.num_unpositioned = data.num_unpositioned - 1;
          test1.rects = data.rects.slice();
          test1.is_positioned = data.is_positioned.slice();
          test1.rects[i].x = xmin;
          test1.rects[i].y = ymin;
          test1.is_positioned[i] = true;

          // Fill the area on the right.
          BinSorter.FillBoundedArea(xmin + data.rects[i].w, xmax, ymin, ymin + data.rects[i].h, test1);
          // Fill the area on the bottom.
          BinSorter.FillBoundedArea(xmin, xmax, ymin + data.rects[i].h, ymax, test1);

          // Learn about the test solution.
          test1.density = BinSorter.SolutionDensity(
                  xmin + data.rects[i].w, xmax, ymin, ymin + data.rects[i].h,
                  xmin, xmax, ymin + data.rects[i].h, ymax,
                  test1.rects, test1.is_positioned);

          // See if this is better than the current best solution.
          if (test1.density >= best_density)
          {
            // The test is better. Save it.
            best_density = test1.density;
            best_rects = test1.rects;
            best_is_positioned = test1.is_positioned;
            best_num_unpositioned = test1.num_unpositioned;
          }

          // **************************************************
          // Divide the remaining area vertically.
          let test2 = {};
          test2.num_unpositioned = data.num_unpositioned - 1;
          test2.rects = data.rects.slice();
          test2.is_positioned = data.is_positioned.slice();
          test2.rects[i].x = xmin;
          test2.rects[i].y = ymin;
          test2.is_positioned[i] = true;

          // Fill the area on the right.
          BinSorter.FillBoundedArea(xmin + data.rects[i].w, xmax, ymin, ymax, test2);
          // Fill the area on the bottom.
          BinSorter.FillBoundedArea(xmin, xmin + data.rects[i].w, ymin + data.rects[i].h, ymax, test2);

          // Learn about the test solution.
          test2.density = BinSorter.SolutionDensity(
                  xmin + data.rects[i].w, xmax, ymin, ymax,
                  xmin, xmin + data.rects[i].w, ymin + data.rects[i].h, ymax,
                  test2.rects, test2.is_positioned);

          // See if this is better than the current best solution.
          if (test2.density >= best_density)
          {
            // The test is better. Save it.
            best_density = test2.density;
            best_rects = test2.rects;
            best_is_positioned = test2.is_positioned;
            best_num_unpositioned = test2.num_unpositioned;
          }
        } // End trying this rectangle.
      } // End looping through the rectangles.

      // Return the best solution we found.
      data.is_positioned = best_is_positioned;
      data.num_unpositioned = best_num_unpositioned;
      data.rects = best_rects;
    }

    function Intersects(r1, r2)
    {
        if ((r2.x + r2.w) < r1.x) return false;
        if (r2.x > (r1.x + r1.w)) return false;
        if ((r2.y + r2.h) < r1.y) return false;
        if (r2.y > (r1.y + r1.h)) return false;
        return true;
    }

    // Find the density of the rectangles in the given areas for this solution.
    BinSorter.SolutionDensity = function(
        xmin1, xmax1, ymin1, ymax1,
        xmin2, xmax2, ymin2, ymax2,
        rects, is_positioned)
    {
      let rect1 = {x:xmin1, y:ymin1, w:xmax1 - xmin1, h:ymax1 - ymin1};
      let rect2 = {x:xmin2, y:ymin2, w:xmax2 - xmin2, h:ymax2 - ymin2};
      let area_covered = 0;
      for (let i = 0; i <= rects.length - 1; i++)
      {
        if (is_positioned[i] && (Intersects(rects[i], rect1) || Intersects(rects[i], rect2)))
        {
          area_covered += rects[i].w * rects[i].h;
        }
      }

      let denom = rect1.w * rect1.h + rect2.w * rect2.h;
      if (Math.abs(denom) < 0.001) return 0;

      return area_covered / denom;
    }

    class Skin
    {
        #private;

        constructor()
        {
            this.isSkin = true;

            this.#private = {};
            this.#private.texture = null;
            this.#private.size = null

            this.name = null;
            this.names = {}; // name to index
            this.components = []; // components by index
            this.msPerFrame = 0;
            this.numFrames = 0;
            this.active = true;
            this.curFrame = 0;
            this.curTime = 0;
            this.location = {x:0, y:0, w:0, h:0 };
        }

        getComponent(name)
        {
            if (name in this.names)
            {
              let index = this.names[name];
              return this.components[index];
            }
            return  {x:0, y:0, w:0, h:0 };
        }

        get texture()
        {
            if (!this.#private.texture)
            {
                this.#private.texture = mx.Game.assetMan.assets[this.name];
                if (this.#private.texture && !this.#private.size)
                {
                    this.#private.size = {};
                    this.#private.size.w = this.#private.texture.width;
                    this.#private.size.h = this.#private.texture.height;
                }
            }
            return this.#private.texture;
        }

        set size(s)
        {
            this.#private.size = { w:s.w, h:s.h };
        }

        get size()
        {
          if (!this.#private.size)
          {
            this.#private.texture = mx.Game.assetMan.assets[this.name];
            if (this.#private.texture)
            {
                this.#private.size = {};
                this.#private.size.w = this.#private.texture.width;
                this.#private.size.h = this.#private.texture.height;
            }              
          }
          return this.#private.size;
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
          // TODO more than one skin - make live skins their own skin also

            this.skins = {};           // string to skin
            this.animatedSkins = {};   // string to skin
            this.surface = null;
            this.size = {x:0, y:0, w:0, h:0};
            this.components = {};    // int to component
            this.originalComponents = {} // int to rect
            this.names = {} // string to int
        }

        addSkin(skin)
        {
            this.skins[skin.name] = skin;
            if (skin.numFrames != 1) this.animatedSkins[skin.name] = skin;
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
         
console.log("Baking textures");
            let i = 0;
            let needSort = false;
      
            this.components = {};
            this.originalComponents = {};
            this.names = {};
      
            // create an array of the texture sizes
            if (!rects) 
            {
              needSort = true;
              rects = [];
console.log("Starting with:");              
              for (let skinindex in this.skins)
              {
                let skin = this.skins[skinindex];

                if (skin.active == false) continue;
                rects[i] = {};
                rects[i].x = 0;
                rects[i].y = 0;
                rects[i].w = skin.size.w;
                rects[i].h = skin.size.h;
console.log(rects[i]);
                skin.location = rects[i];
                ++i;
              }
            }
      
            let binsize = sizeHint;
            let binheight = 0;
      
            if (Object.keys(this.skins).length > 1)
            {
console.log("got many skins")              ;
              if (needSort)
              {
console.log("sorting")                ;
                // find the best positioning of the textures
                while (true)
                {
                  let bestfit = rects.slice(); // start with all rects placed in upper left corner
console.log("try size " + binsize);
                  BinSorter.Sort(binsize, bestfit);                 // arrange them
      
                  if (bestfit[0].x == 0 && bestfit[1].x == 0 && bestfit[0].y == 0 && bestfit[1].y == 0)
                  {
                    binsize += 512; // it didn't find a fit - try bigger area
                    continue; 
                  }
      
                  binheight = 0; 
                  for (let i = 0; i < bestfit.length; ++i) // it fit - find the height we need to hold the rects
                  {                    
                    if (bestfit[i].y + bestfit[i].h > binheight) binheight = bestfit[i].y + bestfit[i].h;
                  }
      
                  if (binheight < binsize)
                  {
                    rects = bestfit; // we will never find a good width:height ratio - bail
                    break;
                  }
      
                  if (binheight - binsize <= 1024)  
                  {
                    rects = bestfit; // found a good size with an ok width:height ratio
                    break;
                  }
      
                  binsize += 512; // try bigger area to get a better width:height ratio
                }
              }
              else
              {
                for (let i = 0; i < rects.length; ++i) 
                {
                  if (rects[i].y + rects[i].h > binheight) binheight = rects[i].y + rects[i].h;
                }
              }
            }
            else if (rects.length)
            {
              // we only have one texture
              binsize = rects[0].w;
              binheight = rects[0].h;
            }
            this.size.w - binsize;
            this.size.h - binheight;
console.log("got size "+binsize +" x "+binheight);
console.log(rects);
      
            // make a canvas, copy the textures onto it
            var c = document.createElement("canvas");
            var ctx = c.getContext("2d");
            c.width = binsize;
            c.height = binheight;

            i = 0;
            for (let skinindex in this.skins)
            {
              let skin = this.skins[skinindex];
              let id = 0; // only one for now
      
              if (skin.active == false) continue;
      
              skin.location = rects[i];
              if (skin.texture != null)
              {
                // create and copy skin into its location
                //gl.texSubImage2D(gl.TEXTURE_2D, 0, rects[i].x, rects[i].y, skin.w, skin.h, gl.RGBA, gl.UNSIGNED_BYTE, skin.texture.image);
                ctx.drawImage(skin.texture.image, rects[i].x, rects[i].y);
              }
      
              // create and store components in the new positions
              for (let name in skin.names)
              {
                let comp = new Component();
                comp.skin = id;
                comp.name = name;
                comp.rect = skin.getComponent(name);
                comp.rect.x += rects[i].x;
                comp.rect.y += rects[i].y;
      
                this.names[name] = comp.id;
                this.components[comp.id] = comp;
      
                if (skin.numFrames > 1) this.originalComponents[comp.id] = comp.rect;
              }
              ++i;
            }

            // make the real surface
            this.surface = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.surface);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
            gl.bindTexture(gl.TEXTURE_2D, null);            
        }

        getSkinSize() { return this.size; }

        getTexture() { return this.surface; }

        getComponentByName(name)
        {
          if (name in this.names)
          {
            let index = this.names[name];
            if (index in this.components)
            {
              return this.components[index];
            }
          }
          return null;
        }

        getComponentByIndex(index)
        {
            if (index in this.components)
            {
              return this.components[index];
            }
          return null;
        }

        update(elapsed)
        {
          // copy next animated texture frame to the baked texture
          for (let skinindex in this.animatedSkins)
          {
            let skin = this.animatedSkins[skinindex];
            if (skin.active == false) continue;
            if (skin.numFrames == 1) continue;
          
            // is it time for the next frame?
            skin.curTime += elapsed;
            if (skin.curTime < skin.msPerFrame) continue;
          
            // how many frames should we advance?
            while (skin.curTime >= skin.msPerFrame)
            {
              skin.curTime -= skin.msPerFrame;
              skin.curFrame++;
            }
            while (skin.curFrame >= skin.numFrames) skin.curFrame -= skin.numFrames;
          
            // what is the component name?
            let compname = Object.keys(skin.names)[0];
            let compid = this.names[compname];
            let comp = this.components[compid];
          
            // update the compoeant to the new rect
            comp.rect.X = this.originalComponents[compid].x + (comp.rect.w * skin.curFrame) % skin.texture.w;
            comp.rect.Y = this.originalComponents[compid].y + ((comp.rect.w * skin.curFrame) / skin.texture.w) * comp.rect.h;
          }
            
          // TODO live skin
        }
    }

    mx.SkinManager = new SkinManager();
    mx.Skin = Skin;
    mx.Component = Component;
    //mx.LiveSkin = LiveSkin
})();