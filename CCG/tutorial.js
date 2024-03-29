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
        if (this.step < 1) { location.reload(); return; }
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
    render() { Game.draw.drawBubble(2.9625520110957004, 2.51872399445215, ["This power source provides 5 power per turn."],1.639389736477115, 2.335644937586685); }
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
    render() { Game.draw.drawBubble(1.8892988929889298, 1.5596555965559655, ["Other crew members you pick up will appear in this column."],5.909205548549811, 2.1437578814627996 ); }
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
        Game.enemy.addSystem("DEMO-1A");
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
        Game.turn = 2;
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
        Game.turn = 1;
    }
    render() { Game.draw.drawBubble(2.754740834386852, 1.4766118836915296, ["At the end of the turn, used cards get shuffled back into the deck.","There is no discard pile, so you might draw a card again right away!"]); }
}
new Step28();
class Step29 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let dmg = function()
        {
            Game.draw.drawAffect(1.5,0.9,0.5,2.1,"#ff0000");
            Game.enemy.activecard = cards["DEMO-5A"];
            Game.hand.ship[0].hp -= 2;
            Game.hand.ship[1].power -= 2;
        }
        Game.draw.moveCard(cards["DEMO-5A"],2,-1,2,1, dmg);
     }
    render() { Game.draw.drawBubble(2.754740834386852, 1.4766118836915296, ["He played 'Fire!' which fires his guns.","By default, attacks hit the hull. Our Hull took 2 damage!"]); }
}
new Step29();
class Step30 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(1.4260429835651074, 1.4412136536030342, ["His gun did 4 damage, but our engine can evade 2 damage for every shot.","The ship will only evade if the engine has enough power."], [{x:1.600505689001264, y:0.8445006321112516},{x:2.586599241466498, y:2.7964601769911503}]); }
}
new Step30();
class Step31 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(2.1329820051413885, 1.480719794344473, ["A green coloured power indicator means that the system is fully powered."],2.668380462724936, 2.3187660668380463); }
}
new Step31();
class Step32 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(3.5629820051413885, 1.480719794344473, ["Note that the power source lost some of its power.","It will be replenished every turn."],1.6118251928020566, 2.3187660668380463); }
}
new Step32();
class Step33 extends Bubble
{
    constructor() { super(); }
    update() { Game.enemy.endTurn(); }
    render() { Game.draw.drawBubble(3.717223650385604, 1.4447300771208227, ["It's our turn again. We need to draw a card."]); }
}
new Step33();
class Step34 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        Game.turn = 2;
        Game.hand.ship[1].power = 5;
        let card3 = function() { Game.hand.addHand("DEMO-14"); }
        Game.draw.deal( card3 ); 
    }
    render() { Game.draw.drawBubble(3.717223650385604, 1.4447300771208227, ["Our Phaser Cannon is powered so lets return fire."]); }
}
new Step34();
class Step35 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let play1 = function() 
        { 
            Game.hand.activateUsedCard(); 
            Game.hand.ship[1].power -= 2;
            Game.draw.drawAffect(3.5,2.1,0.5,0.9,"#ff0000");
            Game.enemy.ship[0].hp -= 5;
        }
        Game.draw.moveCard(Game.hand.hand[1],1,3,2,1,play1); 
        Game.hand.useCard(1);
    }
    render() { Game.draw.drawBubble(1.0467762326169405, 1.374968394437421, ["Good shot! He took 5 damage.","Notice that with the engine on, there is not enough power for another shot.","Our turn ends."]); }
}
new Step35();
class Step36 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let dmg = function()
        {
            Game.draw.drawAffect(1.5,0.9,0.5,2.1,"#ff0000");
            Game.enemy.activecard = cards["DEMO-5A"];
            Game.hand.ship[0].hp -= 2;
            Game.hand.ship[1].power -= 2;
        }
        let fire = function()
        {
            Game.draw.moveCard(cards["DEMO-5A"],2,-1,2,1, dmg);
        }
        Game.turn = 1;
        Game.draw.moveCard(Game.hand.activecard,2,1,4,3,fire); 
        Game.hand.endTurn();
        Game.hand.ship[1].power = 5;
    }
    render() { Game.draw.drawBubble(2.754740834386852, 1.4766118836915296, ["The enemy shot us again!", "This is getting serious."]); }
}
new Step36();
class Step37 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        Game.hand.ship[1].power = 5;
        let card3 = function() { Game.hand.addHand("DEMO-7"); }
        Game.draw.deal( card3 ); 
        Game.enemy.endTurn();
        Game.turn = 2;
    }
    render() { Game.draw.drawBubble(3.717223650385604, 1.4447300771208227, ["We drew 'Shields Up', which would let us activate","one of our defensive systems."]); }
}
new Step37();
class Step38 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(3.717223650385604, 1.4447300771208227, ["This line show the card's requirements.", "We don't have a Defense System, so we can't play it."],1.7969151670951158, 3.4087403598971724); }
}
new Step38();
class Step39 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(3.717223650385604, 1.4447300771208227, ["Let's play 'Evasive Action'","It will let us avoid an extra 2 damage."]); }
}
new Step39(); 
class Step40 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let play1 = function() 
        { 
            Game.hand.activateUsedCard(); 
            Game.draw.drawAffect(2.5,1.9,2.5,2.1,"#ffff00");
            Game.hand.ship[2].effectText[2] = "Evasion: 4";
        }
        Game.draw.moveCard(Game.hand.hand[2],2,3,2,1,play1); 
        Game.hand.useCard(2);
    }
    render() { Game.draw.drawBubble(1.0467762326169405, 1.374968394437421, ["Our engine has been updated to show an Evasion of 4 now.","Our turn ends."],2.6452442159383036, 2.879177377892031); }
}
new Step40();
class Step41 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let dmg = function()
        {
            Game.draw.drawAffect(1.5,0.9,0.5,2.1,"#ff0000");
            Game.enemy.activecard = cards["DEMO-5A"];
            Game.hand.ship[1].power -= 2;
        }
        let fire = function()
        {
            Game.draw.moveCard(cards["DEMO-5A"],2,-1,2,1, dmg);
        }
        Game.draw.moveCard(Game.hand.activecard,2,1,4,3,fire); 
        Game.hand.endTurn();
        Game.turn = 1;
    }
    render() { Game.draw.drawBubble(2.754740834386852, 1.4766118836915296, ["He played 'Fire!' again but we took no damage","thanks to our high evasion."]); }
}
new Step41();
class Step42 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        Game.hand.ship[1].power = 5;
        let card3 = function() { Game.hand.addHand("DEMO-11"); }
        Game.draw.deal( card3 ); 
        Game.enemy.endTurn();
        Game.turn = 2;
    }
    render() { Game.draw.drawBubble(3.717223650385604, 1.4447300771208227, ["We drew 'Jamming Signal'","We have nothing better. Let's try it."]); }
}
new Step42();
class Step43 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let play1 = function() 
        { 
            Game.hand.activateUsedCard(); 
        }
        Game.draw.moveCard(Game.hand.hand[2],2,3,2,1,play1); 
        Game.hand.useCard(2);
    }
    render() { Game.draw.drawBubble(3.6246786632390746, 1.4498714652956297, ["Now he can't attack on his next turn."]); }
}
new Step43(); 
class Step44 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let dmg = function()
        {
            Game.draw.drawAffect(2.5,1.9,3.5,2.1,"#ffff00");
            Game.enemy.activecard = cards["DEMO-20"];
        }
        let fire = function()
        {
            Game.draw.moveCard(cards["DEMO-20"],2,-1,2,1, dmg);
        }
        Game.draw.moveCard(Game.hand.activecard,2,1,4,3,fire); 
        Game.hand.endTurn();
        Game.turn = 1;
    }
    render() { Game.draw.drawBubble(2.754740834386852, 1.4766118836915296, ["The enemy was not able to attack. Instead he targetted our Phaser!","When a target is selected, all future attacks will go there."]); }
}
new Step44();
class Step45 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        Game.hand.ship[1].power = 5;
        let card3 = function() { Game.hand.addHand("DEMO-8"); }
        Game.draw.deal( card3 ); 
        Game.enemy.endTurn();
        Game.turn = 2;
    }
    render() { Game.draw.drawBubble(3.717223650385604, 1.4447300771208227, ["We drew 'Full Salvo'!","It lets us do double damage, but needs double the power."],2.6838046272493576, 3.537275064267352); }
}
new Step45();
class Step46 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(0.9562982005141389, 1.5218508997429305, ["That would mean 4 power for the phaser. Including the engine, we do not have the 6 power needed.",
                                                                             "Luckily, we can reroute power away from the engine, however that would disable our evade skill."]); }
}
new Step46(); 
class Step47 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(0.9562982005141389, 1.5218508997429305, ["Power flows from the power source from left to right.",
                                                                             "After the engine claims 2 power, there is only 3 left for the phaser.",
                                                                             "We can reroute the power by rearranging the systems cards. Lets do that now."]); }
}
new Step47(); 
class Step48 extends Bubble
{
    constructor() { super(); }
    update()
    {
        let phaser = Game.hand.ship[3];
        let engine = Game.hand.ship[2];
        let play1 = function() { Game.hand.ship[3] = engine; Game.hand.ship[3].skip = false; }
        let play2 = function() { Game.hand.ship[2] = phaser; Game.hand.ship[2].skip = false;}
        Game.draw.moveCard(Game.hand.ship[2],2,2,3,2,play1); 
        Game.draw.moveCard(Game.hand.ship[3],3,2,2,2,play2); 
        Game.hand.ship[3].skip = true;
        Game.hand.ship[2].skip = true;
    }
    render() { Game.draw.drawBubble(0.9562982005141389, 1.5218508997429305, ["With the power rerouted, the phaser can claim 4 power. There won't be enough for the engine.",
                                                                             "You can always reroute power for free whenever it is your turn.",
                                                                            "Now use 'Full Salvo'!"]); }
}
new Step48(); 
class Step49 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let dmg = function()
        {
        }
        let play1 = function() 
        {             
            Game.hand.activateUsedCard(); 
            Game.hand.ship[2].power = -4;
            Game.enemy.ship[0].hp -= 10;
            Game.draw.drawAffect(2.5,1.1,0.5,0.9,"#ff0000");
        }
        Game.draw.moveCard(Game.hand.hand[0],2,3,2,1,play1); 
        Game.hand.useCard(2);
    }
    render() { Game.draw.drawBubble(3.6246786632390746, 1.4498714652956297, ["That's a lot of damage!"]); }
}
new Step49(); 
class Step50 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let dmg = function()
        {
            Game.draw.drawAffect(2.5,1.9,3.5,2.1,"#ff0000");
            Game.draw.drawAffect(2.5,1.9,2.5,2.1,"#ff0000");
            Game.enemy.activecard = cards["DEMO-21"];
            Game.hand.ship[2].hp -= 5;
            Game.hand.ship[3].hp -= 5;
        }
        let fire = function()
        {
            Game.draw.moveCard(cards["DEMO-21"],2,-1,2,1, dmg);
        }
        Game.draw.moveCard(Game.hand.activecard,2,1,4,3,fire); 
        Game.hand.endTurn();
        Game.turn = 1;
    }
    render() { Game.draw.drawBubble(2.754740834386852, 1.4766118836915296, ["The enemy took advantage of our disabled engine and played 'Heavy Barrel'.","It took out our phaser and engine!"]); }
}
new Step50();
class Step51 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let card3 = function() { Game.hand.addHand("DEMO-9"); }
        Game.hand.ship[3].effectText[2] = "Evasion: 2";
        Game.hand.ship[2].power = -2;
        Game.draw.deal( card3 ); 
        Game.enemy.endTurn();
        Game.turn = 2;
    }
    render() { Game.draw.drawBubble(3.717223650385604, 1.4447300771208227, ["We are sitting ducks with our systems destroyed!", "We can only repair one using 'Emergency Repairs'"],0.5938303341902315, 3.2133676092544987); }
}
new Step51();
class Step52 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(3.717223650385604, 1.4447300771208227, ["The new card 'Ramming Speed' is interesting!", "Lets repair the engine."]); }
}
new Step52();
class Step53 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let play1 = function() 
        { 
            Game.draw.drawAffect(2.5,1.9,3.5,2.1,"#ffff00");
            Game.hand.activateUsedCard(); 
            Game.hand.ship[3].hp += 5;
        }
        Game.draw.moveCard(Game.hand.hand[0],0,3,2,1,play1); 
        Game.hand.useCard(0);
    }
    render() { Game.draw.drawBubble(3.6246786632390746, 1.4498714652956297, ["Engines are back online."]); }
}
new Step53(); 
class Step54 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let dmg = function()
        {
            Game.draw.drawAffect(1.5,0.9,0.5,2.1,"#ff0000");
            Game.enemy.activecard = cards["DEMO-5A"];
            Game.hand.ship[0].hp -= 2;
            Game.hand.ship[1].power -= 2;
        }
        let fire = function()
        {
            Game.draw.moveCard(cards["DEMO-5A"],2,-1,2,1, dmg);
        }
        Game.turn = 1;
        Game.draw.moveCard(Game.hand.activecard,2,1,4,3,fire); 
        Game.hand.endTurn();
        Game.hand.ship[1].power = 5;
    }
    render() { Game.draw.drawBubble(2.754740834386852, 1.4766118836915296, ["The enemy is trying to finish us off.","With his target (our phaser) destroyed, it reverts back to targetting the hull."]); }
}
new Step54();
class Step55 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let card3 = function() { Game.hand.addHand("DEMO-10"); }
        Game.draw.deal( card3 ); 
        Game.enemy.endTurn();
        Game.hand.ship[1].power += 2;
        Game.turn = 2;
    }
    render() { Game.draw.drawBubble(2.754740834386852, 1.476611883691529, ["Its our turn, but we can not play 'Ramming Speed'","It requires 10 speed and we only have 5."],3.694087403598972, 2.9254498714652954); }
}
new Step55();
class Step56 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let play1 = function() 
        { 
            Game.hand.activateUsedCard(); 
        }
        Game.draw.moveCard(Game.hand.hand[1],1,3,2,1,play1); 
        Game.hand.useCard(1);
    }
    render() { Game.draw.drawBubble(3.6246786632390746, 1.4498714652956297, ["Instead of self destructing, lets just","throw out this card that we can't use."]); }
}
new Step56(); 
class Step57 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let dmg = function()
        {
            Game.draw.drawAffect(1.5,0.9,0.5,2.1,"#ff0000");
            Game.enemy.activecard = cards["DEMO-5A"];
            Game.hand.ship[0].hp -= 2;
            Game.hand.ship[1].power -= 2;
        }
        let fire = function()
        {
            Game.draw.moveCard(cards["DEMO-5A"],2,-1,2,1, dmg);
        }
        Game.turn = 1;
        Game.draw.moveCard(Game.hand.activecard,2,1,4,3,fire); 
        Game.hand.endTurn();
        Game.hand.ship[1].power = 5;
    }
    render() { Game.draw.drawBubble(2.754740834386852, 1.4766118836915296, ["He fired on us again.","I think his whole deck is 'Fire!' cards."]); }
}
new Step57();
class Step58 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let card3 = function() { Game.hand.addHand("DEMO-15"); }
        Game.draw.deal( card3 ); 
        Game.enemy.endTurn();
        Game.hand.ship[1].power += 2;
        Game.turn = 2;
    }
    render() { Game.draw.drawBubble(2.754740834386852, 1.476611883691529, ["'Pedal to the Metal' is just what we need","to boost the engine speed!"]); }
}
new Step58();
class Step59 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let play1 = function() 
        { 
            Game.hand.ship[3].effectText[3] = "Speed: 10";
            Game.hand.activateUsedCard(); 
        }
        Game.draw.moveCard(Game.hand.hand[1],1,3,2,1,play1); 
        Game.hand.useCard(1);
    }
    render() { Game.draw.drawBubble(3.6246786632390746, 1.4498714652956297, ["She's giving it all she's got!"]); }
}
new Step59(); 
class Step60 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let dmg = function()
        {
            Game.draw.drawAffect(1.5,0.9,0.5,2.1,"#ff0000");
            Game.enemy.activecard = cards["DEMO-5A"];
            Game.hand.ship[0].hp -= 2;
            Game.hand.ship[1].power -= 2;
        }
        let fire = function()
        {
            Game.draw.moveCard(cards["DEMO-5A"],2,-1,2,1, dmg);
        }
        Game.turn = 1;
        Game.draw.moveCard(Game.hand.activecard,2,1,4,3,fire); 
        Game.hand.endTurn();
        Game.hand.ship[1].power = 5;
    }
    render() { Game.draw.drawBubble(2.754740834386852, 1.4766118836915296, ["He got us again, but its time to end the battle."]); }
}
new Step60();
class Step61 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let card3 = function() { Game.hand.addHand("DEMO-5"); }
        Game.draw.deal( card3 ); 
        Game.enemy.endTurn();
        Game.hand.ship[1].power += 2;
        Game.turn = 2;
    }
    render() { Game.draw.drawBubble(2.754740834386852, 1.476611883691529, ["Everything is ready. Ramming speed!"]); }
}
new Step61();
class Step62 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let play1 = function() 
        { 
            Game.draw.drawAffect(0.5,2.1,0.5,0.9,"#ff0000");
            Game.enemy.ship[0].hp -= 10;
            Game.hand.ship[0].hp -= 2;
            Game.hand.activateUsedCard(); 
        }
        Game.draw.moveCard(Game.hand.hand[2],2,3,2,1,play1); 
        Game.hand.useCard(2);
    }
    render() { Game.draw.drawBubble(3.6246786632390746, 1.4498714652956297, ["We've won the battle!","Let's head to the nearest Spacedock."]); }
}
new Step62(); 



