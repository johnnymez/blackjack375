// Hand Arrays
let playerHand = [];
let dealerHand = [];

let deck = [];

// Draw card
function drawCard() {
    return deck.pop();
}

// Score
function calculateHandValue(hand) {
    let total = 0;
    let aces = 0;

    for (let card of hand) {
        total += card.value;

        if (card.rank === "A") {
            aces++;
        }
    }

    // Ace value adjustment
    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }

    return total;
}
