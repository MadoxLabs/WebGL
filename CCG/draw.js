let SystemColours = {};
SystemColours[SystemTypes.Hull] = "#000";
SystemColours[SystemTypes.Power] = "Yellow";
SystemColours[SystemTypes.Weapon] = "Red";
SystemColours[SystemTypes.Nav] = "Blue";
SystemColours["Action"] = "#000";

class DrawTool
{
    constructor(context)
    {
        this.context = context;
        this.cardWidth = 200;
        this.cardHeight = 300;
    }

    computeCardSize()
    {
        // 10 pixel margin
        let h = window.innerHeight - 50;
        let w = window.innerWidth - 70;

        let across = w / 6;
        let down = h / 4;

        // check using across
        let checkDown = across * 1.5;
        if (h / checkDown >= 4)
        {
            // we can use it
            this.cardWidth = across;
            this.cardHeight = checkDown;
            return;
        }
        // check using down
        let checkAcross = down / 1.5;
        if (w / checkAcross >= 6)
        {
            // we can use it
            this.cardWidth = checkAcross;
            this.cardHeight = down;
            return;
        }
    }

    drawBoard()
    {        
        // board
        this.moveToCel(0,0); this.drawZone("Enemy Ship System"); 
        this.moveToCel(1,0); this.drawZone("Enemy Ship System"); 
        this.moveToCel(2,0); this.drawZone("Enemy Ship System"); 
        this.moveToCel(3,0); this.drawZone("Enemy Ship System"); 
        this.moveToCel(4,0); this.drawZone("Enemy Ship System"); 
        this.moveToCel(5,0); this.drawZone("Enemy Portrait");    
    
        this.moveToCel(2,1); this.drawZone("Played Card");
    
        this.moveToCel(0,2); this.drawZone("My Ship System");
        this.moveToCel(1,2); this.drawZone("My Ship System"); 
        this.moveToCel(2,2); this.drawZone("My Ship System");
        this.moveToCel(3,2); this.drawZone("My Ship System");
        this.moveToCel(4,2); this.drawZone("My Ship System"); 
    
        this.moveToCel(5,2);   this.drawCrewZone();
        this.moveToCel(5,2.25); this.drawCrewZone();
        this.moveToCel(5,2.5); this.drawCrewZone(); 
        this.moveToCel(5,2.75); this.drawCrewZone(); 
    
        this.moveToCel(0,3); this.drawZone("My Hand"); 
        this.moveToCel(1,3); this.drawZone("My Hand"); 
        this.moveToCel(2,3); this.drawZone("My Hand"); 
        this.moveToCel(4,3); this.drawZone("My Deck");  
    
        this.moveToCel(5,3); this.drawZone("Active Crew");
    }
    
    moveToCel(x, y)
    {
        this.cursorX = 10 + (this.cardWidth + 10) * x;
        this.cursorY = 10 + (this.cardHeight + 10) * y;
    }

