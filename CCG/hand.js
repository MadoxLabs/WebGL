class HandManager
{
    constructor()
    {
        this.ship = [];
        this.hand = [];
        this.deck = [];
        this.crew = [];
        this.activecrew = null;
    }

    addSystem(id)
    {
        let card = cards[id];
        if (card.type != CardType.System) return;
        this.ship.push(card);
    }

    addHand(id)
    {
        let card = cards[id];
        if (card.type != CardType.Action) return;
        this.hand.push(card);
    }
}