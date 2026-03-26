import Game from "./game.js";

const game = new Game();

const homeBtn = document.getElementById("home");
const hitBtn = document.getElementById("hit");
const standBtn = document.getElementById("stand");
const restartBtn = document.getElementById("restart");

homeBtn.addEventListener("click", () => {
    window.location.href = "../../index.html";
});

// small helper function for delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// disable all action buttons while processing
function setActionButtonsDisabled(disabled) {
    hitBtn.disabled = disabled;
    standBtn.disabled = disabled;
    restartBtn.disabled = disabled;
}

game.startGame();
showHands();
updateButtons();

hitBtn.addEventListener("click", async () => {
    if (game.isRoundOver) return;

    setActionButtonsDisabled(true);
    game.statusMessage = "Player chooses Hit...";
    showHands();

    await sleep(1000);

    game.hit();
    showHands();
    updateButtons();

    await sleep(500);
    setActionButtonsDisabled(false);
    updateButtons();
});

standBtn.addEventListener("click", async () => {
    if (game.isRoundOver) return;

    setActionButtonsDisabled(true);
    game.statusMessage = "Player chooses Stand...";
    showHands();

    await sleep(1000);

    game.stand();
    showHands();

    await sleep(1000);

    // dealer draws one card at a time with delay
    while (game.getDealerScore() < 17) {
        game.statusMessage = "Dealer draws a card...";
        showHands();

        await sleep(1200);

        game.dealerDrawCard();
        showHands();

        await sleep(1200);
    }

    game.finishDealerTurn();
    showHands();
    updateButtons();

    setActionButtonsDisabled(false);
    updateButtons();
});

restartBtn.addEventListener("click", async () => {
    setActionButtonsDisabled(true);
    game.statusMessage = "Starting new round...";
    showHands();

    await sleep(800);

    game.startGame();
    showHands();
    updateButtons();

    setActionButtonsDisabled(false);
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
            cardEl.src = "image/card_back.png";
            cardEl.alt = "Hidden card";
        } else {
            cardEl.src = card.imgPath;
            cardEl.alt = `${card.name} of ${card.suit}`;
        }

        dealerCardsDiv.appendChild(cardEl);
    });

    playerScore.textContent = "Score: " + game.getPlayerScore();

    if (game.isRoundOver) {
        dealerScore.textContent = "Score: " + game.getDealerScore();
    } else {
        dealerScore.textContent = "Score: ?";
    }

    gameStatus.textContent = game.statusMessage;
}