    drawBubble(x, y, _text, targetx, targety)
    {
        x *= this.cardWidth;
        y *= this.cardHeight;
        targetx *= this.cardWidth;
        targety *= this.cardHeight;

        let text = _text;
        if (Array.isArray(text) == false)
        {
            text = [];
            text.push(_text);
        }

        this.context.font = "15px Helvetica";

        let h = 30 + (20 * text.length);
        let w = 0;
        let radius = 20;

        for (let i in text)
        {
            let len = this.context.measureText(text[i]).width + 40;
            if (len > w) w = len;
        }

        var r = x + w;
        var b = y + h;

        this.context.beginPath();
        this.context.fillStyle = "white";
        this.context.fill();
        this.context.strokeStyle = "black";
        this.context.lineWidth = 2;
        this.context.moveTo(x + radius, y);

        this.context.lineTo(r - radius, y);
        this.context.quadraticCurveTo(r, y, r, y + radius);
        this.context.lineTo(r, y + h - radius);
        this.context.quadraticCurveTo(r, b, r - radius, b);
        this.context.lineTo(x + radius, b);
        this.context.quadraticCurveTo(x, b, x, b - radius);
        this.context.lineTo(x, y + radius);
        this.context.quadraticCurveTo(x, y, x + radius, y);
        this.context.fill();
        this.context.stroke();
        this.context.fillStyle = "#000";

        y += 30;
        for (let i in text)
        {
            this.context.fillText(text[i], x + 20, y);
            y += 20;
        }

        this.context.font = "12px Helvetica";
        this.context.fillStyle = "green";
        let click = "<click>";
        let len = this.context.measureText(click).width + 5;
        this.context.fillText(click, x + w - len, y - 4);

        if (!targetx) return;

        let targets = [];
        if (Array.isArray(targetx))
        {
            targets = targetx;
        }
        else
        {
            targets.push(
            {
                x: targetx,
                y: targety
            });
        }

        for (let i in targets)
        {
            // point to the left?
            if (targets[i].x < x)
            {
                this.context.beginPath();
                this.context.moveTo(x + 2, y - h / 2 - 6);
                this.context.lineTo(targets[i].x, targets[i].y);
                this.context.lineTo(x + 2, y - h / 2 + 6);
                this.context.closePath();
                this.context.strokeStyle = "black";
                this.context.stroke();
                this.context.fillStyle = "white";
                this.context.fill();

                this.context.beginPath();
                this.context.moveTo(x + 2, y - h / 2 - 6);
                this.context.lineTo(x + 2, y - h / 2 + 6);
                this.context.strokeStyle = "white";
                this.context.stroke();
            }
            else if (targets[i].x > x + w)
            {
                this.context.beginPath();
                this.context.moveTo(x + w - 2, y - h / 2 - 6);
                this.context.lineTo(targets[i].x, targets[i].y);
                this.context.lineTo(x + w - 2, y - h / 2 + 6);
                this.context.closePath();
                this.context.strokeStyle = "black";
                this.context.stroke();
                this.context.fillStyle = "white";
                this.context.fill();

                this.context.beginPath();
                this.context.moveTo(x + w - 3, y - h / 2 - 6);
                this.context.lineTo(x + w - 3, y - h / 2 + 6);
                this.context.strokeStyle = "white";
                this.context.stroke();
            }
            else if (targets[i].y < y)
            {
                this.context.beginPath();
                this.context.moveTo(x + w / 2 - 6, y - h);
                this.context.lineTo(targets[i].x, targets[i].y);
                this.context.lineTo(x + w / 2 + 6, y - h);
                this.context.closePath();
                this.context.strokeStyle = "black";
                this.context.stroke();
                this.context.fillStyle = "white";
                this.context.fill();

                this.context.beginPath();
                this.context.moveTo(x + w / 2 - 6, y - h);
                this.context.lineTo(x + w / 2 + 6, y - h);
                this.context.strokeStyle = "white";
                this.context.stroke();
            }
            else
            {
                this.context.beginPath();
                this.context.moveTo(x + w / 2 - 6, y);
                this.context.lineTo(targets[i].x, targets[i].y);
                this.context.lineTo(x + w / 2 + 6, y);
                this.context.closePath();
                this.context.strokeStyle = "black";
                this.context.stroke();
                this.context.fillStyle = "white";
                this.context.fill();

                this.context.beginPath();
                this.context.moveTo(x + w / 2 - 6, y);
                this.context.lineTo(x + w / 2 + 6, y);
                this.context.strokeStyle = "white";
                this.context.stroke();

            }
        }
    }

    setFontForText(_text, width, height)
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
            this.context.font = "" + s + "px Helvetica";

            if (height)
            {
                let h = s; //this.context.measureText(text[0]).height;
                if (h >= height) continue;
            }

