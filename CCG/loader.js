// Game object is the main object that controls that whole game. 
// It's functions get filled in by the includes files. 
// For now, the loader only makes a load function available to boot up the game.
class modeBase
{
  constructor()
  {
  }

  activate()
  {
  }

  handleEvent(e)
  {
  }

  update()
  {
  }

  render()
  {
  }

  popupClose()
  {
  }
}

var Game = {};

(function () {
  // These are the source files that need including 
  var gameSrc = ["mouse.js", 
                 "main.js"];
  var loadState = 0; // how many files are left to include, so we know when we're done

  // the boot up entry point
  Game.loadApp = function ()
  {
    loadState = gameSrc.length;
    console.log("Boot up");
    for (i in gameSrc) include(gameSrc[i]);
  };

  // create a script tag for each file to include. When each one is loaded, check if we are done.
  function include(filename)
  {
    var head = document.getElementsByTagName("head")[0];
    var script = document.createElement("script");
    var loader = this;
    head.appendChild(script);
    script.onload = function () { handleLoaded(filename); };
    script.src = filename /* + "?version="+(new Date).getTime(); */
    script.type = "text/javascript";
  }

  // When a src file is loaded, this will check if we are done.
  function handleLoaded(filename) 
  {
    loadState -= 1;
    console.log(" " + filename + " loaded. " + loadState + " left");
    if (!loadState) main();
  }

  // launch the game using the Game object
  // the game first gets an init pass, then its run loop is started.
  function main()
  {
    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;
    console.log("Init");
    Game.init();
    console.log("Begin");
    window.requestAnimationFrame(Game.run);
  }

})();
