import Game from "./game.js";

const game = new Game();

game.startGame();
showHands(game);

//button start
const hitBtn = document.getElementById("hit");
const standBtn = document.getElementById("stand");
const restartBtn = document.getElementById("restart");

hitBtn.addEventListener("click", () => {
    game.hit();
    showHands(game);
});

standBtn.addEventListener("click", () => {
    const result = game.stand(); //capturing the result
    game.stand();
    showHands(game);

    document.getElementById("playerScore").textContent += ` - ${result}`;
    hitBtn.disabled = true;
    standBtn.disabled = true;
});

restartBtn.addEventListener("click", () => {
    hitBtn.disabled = false;
    standBtn.disabled = false;
    game.startGame();
    showHands(game);
});
//button end


// function for symbols
function getSuitSymbol(suit) {
    const suits = {
        Hearts: "♥",
        Diamonds: "♦",
        Clubs: "♣",
        Spades: "♠"
    };

    return suits[suit];
}



function showHands(game) {

    const playerCardsDiv = document.getElementById("playerCards");
    const dealerCardsDiv = document.getElementById("dealerCards");

    const playerScore = document.getElementById("playerScore");
    const dealerScore = document.getElementById("dealerScore");

    // clear existing cards
    playerCardsDiv.innerHTML = "";
    dealerCardsDiv.innerHTML = "";

    // show player cards
    game.playerHand.forEach(card => {
        const cardEl = document.createElement("div");
        cardEl.classList.add("card");
        cardEl.textContent = `${card.name} ${getSuitSymbol(card.suit)}`;
        playerCardsDiv.appendChild(cardEl);
    });

    // show dealer cards
    game.dealerHand.forEach(card => {
        const cardEl = document.createElement("div");
        cardEl.classList.add("card");
        cardEl.textContent = `${card.name} ${getSuitSymbol(card.suit)}`;
        dealerCardsDiv.appendChild(cardEl);
    });

    // update score
    playerScore.textContent = "Score: " + game.getPlayerScore();
    dealerScore.textContent = "Score: " + game.getDealerScore();

    if (game.getPlayerScore() > 21){
        playerScore.textContent += " - BUST! You lose!";
        hitBtn.disabled = true;
        standBtn.disabled = true;
    }
}

