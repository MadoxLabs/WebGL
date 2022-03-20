let SystemColours = {};
SystemColours[SystemTypes.Hull] = "#cccccc";
SystemColours[SystemTypes.Power] = "#ffff00";
SystemColours[SystemTypes.Weapon] = "#ff0000";
SystemColours[SystemTypes.Nav] = "#0000ff";
SystemColours[CardType.Action] = "#000000";
SystemColours[CardType.Crew] = "#ff9966";

class AffectLine
{
    constructor(fromx, fromy, tox, toy, c)
    {
        this.fromCelX = fromx;
        this.fromCelY = fromy;
        this.toCelX = tox;
        this.toCelY = toy;
        this.colour = c;
        this.step = 0;
        this.done = false;
        this.startTime = window.performance.now();
    }

    update()
    {
        if (this.done) return;

        let now = window.performance.now();
        let elapsed = now - this.startTime;
        if (elapsed > 300) 
        {
            this.step++;
            this.startTime = now;
            if (this.step == 2)
            {
                this.done = true;
                return;
            }
        }

        if (this.step < 2)
        {
            let width = (this.step == 1) ? 4 : 1 * (elapsed / 50);

            Game.draw.context.beginPath();
            Game.draw.context.fillStyle = this.colour;
            Game.draw.context.strokeStyle = this.colour;
            Game.draw.context.lineWidth = width;
    
            let x = 10 + (Game.draw.cardWidth + 10) * this.fromCelX;
            let y = 10 + (Game.draw.cardHeight + 10) * this.fromCelY;
            Game.draw.context.moveTo(x, y);
    
            x = 10 + (Game.draw.cardWidth + 10) * this.toCelX;
            y = 10 + (Game.draw.cardHeight + 10) * this.toCelY;
            Game.draw.context.lineTo(x, y);
    
            Game.draw.context.stroke();            
        }
        if (this.step == 1)
        {
            let x = 10 + (Game.draw.cardWidth + 10) * Math.floor(this.toCelX);
            let y = 10 + (Game.draw.cardHeight + 10) * Math.floor(this.toCelY);
            let h = Game.draw.cardHeight;
            let w = Game.draw.cardWidth;
            let radius = w / 10;
            var r = x + w;
            var b = y + h;
        
            Game.draw.context.beginPath();
            Game.draw.context.strokeStyle = this.colour;
            Game.draw.context.fillStyle = this.colour;
            Game.draw.context.lineWidth = 2;
            Game.draw.context.moveTo(x + radius, y);
            Game.draw.context.lineTo(r - radius, y);
            Game.draw.context.quadraticCurveTo(r, y, r, y + radius);
            Game.draw.context.lineTo(r, y + h - radius);
            Game.draw.context.quadraticCurveTo(r, b, r - radius, b);
            Game.draw.context.lineTo(x + radius, b);
            Game.draw.context.quadraticCurveTo(x, b, x, b - radius);
            Game.draw.context.lineTo(x, y + radius);
            Game.draw.context.quadraticCurveTo(x, y, x + radius, y);
            Game.draw.context.closePath();
            Game.draw.context.fill();
            Game.draw.context.stroke();
        }
    }
}

class CardInMotion
{
    constructor()
    {
        this.fromCelX = 0;
        this.fromCelY = 0;
        this.toCelX = 0;
        this.toCelY = 0;
        this.drawCall = null;
        this.callback = null;

        this.startTime = window.performance.now();
        this.duration = 1000.0;
        this.done = false;
    }

    computeDuration()
    {
        let xlen = Math.abs( this.fromCelX - this.toCelX);
        let ylen = Math.abs( this.fromCelY - this.toCelY);
        let len = Math.sqrt(xlen*xlen + ylen*ylen);
        this.duration = 500.0 * len / 6.0;
    }

    update()
    {
        if (this.done) return;

        let now = window.performance.now();
        let elapsed = now - this.startTime;
        if (this.duration - elapsed < 0) 
        {
            this.done = true;
            if (this.callback) this.callback();
            return;
        }

        let factor = elapsed / this.duration;
        let x = this.fromCelX - (this.fromCelX - this.toCelX) * factor;
        let y = this.fromCelY - (this.fromCelY - this.toCelY) * factor;
        Game.draw.moveToCel(x,y);
        this.drawCall();
    }
}

class DrawTool
{
    constructor(context)
    {
        this.context = context;
        this.cardWidth = 200;
        this.cardHeight = 300;

        this.inMotion = [];
    }

