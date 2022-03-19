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

    Game.mouse = new Mouse(Game.canvas);
    Game.draw = new DrawTool(Game.context);
    Game.hand = new HandManager();

    Game.onResize();
    Tutorial.startAt(Game.startingStep);

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

let savedX = null;
let savedY = null;
Game.fireMouseEvent = function(type, mouse)
{
    if (type == MouseEvent.Up)
    {
        if (mouse.button == 1)
        {
            savedX = mouse.lastDownX;
            savedY = mouse.lastDownY;
            console.log("saved");
        }

        if (mouse.button == 0)
        {
            Tutorial.progress();
        }

        if (mouse.button == 2)
        {
            console.log("click at "+mouse.lastDownX+", "+mouse.lastDownY);
            if(savedX)
                console.log( "Game.draw.drawBubble("+(mouse.lastDownX/Game.draw.cardWidth)+", "+(mouse.lastDownY/Game.draw.cardHeight)+", [\"\"],"+(savedX/Game.draw.cardWidth)+", "+(savedY/Game.draw.cardHeight)+"); " );
            else
                console.log( "Game.draw.drawBubble("+(mouse.lastDownX/Game.draw.cardWidth)+", "+(mouse.lastDownY/Game.draw.cardHeight)+", [\"\"]); " );
            savedX = null;
            savedY = null;    
        }
    }

};

Game.update = function()
{
    Tutorial.update();
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
    Game.draw.drawHand();
    Tutorial.render();
};

Game.onResize = function() 
{
    // make sure canvas covers 100%
    if (Game.canvas.width != window.innerWidth) Game.canvas.width = window.innerWidth;
    if (Game.canvas.height != window.innerHeight) Game.canvas.height = window.innerHeight;
    //
    Game.draw.computeCardSize();
}
  
