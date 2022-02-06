var Game = mx.Game;

Game.appLoadingError = function (name)
{
    console.log("Error loading "+name);
}

Game.appInit = function ()
{
  Game.textureLocation = "assets/";
}

Game.deviceReady = function ()
{
}

Game.loadingStart = function ()
{
}

Game.loadingStop = function ()
{
}

Game.appUpdate = function ()
{
  if (Game.loading) return;
  if (!Game.camera) return;
}

Game.appDrawAux = function ()
{
  if (Game.loading) return;
}

Game.appDraw = function (eye)
{
  if (Game.loading) return;
}

