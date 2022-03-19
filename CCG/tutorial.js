class TutorialManager
{
    constructor()
    {
        this.step = 0;
        this.updated = false;

        this.bubbles = [];
    }

    progress()
    {
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

class Step1 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(4.718446601941747, 1.3703190013869626, ["This is a Space Ship battle card game.","You are the captain of a space ship.", "Click to continue."]); }
}
new Step1();
class Step2 extends Bubble
{
    constructor() { super(); }
    render() {  Game.draw.drawBubble(4.718446601941747, 1.3703190013869626, ["This row is where information about your ship appears.", "A ship is comprised of Ship System cards."],5.417475728155339, 2.6574202496532595); }
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
    render() { Game.draw.drawBubble(4.0943134535367545, 2.535367545076283, ["This engine requires 2 power per turn.", "Without enough power, its evasion skill is disabled."],2.712898751733703, 2.335644937586685); }
}
new Step8();

class Step9 extends Bubble
{
    constructor() { super(); }
    update() { Game.hand.addSystem("DEMO-2"); }
    render() {Game.draw.drawBubble(5.092250922509225, 2.5141451414514147, ["This ship has a Phaser Cannon as its weapon.", "It takes 2 power to fire, and does 5 damage."],4.265682656826568, 2.6174661746617467); }
}
new Step9();
class Step10 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(1.8892988929889298, 1.5596555965559655, ["Each system has its own health.", "If a system is reduced to 0, it can't be used until repaired."], [{ x: 1.9261992619926198, y: 2.2878228782287824 },{ x: 2.959409594095941, y: 2.2878228782287824 },{ x: 4.044280442804428, y: 2.277982779827798 }] ); }
}
new Step10();

class Step11 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(1.8915510718789408, 3.278688524590164, ["Every ship needs a crew. You start with only one, the Captain.", "This ship is captained by Captain Smith."], 5.455233291298866, 3.4098360655737703 ); }
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
    render() { Game.draw.drawBubble(1.8892988929889298, 1.5596555965559655, ["Each crew member has their own deck of action cards.","The active crew member's deck goes here."],4.872635561160152, 3.2030264817150065 ); }
}
new Step13();
class Step14 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(1.8892988929889298, 1.5596555965559655, ["On your turn, the cards you draw into your hand will appear in this row."],3.230769230769231, 3.656998738965952 ); }
}
new Step14();
class Step15 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(4.153846153846154, 1.5737704918032787, ["When you play a card, it is placed in the middle, here."],3.238335435056747, 1.583858764186633 ); }
}
new Step15();
class Step16 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(6.045397225725095, 0.47414880201765447, ["This is where your opponent's ship will appear.", "You won't be able to see their crew or hand."],5.387137452711223, 0.47414880201765447 ); }
}
new Step16();
class Step17 extends Bubble
{
    constructor() { super(); }
    render() { Game.draw.drawBubble(4.040353089533418, 1.5939470365699875, ["Let's battle!"] ); }
}
new Step17();

