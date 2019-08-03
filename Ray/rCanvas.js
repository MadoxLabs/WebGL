(function ()
{

  class rCanvas
  {
    constructor()
    {
    }

    fromMemory(w, h)
    {
      this.canvas = document.createElement('canvas');
      this.canvas.width = w;
      this.canvas.height = h;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.context = this.canvas.getContext("2d");

      this.clear();
    }

    fromElement(element)
    {
      this.elementName = element;
      this.canvas = document.getElementById(element);
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.context = this.canvas.getContext("2d");

      this.clear();
      this.map = this.context.getImageData(0, 0, this.width, this.height);
    }

    set(color, x, y)
    {
      if (y >= this.height) return;
      if (x >= this.width) return;
      if (x < 0) return;
      if (y < 0) return;
      let red = (this.height - Math.floor(y) -1) * (this.width * 4) + Math.floor(x) * 4;
      this.map.data[red + 0] = (color.red * 255);
      this.map.data[red + 1] = (color.green * 255);
      this.map.data[red + 2] = (color.blue * 255);
      this.map.data[red + 3] = 255;
    }

    get(color, x, y)
    {
      if (y >= this.height) return;
      if (x >= this.width) return;
      if (x < 0) return;
      if (y < 0) return;
      let red = (this.height - Math.floor(y) -1) * (this.width * 4) + Math.floor(x) * 4;
      color.red = this.map.data[red + 0] / 255.0;
      color.green = this.map.data[red + 1] / 255.0;
      color.blue = this.map.data[red + 2] / 255.0; 
    }

    tvstatic()
    {
      let stride = this.width * 4;
      for (let x = 0; x < this.width; ++x) 
      {
        for (let y = 0; y < this.width; ++y) 
        {
          let shade = Math.random() * 128 + 128;
          let red = y * stride + x * 4;
          this.map.data[red + 0] = shade;
          this.map.data[red + 1] = shade;
          this.map.data[red + 2] = shade;
          this.map.data[red + 3] = 255;
        }
      }
    }

    clear()
    {
      this.context.fillStyle = "black";
      this.context.fillRect(0, 0, this.width, this.height);
      this.map = this.context.getImageData(0, 0, this.width, this.height);
    }

    draw()
    {
      this.context.putImageData(this.map, 0, 0);
    }

    // tests
    static test1()
    {
      return {
        name: "Check canvases are initialized to all black",
        test: function ()
        {
          let canvas = new ray.Canvas();
          canvas.fromMemory(10, 10);
          let c = new ray.Colour(1,1,1);

          for (let i = 0; i < 10; ++i)
          {
            for (let j = 0; j < 10; ++j)
            {
              canvas.get(c, i, j);
              if (c.red != 0) return false;
              if (c.green != 0) return false;
              if (c.blue != 0) return false;
            }
          }
          return true;
        }
      };
    }

    static test2()
    {
      return {
        name: "Check canvas pixels can be written and read back",
        test: function ()
        {
          let canvas = new ray.Canvas();
          canvas.fromMemory(10, 10);
          let c1 = new ray.Colour(1, 0.5, 0);
          canvas.set(c1, 5, 5);
          let c2 = new ray.Colour(0, 0, 0);
          canvas.get(c2, 5, 5);
          if (c2.red != 1) return false;
          ray.epsilon = 0.01;
          if (!ray.isEqual(c2.green, 0.5)) return false;
          ray.epsilon = 0.00001;
          if (c2.blue != 0) return false;
          return true;
        }
      };
    }
  }

  ray.classlist.push(rCanvas);
  ray.Canvas = rCanvas;
})();
