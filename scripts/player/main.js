import Game from "./game.js";
import { updateUsername } from "../utils.js";

const game = new Game(updateUsername());

const homeBtn = document.getElementById("home");
const hitDeck = document.getElementById("hitDeck");
const playerCardsDiv = document.getElementById("playerCards");
const standBtn = document.getElementById("stand");
const restartBtn = document.getElementById("restart");
const doubleBtn = document.getElementById("double");
const splitBtn = document.getElementById("split");
const surrenderBtn = document.getElementById("surrender");

let delayDealerReveal = false;

homeBtn.addEventListener("click", () => {
    window.location.href = "../../index.html";
});

async function loadInitialBalance() {
    try {
        const response = await fetch("./scripts/config.json");
        if (!response.ok) throw new Error("Failed to load config.json");

        const data = await response.json();
        const balance = data.initialState.defaultBankroll || 1000;
        document.getElementById("balance").textContent = balance;
    } catch (error) {
        console.error("Error loading initial balance:", error);
        document.getElementById("balance").textContent = "Error";
    }
}

loadInitialBalance();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setActionButtonsDisabled(disabled) {
    hitDeck.draggable = !disabled;
    hitDeck.style.opacity = disabled ? "0.5" : "1";
    standBtn.disabled = disabled;
    doubleBtn.disabled = disabled;
    splitBtn.disabled = disabled;
    surrenderBtn.disabled = disabled;
}

game.startGame().then(() => {
    if (hitDeck) {
        hitDeck.src = game.deck.cardBackPath;
    }
    showHands();
    updateButtons();
});

async function runDealerTurn() {
    game.statusMessage = "Dealer's turn.";
    showHands();
    await sleep(1000);

    while (game.getDealerScore() < 17) {
        game.statusMessage = "Dealer draws a card...";
        showHands();
        await sleep(1000);

        game.dealerDrawCard();
        showHands();
        await sleep(1000);
    }

    game.finishDealerTurn();
    showHands();
    updateButtons();
}

