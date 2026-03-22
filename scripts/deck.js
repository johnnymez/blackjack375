// deck.js

class Deck {
    constructor() {
        this.cards = [];
        this.suits = ["heart", "diamond", "club", "spade"];
        this.values = [
            { name: "1", value: 11 },
            { name: "2", value: 2 },
            { name: "3", value: 3 },
            { name: "4", value: 4 },
            { name: "5", value: 5 },
            { name: "6", value: 6 },
            { name: "7", value: 7 },
            { name: "8", value: 8 },
            { name: "9", value: 9 },
            { name: "10", value: 10 },
            { name: "11", value: 10 },
            { name: "12", value: 10 },
            { name: "13", value: 10 }
        ];
    }

    // Create the 52-card deck
    createDeck() {
        this.cards = [];

        for (let suit of this.suits) {
            for (let val of this.values) {
                this.cards.push({
                    suit: suit,
                    name: val.name,
                    value: val.value, 
                    imgPath: `image/${suit}/${val.name}.png`
                });
            }
        }
    }

    // Fisher-Yates Shuffle Algorithm
    shuffleDeck() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    // Deal one card
    dealCard() {
        return this.cards.pop();
    }
}

export default Deck;