var Game = mx.Game;

Game.appLoadingError = function (name)
{
    console.log("Error loading "+name);
}

Game.appInit = function ()
{
  Game.textureLocation = "assets/";
  Game.loadInputFile("assets/controls.conf");
}

Game.deviceReady = function ()
{
}

Game.loadingStart = function ()
{
}

Game.loadingStop = function ()
{
  let source = new mx.DataSource();
  let lib = mx.DataLibrary;
  let value = new mx.Float("PI", 3.1415);
  source.publish(value);
  lib.publish(source);
  lib.setDefault(new mx.String("PI", "You suck"));
  let wrap = lib.getData("PI");
  console.log(wrap.value);

  let source2 = new mx.DataSource();
  let value2 = new mx.Float("PI", 666);
  source2.publish(value2);
  lib.publish(source2);
  console.log(wrap.value2);
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