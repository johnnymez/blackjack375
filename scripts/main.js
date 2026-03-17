import Game from "./game.js";

const game = new Game();



//button start
const hitBtn = document.getElementById("hit");
const standBtn = document.getElementById("stand");
const restartBtn = document.getElementById("restart");

game.startGame();
showHands(game);

hitBtn.addEventListener("click", () => {
    game.hit();
    showHands(game);
});

standBtn.addEventListener("click", () => {
    // const result = game.stand(); //capturing the result
    game.stand();
    showHands(game);

    // document.getElementById("playerScore").textContent += ` - ${game.statusMessage}`;
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
    const gameStatus = document.getElementById("gameStatus");

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
    game.dealerHand.forEach((card, index) => {
        const cardEl = document.createElement("div");
        cardEl.classList.add("card");

        if (!game.isRoundOver && index === 0) {
            cardEl.textContent = "?";
            cardEl.classList.add("hidden-card");
        } else {
            cardEl.textContent = `${card.name} ${getSuitSymbol(card.suit)}`;
    }

    dealerCardsDiv.appendChild(cardEl);
});

    // update score
    playerScore.textContent = "Score: " + game.getPlayerScore();
    if (game.isRoundOver) {
        dealerScore.textContent = "Score: " + game.getDealerScore();
    } else {
        // const visibleDealerCard = game.dealerHand[1];
        dealerScore.textContent = "Score: " + game.calculateScore([game.dealerHand[1]]);
    }
    // update status message
    gameStatus.textContent = game.statusMessage;

    // disable buttons when round ends
    hitBtn.disabled = game.isRoundOver;
    standBtn.disabled = game.isRoundOver;
}

