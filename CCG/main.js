Game.init = function()
{
    Game.Ready = false; // are we ready to begin the run loop?

    Game.canvas = document.getElementById("surface");
    Game.context = Game.canvas.getContext("2d");

    document.getElementById("loading").style.display = "inline";
    document.getElementById("game").style.display = "none";

    window.addEventListener('resize', function(event) { if ( Game.onResize) Game.onResize(); }, true);    
};

Game.postInit = function()
{
    document.getElementById("loading").style.display = "none";
    document.getElementById("game").style.display = "inline";

    Game.tutorialStep = 0;
    Game.mouse = new Mouse(Game.canvas);
    Game.draw = new DrawTool(Game.context);

    Game.onResize();

    Game.Ready = true;
};

Game.run = function()
{
    if (!Game.Ready)
    {
        Game.postInit();
    }
    else
    {
        Game.update();
        Game.render();
    }
    window.requestAnimationFrame(Game.run);
};

Game.fireMouseEvent = function(type, mouse)
{
    if (type == MouseEvent.Up)
    {
        Game.tutorialStep++;

        console.log("click at "+mouse.lastDownX+", "+mouse.lastDownY);
        console.log("thats a factor of  "+(mouse.lastDownX/Game.cardWidth)+", "+(mouse.lastDownY/Game.cardHeight));
    }

};

Game.update = function()
{
};

Game.render = function()
{
    // clear
    Game.context.fillStyle = "#aaa";
    Game.context.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
    Game.context.strokeStyle = "black";
    Game.context.lineWidth = 2;
    Game.context.strokeRect(2, 2, Game.canvas.width - 4, Game.canvas.height - 4);

    Game.draw.drawBoard();

    if (Game.tutorialStep == 0)
    {
        Game.draw.drawBubble(4.7,1.6, ["This is the game board", "Click to see some cards"]);
    }
    if (Game.tutorialStep > 0)
    {
        Game.draw.moveToCel(0,2);
        Game.draw.drawCard(cards[1000]);
        Game.draw.moveToCel(0,3);
        Game.draw.drawCard(cards[1001]);
        Game.draw.moveToCel(1,2);
        Game.draw.drawCard(cards[1002]);    

        if (Game.tutorialStep == 1)
            Game.draw.drawBubble(3.6, 1.7, ["This is some cards"], 2.15, 2.11);

        if (Game.tutorialStep == 2)
           Game.draw.drawBubble(4.7,1.6, ["That it for now"]                  );
    }
};


Game.onResize = function() 
{
    // make sure canvas covers 100%
    if (Game.canvas.width != window.innerWidth) Game.canvas.width = window.innerWidth;
    if (Game.canvas.height != window.innerHeight) Game.canvas.height = window.innerHeight;
    //
    Game.draw.computeCardSize();
}
  
