
var Sides = { 'None': 0, 'Top': 1, 'Bottom': 2, 'Left': 4, 'Right': 8 };

function wtSquare(x,y,o)     // a section of the wang texture file, it holds 4x4 squares
{
  this.X = x;                // uv coords
  this.Y = y;
  this.Oranges = o;          // bitmap of how many sides are orange
}

function WangTiles()
{
  // set up the 4x4 squares of the texture map
  this.squares = [];
  this.squares.push(new wtSquare(0.0 / 4.0, 0.0 / 4.0, Sides.Left | Sides.Top | Sides.Right));
  this.squares.push(new wtSquare(1.0 / 4.0, 0.0 / 4.0, Sides.Left | Sides.Top));
  this.squares.push(new wtSquare(2.0 / 4.0, 0.0 / 4.0, Sides.Top));
  this.squares.push(new wtSquare(3.0 / 4.0, 0.0 / 4.0, Sides.Top | Sides.Right));

  this.squares.push(new wtSquare(0.0 / 4.0, 1.0 / 4.0, Sides.Left | Sides.Right));
  this.squares.push(new wtSquare(1.0 / 4.0, 1.0 / 4.0, Sides.Left));
  this.squares.push(new wtSquare(2.0 / 4.0, 1.0 / 4.0, Sides.None));
  this.squares.push(new wtSquare(3.0 / 4.0, 1.0 / 4.0, Sides.Right));

  this.squares.push(new wtSquare(0.0 / 4.0, 2.0 / 4.0, Sides.Left | Sides.Bottom | Sides.Right));
  this.squares.push(new wtSquare(1.0 / 4.0, 2.0 / 4.0, Sides.Left | Sides.Bottom));
  this.squares.push(new wtSquare(2.0 / 4.0, 2.0 / 4.0, Sides.Bottom));
  this.squares.push(new wtSquare(3.0 / 4.0, 2.0 / 4.0, Sides.Bottom | Sides.Right));

  this.squares.push(new wtSquare(0.0 / 4.0, 3.0 / 4.0, Sides.Top | Sides.Left | Sides.Bottom | Sides.Right));
  this.squares.push(new wtSquare(1.0 / 4.0, 3.0 / 4.0, Sides.Top | Sides.Left | Sides.Bottom));
  this.squares.push(new wtSquare(2.0 / 4.0, 3.0 / 4.0, Sides.Top | Sides.Bottom));
  this.squares.push(new wtSquare(3.0 / 4.0, 3.0 / 4.0, Sides.Top | Sides.Bottom | Sides.Right));
}

// e's are 0 or 1 for orange/blue
// e1 = left/top
// e2 = right/bottom
WangTiles.prototype.TileIndexX = function(e1, e2)
{
  var result;
  if (e1 < e2) result = 1;
  else if (e1 == e2)
  {
    if (e1 > 0) result = 2;
    else result = 0;
  }
  else result = 3;
  return result;
}

WangTiles.prototype.TileIndexY = function(e1, e2)
{
  var result;
  if (e1 < e2) result = 0;
  else if (e1 == e2)
  {
    if (e1 > 0) result = 1;
    else result = 3;
  }
  else result = 2;
  return result;
}

WangTiles.prototype.Create = function(x, y)
{
  var r = new mxRand();
  var map = [];          // an arrangemnt of pointers to the square array, stores our arrangement
  var outmap = new Float32Array(x*y*2);       // float array for making a texture

  var index = 0;
  for (var j = 0; j < y; ++j)
  {
    for (var i = 0; i < x; ++i)
    {
      var top = 1, left = 1, right = 0, bottom = 0;    // start with top and left orange

      if (j == 0) top = 0;                                                              // top row is always top orange
      else if ((map[(j - 1) * x + i].Oranges & Sides.Bottom) == Sides.Bottom) top = 0;  // top orange if the one above has bottom orange
      if (i == 0) left = 0;                                                             // left col is always left orange
      else if ((map[j * x + (i - 1)].Oranges & Sides.Right) == Sides.Right) left = 0;   // left orange if the one beside is right orange

      if (j == y - 1) bottom = 0;  // bottom row always bottom orange
      else bottom = (r.pop() * 2)|0;     // else random
      if (i == x - 1) right = 0;
      else right = (r.pop() * 2)|0;

      map[j * x + i] = this.squares[this.TileIndexY(top, bottom) * 4 + this.TileIndexX(left, right)];
      outmap[index++] = (map[j * x + i].X);
      outmap[index++] = (map[j * x + i].Y);
    }
  }
  return outmap;
}