            let w = 0;
            for (let i in text)
            {
                let len = this.context.measureText(text[i]).width;
                if (len > w) w = len;
            }
            if (w < width) return s;
        }
        return 5;
    }

    drawCard(card)
    {
        let x = this.cursorX;
        let y = this.cursorY;
        let h = this.cardHeight;
        let w = this.cardWidth;
        let radius = w / 10;
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
        let hpPosX = x + w / 2 + hpOffsetX;
        let hpPosY = y + nameHeight + hpOffsetY;
        let effectOffsetX = w * 0.05;
        let effectPosX = x + effectOffsetX;
        let effectStepY = 0;
        let reqOffsetX = w * 0.05;
        let reqPosX = x + reqOffsetX;
        let reqStepY = 0;

        // background
        this.context.beginPath();
        this.context.fillStyle = "#fff";
        this.context.strokeStyle = "#fff";
        this.context.lineWidth = 2;
        this.context.moveTo(x + radius, y);
        this.context.lineTo(r - radius, y);
        this.context.quadraticCurveTo(r, y, r, y + radius);
        this.context.lineTo(r, y + h - radius);
        this.context.quadraticCurveTo(r, b, r - radius, b);
        this.context.lineTo(x + radius, b);
        this.context.quadraticCurveTo(x, b, x, b - radius);
        this.context.lineTo(x, y + radius);
        this.context.quadraticCurveTo(x, y, x + radius, y);
        this.context.fill();

        // name area
        this.context.beginPath();
        this.context.fillStyle = "#add8e6";
        this.context.strokeStyle = "#add8e6";
        this.context.lineWidth = 2;
        this.context.moveTo(x, y + radius);
        this.context.quadraticCurveTo(x, y, x + radius, y);
        this.context.lineTo(r - radius, y); // top
        this.context.quadraticCurveTo(r, y, r, y + radius);
        this.context.lineTo(r, y + nameHeight); // right edge
        this.context.lineTo(x, y + nameHeight); // bottom
        this.context.lineTo(x, y + radius); // left edge
        this.context.fill();

        this.setFontForText(card.name, w - nameOffsetX - nameOffsetX, nameHeight);
        this.context.fillStyle = "#000";
        this.context.fillText(card.name, namePosX, namePosY);

        // power / HP Area
        if (card.type == CardType.System)
        {
            this.context.beginPath();
            this.context.fillStyle = "#aaa";
            this.context.strokeStyle = "#fff";
            this.context.lineWidth = 2;
            this.context.moveTo(x, y + nameHeight);
            this.context.lineTo(r, y + nameHeight);
            this.context.lineTo(r, y + nameHeight + powerHeight);
            this.context.lineTo(x, y + nameHeight + powerHeight);
            this.context.fill();
            this.context.moveTo(x + w / 2, y + nameHeight);
            this.context.lineTo(x + w / 2, y + nameHeight + powerHeight);
            this.context.stroke();

            let text = "";
            this.context.fillStyle = card.type == CardType.Action ? "#fff" : "#000";
            if (card.power < 0)
                text = ">>> " + (-1 * card.power);
            else
                text = "<<< " + card.power;
            this.setFontForText(text, w / 2 - nameOffsetX - nameOffsetX, powerHeight);
            this.context.fillText(text, powerPosX, powerPosY);

            text = "HP: " + card.hp;
            this.setFontForText(text, w / 2 - nameOffsetX - nameOffsetX, powerHeight);
            this.context.fillStyle = card.type == CardType.Action ? "#fff" : "#000";
            this.context.fillText(text, hpPosX, hpPosY);
        }

        // Requirement area
        reqStepY = this.setFontForText(card.requires, w - nameOffsetX - nameOffsetX) * 1.1;
        let reqY = y + nameHeight + (card.type == CardType.System ? powerHeight : 0) + reqStepY;
        this.context.fillStyle = "#aaa";
        this.context.fillRect(x, reqY - reqStepY + 2, w, (reqStepY * card.requires.length));
        for (let i in card.requires)
        {
            this.context.fillStyle = "#000";
            this.context.fillText(card.requires[i], reqPosX, reqY);
            reqY += reqStepY;
        }

        // Effect area
        effectStepY = this.setFontForText(card.effectText, w - nameOffsetX - nameOffsetX) * 1.1;

        let effectHeight = effectStepY * (card.effectText.length + 1);
        this.context.beginPath();
        this.context.strokeStyle = "#000";
        this.context.lineWidth = 2;
        this.context.moveTo(x, b - systemHeight - effectHeight);
        this.context.lineTo(r, b - systemHeight - effectHeight);
        this.context.stroke();

        let effectY = b - systemHeight - effectHeight;
        for (let i in card.effectText)
        {
            effectY += effectStepY;
            this.context.fillStyle = "#000";
            this.context.fillText(card.effectText[i], effectPosX, effectY);
        }

        // border
        let c = card.type == CardType.Action ? SystemColours["Action"] : SystemColours[card.system];
        this.context.beginPath();
        this.context.strokeStyle = c;
        this.context.fillStyle = c;
        this.context.lineWidth = 2;
        this.context.moveTo(x + radius, y);
        this.context.lineTo(r - radius, y);
        this.context.quadraticCurveTo(r, y, r, y + radius);
        this.context.lineTo(r, y + h - radius);
        this.context.quadraticCurveTo(r, b, r - radius, b);
        this.context.lineTo(x + radius, b);
        this.context.quadraticCurveTo(x, b, x, b - radius);
        this.context.lineTo(x, y + radius);
        this.context.quadraticCurveTo(x, y, x + radius, y);
        this.context.closePath();
        this.context.stroke();

        // system name
        this.context.beginPath();
        this.context.fillStyle = c;
        this.context.strokeStyle = c;
        this.context.lineWidth = 2;
        this.context.moveTo(x + radius, b);
        this.context.quadraticCurveTo(x, b, x, b - radius);
        this.context.lineTo(x, b - systemHeight);
        this.context.lineTo(x + systemWidth, b - systemHeight);
        this.context.lineTo(x + systemWidth, b);
        this.context.fill();

        let text = card.type == CardType.Action ? "Action" : SystemNames[card.system];
        this.setFontForText(text, w / 2 - nameOffsetX - nameOffsetX, systemHeight);
        this.context.fillStyle = card.type == CardType.Action ? "#fff" : "#000";
        this.context.fillText(text, systemPosX, systemPosY);

    }

    drawZone(label)
    {
        let x = this.cursorX;
        let y = this.cursorY;
        let h = this.cardHeight;
        let w = this.cardWidth;
        let radius = w / 10;
        var r = x + w;
        var b = y + h;

        let nameHeight = h * 0.24;
        let nameOffsetX = w * 0.05;
        let nameOffsetY = nameHeight * 0.6;
        let namePosX = x + nameOffsetX;
        let namePosY = y + nameOffsetY;

        this.context.beginPath();
        this.context.strokeStyle = "#000";
        this.context.fillStyle = "#000";
        this.context.lineWidth = 2;
        this.context.moveTo(x + radius, y);
        this.context.lineTo(r - radius, y);
        this.context.quadraticCurveTo(r, y, r, y + radius);
        this.context.lineTo(r, y + h - radius);
        this.context.quadraticCurveTo(r, b, r - radius, b);
        this.context.lineTo(x + radius, b);
        this.context.quadraticCurveTo(x, b, x, b - radius);
        this.context.lineTo(x, y + radius);
        this.context.quadraticCurveTo(x, y, x + radius, y);
        this.context.closePath();
        this.context.stroke();

        this.setFontForText(label, w - nameOffsetX - nameOffsetX);
        this.context.fillStyle = "#000";
        this.context.fillText(label, namePosX, namePosY);
    }

    drawCrewZone()
    {
        let x = this.cursorX;
        let y = this.cursorY;
        let h = this.cardHeight * 0.2;
        let w = this.cardWidth;
        let radius = w / 10;
        var r = x + w;
        var b = y + h;

        let nameHeight = h;
        let nameOffsetX = w * 0.05;
        let nameOffsetY = nameHeight * 0.8;
        let namePosX = x + nameOffsetX;
        let namePosY = y + nameOffsetY;

        this.context.beginPath();
        this.context.strokeStyle = "#000";
        this.context.fillStyle = "#000";
        this.context.lineWidth = 2;
        this.context.moveTo(x + radius, y);
        this.context.lineTo(r - radius, y);
        this.context.quadraticCurveTo(r, y, r, y + radius);
        this.context.lineTo(r, y + h - radius);
        this.context.quadraticCurveTo(r, b, r - radius, b);
        this.context.lineTo(x + radius, b);
        this.context.quadraticCurveTo(x, b, x, b - radius);
        this.context.lineTo(x, y + radius);
        this.context.quadraticCurveTo(x, y, x + radius, y);
        this.context.closePath();
        this.context.stroke();

        this.setFontForText("Crew", w - nameOffsetX - nameOffsetX);
        this.context.fillStyle = "#000";
        this.context.fillText("Crew", namePosX, namePosY);
    }

}
