class TutorialManager
{
    constructor()
    {
        this.step = 0;
        this.updated = false;

        this.bubbles = [];
    }

    startAt(num)
    {
        this.step = num;
    }

    progress()
    {
        if (Game.draw.isInMotion()) return;
        if (!this.step) { location.reload(); return; }
        this.step++;
        this.updated = false;
    }

    update()
    {
        if (this.updated) return;
        this.updated = true;

        let bubble = this.bubbles[this.step];
        if (bubble) bubble.update();
    }

    render()
    {
        if (Game.draw.isInMotion()) return;
        let bubble = this.bubbles[this.step];
        if (bubble) bubble.render();
    }
}

let Tutorial = new TutorialManager();

class Bubble
{
    constructor() { Tutorial.bubbles.push(this); }
    update() { }
    render() { }
}

class Step0 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(4.718446601941747, 1.3703190013869626, ["This tutorial doesn't exist yet!", "Come back later"]); }
}
new Step0();

class Step1 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(4.30287859824781, 1.4167709637046308, ["This is a Space Ship battle card game.","You are the captain of a space ship.", "Click to continue."]); }
}
new Step1();
class Step2 extends Bubble
{
    constructor() { super(); }
    render() {  Game.draw.drawBubble(1.2390488110137674, 2.623279098873592, ["This row is where information about your ship appears.", "A ship is comprised of Ship System cards."]); }
}
new Step2();
class Step3 extends Bubble
{
    constructor() { super(); }
    update() { Game.hand.addSystem("DEMO-3"); }
    render() { Game.draw.drawBubble(1.8224687933425796, 2.51872399445215, ["This card is the ship's hull.", "Some Systems are optional, but every ship must have a Hull."],1.0901525658807212, 2.651872399445215); }
}
new Step3();
class Step4 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(1.8224687933425796, 2.51872399445215, ["This hull has 20 health to withstand damage with.","When the hull's health is reduced to 0, you lose!"],1.073509015256588, 2.335644937586685);  }
}
new Step4();
class Step5 extends Bubble
{
    constructor() { super(); }
    update() { Game.hand.addSystem("DEMO-1"); }
    render() { Game.draw.drawBubble(2.9625520110957004, 2.51872399445215, ["This card is the ship's power source.", "The power source provides power to the other systems."],2.1386962552011095, 2.651872399445215); }
}
new Step5();
class Step6 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(2.9625520110957004, 2.51872399445215, ["This power source provides 20 power per turn."],1.639389736477115, 2.335644937586685); }
}
new Step6();
class Step7 extends Bubble
{
    constructor() { super(); }
    update() { Game.hand.addSystem("DEMO-4"); }
    render() { Game.draw.drawBubble(4.0943134535367545, 2.535367545076283, ["This card is the ship's engine.", "Engines help to evade incoming damage.","This engine can evade 2 damage."],3.2122052704576975, 2.635228848821082); }
}
new Step7();
class Step8 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(3.747183979974969, 2.2127659574468086, ["This engine requires 2 power per turn.", "Without enough power, its evasion skill is disabled."],2.712898751733703, 2.335644937586685); }
}
new Step8();

class Step9 extends Bubble
{
    constructor() { super(); }
    update() { Game.hand.addSystem("DEMO-2"); }
    render() {Game.draw.drawBubble(2.8760951188986237, 1.6871088861076347, ["This ship has a Phaser Cannon as its weapon.", "It takes 2 power to fire, and does 5 damage."],4.100125156445557, 2.1476846057571963); }
}
new Step9();
class Step10 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(1.81029263370333, 1.70736629667003035, ["Each system has its own health.", "If a system is reduced to 0, it can't be used until repaired."], [{ x: 1.9261992619926198, y: 2.2878228782287824 },{ x: 2.959409594095941, y: 2.2878228782287824 },{ x: 4.044280442804428, y: 2.277982779827798 }] ); }
}
new Step10();

