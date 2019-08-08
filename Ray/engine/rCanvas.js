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

    bltData(data, x, y)
    {
      let loc = Math.floor(y) * (this.width * 4) + Math.floor(x) * 4;
      this.map.data.set(data, loc);
    }

    set(color, x, y)
    {
      if (y >= this.height) return;
      if (x >= this.width) return;
      if (x < 0) return;
      if (y < 0) return;
      let red = Math.floor(y) * (this.width * 4) + Math.floor(x) * 4;
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
      let red = Math.floor(y) * (this.width * 4) + Math.floor(x) * 4;
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
          let c = ray.RGBColour(1,1,1);

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
          let c1 = ray.RGBColour(1, 0.5, 0);
          canvas.set(c1, 5, 5);
          let c2 = ray.RGBColour(0, 0, 0);
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

  class rRender
  {
    constructor()
    {
    }

    lighting(material, light, point, eye, normal)
    {
      let effectiveColour = ray.Colour.multiply(material.colour, light.colour);
      let ambient = ray.Colour.multiply(effectiveColour, light.intensityAmbient).times(material.ambient);
      let diffuse = null;
      let specular = null;

      let toLight = ray.Touple.subtract(light.position, point);
      let distance = toLight.magnitude();
      toLight.normalize();
      let lightDotNormal = toLight.dot(normal);
      if (lightDotNormal < 0)
      {
        diffuse = ray.Black;
        specular = ray.Black;
      }
      else
      {
        diffuse = ray.Colour.multiply(effectiveColour, light.intensityDiffuse).times(material.diffuse).times(lightDotNormal);
        let reflect = ray.Touple.reflect(toLight.negate(), normal);
        let reflectDotEye = reflect.dot(eye);
        if (reflectDotEye <= 0)
          specular = ray.Black;
        else
        {
          let factor = Math.pow(reflectDotEye, material.shininess);
          specular = ray.Colour.multiply(light.colour, material.specular).times(factor);
        }
      }
      let attenuation = light.attenuation[0] + light.attenuation[1] * distance + light.attenuation[2] * distance * distance;
      return ambient.plus(diffuse).plus(specular).times(1.0/attenuation);
    }

    static test1()
    {
      return {
        name: "Lighting with the eye between light and surface",
        test: function ()
        {
          let m = new ray.Material();
          let p = ray.Origin;
          let eye = ray.Vector(0, 0, -1);
          let normal = ray.Vector(0, 0, -1);
          let light = new ray.LightPoint(ray.Point(0, 0, -10), ray.RGBColour(1, 1, 1));
          let result = ray.Render.lighting(m, light, p, eye, normal);
          if (result.equals(ray.RGBColour(1.9, 1.9, 1.9)) == false) return false;
          return true;
        }
      };
    }

    static test2()
    {
      return {
        name: "Lighting with the eye offset 45 degrees between light and surface",
        test: function ()
        {
          let m = new ray.Material();
          let p = ray.Origin;
          let num = Math.sqrt(2) / 2;
          let eye = ray.Vector(0, num, -num);
          let normal = ray.Vector(0, 0, -1);
          let light = new ray.LightPoint(ray.Point(0, 0, -10), ray.RGBColour(1, 1, 1));
          let result = ray.Render.lighting(m, light, p, eye, normal);
          if (result.equals(ray.RGBColour(1.0, 1.0, 1.0)) == false) return false;
          return true;
        }
      };
    }

    static test3()
    {
      return {
        name: "Lighting with the light offset 45 degrees between eye and surface",
        test: function ()
        {
          let m = new ray.Material();
          let p = ray.Origin;
          let eye = ray.Vector(0, 0, -1);
          let normal = ray.Vector(0, 0, -1);
          let light = new ray.LightPoint(ray.Point(0, 10, -10), ray.RGBColour(1, 1, 1));
          let result = ray.Render.lighting(m, light, p, eye, normal);
          if (result.equals(ray.RGBColour(0.7364, 0.7364, 0.7364)) == false) return false;
          return true;
        }
      };
    }

    static test4()
    {
      return {
        name: "Lighting with the eye in the path of the reflection",
        test: function ()
        {
          let num = Math.sqrt(2) / 2;
          let m = new ray.Material();
          let p = ray.Origin;
          let eye = ray.Vector(0, -num, -num);
          let normal = ray.Vector(0, 0, -1);
          let light = new ray.LightPoint(ray.Point(0, 10, -10), ray.RGBColour(1, 1, 1));
          let result = ray.Render.lighting(m, light, p, eye, normal);
          if (result.equals(ray.RGBColour(1.6364, 1.6364, 1.6364)) == false) return false;
          return true;
        }
      };
    }

    static test5()
    {
      return {
        name: "Lighting with the light behind the surface",
        test: function ()
        {
          let m = new ray.Material();
          let p = ray.Origin;
          let eye = ray.Vector(0, 0, -1);
          let normal = ray.Vector(0, 0, -1);
          let light = new ray.LightPoint(ray.Point(0, 0, 10), ray.RGBColour(1, 1, 1));
          let result = ray.Render.lighting(m, light, p, eye, normal);
          if (result.equals(ray.RGBColour(0.1, 0.1, 0.1)) == false) return false;
          return true;
        }
      };
    }

  }

  ray.classlist.push(rCanvas);
  ray.classlist.push(rRender);
  ray.Canvas = rCanvas;
  ray.Render = new rRender();
})();
