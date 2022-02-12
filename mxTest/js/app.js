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
  let list = new mx.StringList("names");
  list.push("Bob");
  list.push("Dave");
  list.push("Bill");
  source.publish(list);
  lib.publish(source);
  lib.setDefault(new mx.String("PI", "You suck"));
  let wrap = lib.getData("PI");
  console.log(wrap.value);

  value.value = 9.8;
  console.log(wrap.value);

  let source2 = new mx.DataSource();
  let value2 = new mx.Float("PI", 666);
  source2.publish(value2);
  lib.publish(source2);
  console.log(wrap.value);
  
  source2.unpublish();
  console.log(wrap.value);

  wrap2 = lib.getData("names");
  for (let i = 0; i < wrap2.count; ++i)
  {
      let val = wrap2.value;
      console.log(val);
  }

  list.push("George");
  for (let i = 0; i < wrap2.count; ++i)
  {
      let val = wrap2.value;
      console.log(val);
  }

  let list2 = new mx.IntList("names");
  list2.push(1);
  list2.push(2);
  list2.push(3);
  source2.publish(list2);
  lib.publish(source2);
  for (let i = 0; i < wrap2.count; ++i)
  {
      let val = wrap2.value;
      console.log(val);
  }

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