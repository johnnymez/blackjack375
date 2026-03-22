// game.js

import Deck from "./deck.js";

class Game {
    constructor() {
        this.deck = new Deck();
        this.playerHand = [];
        this.dealerHand = [];
    }

    startGame() {
        this.deck.createDeck();
        this.deck.shuffleDeck();

        this.playerHand = [];
        this.dealerHand = [];

        // Deal initial cards
        this.playerHand.push(this.deck.dealCard());
        this.playerHand.push(this.deck.dealCard());

        this.dealerHand.push(this.deck.dealCard());
        this.dealerHand.push(this.deck.dealCard());

        console.log("Player Hand:", this.playerHand);
        console.log("Dealer Hand:", this.dealerHand);
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
        const card = this.deck.dealCard();
        this.playerHand.push(card);

        console.log("Player drew:", card);
        console.log("Player Score:", this.calculateScore(this.playerHand));

        if (this.calculateScore(this.playerHand) > 21) {
            console.log("Player busts!");
        }
    }

    stand() {
        console.log("Player stands. Dealer's turn.");

        while (this.calculateScore(this.dealerHand) < 17) {
            this.dealerHand.push(this.deck.dealCard());
        }

        const playerScore = this.calculateScore(this.playerHand);
        const dealerScore = this.calculateScore(this.dealerHand);

        console.log("Player Score:", playerScore);
        console.log("Dealer Score:", dealerScore);

        if (dealerScore > 21 || playerScore > dealerScore) {
            console.log("Player Wins!");
        } else if (dealerScore > playerScore) {
            console.log("Dealer Wins!");
        } else {
            console.log("Push (Tie)");
        }
    }
    getPlayerScore() {
    return this.calculateScore(this.playerHand);
    }

    getDealerScore() {
    return this.calculateScore(this.dealerHand);
    }
}



export default Game;