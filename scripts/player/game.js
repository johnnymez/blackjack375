// game.js

import Deck from "./deck.js";

class Game {
    constructor(username) {
        this.deck = new Deck();
        this.username = username || "Player";

        this.playerHands = [[]];
        this.currentHandIndex = 0;
        this.dealerHand = [];

        this.isRoundOver = false;
        this.statusMessage = "";
        this.splitMode = false;
        this.roundResults = [];
    }

    async startGame() {
        await this.deck.createDeck();
        this.deck.shuffleDeck();

        this.playerHands = [[]];
        this.currentHandIndex = 0;
        this.dealerHand = [];
        this.isRoundOver = false;
        this.splitMode = false;
        this.roundResults = [];
        this.statusMessage = `Game started. ${this.username}'s turn.`;

        this.playerHands[0].push(this.deck.dealCard());
        this.playerHands[0].push(this.deck.dealCard());

        this.dealerHand.push(this.deck.dealCard());
        this.dealerHand.push(this.deck.dealCard());

        const playerScore = this.calculateScore(this.playerHands[0]);
        const dealerScore = this.calculateScore(this.dealerHand);

        if (playerScore === 21 && dealerScore === 21) {
            this.statusMessage = "Push (Both Blackjack)";
            this.isRoundOver = true;
            this.roundResults = ["tie"];
        } else if (playerScore === 21) {
            this.statusMessage = `Blackjack! ${this.username} wins!`;
            this.isRoundOver = true;
            this.roundResults = ["win"];
        } else if (dealerScore === 21) {
            this.statusMessage = "Dealer has Blackjack!";
            this.isRoundOver = true;
            this.roundResults = ["loss"];
        }
    }

    getCurrentHand() {
        return this.playerHands[this.currentHandIndex];
    }

    calculateScore(hand) {
        let total = 0;
        let aces = 0;

        for (let card of hand) {
            total += card.value;
            if (card.name === "A") aces++;
        }

        while (total > 21 && aces > 0) {
            total -= 10;
            aces--;
        }

        return total;
    }

    getPlayerScore() {
        return this.calculateScore(this.getCurrentHand());
    }

    getDealerScore() {
        return this.calculateScore(this.dealerHand);
    }

    hit() {
        if (this.isRoundOver) return null;

        const currentHand = this.getCurrentHand();
        const card = this.deck.dealCard();
        currentHand.push(card);

        if (this.splitMode) {
            this.statusMessage = `Hand ${this.currentHandIndex + 1} drew a card.`;
        } else {
            this.statusMessage = `${this.username} drew a card.`;
        }

        return card;
    }

    isCurrentHandBust() {
        return this.calculateScore(this.getCurrentHand()) > 21;
    }

    allHandsBust() {
        return this.playerHands.every(hand => this.calculateScore(hand) > 21);
    }

    hasActiveHand() {
        return this.playerHands.some(hand => this.calculateScore(hand) <= 21);
    }

    moveToNextHand() {
        if (this.splitMode && this.currentHandIndex < this.playerHands.length - 1) {
            this.currentHandIndex++;
            return true;
        }
        return false;
    }

    canDouble() {
        return !this.isRoundOver && this.getCurrentHand().length === 2;
    }

    doubleCurrentHand() {
        if (!this.canDouble()) return null;

        if (this.splitMode) {
            this.statusMessage = `Hand ${this.currentHandIndex + 1} doubles.`;
        } else {
            this.statusMessage = `${this.username} doubles.`;
        }

        return this.hit();
    }

    canSplit() {
        const hand = this.getCurrentHand();

        return (
            !this.isRoundOver &&
            !this.splitMode &&
            hand.length === 2 &&
            hand[0].value === hand[1].value
        );
    }

    splitHand() {
        if (!this.canSplit()) return false;

        const originalHand = this.playerHands[0];
        const firstCard = originalHand[0];
        const secondCard = originalHand[1];

        this.playerHands = [[firstCard], [secondCard]];
        this.splitMode = true;
        this.currentHandIndex = 0;

        this.playerHands[0].push(this.deck.dealCard());
        this.playerHands[1].push(this.deck.dealCard());

        this.statusMessage = `${this.username} split the hand. Playing hand 1.`;
        return true;
    }

    finishPlayerBustRound() {
        this.roundResults = this.playerHands.map(() => "loss");

        if (!this.splitMode) {
            this.statusMessage = `${this.username} busts! Dealer wins.`;
        } else {
            const results = this.playerHands.map((hand, index) => {
                const score = this.calculateScore(hand);
                return score > 21 ? `Hand ${index + 1} busts` : `Hand ${index + 1} survives`;
            });
            this.statusMessage = results.join(" | ");
        }

        this.isRoundOver = true;
    }


    dealerDrawCard() {
        const card = this.deck.dealCard();
        this.dealerHand.push(card);
        return card;
    }

    finishDealerTurn() {
        const dealerScore = this.calculateScore(this.dealerHand);
        const results = [];
        this.roundResults = [];

        this.playerHands.forEach((hand, index) => {
            const playerScore = this.calculateScore(hand);
            const handLabel = this.splitMode ? `Hand ${index + 1}` : this.username;

            if (playerScore > 21) {
                results.push(`${handLabel} busts`);
                this.roundResults.push("loss");
            } else if (dealerScore > 21 || playerScore > dealerScore) {
                results.push(`${handLabel} wins`);
                this.roundResults.push("win");
            } else if (dealerScore > playerScore) {
                results.push(`${handLabel} loses`);
                this.roundResults.push("loss");
            } else {
                results.push(`${handLabel} pushes`);
                this.roundResults.push("tie");
            }
        });

        this.statusMessage = results.join(" | ");
        this.isRoundOver = true;
    }

    canSurrender() {
        return (
            !this.isRoundOver &&
            !this.splitMode &&
            this.getCurrentHand().length === 2
        );
    }

    surrender() {
        if (!this.canSurrender()) return false;

        this.statusMessage = `${this.username} surrendered. Dealer wins half the bet.`;
        this.isRoundOver = true;
        this.roundResults = ["loss"];
        return true;
    }

    getRoundResult() {
        if (this.roundResults.length === 0) return null;

        const hasWin = this.roundResults.includes("win");
        const hasLoss = this.roundResults.includes("loss");
        const hasTie = this.roundResults.includes("tie");

        if (hasWin && hasLoss) return "tie";
        if (hasWin) return "win";
        if (hasTie && !hasLoss) return "tie";
        return "loss";
    }
}

export default Game;