class Step63 extends Bubble
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
        Game.enemy = new HandManager();
        Game.gotoSpacedock();
    }
    render() { Game.draw.drawBubble(0.7340425531914894, 1.5319148936170213, ["Between battles you might find yourself at a spacedock like this one."]); }
}
new Step63(); 
new class Step64 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(0.7340425531914894, 1.5319148936170213, ["Spacedocks have many useful services, but not all of them will offer every service."]); }
}();
new class Step65 extends Bubble
{
    constructor() { super(); }
    update() { }
    render() { Game.draw.drawBubble(0.7340425531914894, 1.5319148936170213, ["This is the ship repair yard.","Use it to fix damage to your systems or hull"],1.148936170212766, 1.047872340425532); }
}();
new class Step66 extends Bubble
{
    constructor() { super(); }
    update() { }
    render() { Game.draw.drawBubble(0.7340425531914894, 1.5319148936170213, ["Not every repair yard will be set up to repair every type of system."]); }
}();
new class Step67 extends Bubble
{
    constructor() { super(); }
    update() { Game.deckmode = 7; }
    render() { Game.draw.drawBubble(0.7340425531914894, 1.5319148936170213, ["You can refit your ship here.","This lets you buy and sell ship system cards, or replace the hull."],2.2021276595744683, 1.0319148936170213); }
}();
new class Step68 extends Bubble
{
    constructor() { super(); }
    update() { Game.deckmode = 0;}
    render() { Game.draw.drawBubble(0.7340425531914894, 1.5319148936170213, ["The training facility lets you hire new crew, or level up your existing crew.","Lets see who is here."],3.3111702127659575, 1.047872340425532); }
}();
new class Step69 extends Bubble
{
    constructor() { super(); }
    update() { 
        Game.enemy.addCrew("DEMO-22"); 
        Game.enemy.activecard =  Game.enemy.crew[0];
    }
    render() { Game.draw.drawBubble(3.7579787234042556, 1.5159574468085106, ["Ensign Lee is the only person here right now."],3.2313829787234045, 1.4893617021276595); }
}();
new class Step70 extends Bubble
{
    constructor() { super(); }
    update() { }
    render() { Game.draw.drawBubble(3.7579787234042556, 1.5159574468085106, ["Being level 1, he can only have a hand size of 1 card.","We'll take him anyway."],2.7845744680851063, 1.8670212765957446); }
}();
new class Step71 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let play1 = function()
        {
            Game.enemy.addHand("DEMO-23"); 
            Game.enemy.activecard =  Game.enemy.hand[0];
            Game.hand.addCrew("DEMO-22");
        }
        Game.draw.moveCard(Game.enemy.activecard,2,1,5,2.25,play1); 
        Game.enemy.activecard = null;
    }
    render() { Game.draw.drawBubble(0.7340425531914894, 2.3319148936170213, ["Note that each crew member comes with their own card, just like this one.","Don't forget to add it to your deck."]); }
}();
new class Step72 extends Bubble
{
    constructor() { super(); }
    update() 
    {
        Game.draw.moveCard(Game.enemy.activecard,2,1,4,3); 
        Game.enemy.activecard = null;
     }
    render() { Game.draw.drawBubble(0.7340425531914894, 1.5319148936170213, ["We can also buy some training for Captain Smith."]); }
}();
new class Step73 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let card = null;
        let d = function()
        {
            Game.hand.activecrew = Game.hand.activecard;
            Game.hand.activecard = null;    
        }
        let m = function()
        {
            Game.enemy.addHand("DEMO-24"); 
            Game.draw.moveCard(Game.hand.activecard,2,1,5,3,d); 
            Game.enemy.activecard =  Game.enemy.hand[1];
        }
        let c = function() 
        { 
            Game.hand.activecard = card;
            Game.draw.drawAffect(2.75,0.9,2.5,1.1,"#00ff00", m);   
        }
        Game.draw.moveCard(Game.hand.activecrew,5,3,2,1, c);         
        card = Game.hand.activecrew;
        Game.hand.activecrew = null;        
    }
    render() { Game.draw.drawBubble(0.7340425531914894, 0.5319148936170213, ["Training has earned him a new card, 'The Sigma Manuever'!","Lets train Ensign Lee as well"]); }
}();
new class Step74 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let card = null;
        let m = function()
        {
            Game.hand.activecard.effectText.push("Weapons: +1");
        }
        let c = function() 
        { 
            Game.hand.activecard = card;
            Game.draw.drawAffect(2.75,0.9,2.5,1.1,"#00ff00", m);   
        }
        let b = function() 
        { 
            Game.draw.moveCard(card,4,2.25,2,1, c);    
        }
        Game.draw.moveCard(Game.enemy.activecard,2,1,4,3, b);    
        Game.enemy.activecard = null;     
        card = Game.hand.crew[1];
    }
    render() { Game.draw.drawBubble(0.7340425531914894, 0.5319148936170213, ["Ensign Lee has gained a new stat: +1 damage from Weapons!"],2.8155080213903743, 1.9304812834224598); }
}();
new class Step75 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let d = function()
        {
        }
        Game.hand.activecard = null;    
        Game.draw.moveCard(Game.hand.activecrew,2,1,5,2.25, d);         
    }
    render() { Game.draw.drawBubble(0.7340425531914894, 1.5319148936170213, ["Training is a good way to get more cards and skills."]); }
}();
new class Step76 extends Bubble
{
    constructor() { super(); }
    update() { Game.deckmode = 8; }
    render() { Game.draw.drawBubble(0.7340425531914894, 1.5319148936170213, ["The final service is the Market where you can buy and sell cards."],4.371657754010695, 1.0106951871657754); }
}();
new class Step77 extends Bubble
{
    constructor() { super(); }
    update() { Game.deckmode = 0; }
    render() { Game.draw.drawBubble(0.7340425531914894, 1.5319148936170213, ["Regardless of there being a spacedock or not, you can always adjust your deck between battles."]); }
}();
new class Step78 extends Bubble
{
    constructor() { super(); }
    update() { Game.deckmode = 1; }
    render() { Game.draw.drawBubble(0.7340425531914894, 1.5319148936170213, ["Each crew member can have their own deck to play from.","This is Captain Smith's deck at the bottom."]); }
}();
new class Step79 extends Bubble
{
    constructor() { super(); }
    update() { }
    render() { Game.draw.drawBubble(0.7340425531914894, 1.5319148936170213, ["Lets take some of our cards to make a small deck for Ensign Lee.","Cards at the top are not in any deck."]); }
}();
new class Step80 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let d = function() { Game.deckmode = 3; }
        Game.draw.moveCard(cards["DEMO-8"],0,2,0,0, d);         
        Game.draw.moveCard(cards["DEMO-5"],2,2,1,0);         
        Game.deckmode = 2; 
    }
    render() { Game.draw.drawBubble(0.7340425531914894, 1.5319148936170213, ["Switch to Ensign Lee to see his deck."]); }
}();
new class Step81 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let d = function()
        {
            Game.hand.activecrew = Game.hand.crew[1];
            Game.deckmode = 4; 
        }
        Game.draw.moveCard(Game.hand.crew[1],5,2.25,5,3, d);         
    }
    render() { Game.draw.drawBubble(0.7340425531914894, 1.5319148936170213, ["Ensign Lee has nothing in his deck yet. Lets add these cards."]); }
}();
new class Step82 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let c = function() { Game.deckmode = 6; }
        Game.deckmode = 5;
        Game.draw.moveCard(cards["DEMO-8"],0,0,0,2, c);         
        Game.draw.moveCard(cards["DEMO-5"],1,0,1,2);             
    }
    render() { Game.draw.drawBubble(0.7340425531914894, 1.5319148936170213, ["We are ready to continue!"]); }
}();
new class Step83 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        Game.deckmode = 0;
        Game.leaveSpacedock();

        Game.hand = new HandManager();
        Game.hand.addSystem("DEMO-3");
        Game.hand.addSystem("DEMO-1");
        Game.hand.addSystem("DEMO-4");
        Game.hand.addSystem("DEMO-2");
        Game.hand.addCrew("DEMO-6"); 
        Game.hand.addCrew("DEMO-22"); 
        Game.hand.activateCrew(0);
        Game.hand.deck = [];

        Game.enemy = new HandManager();
        Game.enemy.addSystem("DEMO-17");
        Game.enemy.addSystem("DEMO-18");
        Game.enemy.addSystem("DEMO-1A");
        Game.enemy.addSystem("DEMO-19");
        Game.enemy.addCrew("DEMO-16"); 
        Game.enemy.activateCrew(0);
    }
    render() { Game.draw.drawBubble(3.5053475935828877, 1.4973262032085561, ["Let's try this battle again, this time with a crew!"]); }
}();
new class Step84 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        Game.turn = 2;
        let card1 = function() { Game.hand.addHand("DEMO-11"); }
        let card2 = function() { Game.hand.addHand("DEMO-10");  Game.draw.deal( card1 );}
        let card3 = function() { Game.hand.addHand("DEMO-12"); Game.draw.deal( card2 );}
        Game.draw.deal( card3 ); 
    }
    render() { Game.draw.drawBubble(3.5053475935828877, 1.4973262032085561, ["We draw 3 cards like before.","Let's start with 'On Screen' again."]); }
}();
new class Step85 extends Bubble
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
    render() { Game.draw.drawBubble(3.5053475935828877, 1.4973262032085561, ["Yep, its the same guy!"]); }
}();
new class Step86 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let dmg = function()
        {
            Game.draw.drawAffect(1.5,0.9,0.5,2.1,"#ff0000");
            Game.enemy.activecard = cards["DEMO-5A"];
            Game.hand.ship[0].hp -= 2;
            Game.hand.ship[1].power -= 2;
        }
        let a = function() { Game.draw.moveCard(cards["DEMO-5A"],2,-1,2,1, dmg); }
        Game.draw.moveCard(Game.hand.activecard,2,1,4,3, a); 
        Game.hand.endTurn();
        Game.turn = 1;
    }
    render() { Game.draw.drawBubble(3.5053475935828877, 1.4973262032085561, ["He fired on us again. So predictable!"]); }
}();
new class Step87 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        Game.enemy.endTurn(); 

        Game.turn = 2;
        Game.hand.ship[1].power = 5;
        let card3 = function() { Game.hand.addHand("DEMO-23"); }
        Game.draw.deal( card3 ); 
    }
    render() { Game.draw.drawBubble(1.0467762326169405, 1.374968394437421, ["It's our turn and we've drawn the new card for Ensign Lee","Let's play it"]); }
}();
new class Step88 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let play1 = function() 
        { 
            Game.hand.activateUsedCard(); 
            Game.hand.crew[1].hasmove = true;
        }
        Game.draw.moveCard(Game.hand.hand[0],0,3,2,1,play1); 
        Game.hand.useCard(0);
    }
    render() { Game.draw.drawBubble(1.0467762326169405, 1.374968394437421, ["Notice how Ensign Lee's name turned green.","That means he has been activated and can play cards."],5.5588235294117645, 2.53475935828877); }
}();
new class Step88a extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(1.0467762326169405, 1.374968394437421, ["The Ensign has been activated for 1 turn.","There are also cards that activate crew for 2 or more turns!"]); }
}();
new class Step89 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let dmg = function()
        {
            Game.draw.drawAffect(1.5,0.9,0.5,2.1,"#ff0000");
            Game.enemy.activecard = cards["DEMO-5A"];
            Game.hand.ship[0].hp -= 2;
            Game.hand.ship[1].power -= 2;
        }
        let a = function() { Game.draw.moveCard(cards["DEMO-5A"],2,-1,2,1, dmg); }
        Game.draw.moveCard(Game.hand.activecard,2,1,4,3, a); 
        Game.hand.endTurn();
        Game.turn = 1;
    }
    render() { Game.draw.drawBubble(3.5053475935828877, 1.4973262032085561, ["The Alien Captain is a one trick pony!"]); }
}();
new class Step90 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        Game.enemy.endTurn(); 

        Game.turn = 2;
        Game.hand.ship[1].power = 5;
        let card3 = function() { Game.hand.addHand("DEMO-5"); }
        Game.draw.deal( card3 ); 
    }
    render() { Game.draw.drawBubble(3.5053475935828877, 1.4973262032085561, ["We've drawn the 'Fire!' card.","Let's do some damage"]); }
}();
new class Step91 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let play1 = function() 
        { 
            Game.hand.activateUsedCard(); 
            Game.hand.ship[1].power -= 2;
            Game.draw.drawAffect(3.5,2.1,0.5,0.9,"#ff0000");
            Game.enemy.ship[0].hp -= 5;
        }
        Game.draw.moveCard(Game.hand.hand[0],0,3,2,1,play1); 
        Game.hand.useCard(0);
    }
    render() { Game.draw.drawBubble(1.0467762326169405, 1.374968394437421, ["That's a good start, but now it's Ensign Lee's turn!"]); }
}();
new class Step92 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
    }
    render() { Game.draw.drawBubble(1.0467762326169405, 1.374968394437421, ["Since the Ensign has been activated for this turn,","we can click on him to see his hand."],5.5588235294117645, 2.53475935828877); }
}();
new class Step93 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let d = function()
        {
            Game.hand.activecrew = Game.hand.crew[1];
            Game.hand.captainhand = Game.hand.hand;
            Game.hand.hand = [];
            Game.hand.activecrew.effectText.push("Weapons: +1");
        }
        Game.draw.moveCard(Game.hand.crew[1],5,2.25,5,3, d);         
    }
    render() { Game.draw.drawBubble(1.0467762326169405, 1.374968394437421, ["Ensign Lee needs to draw his starting hand. Remember he only gets 1 card."]); }
}();
new class Step94 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let card3 = function() { Game.hand.addHand("DEMO-5");}
        Game.draw.deal( card3 ); 
    }
    render() { Game.draw.drawBubble(1.0467762326169405, 1.374968394437421, ["We made sure his deck is only attack cards, since he gets +1 to Weapons"]); }
}();
new class Step95 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
    }
    render() { Game.draw.drawBubble(1.0467762326169405, 1.374968394437421, ["We are unable to use his 'Fire!' card because the Phaser doesn't have power."],3.5614973262032086, 2.3262032085561497); }
}();
new class Step96 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
    }
    render() { Game.draw.drawBubble(1.0467762326169405, 1.374968394437421, ["We can still reroute power, however.","You can reroute power once per turn, and you can do it any time."]); }
}();
new class Step97 extends Bubble
{
    constructor() { super(); }
    update()
    {
        let phaser = Game.hand.ship[3];
        let engine = Game.hand.ship[2];
        let play1 = function() { Game.hand.ship[3] = engine; Game.hand.ship[3].skip = false; }
        let play2 = function() { Game.hand.ship[2] = phaser; Game.hand.ship[2].skip = false;}
        Game.draw.moveCard(Game.hand.ship[2],2,2,3,2,play1); 
        Game.draw.moveCard(Game.hand.ship[3],3,2,2,2,play2); 
        Game.hand.ship[3].skip = true;
        Game.hand.ship[2].skip = true;
    }
    render() { Game.draw.drawBubble(0.9562982005141389, 1.5218508997429305, ["With the power rerouted, we have enough juice to fire again!"]); }
}();
new class Step98 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let play1 = function() 
        { 
            Game.hand.activateUsedCard(); 
            Game.hand.ship[1].power -= 2;
            Game.draw.drawAffect(2.5,2.1,0.5,0.9,"#ff0000");
            Game.enemy.ship[0].hp -= 6;

            Game.hand.crew[1].hasmove = false;
        }
        Game.draw.moveCard(Game.hand.hand[0],0,3,2,1,play1); 
        Game.hand.useCard(0);
    }
    render() { Game.draw.drawBubble(3.5053475935828877, 1.4973262032085561, ["Ensign Lee is done, so our turn ends."]); }
}();
new class Step99 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let dmg = function()
        {
            Game.draw.drawAffect(1.5,0.9,0.5,2.1,"#ff0000");
            Game.enemy.activecard = cards["DEMO-5A"];
            Game.hand.ship[0].hp -= 2;
            Game.hand.ship[1].power -= 2;
        }
        let a = function() { Game.draw.moveCard(cards["DEMO-5A"],2,-1,2,1, dmg); }
        Game.draw.moveCard(Game.hand.activecard,2,1,4,3, a); 
        Game.hand.endTurn();
        Game.turn = 1;
        Game.hand.ship[1].power = 5;
    }
    render() { Game.draw.drawBubble(3.5053475935828877, 1.4973262032085561, ["Our turn, and Ensign Lee is no longer active."]); }
}();
new class Step100 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        Game.enemy.endTurn(); 

        Game.turn = 2;
        Game.hand.ship[1].power = 5;

        let d = function()
        {
            Game.hand.activecrew = Game.hand.crew[0];
            Game.hand.leehand = Game.hand.hand;
            Game.hand.hand = Game.hand.captainhand;
            let card3 = function() { Game.hand.addHand("DEMO-24"); }
            Game.draw.deal( card3 ); 
            }
        Game.draw.moveCard(Game.hand.crew[0],5,2.25,5,3, d);         
    }
    render() { Game.draw.drawBubble(3.5053475935828877, 1.4973262032085561, ["We drew the new card we got from training!","Before using it, lets jam up the enemy."]); }
}();
new class Step101 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let play1 = function() 
        { 
            Game.hand.activateUsedCard(); 
        }
        Game.draw.moveCard(Game.hand.hand[2],2,3,2,1,play1); 
        Game.hand.useCard(2);
    }
    render() { Game.draw.drawBubble(3.5053475935828877, 1.4973262032085561, ["That bought us some time for a big finish."]); }
}();
class Step102 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let dmg = function()
        {
            Game.draw.drawAffect(2.5,1.9,3.5,2.1,"#ffff00");
            Game.enemy.activecard = cards["DEMO-20"];
        }
        let fire = function()
        {
            Game.draw.moveCard(cards["DEMO-20"],2,-1,2,1, dmg);
        }
        Game.draw.moveCard(Game.hand.activecard,2,1,4,3,fire); 
        Game.hand.endTurn();
        Game.turn = 1;
    }
    render() { Game.draw.drawBubble(3.5053475935828877, 1.4973262032085561, ["He is nothing if not predictable"]); }
}
new Step102();
new class Step103 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        Game.enemy.endTurn(); 

        Game.turn = 2;
        Game.hand.ship[1].power = 5;
        let card3 = function() { Game.hand.addHand("DEMO-23"); }
        Game.draw.deal( card3 ); 
    }
    render() { Game.draw.drawBubble(3.5053475935828877, 1.4973262032085561, ["We've got Ensign Lee again! Perfect."]); }
}();
new class Step104 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let play1 = function() 
        { 
            Game.hand.activateUsedCard(); 
            Game.hand.crew[1].hasmove = true;
        }
        Game.draw.moveCard(Game.hand.hand[2],2,3,2,1,play1); 
        Game.hand.useCard(2);
    }
    render() { Game.draw.drawBubble(3.5053475935828877, 1.4973262032085561, ["Everything is all set"]); }
}();
new class Step105 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let dmg = function()
        {
            Game.draw.drawAffect(1.5,0.9,0.5,2.1,"#ff0000");
            Game.enemy.activecard = cards["DEMO-5A"];
            Game.hand.ship[0].hp -= 2;
            Game.hand.ship[1].power -= 2;
        }
        let a = function() { Game.draw.moveCard(cards["DEMO-5A"],2,-1,2,1, dmg); }
        Game.draw.moveCard(Game.hand.activecard,2,1,4,3, a); 
        Game.hand.endTurn();
        Game.turn = 1;
        Game.hand.ship[1].power = 5;
    }
    render() { Game.draw.drawBubble(3.5053475935828877, 1.4973262032085561, ["I've grown tired of this Alien Captain!"]); }
}();
new class Step106 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        Game.enemy.endTurn(); 

        Game.turn = 2;
        Game.hand.ship[1].power = 5;
        let card3 = function() { Game.hand.addHand("DEMO-7"); }
        Game.draw.deal( card3 ); 
    }
    render() { Game.draw.drawBubble(3.304812834224599, 1.481283422459893, ["Captain Smith is active, but we don't have to use him first.","Let's switch to Ensign Lee"]); }
}();
new class Step107 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let d = function()
        {
            Game.hand.crew[0].hasmove = true;
            Game.hand.activecrew = Game.hand.crew[1];
            Game.hand.captainhand = Game.hand.hand;
            Game.hand.hand = Game.hand.leehand
        }
        Game.draw.moveCard(Game.hand.crew[1],5,2.25,5,3, d);         
    }
    render() { Game.draw.drawBubble(1.0467762326169405, 1.374968394437421, ["Now that Ensign Lee is active, Captain's Smith name is green,","telling us he still has a move."]); }
}();
new class Step108 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        Game.enemy.endTurn(); 

        let card3 = function() { Game.hand.addHand("DEMO-8"); }
        Game.draw.deal( card3 ); 
    }
    render() { Game.draw.drawBubble(1.0467762326169405, 1.374968394437421, ["Ensign Lee has draw 'Full Salvo', and the power is already rerouted to support this card."]); }
}();
new class Step109 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let play1 = function() 
        { 
            Game.hand.activateUsedCard(); 
            Game.hand.ship[1].power -= 4;
            Game.draw.drawAffect(2.5,2.1,0.5,0.9,"#ff0000");
            Game.enemy.ship[0].hp -= 12;

            Game.hand.crew[1].hasmove = false;
        }
        Game.draw.moveCard(Game.hand.hand[0],0,3,2,1,play1); 
        Game.hand.useCard(0);
    }
    render() { Game.draw.drawBubble(3.5053475935828877, 1.4973262032085561, ["Ensign Lee's weapon skill really helped out!","Let's switch back to Captain Smith"]); }
}();
new class Step110 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let d = function()
        {
            Game.hand.crew[1].hasmove = false;
            Game.hand.activecrew = Game.hand.crew[0];
            Game.hand.leehand = Game.hand.hand;
            Game.hand.hand = Game.hand.captainhand;
        }
        Game.draw.moveCard(Game.hand.crew[0],5,2.25,5,3, d);         
    }
    render() { Game.draw.drawBubble(3.5053475935828877, 1.4973262032085561, ["Note that there isn't enough power left to fire the Phaser.","It's time for the Sigma Maneuver!"]); }
}();
new class Step110 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        let play1 = function() 
        { 
            Game.hand.activateUsedCard(); 
            Game.draw.drawAffect(2.5,2.1,0.5,0.9,"#ff0000");
            Game.enemy.ship[0].hp -= 2;

            Game.hand.crew[0].hasmove = false;
        }
        Game.draw.moveCard(Game.hand.hand[0],0,3,2,1,play1); 
        Game.hand.useCard(0);
    }
    render() { Game.draw.drawBubble(3.5053475935828877, 1.4973262032085561, ["We've won the fight, thanks to our crew!"]); }
}();
new class Step110 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
    }
    render() { Game.draw.drawBubble(1.0467762326169405, 1.374968394437421, ["Remember enemy ships can also have crew as well!","That's the end for now."]); }
}();
new class Step110 extends Bubble
{
    constructor() { super(); }
    update() 
    { 
        location.reload();
    }
    render() {  }
}();