hitDeck.addEventListener("dragstart", (event) => {
    if (game.isRoundOver || standBtn.disabled) {
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
    game.statusMessage = `${game.splitMode ? `Hand ${game.currentHandIndex + 1}` : game.username} draws a card...`;
    showHands();
    await sleep(700);

    game.hit();
    showHands();
    await sleep(700);

if (game.isCurrentHandBust()) {
    if (game.moveToNextHand()) {
        game.statusMessage = `Hand 1 busts. Playing hand 2.`;
        showHands();
        await sleep(900);
        setActionButtonsDisabled(false);
        updateButtons();
        return;
    }

    // no more hands left
    if (game.hasActiveHand()) {
        await runDealerTurn();
        setActionButtonsDisabled(false);
        updateButtons();
        return;
    }

    delayDealerReveal = true;
    showHands();
    await sleep(900);
    delayDealerReveal = false;

    game.finishPlayerBustRound();
    showHands();
    updateButtons();
    return;
}

    setActionButtonsDisabled(false);
    updateButtons();
});

standBtn.addEventListener("click", async () => {
    if (game.isRoundOver) return;

    setActionButtonsDisabled(true);

    if (game.splitMode) {
        game.statusMessage = `Hand ${game.currentHandIndex + 1} stands.`;
    } else {
        game.statusMessage = `${game.username} stands.`;
    }

    showHands();
    await sleep(800);

    if (game.moveToNextHand()) {
        game.statusMessage = `Playing hand 2.`;
        showHands();
        await sleep(800);
        setActionButtonsDisabled(false);
        updateButtons();
        return;
    }

    await runDealerTurn();
    setActionButtonsDisabled(false);
    updateButtons();
});

doubleBtn.addEventListener("click", async () => {
    if (game.isRoundOver || !game.canDouble()) return;

    setActionButtonsDisabled(true);
    game.statusMessage = `${game.splitMode ? `Hand ${game.currentHandIndex + 1}` : game.username} doubles.`;
    showHands();
    await sleep(700);

    game.doubleCurrentHand();
    showHands();
    await sleep(900);

    if (game.isCurrentHandBust()) {
        if (game.moveToNextHand()) {
            game.statusMessage = `Current hand busts. Playing next hand.`;
            showHands();
            await sleep(800);
            setActionButtonsDisabled(false);
            updateButtons();
            return;
        }

        delayDealerReveal = true;
        showHands();
        await sleep(900);
        delayDealerReveal = false;

        game.finishPlayerBustRound();
        showHands();
        updateButtons();
        return;
    }

    if (game.moveToNextHand()) {
        game.statusMessage = `Double complete. Playing hand 2.`;
        showHands();
        await sleep(800);
        setActionButtonsDisabled(false);
        updateButtons();
        return;
    }

    await runDealerTurn();
    setActionButtonsDisabled(false);
    updateButtons();
});

splitBtn.addEventListener("click", async () => {
    if (game.isRoundOver || !game.canSplit()) {
        alert("You can only split when your first two cards have the same value.");
        return;
    }

    setActionButtonsDisabled(true);

    // show message
    game.statusMessage = "Splitting hand...";
    showHands();
    await sleep(800);

    // split
    game.splitHand();
    showHands();
    await sleep(800);

    // Transition to first hand
    game.statusMessage = "Playing hand 1";
    showHands();
    await sleep(800);

    setActionButtonsDisabled(false);
    updateButtons();
});

restartBtn.addEventListener("click", async () => {
    setActionButtonsDisabled(true);
    game.statusMessage = "Starting new round...";
    showHands();

    await sleep(800);

    delayDealerReveal = false;
    await game.startGame();

    if (hitDeck) {
        hitDeck.src = game.deck.cardBackPath;
    }

    showHands();
    updateButtons();
    setActionButtonsDisabled(false);
});

surrenderBtn.addEventListener("click", async () => {
    if (game.isRoundOver || !game.canSurrender()) return;

    setActionButtonsDisabled(true);

    game.statusMessage = `${game.username} chooses to surrender...`;
    showHands();
    await sleep(800);

    game.surrender();
    showHands();
    updateButtons();
});

function updateButtons() {
    hitDeck.draggable = !game.isRoundOver;
    hitDeck.style.opacity = game.isRoundOver ? "0.5" : "1";

    standBtn.disabled = game.isRoundOver;
    restartBtn.disabled = false;
    doubleBtn.disabled = game.isRoundOver || !game.canDouble();
    splitBtn.disabled = game.isRoundOver || !game.canSplit();
    surrenderBtn.disabled = game.isRoundOver || !game.canSurrender();
}

function showHands() {
    const playerCardsContainer = document.getElementById("playerCards");
    const dealerCardsDiv = document.getElementById("dealerCards");

    const playerScore = document.getElementById("playerScore");
    const dealerScore = document.getElementById("dealerScore");
    const gameStatus = document.getElementById("gameStatus");

    playerCardsContainer.innerHTML = "";
    dealerCardsDiv.innerHTML = "";

    game.playerHands.forEach((hand, index) => {
        const handWrapper = document.createElement("div");
        handWrapper.classList.add("hand-wrapper");

        if (game.splitMode && index === game.currentHandIndex && !game.isRoundOver) {
            handWrapper.classList.add("active-hand");
        }

        const handLabel = document.createElement("p");
        handLabel.textContent = game.splitMode ? `Hand ${index + 1} - Score: ${game.calculateScore(hand)}` : "";
        if (game.splitMode) {
            handWrapper.appendChild(handLabel);
        }

        const cardsRow = document.createElement("div");
        cardsRow.classList.add("split-hand-row");

        hand.forEach(card => {
            const cardImgElement = card.render();
            cardImgElement.alt = `${card.name} of ${card.suit}`;
            cardsRow.appendChild(cardImgElement);
        });

        handWrapper.appendChild(cardsRow);
        playerCardsContainer.appendChild(handWrapper);
    });

    game.dealerHand.forEach((card, index) => {
        let cardImgElement;

        if ((!game.isRoundOver || delayDealerReveal) && index === 1) {
            cardImgElement = document.createElement("img");
            cardImgElement.classList.add("card");
            cardImgElement.src = game.deck.cardBackPath;
            cardImgElement.alt = "Hidden card";
        } else {
            cardImgElement = card.render();
            cardImgElement.alt = `${card.name} of ${card.suit}`;
        }

        dealerCardsDiv.appendChild(cardImgElement);
    });

    if (game.splitMode) {
        playerScore.textContent = `Current hand score: ${game.getPlayerScore()}`;
    } else {
        playerScore.textContent = "Score: " + game.getPlayerScore();
    }

    if (game.isRoundOver) {
        dealerScore.textContent = "Score: " + game.getDealerScore();
    } else {
        dealerScore.textContent = "Score: ?";
    }

    gameStatus.textContent = game.statusMessage;
}