    createFacedownPattern()
    {
        // Create a pattern, offscreen
        const patternCanvas = document.createElement('canvas');
        const patternContext = patternCanvas.getContext('2d');

        // Give the pattern a width and height of 50
        patternCanvas.width = 50;
        patternCanvas.height = 50;

        // Give the pattern a background color and draw an arc
        patternContext.fillStyle = '#fec';
        patternContext.fillRect(0, 0, patternCanvas.width, patternCanvas.height);
        patternContext.arc(0, 0, 50, 0, .5 * Math.PI);
        patternContext.stroke();

        this.facedownPattern = this.context.createPattern(patternCanvas, 'repeat');
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

        this.createFacedownPattern();
    }

    isInMotion()
    {
        return this.inMotion.length > 0;
    }

    moveCard(card, x, y, tox, toy, callback)
    {
        let mover = new CardInMotion();
        mover.fromCelX = x;
        mover.fromCelY = y;
        mover.toCelX = tox;
        mover.toCelY = toy;
        let o = this;
        mover.drawCall = function() { o.drawCard(card); }
        mover.callback = callback;
        mover.computeDuration();
        this.inMotion.push(mover);
    }

    deal(callback)
    {
        let mover = new CardInMotion();
        mover.fromCelX = 4;
        mover.fromCelY = 3;
        mover.toCelX = Game.hand.getEmptyHandSlot();
        mover.toCelY = 3;
        let o = this;
        mover.drawCall = function() { o.drawFaceDown(); }
        mover.callback = callback;
        mover.computeDuration();
        this.inMotion.push(mover);
    }

    drawAffect(fromx, fromy, tox, toy, c)
    {
        let mover = new AffectLine(fromx, fromy, tox, toy, c);
        this.inMotion.push(mover);
    }

    drawBoard()
    {        
        // whose turn
        if (Game.turn == 1)
        {
            let x = (this.cardWidth  + 10) * 0;
            let w = (this.cardWidth  + 10) * 6 +10;
            let y = (this.cardHeight + 10) * 0;
            let h = (this.cardHeight + 10) * 1 +10;
            this.context.fillStyle = "#ccffcc";
            this.context.fillRect(x, y, w, h);
        }
        else if (Game.turn == 2)
        {
            let x = (this.cardWidth  + 10) * 0;
            let w = (this.cardWidth  + 10) * 6 +10;
            let y = (this.cardHeight + 10) * 2;
            let h = (this.cardHeight + 10) * 2 +10;
            this.context.fillStyle = "#ccffcc";
            this.context.fillRect(x, y, w, h);
        }
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
    
        this.moveToCel(5,2);    this.drawCrewZone();
        this.moveToCel(5,2.25); this.drawCrewZone();
        this.moveToCel(5,2.5);  this.drawCrewZone(); 
        this.moveToCel(5,2.75); this.drawCrewZone(); 
    
        this.moveToCel(0,3); this.drawZone("My Hand"); 
        this.moveToCel(1,3); this.drawZone("My Hand"); 
        this.moveToCel(2,3); this.drawZone("My Hand"); 
        this.moveToCel(4,3); this.drawZone("My Deck");  
    
        this.moveToCel(5,3); this.drawZone("Active Crew");
    }
    
