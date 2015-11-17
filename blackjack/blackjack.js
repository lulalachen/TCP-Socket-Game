var cards = require('./cards');


//////////////////////
/// Blackjack game ///
//////////////////////
function BlackjackGame (uid, roomId) {
    this.dealerHand = new BlackjackHand();
    this.cards = cards.newCards(); // Initialize deck
    this.roomId = roomId;
    this.playerList = [{
      // Room host
      uid : uid,
      status : 'Initializing',
      playerHand : new BlackjackHand()
    }];
}




BlackjackGame.prototype.newGame = function (uid) {
    // Start game
    this.dealerHand = new BlackjackHand();
    this.playerList = [{
      uid : uid,
      status : 'Playing',
      playerHand : new BlackjackHand()
    }];

    this.playerList.playerHand.addCard(this.cards.deal());

    this.dealerHand.addCard(this.cards.deal());
    this.playerList.addCard(this.cards.deal());

}

BlackjackGame.prototype.joinGame = function(uid) {
  this.playerList.push({
    uid : uid,
    ststus : 'Playing',
    playerHand : new BlackjackHand()
  });
};

BlackjackGame.prototype.isInProgress = function () {
    return (this.result === 'None') && (this.dealerHand.hasCards());
}

BlackjackGame.prototype.toJson = function () {
    return {
        dealer: {
            cards: this.dealerHand.getCards(),
            score: this.dealerHand.getScore()
        },
        player: {
            cards: this.playerHand.getCards(),
            score: this.playerHand.getScore(),
            balance: 102.50
        },
        result: this.result
    };
}

BlackjackGame.prototype.getResultForPlayer = function (uid) {
    var score;
    this.playerList.forEach(function(u){
      if (u.uid === uid){
        score = u.playerHand.getScore();
      }
    })
    return (score > 21) ? 'Busted' : 'Playing';
}

BlackjackGame.prototype.isGameInProgress = function () {
    return this.result === 'Playing';
}

BlackjackGame.prototype.hit = function (uid) {
    if (this.isGameInProgress(uid)) {
        this.playerHand.addCard(this.cards.deal());
        this.result = this.getResultForPlayer(uid);
    }
}

BlackjackGame.prototype.getResult = function () {
    var playerScore = this.playerHand.getScore();
    var dealerScore = this.dealerHand.getScore();

    if (this.playerHand.isBusted()) {
        return 'Busted';
    } else if (this.dealerHand.isBusted()) {
        return 'Win';
    }

    if (playerScore > dealerScore) {
        return 'Win';
    } else if (playerScore === dealerScore) {
        return 'Push';
    }
    return 'Lose';
}

BlackjackGame.prototype.stand = function () {
    if (this.isGameInProgress()) {
        while (this.dealerHand.getScore() < 17) {
            this.dealerHand.addCard(this.cards.deal());
        }
        this.result = this.getResult();
    }
}

//////////////////////
/// Blackjack hand ///
//////////////////////

function BlackjackHand() {
    this.cards = [];
}

BlackjackHand.prototype.hasCards = function () {
    return this.cards.length > 0;
}

BlackjackHand.prototype.addCard = function (card) {
    this.cards.push(card);
}

BlackjackHand.prototype.numberToSuit = function (number) {
  var suits = ['C', 'D', 'H', 'S'];
  var index = Math.floor(number / 13);
  return suits[index];
}

BlackjackHand.prototype.numberToCard = function (number) {
  return {
    rank: (number % 13) + 1,
    suit: this.numberToSuit(number)
  };
}

BlackjackHand.prototype.getCards = function () {
    var convertedCards = [];
    for (var i = 0; i < this.cards.length; i++) {
        var number = this.cards[i];
        convertedCards[i] = this.numberToCard(number);
    }
    return convertedCards;
}

BlackjackHand.prototype.getCardScore = function (card) {
    if (card.rank === 1) {
        return 11;
    } else if (card.rank >= 11) {
        return 10;
    }
    return card.rank;
}

BlackjackHand.prototype.getScore = function () {
    var score = 0;
    var cards = this.getCards();
    var aces = [];

    // Sum all cards excluding aces.
    for (var i = 0; i < cards.length; ++i) {
        var card = cards[i];
        if (card.rank === 1) {
            aces.push(card);
        } else {
            score = score + this.getCardScore(card);
        }
    }

    // Add aces.
    if (aces.length > 0) {
        var acesScore = aces.length * 11;
        var acesLeft = aces.length;
        while ((acesLeft > 0) && (acesScore + score) > 21) {
            acesLeft = acesLeft - 1;
            acesScore = acesScore - 10;
        }
        score = score + acesScore;
    }

    return score;
}

BlackjackHand.prototype.isBusted = function () {
    return this.getScore() > 21;
}

// Exports.
function newGame (uid, roomId) {
    return new BlackjackGame(uid, roomId);
}

exports.newGame = newGame