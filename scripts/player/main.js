import Game from "./game.js";

const game = new Game();

const homeBtn = document.getElementById("home");
const hitDeck = document.getElementById("hitDeck");
const playerCardsDiv = document.getElementById("playerCards");
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
    hitDeck.draggable = !disabled;
    hitDeck.style.opacity = disabled ? "0.5" : "1";
    standBtn.disabled = disabled;
}

game.startGame();
showHands();
updateButtons();

hitDeck.addEventListener("dragstart", (event) => {
    if (game.isRoundOver) {
        event.preventDefault();
        return;
    }

    if (standBtn.disabled) {
        event.preventDefault();
        return;
    }

    event.dataTransfer.setData("text/plain", "hit-card");
});

    playerCardsDiv.addEventListener("dragover", (event) => {
    if (game.isRoundOver || standBtn.disabled) return;

    event.preventDefault();
    playerCardsDiv.classList.add("drag-over");
});

    playerCardsDiv.addEventListener("dragleave", () => {
    playerCardsDiv.classList.remove("drag-over");
});

    playerCardsDiv.addEventListener("drop", async (event) => {
    event.preventDefault();
    playerCardsDiv.classList.remove("drag-over");

    if (game.isRoundOver || standBtn.disabled) return;

    const draggedItem = event.dataTransfer.getData("text/plain");
    if (draggedItem !== "hit-card") return;

    setActionButtonsDisabled(true);
    game.statusMessage = "Player draws a card...";
    showHands();

    await sleep(800);

    game.hit();
    showHands();
    updateButtons();

    await sleep(400);

    if (!game.isRoundOver) {
        setActionButtonsDisabled(false);
    }
    updateButtons();
});

    standBtn.addEventListener("click", async () => {
    if (game.isRoundOver) return;

    setActionButtonsDisabled(true);
    game.statusMessage = "Player chooses Stand...";
    showHands();

    await sleep(800);

    game.stand();
    showHands();

    await sleep(800);

    // dealer draws one card at a time with delay
    while (game.getDealerScore() < 17) {
        game.statusMessage = "Dealer draws a card...";
        showHands();

        await sleep(900);

        game.dealerDrawCard();
        showHands();

        await sleep(900);
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

    await sleep(600);

    game.startGame();
    showHands();
    updateButtons();

    setActionButtonsDisabled(false);
});

function updateButtons() {
    hitDeck.draggable = !game.isRoundOver;
    hitDeck.style.opacity = game.isRoundOver ? "0.5" : "1";
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