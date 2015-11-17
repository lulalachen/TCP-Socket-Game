function PlayingCards() {
    this.deck = this.getShuffle();
    this.currentLocation = 0;
}

PlayingCards.prototype.getRandom = function (max) {
    return Math.floor(Math.random() * (max + 1));
}

PlayingCards.prototype.getShuffle = function () {
    var deck = [];
    deck[0] = 0;
    for (var i = 1; i < 52; i++) {
        var j = this.getRandom(i);
        deck[i] = deck[j];
        deck[j] = i;
    }
    return deck;
}

PlayingCards.prototype.deal = function () {

    console.log("current: " + this.currentLocation);

    if (this.currentLocation >= this.deck.length) {
        this.deck = this.getShuffle();
        this.currentLocation = 0;
        console.log("Created new pack");
    }

    var cardNumber = this.deck[this.currentLocation];
    this.currentLocation = this.currentLocation + 1;
    return cardNumber;
}

function newCards () {
    return new PlayingCards();
}

exports.newCards = newCards;