const CardType = {
    Unknown: 0,
    Action: 1,
    System: 2,
    Crew: 3
}

const SystemTypes = {
    Unknown : 100,
    Hull : 101,
    Power : 102,
    Weapon : 103,
    Nav: 104,
    Defense: 105
}

let SystemNames = {};

SystemNames[ SystemTypes.Unknown] = "Unknown";
SystemNames[ SystemTypes.Hull] = "Hull";
SystemNames[ SystemTypes.Power] = "Power";
SystemNames[ SystemTypes.Weapon] = "Weapon";
SystemNames[ SystemTypes.Nav] = "Nav";
SystemNames[ SystemTypes.Defense] = "Defense";
SystemNames[ CardType.Action] = "Action";
SystemNames[ CardType.Crew] = "Crew";

let ReverseSystemNames = {};

ReverseSystemNames[ "Unknown" ] = SystemTypes.Unknown;
ReverseSystemNames[ "Hull" ] = SystemTypes.Hull;
ReverseSystemNames[ "Power" ] = SystemTypes.Power;
ReverseSystemNames[ "Weapon" ] = SystemTypes.Weapon;
ReverseSystemNames[ "Nav" ] = SystemTypes.Nav;
ReverseSystemNames[ "Defense" ] = SystemTypes.Defense;

let cards = {};

class Card
{
    static get defaultCard()
    {
        return {
            id: 0,
            name: "Default Name",
            type: CardType.Unknown,
            requires: null,
            effectText: [],
            effects: [],
            hp: 0,
            system: SystemTypes.Unknown,
            power: 0    
        }
    }

    constructor(params)
    {
        Object.assign(this, Card.defaultCard);
        if (params) Object.assign(this, params);

        this.state = {};

        cards[this.id] = this;
    }
}

new Card({
    id: "DEMO-1",
    name: "Small Fusion Reactor",
    type: CardType.System,
    system: SystemTypes.Power,
    power: 5,
    effectText: ["A basic power core", "Provides 5 power per turn"],
    hp: 10
});

new Card({
    id: "DEMO-1A",
    name: "Small Fusion Reactor",
    type: CardType.System,
    system: SystemTypes.Power,
    power: 5,
    effectText: ["A basic power core", "Provides 5 power per turn"],
    hp: 10
});

new Card({
    id: "DEMO-2",
    name: "Phaser Cannon",
    type: CardType.System,
    system: SystemTypes.Weapon,
    power: -2,
    effectText: ["A small phased energy cannon", "Damage: 5", "External"],
    hp: 5
});

new Card({
    id: "DEMO-3",
    name: "Steel Hull",
    type: CardType.System,
    system: SystemTypes.Hull,
    effectText: ["Standard steel plating"],
    hp: 20
});

new Card({
    id: "DEMO-4",
    name: "Chemical Propultion Engine",
    type: CardType.System,
    system: SystemTypes.Nav,
    power: -2,
    effectText: ["Standard gimballing rocket", "fuel engine", "Evasion: 2", "Speed: 5", "External"],
    hp: 5
});

new Card({
    id: "DEMO-5",
    name: "FIRE!",
    type: CardType.Action,
    effectText: ["Fire one weapon system"],
    requires: [ "Weapon" ]
});

new Card({
    id: "DEMO-5A",
    name: "FIRE!",
    type: CardType.Action,
    effectText: ["Fire one weapon system"],
    requires: [ "Weapon" ]
});

new Card({
    id: "DEMO-6",
    name: "Captain Smith",
    type: CardType.Crew,
    effectText: ["Best captain in the fleet","Hand size: 3","Actions: 1"]
});

new Card({
    id: "DEMO-7",
    name: "Shields Up",
    type: CardType.Action,
    effectText: ["Activate one defensive system"],
    requires: [ "Defense" ]
});

new Card({
    id: "DEMO-8",
    name: "Full Salvo",
    type: CardType.Action,
    effectText: ["Fire one weapon system", "Damage: x2"],
    requires: [ "Weapon", "Power: x2" ]
});

new Card({
    id: "DEMO-9",
    name: "Ramming Speed",
    type: CardType.Action,
    effectText: ["Ram the enemy ship", "Damage: 10", "Hull: -2"],
    requires: [ "Nav", "Speed: 10" ]
});

new Card({
    id: "DEMO-10",
    name: "Self Destruct",
    type: CardType.Action,
    effectText: ["Destroy one vessel you control", "Deamge: 5 for each power point"],
    requires: [ "Power" ]
});

new Card({
    id: "DEMO-11",
    name: "Jamming Signal",
    type: CardType.Action,
    effectText: ["Enemy can not attack next turn"]
});

new Card({
    id: "DEMO-12",
    name: "On Screen",
    type: CardType.Action,
    effectText: ["Reveal enemy's external systems", "Once"]
});

new Card({
    id: "DEMO-13",
    name: "Evasive Action",
    type: CardType.Action,
    effectText: ["Avoid enemy fire for 2 turns", "Evade: +2"],
    requires: [ "Nav" ]
});

new Card({
    id: "DEMO-14",
    name: "Emergency Repairs",
    type: CardType.Action,
    effectText: ["Repair any non Hull system", "HP: +5"]
});

new Card({
    id: "DEMO-15",
    name: "Pedal to the Metal",
    type: CardType.Action,
    effectText: ["Increase speed for 1 turn.","Speed: +5"]
});

new Card({
    id: "DEMO-16",
    name: "Alien Captain",
    type: CardType.Crew,
    effectText: ["An angry alien","Hand size: 3","Actions: 1"]
});

new Card({
    id: "DEMO-17",
    name: "Reenforced Hull",
    type: CardType.System,
    system: SystemTypes.Hull,
    effectText: ["Stong steel plating"],
    hp: 25
});

new Card({
    id: "DEMO-18",
    name: "Machine Guns",
    type: CardType.System,
    system: SystemTypes.Weapon,
    power: -2,
    effectText: ["A pair of machine guns", "Damage: 4", "External"],
    hp: 5
});

new Card({
    id: "DEMO-19",
    name: "Chemical Propultion Engine",
    type: CardType.System,
    system: SystemTypes.Nav,
    power: -2,
    effectText: ["Standard rocket fuel engine", "Speed: 5", "External"],
    hp: 5
});

new Card({
    id: "DEMO-20",
    name: "Target System",
    type: CardType.Action,
    requires: [ "Weapon" ],
    effectText: ["Select a Ship System to attack"]
});

new Card({
    id: "DEMO-21",
    name: "Heavy Barrel",
    type: CardType.Action,
    requires: [ "Weapon" ],
    effectText: ["Damage: 5","Damage 5 to one other","random external system"]
});