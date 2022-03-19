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
  var gameSrc1 = [
                  "cards.js",                 
                 ];
  var gameSrc2 = [
                  "hand.js",
                  "mouse.js", 
                  "draw.js",
                  "tutorial.js",
                 ];
  var gameSrc3 = ["main.js"];
  var loadState = 0; // how many files are left to include, so we know when we're done
  var step = 1;

  Game.startTutorial = function(num)
  {
    Game.startingStep = num;
    Game.loadApp();
  }

  // the boot up entry point
  Game.loadApp = function ()
  {
    console.log("Boot up");

    loadState = gameSrc1.length;
    for (i in gameSrc1) include(gameSrc1[i]);
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
    if (!loadState) 
    {
      if (step == 1)
      {
        loadState = gameSrc2.length;
        for (i in gameSrc2) include(gameSrc2[i]);
        step = 2;    
      }
      else if (step == 2)
      {
        loadState = gameSrc3.length;
        for (i in gameSrc3) include(gameSrc3[i]);
        step = 3;    
      }
      else
        main();
    }
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
