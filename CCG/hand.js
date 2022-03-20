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

    update()
    {
        let total = 0;
        for (let i in this.ship)
        {
            if (this.ship[i].system == SystemTypes.Power) total += this.ship[i].power;
        }
        for (let i in this.ship)
        {
            if (this.ship[i].system == SystemTypes.Power) continue;
            if (total >= -1*this.ship[i].power) 
            {
                this.ship[i].state.powered = true;
                total += this.ship[i].power;
            }
            else this.ship[i].state.powered = false;
        }
    }

    shipHasSystem(name)
    {
        let type = ReverseSystemNames[name];
        if (!type) return false;
        for (let i in this.ship)
        {
            if (this.ship[i].system == type && this.ship[i].hp > 0) return true;
        }
        return false;
    }

    addSystem(id)
    {
        let card = cards[id];
        if (card.type != CardType.System) return;
        card.hand = this;
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
                card.hand = this;
                return;
            }
        }
        card.hand = this;
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