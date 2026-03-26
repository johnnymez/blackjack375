// game.js

import Deck from "./deck.js";

class Game {
    constructor() {
        this.deck = new Deck();
        this.playerHand = [];
        this.dealerHand = [];
        this.isRoundOver = false;
        this.statusMessage = "";
    }

    startGame() {
        this.deck.createDeck();
        this.deck.shuffleDeck();

        this.playerHand = [];
        this.dealerHand = [];
        this.isRoundOver = false;
        this.statusMessage = "Game started. Player's turn.";

        // Deal initial cards
        this.playerHand.push(this.deck.dealCard());
        this.playerHand.push(this.deck.dealCard());

        this.dealerHand.push(this.deck.dealCard());
        this.dealerHand.push(this.deck.dealCard());

        console.log("Player Hand:", this.playerHand);
        console.log("Dealer Hand:", this.dealerHand);
        const playerScore = this.calculateScore(this.playerHand);
        const dealerScore = this.calculateScore(this.dealerHand);

        if (playerScore === 21 && dealerScore === 21) {
            this.statusMessage = "Push (Both Blackjack)";
            this.isRoundOver = true;
        } else if (playerScore === 21) {
            this.statusMessage = "Blackjack! Player wins!";
            this.isRoundOver = true;
        } else if (dealerScore === 21) {
            this.statusMessage = "Dealer has Blackjack!";
            this.isRoundOver = true;
        }
    }

    // Calculate score
    calculateScore(hand) {
        let total = 0;
        let aces = 0;

        for (let card of hand) {
            total += card.value;
            if (card.name === "A") aces++;
        }

        // Adjust Ace value if bust
        while (total > 21 && aces > 0) {
            total -= 10;
            aces--;
        }

        return total;
    }

    hit() {
    if (this.isRoundOver) return;

    const card = this.deck.dealCard();
    this.playerHand.push(card);

    if (this.calculateScore(this.playerHand) > 21) {
        this.statusMessage = "Player busts! Dealer wins.";
        this.isRoundOver = true;
    } else {
        this.statusMessage = "Player drew a card.";
        console.log("Player drew:", card);
    }
}

    stand() {
    if (this.isRoundOver) return;
    this.statusMessage = "Player stands. Dealer's turn.";
}
    getPlayerScore() {
    return this.calculateScore(this.playerHand);
    }

    getDealerScore() {
    return this.calculateScore(this.dealerHand);
    }

    dealerDrawCard() {
    const card = this.deck.dealCard();
    this.dealerHand.push(card);
    return card;
}

    finishDealerTurn() {
    const playerScore = this.calculateScore(this.playerHand);
    const dealerScore = this.calculateScore(this.dealerHand);

    console.log("Player Score:", playerScore);
    console.log("Dealer Score:", dealerScore);

    if (dealerScore > 21 || playerScore > dealerScore) {
        this.statusMessage = "Player wins!";
    } else if (dealerScore > playerScore) {
        this.statusMessage = "Dealer wins!";
    } else {
        this.statusMessage = "Push (Tie)";
    }

    this.isRoundOver = true;
}


}



export default Game;