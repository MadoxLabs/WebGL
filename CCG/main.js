
const CardType = {
    Action: 0,
    System: 1,
    Crew: 2
}

class Card
{
    constructor()
    {
        this.name = "Default Name";
        this.type = CardType.Action;
        this.requires = [];
        this.effectText = [];

        this.hp=10;
        this.system = "Hull";
        this.power = 10;
    }
}


Game.init = function()
{
    Game.Ready = false; // are we ready to begin the run loop?

    Game.canvas = document.getElementById("surface");
    Game.context = Game.canvas.getContext("2d");

    document.getElementById("loading").style.display = "inline";
    document.getElementById("game").style.display = "none";

    window.addEventListener('resize', function(event) { if ( Game.onResize) Game.onResize(); }, true);    
    Game.onResize();
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

Game.postInit = function()
{
    document.getElementById("loading").style.display = "none";
    document.getElementById("game").style.display = "inline";

    Game.mouse = new Mouse(Game.canvas);

    Game.cardWidth = 200;
    Game.cardHeight = 300;
    Game.onResize();

    Game.Ready = true;
};

Game.fireMouseEvent = function(type, mouse)
{
    if (type == MouseEvent.Up)
    {
        step++;

        console.log("click at "+mouse.lastDownX+", "+mouse.lastDownY);
        console.log("thats a factor of  "+(mouse.lastDownX/Game.cardWidth)+", "+(mouse.lastDownY/Game.cardHeight));
    }

};

Game.update = function()
{
    if (Game.canvas.width != window.innerWidth) Game.canvas.width = window.innerWidth;
    if (Game.canvas.height != window.innerHeight) Game.canvas.height = window.innerHeight;
};

let step = 0;

Game.render = function()
{
    // clear
    Game.context.fillStyle = "#aaa";
    Game.context.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
    Game.context.strokeStyle = "black";
    Game.context.lineWidth = 2;
    Game.context.strokeRect(2, 2, Game.canvas.width - 4, Game.canvas.height - 4);

    // board
//    let cursorX = 10;
//    let cursorY = 10;
//    let stepOver = function() { cursorX += Game.cardWidth+10; }
//    let stepDown = function() { cursorY += Game.cardHeight+10; }
//    let crewDown = function() { cursorY += Game.cardHeight * 0.2 +10; }
//    let reset = function() { cursorX = 10; }
    Game.moveToCel(0,0); Game.drawZone("Enemy Ship System"); 
    Game.moveToCel(1,0); Game.drawZone("Enemy Ship System"); 
    Game.moveToCel(2,0); Game.drawZone("Enemy Ship System"); 
    Game.moveToCel(3,0); Game.drawZone("Enemy Ship System"); 
    Game.moveToCel(4,0); Game.drawZone("Enemy Ship System"); 
    Game.moveToCel(5,0); Game.drawZone("Enemy Portrait");    

    Game.moveToCel(2,1); Game.drawZone("Played Card");

    Game.moveToCel(0,2); Game.drawZone("My Ship System");
    Game.moveToCel(1,2); Game.drawZone("My Ship System"); 
    Game.moveToCel(2,2); Game.drawZone("My Ship System");
    Game.moveToCel(3,2); Game.drawZone("My Ship System");
    Game.moveToCel(4,2); Game.drawZone("My Ship System"); 

    Game.moveToCel(5,2);   Game.drawCrewZone();
    Game.moveToCel(5,2.25); Game.drawCrewZone();
    Game.moveToCel(5,2.5); Game.drawCrewZone(); 
    Game.moveToCel(5,2.75); Game.drawCrewZone(); 

    Game.moveToCel(0,3); Game.drawZone("My Hand"); 
    Game.moveToCel(1,3); Game.drawZone("My Hand"); 
    Game.moveToCel(2,3); Game.drawZone("My Hand"); 
    Game.moveToCel(4,3); Game.drawZone("My Deck");  

    Game.moveToCel(5,3); Game.drawZone("Active Crew");

    if (step == 0)
    {
        Game.drawBubble(4.7,1.6, ["This is the game board", "Click to see some cards"], 3.58, 1.63);
    }
    if (step > 0)
    {
        let card = new Card();
        card.name = "Small Fusion Reactor";
        card.type = CardType.System;
        card.system = "Power";
        card.power = 10;
        card.effectText = ["A basic power core", "Provides 10 power per turn"];
        Game.moveToCel(0,2);
        Game.drawCard(card);
    
        card = new Card();
        card.name = "FIRE!";
        card.type = CardType.Action;
        card.effectText = ["Fire one weapon system"];
        card.requires = [ "Weapon" ];
        Game.moveToCel(0,3);
        Game.drawCard(card);
    
        card = new Card();
        card.name = "Phaser Cannon";
        card.system = "Weapon";
        card.type = CardType.System;
        card.power = -2;
        card.effectText = ["A small phased energy cannon", "Damage: 5"];
        Game.moveToCel(1,2);
        Game.drawCard(card);    

        if (step == 1)
            Game.drawBubble(4.7,1.6, ["This is some cards"], 3.6, 2.0);

        if (step == 2)
           Game.drawBubble(4.7,1.6, ["That it for now"], 4.9,1.6);

    }
};

Game.moveToCel = function(x, y)
{
    Game.cursorX = 10 + (Game.cardWidth+10) * x;
    Game.cursorY = 10 + (Game.cardHeight+10) * y;
}

Game.drawBubble = function(x, y, _text, targetx, targety)
{
    x *= Game.cardWidth;
    y *= Game.cardHeight;
    targetx *= Game.cardWidth;
    targety *= Game.cardHeight;

    let text = _text;
    if (Array.isArray(text) == false)
    {
        text = [];
        text.push(_text);
    }

    Game.context.font = "15px Helvetica";

    let h = 30 + (20 * text.length);
    let w = 0;
    let radius = 20;

    for (let i in text)
    {
        let len = Game.context.measureText(text[i]).width + 40;
        if (len > w) w = len;
    }

    var r = x + w;
    var b = y + h;

    Game.context.beginPath();
    Game.context.fillStyle = "white";
    Game.context.fill();
    Game.context.strokeStyle = "black";
    Game.context.lineWidth = 2;
    Game.context.moveTo(x + radius, y);

    Game.context.lineTo(r - radius, y);
    Game.context.quadraticCurveTo(r, y, r, y + radius);
    Game.context.lineTo(r, y + h - radius);
    Game.context.quadraticCurveTo(r, b, r - radius, b);
    Game.context.lineTo(x + radius, b);
    Game.context.quadraticCurveTo(x, b, x, b - radius);
    Game.context.lineTo(x, y + radius);
    Game.context.quadraticCurveTo(x, y, x + radius, y);
    Game.context.fill();
    Game.context.stroke();
    Game.context.fillStyle = "#000";

    y += 30;
    for (let i in text)
    {
        Game.context.fillText(text[i], x + 20, y);
        y += 20;
    }

    Game.context.font = "12px Helvetica";
    Game.context.fillStyle = "green";
    let click = "<click>";
    let len = Game.context.measureText(click).width+5;
    Game.context.fillText(click, x + w - len, y-4);

    let targets = [];
    if (Array.isArray(targetx))
    {
        targets = targetx;
    }
    else
    {
        targets.push({x:targetx, y:targety});
    }

    for (let i in targets)
    {
        // point to the left?
        if (targets[i].x < x)
        {
            Game.context.beginPath();
            Game.context.moveTo(x + 2, y - h / 2 - 6);
            Game.context.lineTo(targets[i].x, targets[i].y);
            Game.context.lineTo(x + 2, y - h / 2 + 6);
            Game.context.closePath();
            Game.context.strokeStyle = "black";
            Game.context.stroke();
            Game.context.fillStyle = "white";
            Game.context.fill();

            Game.context.beginPath();
            Game.context.moveTo(x + 2, y - h / 2 - 6);
            Game.context.lineTo(x + 2, y - h / 2 + 6);
            Game.context.strokeStyle = "white";
            Game.context.stroke();
        }
        else if (targets[i].x > x + w)
        {
            Game.context.beginPath();
            Game.context.moveTo(x + w - 2, y - h / 2 - 6);
            Game.context.lineTo(targets[i].x, targets[i].y);
            Game.context.lineTo(x + w - 2, y - h / 2 + 6);
            Game.context.closePath();
            Game.context.strokeStyle = "black";
            Game.context.stroke();
            Game.context.fillStyle = "white";
            Game.context.fill();

            Game.context.beginPath();
            Game.context.moveTo(x + w - 3, y - h / 2 - 6);
            Game.context.lineTo(x + w - 3, y - h / 2 + 6);
            Game.context.strokeStyle = "white";
            Game.context.stroke();
        }
        else if (targets[i].y < y)
        {
            Game.context.beginPath();
            Game.context.moveTo(x + w / 2 - 6, y - h);
            Game.context.lineTo(targets[i].x, targets[i].y);
            Game.context.lineTo(x + w / 2 + 6, y - h);
            Game.context.closePath();
            Game.context.strokeStyle = "black";
            Game.context.stroke();
            Game.context.fillStyle = "white";
            Game.context.fill();

            Game.context.beginPath();
            Game.context.moveTo(x + w / 2 - 6, y - h);
            Game.context.lineTo(x + w / 2 + 6, y - h);
            Game.context.strokeStyle = "white";
            Game.context.stroke();
        }
        else
        {
            Game.context.beginPath();
            Game.context.moveTo(x + w / 2 - 6, y );
            Game.context.lineTo(targets[i].x, targets[i].y);
            Game.context.lineTo(x + w / 2 + 6, y );
            Game.context.closePath();
            Game.context.strokeStyle = "black";
            Game.context.stroke();
            Game.context.fillStyle = "white";
            Game.context.fill();

            Game.context.beginPath();
            Game.context.moveTo(x + w / 2 - 6, y );
            Game.context.lineTo(x + w / 2 + 6, y );
            Game.context.strokeStyle = "white";
            Game.context.stroke();

        }
    }
}

let SystemColours = {};
SystemColours["Hull"  ] ="#000";
SystemColours["Power" ] ="Yellow";
SystemColours["Weapon"] ="Red";
SystemColours["Nav"   ] ="Blue";
SystemColours["Action"] ="#000";

Game.setFontForText = function(_text, width, height)
{
    let text = _text;
    if (Array.isArray(text) == false)
    {
        text = [];
        text.push(_text);
    }

    // try all the fonts
    for (let s = 20; s > 5; --s)
    {
        Game.context.font = ""+s+"px Helvetica";

        if (height)
        {
            let h = s; //Game.context.measureText(text[0]).height;
            if (h >= height) continue;
        }

        let w = 0;
        for (let i in text)
        {
            let len = Game.context.measureText(text[i]).width;
            if (len > w) w = len;
        }
        if (w < width) return s;
    }    
    return 5;
}

Game.drawCard = function(card)
{
    let x = Game.cursorX;
    let y = Game.cursorY;
    let h = Game.cardHeight;
    let w = Game.cardWidth;
    let radius = w/10;
    var r = x + w;
    var b = y + h;

    let nameHeight = h * 0.13;
    let nameOffsetX = w * 0.05;
    let nameOffsetY = nameHeight * 0.8;
    let namePosX = x + nameOffsetX;
    let namePosY = y + nameOffsetY;
    let systemHeight = h * 0.1;
    let systemWidth = w * 0.5;
    let systemOffsetX = systemWidth * 0.1;
    let systemOffsetY = systemHeight * 0.3;
    let systemPosX = x + systemOffsetX;
    let systemPosY = b - systemOffsetY;
    let powerHeight = h * 0.1;
    let powerOffsetX = w * 0.05;
    let powerOffsetY = powerHeight * 0.8;
    let powerPosX = x + powerOffsetX;
    let powerPosY = y + nameHeight + powerOffsetY;
    let hpOffsetX = w * 0.05;
    let hpOffsetY = powerHeight * 0.8;
    let hpPosX = x + w/2 + hpOffsetX;
    let hpPosY = y + nameHeight + hpOffsetY;
    let effectOffsetX = w * 0.05;
    let effectPosX = x + effectOffsetX;
    let effectStepY = 0;
    let reqOffsetX = w * 0.05;
    let reqPosX = x + reqOffsetX;
    let reqStepY = 0;

    // background
    Game.context.beginPath();
    Game.context.fillStyle = "#fff";
    Game.context.strokeStyle = "#fff";
    Game.context.lineWidth = 2;
    Game.context.moveTo(x + radius, y);   
    Game.context.lineTo(r - radius, y);
    Game.context.quadraticCurveTo(r, y, r, y + radius);
    Game.context.lineTo(r, y + h - radius);
    Game.context.quadraticCurveTo(r, b, r - radius, b);
    Game.context.lineTo(x + radius, b);
    Game.context.quadraticCurveTo(x, b, x, b - radius);
    Game.context.lineTo(x, y + radius);
    Game.context.quadraticCurveTo(x, y, x + radius, y);
    Game.context.fill();

    // name area
    Game.context.beginPath();
    Game.context.fillStyle = "#add8e6";
    Game.context.strokeStyle = "#add8e6";
    Game.context.lineWidth = 2;
    Game.context.moveTo(x, y + radius);
    Game.context.quadraticCurveTo(x, y, x + radius, y);
    Game.context.lineTo(r - radius, y); // top
    Game.context.quadraticCurveTo(r, y, r, y + radius);
    Game.context.lineTo(r, y + nameHeight); // right edge
    Game.context.lineTo(x, y + nameHeight); // bottom
    Game.context.lineTo(x, y + radius); // left edge
    Game.context.fill();
    
    Game.setFontForText(card.name, w - nameOffsetX - nameOffsetX, nameHeight);
    Game.context.fillStyle = "#000";
    Game.context.fillText(card.name,namePosX, namePosY);

    // power / HP Area
    if (card.type == CardType.System)
    {
        Game.context.beginPath();
        Game.context.fillStyle = "#aaa";
        Game.context.strokeStyle = "#fff";
        Game.context.lineWidth = 2;
        Game.context.moveTo(x, y + nameHeight);
        Game.context.lineTo(r, y + nameHeight);
        Game.context.lineTo(r, y + nameHeight + powerHeight); 
        Game.context.lineTo(x, y + nameHeight + powerHeight);
        Game.context.fill();
        Game.context.moveTo(x + w/2, y + nameHeight);
        Game.context.lineTo(x + w/2, y + nameHeight + powerHeight);
        Game.context.stroke();
    
        let text = "";
        Game.context.fillStyle = card.type == CardType.Action ? "#fff": "#000";
        if (card.power < 0)
            text = ">>> " + (-1*card.power);
        else
            text = "<<< " + card.power;
        Game.setFontForText(text, w/2 - nameOffsetX - nameOffsetX, powerHeight);
        Game.context.fillText(text, powerPosX, powerPosY);
    
        text = "HP: "+card.hp;
        Game.setFontForText(text, w/2 - nameOffsetX - nameOffsetX, powerHeight);
        Game.context.fillStyle = card.type == CardType.Action ? "#fff": "#000";
        Game.context.fillText(text, hpPosX, hpPosY);    
    }

    // Requirement area
    reqStepY = Game.setFontForText(card.requires, w - nameOffsetX - nameOffsetX) * 1.1;
    let reqY = y + nameHeight + (card.type == CardType.System ? powerHeight : 0) + reqStepY;
    Game.context.fillStyle = "#aaa";
    Game.context.fillRect(x, reqY-reqStepY+2, w,  (reqStepY * card.requires.length));
    for (let i in card.requires)
    {        
        Game.context.fillStyle = "#000";
        Game.context.fillText(card.requires[i], reqPosX, reqY);    
        reqY += reqStepY;
    }

    // Effect area
    effectStepY = Game.setFontForText(card.effectText, w - nameOffsetX - nameOffsetX) * 1.1;

    let effectHeight = effectStepY * (card.effectText.length+1);
    Game.context.beginPath();
    Game.context.strokeStyle = "#000";
    Game.context.lineWidth = 2;
    Game.context.moveTo(x, b - systemHeight - effectHeight);
    Game.context.lineTo(r, b - systemHeight - effectHeight);
    Game.context.stroke();
    
    let effectY = b - systemHeight - effectHeight;
    for (let i in card.effectText)
    {        
        effectY += effectStepY;
        Game.context.fillStyle = "#000";
        Game.context.fillText(card.effectText[i], effectPosX, effectY);    
    }

    // border
    let c = card.type == CardType.Action ? SystemColours["Action"] : SystemColours[card.system];
    Game.context.beginPath();
    Game.context.strokeStyle = c;
    Game.context.fillStyle = c;
    Game.context.lineWidth = 2;
    Game.context.moveTo(x + radius, y);   
    Game.context.lineTo(r - radius, y);
    Game.context.quadraticCurveTo(r, y, r, y + radius);
    Game.context.lineTo(r, y + h - radius);
    Game.context.quadraticCurveTo(r, b, r - radius, b);
    Game.context.lineTo(x + radius, b);
    Game.context.quadraticCurveTo(x, b, x, b - radius);
    Game.context.lineTo(x, y + radius);
    Game.context.quadraticCurveTo(x, y, x + radius, y);
    Game.context.closePath();
    Game.context.stroke();

    // system name
    Game.context.beginPath();
    Game.context.fillStyle = c;
    Game.context.strokeStyle = c;
    Game.context.lineWidth = 2;
    Game.context.moveTo(x + radius, b);
    Game.context.quadraticCurveTo(x, b, x, b - radius);
    Game.context.lineTo(x, b - systemHeight);
    Game.context.lineTo(x + systemWidth, b - systemHeight);
    Game.context.lineTo(x + systemWidth, b);
    Game.context.fill();

    text = card.type == CardType.Action ? "Action" : card.system;
    Game.setFontForText(text, w/2 - nameOffsetX - nameOffsetX, systemHeight);
    Game.context.fillStyle = card.type == CardType.Action ? "#fff": "#000";
    Game.context.fillText(text, systemPosX, systemPosY);

}

Game.drawZone = function(label)
{
    let x = Game.cursorX;
    let y = Game.cursorY;
    let h = Game.cardHeight;
    let w = Game.cardWidth;
    let radius = w/10;
    var r = x + w;
    var b = y + h;

    let nameHeight = h * 0.24;
    let nameOffsetX = w * 0.05;
    let nameOffsetY = nameHeight * 0.6;
    let namePosX = x + nameOffsetX;
    let namePosY = y + nameOffsetY;

    Game.context.beginPath();
    Game.context.strokeStyle = "#000";
    Game.context.fillStyle = "#000";
    Game.context.lineWidth = 2;
    Game.context.moveTo(x + radius, y);   
    Game.context.lineTo(r - radius, y);
    Game.context.quadraticCurveTo(r, y, r, y + radius);
    Game.context.lineTo(r, y + h - radius);
    Game.context.quadraticCurveTo(r, b, r - radius, b);
    Game.context.lineTo(x + radius, b);
    Game.context.quadraticCurveTo(x, b, x, b - radius);
    Game.context.lineTo(x, y + radius);
    Game.context.quadraticCurveTo(x, y, x + radius, y);
    Game.context.closePath();
    Game.context.stroke();

    Game.setFontForText(label, w - nameOffsetX - nameOffsetX);
    Game.context.fillStyle = "#000";
    Game.context.fillText(label, namePosX, namePosY);
}

Game.drawCrewZone = function()
{
    let x = Game.cursorX;
    let y = Game.cursorY;
    let h = Game.cardHeight * 0.2;
    let w = Game.cardWidth;
    let radius = w/10;
    var r = x + w;
    var b = y + h;

    let nameHeight = h;
    let nameOffsetX = w * 0.05;
    let nameOffsetY = nameHeight * 0.8;
    let namePosX = x + nameOffsetX;
    let namePosY = y + nameOffsetY;

    Game.context.beginPath();
    Game.context.strokeStyle = "#000";
    Game.context.fillStyle = "#000";
    Game.context.lineWidth = 2;
    Game.context.moveTo(x + radius, y);   
    Game.context.lineTo(r - radius, y);
    Game.context.quadraticCurveTo(r, y, r, y + radius);
    Game.context.lineTo(r, y + h - radius);
    Game.context.quadraticCurveTo(r, b, r - radius, b);
    Game.context.lineTo(x + radius, b);
    Game.context.quadraticCurveTo(x, b, x, b - radius);
    Game.context.lineTo(x, y + radius);
    Game.context.quadraticCurveTo(x, y, x + radius, y);
    Game.context.closePath();
    Game.context.stroke();

    Game.setFontForText("Crew", w - nameOffsetX - nameOffsetX);
    Game.context.fillStyle = "#000";
    Game.context.fillText("Crew", namePosX, namePosY);
}

Game.onResize = function() 
{
    // 10 pixel margin
    let h = window.innerHeight - 50;
    let w = window.innerWidth - 70;

    let across = w/6;
    let down = h/4;

    // check using across
    let checkDown = across * 1.5;
    if (h/checkDown >= 4)
    {
        // we can use it
        Game.cardWidth = across;
        Game.cardHeight = checkDown;
        return;
    }
    // check using down
    let checkAcross = down / 1.5;
    if (w/checkAcross >= 6)
    {
        // we can use it
        Game.cardWidth = checkAcross;
        Game.cardHeight = down;
        return;
    }  
}
  
