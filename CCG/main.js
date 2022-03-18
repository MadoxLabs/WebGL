
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

    Game.Ready = true;
};

Game.fireMouseEvent = function(type, mouse)
{
    if (type == MouseEvent.Up)
    {
        step++;
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

//    Game.drawBubble(100, 60, ["Hello this is a test!", "This is the edge of the page"], 10, 30);
//    Game.drawBubble(400, 100, ["Look at this bubble", "Its great"], 300, 80);
//    Game.drawBubble(100, 200, ["Can we point up?"], 180, 120);
//    Game.drawBubble(300, 200, ["Can we point right?", "And down?!"], [ {x:500, y:220}, {x:300, y:320} ]);

    Game.drawZone(10,10,"Enemy Ship System");
    Game.drawZone(120,10,"Enemy Ship System");
    Game.drawZone(230,10,"Enemy Ship System");
    Game.drawZone(340,10,"Enemy Ship System");
    Game.drawZone(450,10,"Enemy Ship System");
    Game.drawZone(560,10,"Enemy Portrait");

    Game.drawZone(230, 170, "Played Card");

    Game.drawZone(10, 330,"My Ship System");
    Game.drawZone(120,330,"My Ship System");
    Game.drawZone(230,330,"My Ship System");
    Game.drawZone(340,330,"My Ship System");
    Game.drawZone(450,330,"My Ship System");

    Game.drawZone(10, 490,"My Hand");
    Game.drawZone(120,490,"My Hand");
    Game.drawZone(230,490,"My Hand");
    Game.drawZone(450,490,"My Deck");

    Game.drawZone(560,490,"Active Crew");

    Game.drawCrewZone(560,330);
    Game.drawCrewZone(560,380);
    Game.drawCrewZone(560,430);

    if (step == 0)
    {
        Game.drawBubble(600, 250, ["This is the game board", "Click to see some cards"], 300, 300);
    }
    if (step > 0)
    {
        let card = new Card();
        card.name = "Small Fusion Reactor";
        card.type = CardType.System;
        card.system = "Power";
        card.power = 10;
        card.effectText = ["A basic power core", "Provides 10 power per turn"];
        Game.drawCard(400, 400, card);
    
        card = new Card();
        card.name = "FIRE!";
        card.type = CardType.Action;
        card.effectText = ["Fire one weapon system"];
        card.requires = [ "Weapon" ];
        Game.drawCard(650, 400, card);
    
        card = new Card();
        card.name = "Phaser Cannon";
        card.system = "Weapon";
        card.type = CardType.System;
        card.power = -2;
        card.effectText = ["A small phased energy cannon", "Damage: 5"];
        Game.drawCard(150, 400, card);    

        if (step == 1)
            Game.drawBubble(400, 300, ["This is some cards"], 450, 400);

        if (step == 2)
           Game.drawBubble(400, 300, ["That it for now"], 450, 300);

    }
};

Game.drawBubble = function(x, y, _text, targetx, targety)
{
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

Game.setFontForText = function(_text, width)
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

Game.drawCard = function(x, y, card)
{
    let h = 300;
    let w = 200;
    let radius = w/10;
    var r = x + w;
    var b = y + h;

    let nameHeight = 40;
    let nameOffsetX = w * 0.05;
    let nameOffsetY = nameHeight * 0.6;
    let namePosX = x + nameOffsetX;
    let namePosY = y + nameOffsetY;
    let systemHeight = 30;
    let systemWidth = w * 0.5;
    let systemOffsetX = systemWidth * 0.1;
    let systemOffsetY = systemHeight * 0.3;
    let systemPosX = x + systemOffsetX;
    let systemPosY = b - systemOffsetY;
    let powerHeight = 30;
    let powerOffsetX = w * 0.05;
    let powerOffsetY = powerHeight * 0.6;
    let powerPosX = x + powerOffsetX;
    let powerPosY = y + nameHeight + powerOffsetY;
    let hpOffsetX = w * 0.05;
    let hpOffsetY = powerHeight * 0.6;
    let hpPosX = x + w/2 + hpOffsetX;
    let hpPosY = y + nameHeight + hpOffsetY;
    let effectOffsetX = w * 0.05;
    let effectPosX = x + effectOffsetX;
    let effectStepY = 20;
    let reqOffsetX = w * 0.05;
    let reqPosX = x + reqOffsetX;
    let reqStepY = 20;

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
    
    Game.setFontForText(card.name, w - nameOffsetX - nameOffsetX);
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
        Game.setFontForText(text, w/2 - nameOffsetX - nameOffsetX);
        Game.context.fillText(text, powerPosX, powerPosY);
    
        text = "HP: "+card.hp;
        Game.setFontForText(text, w/2 - nameOffsetX - nameOffsetX);
        Game.context.fillStyle = card.type == CardType.Action ? "#fff": "#000";
        Game.context.fillText(text, hpPosX, hpPosY);    
    }

    // Requirement area
    reqStepY = Game.setFontForText(card.requires, w - nameOffsetX - nameOffsetX);
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
    effectStepY = Game.setFontForText(card.effectText, w - nameOffsetX - nameOffsetX);

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
    Game.setFontForText(text, w/2 - nameOffsetX - nameOffsetX);
    Game.context.fillStyle = card.type == CardType.Action ? "#fff": "#000";
    Game.context.fillText(text, systemPosX, systemPosY);

}

Game.drawZone = function(x, y, label)
{
    let h = 150;
    let w = 100;
    let radius = w/10;
    var r = x + w;
    var b = y + h;

    let nameHeight = 40;
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

Game.drawCrewZone = function(x, y)
{
    let h = 40;
    let w = 100;
    let radius = w/10;
    var r = x + w;
    var b = y + h;

    let nameHeight = 40;
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

    Game.setFontForText("Crew", w - nameOffsetX - nameOffsetX);
    Game.context.fillStyle = "#000";
    Game.context.fillText("Crew", namePosX, namePosY);
}