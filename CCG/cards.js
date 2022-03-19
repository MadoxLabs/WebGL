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
    Nav: 104
}

let SystemNames = {};

SystemNames[ SystemTypes.Unknown] = "Unknown";
SystemNames[ SystemTypes.Hull] = "Hull";
SystemNames[ SystemTypes.Power] = "Power";
SystemNames[ SystemTypes.Weapon] = "Weapon";
SystemNames[ SystemTypes.Nav] = "Nav";
SystemNames[ CardType.Action] = "Action";
SystemNames[ CardType.Crew] = "Crew";

let cards = {};

class Card
{
    static get defaultCard()
    {
        return {
            id: 0,
            name: "Default Name",
            type: CardType.Unknown,
            requires: [],
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
    power: 10,
    effectText: ["A basic power core", "Provides 10 power per turn"],
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
    hp: 10
});

new Card({
    id: "DEMO-5",
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
