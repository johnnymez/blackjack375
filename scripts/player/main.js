import Game from "./game.js";
import { updateUsername } from "../utils.js";

const game = new Game(updateUsername());

const layout = document.getElementById("layout");
const homeBtn = document.getElementById("home");
const gameArea = document.getElementById("game");
const hitDeck = document.getElementById("hitDeck");
const playerCardsDiv = document.getElementById("playerCards");
const standBtn = document.getElementById("stand");
const betBtn = document.getElementById("bet-btn");
const betInput = document.getElementById("bet-input");
const restartBtn = document.getElementById("restart");
const doubleBtn = document.getElementById("double");
const splitBtn = document.getElementById("split");
const surrenderBtn = document.getElementById("surrender");
const balanceDisplay = document.querySelector("#balance");
const currentBetDisplay = document.querySelector("#currentBet");
const lastResultDisplay = document.querySelector("#lastResult");
const historyList = document.querySelector("#historyList");
const winDisplay = document.querySelector("#win");
const lossDisplay = document.querySelector("#loss");

let playerMoney = 1000;
let currentBet = 0;
let gameHistory = [];
let lastResult = "Place a bet to deal.";
let winCount = 0;
let lossCount = 0;

let delayDealerReveal = false;

homeBtn.addEventListener("click", () => {
    window.location.href = "../../index.html";
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function formatCurrency(amount) {
    return amount.toString();
}

function updateHistoryList() {
    if (!historyList) return;

    historyList.innerHTML = "";

    gameHistory
        .slice(-3)
        .reverse()
        .forEach((entry) => {
            const item = document.createElement("li");
            item.textContent = `${entry.result.toUpperCase()} | Bet: $${entry.bet} | Total: $${entry.total}`;
            historyList.appendChild(item);
        });
}

function updateBettingDisplay() {
    balanceDisplay.textContent = formatCurrency(playerMoney);
    currentBetDisplay.textContent = formatCurrency(currentBet);
    lastResultDisplay.textContent = lastResult;
    updateHistoryList();
}

function updateWinLossDisplay() {
    winDisplay.textContent = winCount;
    lossDisplay.textContent = lossCount;
}

function setGameplayActive(isActive) {
    layout.classList.toggle("awaiting-bet", !isActive);
    gameArea.classList.toggle("gameplay-disabled", !isActive);
    document.getElementById("controls").classList.toggle("gameplay-disabled", !isActive);
}

function setWaitingForBetState(message = "Place a bet to deal.") {
    delayDealerReveal = false;
    currentBet = 0;
    game.playerHands = [[]];
    game.currentHandIndex = 0;
    game.dealerHand = [];
    game.isRoundOver = true;
    game.splitMode = false;
    game.roundResults = [];
    game.statusMessage = message;

    setGameplayActive(false);
    showHands();
    updateButtons();
    updateBettingDisplay();
}

function finalizeRound() {
    if (!game.isRoundOver || currentBet <= 0) return;

    const result = game.getRoundResult() || "loss";
    const settledBet = currentBet;

    if (result === "win") {
        playerMoney += settledBet * 2;
        winCount++;
        lastResult = `Win! Paid $${settledBet * 2}.`;
    } else if (result === "tie") {
        playerMoney += settledBet;
        lastResult = `Tie. Returned $${settledBet}.`;
    } else {
        lossCount++;
        lastResult = `Loss. Lost $${settledBet}.`;
    }

    gameHistory.push({
        result,
        bet: settledBet,
        total: playerMoney
    });

    currentBet = 0;
    updateWinLossDisplay();
    updateBettingDisplay();
    updateButtons();
}

async function startRoundFromBet() {
    const betAmount = Number.parseInt(betInput.value, 10);

    if (!Number.isInteger(betAmount) || betAmount <= 0) {
        alert("Enter a bet greater than 0.");
        return;
    }

    if (betAmount > playerMoney) {
        alert("Your bet cannot be more than your available money.");
        return;
    }

    currentBet = betAmount;
    playerMoney -= betAmount;
    lastResult = `Bet placed: $${betAmount}`;
    setGameplayActive(true);
    updateBettingDisplay();
    updateButtons();
    setActionButtonsDisabled(true);

    await game.startGame();

    if (hitDeck && game.deck.cardBackPath) {
        hitDeck.src = game.deck.cardBackPath;
    }

    showHands();

    if (game.isRoundOver) {
        finalizeRound();
        return;
    }

    setActionButtonsDisabled(false);
    updateButtons();
}

function setActionButtonsDisabled(disabled) {
    hitDeck.draggable = !disabled;
    hitDeck.style.opacity = disabled ? "0.5" : "1";
    standBtn.disabled = disabled;
    doubleBtn.disabled = disabled;
    splitBtn.disabled = disabled;
    surrenderBtn.disabled = disabled;
}

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
    finalizeRound();
    updateButtons();
}

betBtn.addEventListener("click", async () => {
    if (currentBet > 0 && !game.isRoundOver) return;

    await startRoundFromBet();
});

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
        finalizeRound();
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
        finalizeRound();
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
    await sleep(200);
    setWaitingForBetState("Round reset. Place a bet to deal again.");
});

surrenderBtn.addEventListener("click", async () => {
    if (game.isRoundOver || !game.canSurrender()) return;

    setActionButtonsDisabled(true);

    game.statusMessage = `${game.username} chooses to surrender...`;
    showHands();
    await sleep(800);

    game.surrender();
    showHands();
    finalizeRound();
    updateButtons();
});

function updateButtons() {
    const roundActive = currentBet > 0 && !game.isRoundOver;

    hitDeck.draggable = roundActive;
    hitDeck.style.opacity = roundActive ? "1" : "0.5";

    standBtn.disabled = !roundActive;
    restartBtn.disabled = roundActive;
    doubleBtn.disabled = !roundActive || !game.canDouble();
    splitBtn.disabled = !roundActive || !game.canSplit();
    surrenderBtn.disabled = !roundActive || !game.canSurrender();
    betBtn.disabled = roundActive;
    betInput.disabled = roundActive;
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

updateWinLossDisplay();
setWaitingForBetState();