class Step11 extends Bubble
{
    constructor() { super(); }
    update() { Game.hand.addCrew("DEMO-6"); Game.hand.activateCrew(0); }
    render() { Game.draw.drawBubble(0.825531914893617, 3.370212765957447, ["Every ship needs a crew. You start with only one, the Captain.", "This ship is captained by Captain Smith."], 5.455233291298866, 3.4098360655737703 ); }
}
new Step11();
class Step12 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(1.8892988929889298, 1.5596555965559655, ["Other crew members you pick up will appear in this collumn."],5.909205548549811, 2.1437578814627996 ); }
}
new Step12();
class Step13 extends Bubble
{
    constructor() { super(); }
    update() { Game.hand.deck = []; }
    render() { Game.draw.drawBubble(1.8892988929889298, 1.5596555965559655, ["Each crew member has their own deck of action cards.","The active crew member's deck goes here."],4.872635561160152, 3.2030264817150065 ); }
}
new Step13();
class Step14 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(3.698060941828255, 3.3850415512465375, ["On your turn, the cards you draw into your hand","will appear in this row."],3.230769230769231, 3.656998738965952 ); }
}
new Step14();
class Step15 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(3.454317897371715, 1.506883604505632, ["When you play a card, it is placed in the middle, here."],3.238335435056747, 1.583858764186633 ); }
}
new Step15();
class Step16 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(1.3591989987484356, 0.4956195244055069, ["This is where your opponent's ship will appear.", "You won't be able to see their crew or hand."]); }
}
new Step16();
class Step17 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        Game.hand = new HandManager();
        Game.hand.addSystem("DEMO-3");
        Game.hand.addSystem("DEMO-1");
        Game.hand.addSystem("DEMO-4");
        Game.hand.addSystem("DEMO-2");
        Game.hand.addCrew("DEMO-6"); 
        Game.hand.activateCrew(0);
        Game.hand.deck = [];
    }
    render() { Game.draw.drawBubble(4.040353089533418, 1.5939470365699875, ["Let's battle!"] ); }
}
new Step17();
class Step18 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        Game.enemy = new HandManager();
        Game.enemy.addSystem("DEMO-17");
        Game.enemy.addSystem("DEMO-18");
        Game.enemy.addSystem("DEMO-1");
        Game.enemy.addSystem("DEMO-19");
        Game.enemy.addCrew("DEMO-16"); 
        Game.enemy.activateCrew(0);
    }
    render() { Game.draw.drawBubble(4.079519595448799, 1.4007585335018964, ["This is your opponent.", "Information about the captain appears here."],5.878634639696586, 1.0619469026548674); }
}
new Step18();
class Step19 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(0.475094816687737, 1.5170670037926675, ["This is his ship. You can only see the hull right now.", "Some Action cards can reveal more of his ship.", "It seems that his Hull is stronger than ours!"],0.8068268015170669, 1.0518331226295827); }
}
new Step19();
class Step20 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(0.475094816687737, 1.5170670037926675, ["Lets start our turn by dealing our hand.","Captain Smith gets 3 cards in his hand."]); }
}
new Step20();
class Step21 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
//        let play1 = function() { Game.hand.activateUsedCard(); Game.draw.moveCard(Game.hand.activecard,2,1,4,3); Game.hand.endTurn();}
//        let card1 = function() { Game.hand.addHand("DEMO-13"); Game.draw.moveCard(Game.hand.hand[1],1,3,2,1,play1); Game.hand.useCard(1); }
        let card1 = function() { Game.hand.addHand("DEMO-13"); }
        let card2 = function() { Game.hand.addHand("DEMO-5");  Game.draw.deal( card1 );}
        let card3 = function() { Game.hand.addHand("DEMO-12"); Game.draw.deal( card2 );}
        Game.draw.deal( card3 ); 
    }
    render() { Game.draw.drawBubble(0.475094816687737, 1.5170670037926675, ["Space battles are pretty fast paced!", "On your turn, you can play only one card.","(Unless instructed otherwise)"]); }
}
new Step21();
class Step22 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(0.475094816687737, 1.5170670037926675, ["This is a good time to point out:","Every rule in the game can be broken if an Action card says so.","Keep a look out for those types of cards!"]); }
}
new Step22();
class Step23 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(1.0467762326169405, 1.774968394437421, ["We don't know much about his ship, so lets start by playing this card.","'On Screen' reveals any Systems that are external."],0.5537294563843236, 3.2060682680151706); }
}
new Step23();
class Step24 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(1.0467762326169405, 1.774968394437421, ["Also note that it is a 'Once' card.","'Once' cards won't show up again in this battle after being used","Ok, play it now."],0.5537294563843236, 3.2060682680151706); }
}
new Step24();
class Step25 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let play1 = function() 
        { 
            Game.hand.activateUsedCard(); 
            Game.enemy.ship[1].state.revealed = true;
            Game.enemy.ship[3].state.revealed = true;
        }
        Game.draw.moveCard(Game.hand.hand[0],0,3,2,1,play1); 
        Game.hand.useCard(0);
    }
    render() { Game.draw.drawBubble(1.0467762326169405, 1.374968394437421, ["Now we can see more systems!"]); }
}
new Step25();
class Step26 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(1.0467762326169405, 1.374968394437421, ["His weapon doesn't do as much damage as ours."],1.5929203539823007, 0.8394437420986094); }}
new Step26();
class Step27 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(1.0467762326169405, 1.374968394437421, ["His engine can't evade damage like ours can.","Thats good to know!","Let's end our turn"],3.716814159292035, 0.8950695322376738); }}
new Step27();
class Step28 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        Game.draw.moveCard(Game.hand.activecard,2,1,4,3); 
        Game.hand.endTurn();
    }
    render() { Game.draw.drawBubble(3.754740834386852, 1.4766118836915296, ["At the end of the turn, used cards get shuffled back into the deck.","There is no discard pile, so you might draw it again right away!"]); }
}
new Step28();
