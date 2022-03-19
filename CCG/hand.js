class HandManager
{
    constructor()
    {
        this.ship = [];
        this.hand = [];
        this.deck = null;
        this.crew = [];
        this.activecrew = null;
        this.activecard = null;
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

        for (let i in this.hand)
        {
            if (!this.hand[i]) 
            {
                this.hand[i] = card;
                return;
            }
        }
        this.hand.push(card);
    }

    getEmptyHandSlot()
    {
        for (let i in this.hand)
        {
            if (!this.hand[i]) 
            {
                return i;
            }
        }
        return this.hand.length;
    }

    useCard(i)
    {
        if (i < this.hand.length)
        {
            this.usedcard = this.hand[i];
            this.hand[i] = null;
        }
    }

    activateUsedCard()
    {
        this.activecard = this.usedcard;
    }
    
    endTurn()
    {
        this.activecard = null;
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