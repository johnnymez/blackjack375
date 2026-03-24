import Game from "./game.js";

const game = new Game();

const homeBtn = document.getElementById("home");

const hitBtn = document.getElementById("hit");
const standBtn = document.getElementById("stand");
const restartBtn = document.getElementById("restart");

game.startGame();
showHands();
updateButtons();

homeBtn.addEventListener("click", () => {
    window.location.href = "../../index.html";
});


hitBtn.addEventListener("click", () => {
    game.hit();
    showHands();
    updateButtons();
});

standBtn.addEventListener("click", () => {
    game.stand();
    showHands();
    updateButtons();
});

restartBtn.addEventListener("click", () => {
    game.startGame();
    showHands();
    updateButtons();
});

function updateButtons() {
    hitBtn.disabled = game.isRoundOver;
    standBtn.disabled = game.isRoundOver;
}

function showHands() {
    const playerCardsDiv = document.getElementById("playerCards");
    const dealerCardsDiv = document.getElementById("dealerCards");

    const playerScore = document.getElementById("playerScore");
    const dealerScore = document.getElementById("dealerScore");
    const gameStatus = document.getElementById("gameStatus");

    playerCardsDiv.innerHTML = "";
    dealerCardsDiv.innerHTML = "";

    // show player cards
    game.playerHand.forEach(card => {
        const cardEl = document.createElement("img");
        cardEl.classList.add("card");
        cardEl.src = card.imgPath;
        cardEl.alt = `${card.name} of ${card.suit}`;
        playerCardsDiv.appendChild(cardEl);
    });

    // show dealer cards
    game.dealerHand.forEach((card, index) => {
        const cardEl = document.createElement("img");
        cardEl.classList.add("card");

        if (!game.isRoundOver && index === 1) {
            // hidden second dealer card during round
            cardEl.src = "image/card_back.png";
            cardEl.alt = "Hidden card";
        } else {
            cardEl.src = card.imgPath;
            cardEl.alt = `${card.name} of ${card.suit}`;
        }

        dealerCardsDiv.appendChild(cardEl);
    });

    // update player score
    playerScore.textContent = "Score: " + game.getPlayerScore();

    // update dealer score
    if (game.isRoundOver) {
        dealerScore.textContent = "Score: " + game.getDealerScore();
    } else {
        dealerScore.textContent = "Score: ?";
    }

    // update status message
    gameStatus.textContent = game.statusMessage;
}