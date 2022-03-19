const CardType = {
    Unknown: 0,
    Action: 1,
    System: 2,
    Crew: 3
}

const SystemTypes = {
    Unknown : 0,
    Hull : 1,
    Power : 2,
    Weapon : 3,
    Nav: 4
}

let SystemNames = [
    "Unknown",
    "Hull",
    "Power",
    "Weapon",
    "Engine"
]

let cardid = 1000;
let cards = {};

class Card
{
    static get defaultCard()
    {
        return {
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

        this.id = cardid++;
        this.state = {};

        cards[this.id] = this;
    }
}

new Card({
    name: "Small Fusion Reactor",
    type: CardType.System,
    system: SystemTypes.Power,
    power: 10,
    effectText: ["A basic power core", "Provides 10 power per turn"],
    hp: 10
});

new Card({
    name: "FIRE!",
    type: CardType.Action,
    effectText: ["Fire one weapon system"],
    requires: [ "Weapon" ]
});

new Card({
    name: "Phaser Cannon",
    type: CardType.System,
    system: SystemTypes.Weapon,
    power: -2,
    effectText: ["A small phased energy cannon", "Damage: 5"],
    hp: 5
});
