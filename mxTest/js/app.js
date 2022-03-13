var Game = mx.Game;

Game.appLoadingError = function (name)
{
    console.log("Error loading "+name);
}

Game.appInit = function ()
{
  Game.textureLocation = "assets/";
  Game.loadInputFile("assets/controls.conf");
  Game.loadSkinFile("assets/CreditsBG.skin");
  Game.loadSkinFile("assets/DisconnectBG.skin");
  Game.loadSkinFile("assets/Elements.skin");
  Game.loadSkinFile("assets/Flubber.skin");
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

Game.handlePlayerConnected = function(player)
{
  mx.PlayerManager.assignConfigToPlayer(player, 1); // start with default keybindings
}