    drawHand()
    {
        let hand = Game.hand;

        for (let i in hand.ship)
        {
            if (hand.ship[i].state.skip) continue;
            Game.draw.moveToCel(i,2);
            Game.draw.drawCard(hand.ship[i]);    
        }
        for (let i in hand.hand)
        {
            if (hand.hand[i])
            {
                Game.draw.moveToCel(i,3);
                Game.draw.drawCard(hand.hand[i]);        
            }
        }
        if (hand.activecard)
        {
            Game.draw.moveToCel(2,1);
            Game.draw.drawCard(hand.activecard);    
        }
        for (let i in hand.crew)
        {
            Game.draw.moveToCel(5,2 + (0.25*i));
            Game.draw.drawCrewZone(hand.crew[i].name);    
        }
        if (hand.activecrew)
        {
            Game.draw.moveToCel(5,3);
            Game.draw.drawCard(hand.activecrew);
        }
        if (hand.deck)
        {
            Game.draw.moveToCel(4,3);
            Game.draw.drawFaceDown();
        }

        // enemy
        hand = Game.enemy;
        if (!hand) return;

        for (let i in hand.ship)
        {
            Game.draw.moveToCel(i,0);
            if (hand.ship[i].system == SystemTypes.Hull || hand.ship[i].state.revealed)
                Game.draw.drawCard(hand.ship[i]);    
            else
                Game.draw.drawFaceDown();
        }

        if (hand.activecrew)
        {
            Game.draw.moveToCel(5,0);
            Game.draw.drawCard(hand.activecrew);
        }

        if (hand.activecard)
        {
            Game.draw.moveToCel(2,1);
            Game.draw.drawCard(hand.activecard);    
        }
        
        // remove all done movers
        for (let i in this.inMotion)
        {
            if (this.inMotion[i].done)
                this.inMotion.splice(i,1);
            else 
                this.inMotion[i].update();
        }
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
            targets[i].x *= this.cardWidth;
            targets[i].y *= this.cardHeight;
    
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

    setColourForText(background)
    {
        var c = background.substring(1);      // strip #
        var rgb = parseInt(c, 16);   // convert rrggbb to decimal
        var r = (rgb >> 16) & 0xff;  // extract red
        var g = (rgb >>  8) & 0xff;  // extract green
        var b = (rgb >>  0) & 0xff;  // extract blue

        var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
        if (luma < 60) this.context.fillStyle = "#fff";
        else this.context.fillStyle = "#000";
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
        let bg = "#add8e6";
        this.context.beginPath();
        this.context.fillStyle = bg;
        this.context.strokeStyle = bg;
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
        this.setColourForText(bg);
        this.context.fillText(card.name, namePosX, namePosY);

        // power / HP Area
        if (card.type == CardType.System)
        {
            bg = "#e6e6e6";
            this.context.beginPath();
            this.context.fillStyle = bg;
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
            if (card.power < 0) 
            {
                if (card.state.powered)
                    this.context.fillStyle = "#39ac39";
                else
                    this.context.fillStyle = "#ff0000";
                text = ">>> " + (-1 * card.power);
            }
            else if (card.power > 0)
            {
                this.setColourForText(bg);
                text = "<<< " + card.power;
            }
            this.setFontForText(text, w / 2 - nameOffsetX - nameOffsetX, powerHeight);
            this.context.fillText(text, powerPosX, powerPosY);

            text = "HP: " + card.hp;
            this.setFontForText(text, w / 2 - nameOffsetX - nameOffsetX, powerHeight);
            this.setColourForText(bg);
            this.context.fillText(text, hpPosX, hpPosY);
        }

        // Requirement area - only ever 2 requirements
        if (card.hand && card.requires)
        {
            bg = "#e6e6e6";
            reqStepY = this.setFontForText(card.requires, w - nameOffsetX - nameOffsetX) * 1.1;
            let reqY = y + nameHeight + (card.type == CardType.System ? powerHeight : 0) + reqStepY;
            this.context.fillStyle = bg;
            this.context.fillRect(x, reqY - reqStepY + 2, w, (reqStepY * card.requires.length));

            if (card.hand.shipHasSystem(card.requires[0]))
                this.context.fillStyle = "#39ac39";
            else
                this.context.fillStyle = "#ff0000";

            // req 0
            this.context.fillText(card.requires[0], reqPosX, reqY);
            reqY += reqStepY;

            // req 1
            if (card.requires.length>1)
            {
                if (card.requires[1] == "Power: x2")
                {
                    if (card.hand.ship[2].system == SystemTypes.Weapon)
                        this.context.fillStyle = "#39ac39";
                    else
                        this.context.fillStyle = "#ff0000";
                }
                if (card.requires[1] == "Speed: 10")
                {
                    if (card.hand.ship[2].speed == 10)
                        this.context.fillStyle = "#39ac39";
                    else
                        this.context.fillStyle = "#ff0000";
                }
                this.context.fillText(card.requires[1], reqPosX, reqY);
            }
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
        let c = (card.type == CardType.System) ? SystemColours[card.system] : SystemColours[card.type];
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

        let text = (card.type == CardType.System) ? SystemNames[card.system] : SystemNames[card.type];
        this.setFontForText(text, w / 2 - nameOffsetX - nameOffsetX, systemHeight);
        this.setColourForText(c);
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

    drawCrewZone(name)
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

        let bg = name ? SystemColours[CardType.Crew] : "#e6e6e6";
        if (!name) name = "Crew";

        this.context.beginPath();
        this.context.strokeStyle = "#000000";
        this.context.fillStyle = bg;
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
        this.context.fill();
        this.context.fillStyle = "#000000"; // makes no sense that this line is required
        this.context.stroke();

        this.setFontForText(name, w - nameOffsetX - nameOffsetX);
        this.setColourForText(bg);
        this.context.fillText(name, namePosX, namePosY);
    }

    drawFaceDown()
    {
        if (!this.facedownPattern) this.createFacedownPattern();

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
        this.context.fillStyle = this.facedownPattern;
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
        this.context.fill();
        this.context.stroke();
    }
}
