class HandManager
{
    constructor()
    {
        this.ship = [];
        this.hand = [];
        this.deck = null;
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

    addCrew(id)
    {
        let card = cards[id];
        if (card.type != CardType.Crew) return;
        this.crew.push(card);
    }

    activateCrew(i)
    {
        let card = this.crew[i];
        if (!card) return;
        this.activecrew = card;
    }
}