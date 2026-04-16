import Game from "./game.js";
import { updateUsername } from "../utils.js";
import {
    updateWinLossDisplay,
    setGameplayActive,
    setActionButtonsDisabled,
    updateButtons,
    showHands
} from "./uiController.js";
import {
    updateBettingDisplay,
    loadInitialBalance,
    finalizeRound
} from "./bettingManager.js";

const game = new Game(updateUsername());

const layout = document.getElementById("layout");
const gameArea = document.getElementById("game");
const controls = document.getElementById("controls");
const homeBtn = document.getElementById("home");
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

window.addEventListener("keydown", (event) => {
    if (event.key === "Esc" || event.key === "Escape") {
        event.preventDefault();
        window.location.href = "../../index.html";
    }
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function applyRoundResult() {
    const roundState = finalizeRound(
        game,
        currentBet,
        playerMoney,
        winCount,
        lossCount,
        lastResult,
        gameHistory
    );

    currentBet = roundState.currentBet;
    playerMoney = roundState.playerMoney;
    winCount = roundState.winCount;
    lossCount = roundState.lossCount;
    lastResult = roundState.lastResult;
    gameHistory = roundState.gameHistory;

    updateWinLossDisplay(winDisplay, lossDisplay, winCount, lossCount);
    updateBettingDisplay(
        balanceDisplay,
        currentBetDisplay,
        lastResultDisplay,
        historyList,
        playerMoney,
        currentBet,
        lastResult,
        gameHistory
    );
    updateButtons(
        game,
        currentBet,
        hitDeck,
        standBtn,
        restartBtn,
        doubleBtn,
        splitBtn,
        surrenderBtn,
        betBtn,
        betInput
    );
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

    setGameplayActive(layout, gameArea, controls, false);
    showHands(game, playerCardsDiv, delayDealerReveal);
    updateButtons(
        game,
        currentBet,
        hitDeck,
        standBtn,
        restartBtn,
        doubleBtn,
        splitBtn,
        surrenderBtn,
        betBtn,
        betInput
    );
    updateBettingDisplay(
        balanceDisplay,
        currentBetDisplay,
        lastResultDisplay,
        historyList,
        playerMoney,
        currentBet,
        lastResult,
        gameHistory
    );
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
    setGameplayActive(layout, gameArea, controls, true);
    updateBettingDisplay(
        balanceDisplay,
        currentBetDisplay,
        lastResultDisplay,
        historyList,
        playerMoney,
        currentBet,
        lastResult,
        gameHistory
    );
    updateButtons(
        game,
        currentBet,
        hitDeck,
        standBtn,
        restartBtn,
        doubleBtn,
        splitBtn,
        surrenderBtn,
        betBtn,
        betInput
    );
    setActionButtonsDisabled(hitDeck, standBtn, doubleBtn, splitBtn, surrenderBtn, true);

    await game.startGame();

    if (hitDeck && game.deck.cardBackPath) {
        hitDeck.src = game.deck.cardBackPath;
    }

    showHands(game, playerCardsDiv, delayDealerReveal);

    if (game.isRoundOver) {
        applyRoundResult();
        return;
    }

    setActionButtonsDisabled(hitDeck, standBtn, doubleBtn, splitBtn, surrenderBtn, false);
    updateButtons(
        game,
        currentBet,
        hitDeck,
        standBtn,
        restartBtn,
        doubleBtn,
        splitBtn,
        surrenderBtn,
        betBtn,
        betInput
    );
}

async function runDealerTurn() {
    game.statusMessage = "Dealer's turn.";
    showHands(game, playerCardsDiv, delayDealerReveal);
    await sleep(1000);

    while (game.getDealerScore() < 17) {
        game.statusMessage = "Dealer draws a card...";
        showHands(game, playerCardsDiv, delayDealerReveal);
        await sleep(1000);

        game.dealerDrawCard();
        showHands(game, playerCardsDiv, delayDealerReveal);
        await sleep(1000);
    }

    game.finishDealerTurn();
    showHands(game, playerCardsDiv, delayDealerReveal);
    applyRoundResult();
    updateButtons(
        game,
        currentBet,
        hitDeck,
        standBtn,
        restartBtn,
        doubleBtn,
        splitBtn,
        surrenderBtn,
        betBtn,
        betInput
    );
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

    setActionButtonsDisabled(hitDeck, standBtn, doubleBtn, splitBtn, surrenderBtn, true);
    game.statusMessage = `${game.splitMode ? `Hand ${game.currentHandIndex + 1}` : game.username} draws a card...`;
    showHands(game, playerCardsDiv, delayDealerReveal);
    await sleep(700);

    game.hit();
    showHands(game, playerCardsDiv, delayDealerReveal);
    await sleep(700);

    if (game.isCurrentHandBust()) {
        if (game.moveToNextHand()) {
            game.statusMessage = "Hand 1 busts. Playing hand 2.";
            showHands(game, playerCardsDiv, delayDealerReveal);
            await sleep(900);
            setActionButtonsDisabled(hitDeck, standBtn, doubleBtn, splitBtn, surrenderBtn, false);
            updateButtons(
                game,
                currentBet,
                hitDeck,
                standBtn,
                restartBtn,
                doubleBtn,
                splitBtn,
                surrenderBtn,
                betBtn,
                betInput
            );
            return;
        }

        if (game.hasActiveHand()) {
            await runDealerTurn();
            setActionButtonsDisabled(hitDeck, standBtn, doubleBtn, splitBtn, surrenderBtn, false);
            updateButtons(
                game,
                currentBet,
                hitDeck,
                standBtn,
                restartBtn,
                doubleBtn,
                splitBtn,
                surrenderBtn,
                betBtn,
                betInput
            );
            return;
        }

        delayDealerReveal = true;
        showHands(game, playerCardsDiv, delayDealerReveal);
        await sleep(900);
        delayDealerReveal = false;

        game.finishPlayerBustRound();
        showHands(game, playerCardsDiv, delayDealerReveal);
        applyRoundResult();
        updateButtons(
            game,
            currentBet,
            hitDeck,
            standBtn,
            restartBtn,
            doubleBtn,
            splitBtn,
            surrenderBtn,
            betBtn,
            betInput
        );
        return;
    }

    setActionButtonsDisabled(hitDeck, standBtn, doubleBtn, splitBtn, surrenderBtn, false);
    updateButtons(
        game,
        currentBet,
        hitDeck,
        standBtn,
        restartBtn,
        doubleBtn,
        splitBtn,
        surrenderBtn,
        betBtn,
        betInput
    );
});

standBtn.addEventListener("click", async () => {
    if (game.isRoundOver) return;

    setActionButtonsDisabled(hitDeck, standBtn, doubleBtn, splitBtn, surrenderBtn, true);

    if (game.splitMode) {
        game.statusMessage = `Hand ${game.currentHandIndex + 1} stands.`;
    } else {
        game.statusMessage = `${game.username} stands.`;
    }

    showHands(game, playerCardsDiv, delayDealerReveal);
    await sleep(800);

    if (game.moveToNextHand()) {
        game.statusMessage = "Playing hand 2.";
        showHands(game, playerCardsDiv, delayDealerReveal);
        await sleep(800);
        setActionButtonsDisabled(hitDeck, standBtn, doubleBtn, splitBtn, surrenderBtn, false);
        updateButtons(
            game,
            currentBet,
            hitDeck,
            standBtn,
            restartBtn,
            doubleBtn,
            splitBtn,
            surrenderBtn,
            betBtn,
            betInput
        );
        return;
    }

    await runDealerTurn();
    setActionButtonsDisabled(hitDeck, standBtn, doubleBtn, splitBtn, surrenderBtn, false);
    updateButtons(
        game,
        currentBet,
        hitDeck,
        standBtn,
        restartBtn,
        doubleBtn,
        splitBtn,
        surrenderBtn,
        betBtn,
        betInput
    );
});

doubleBtn.addEventListener("click", async () => {
    if (game.isRoundOver || !game.canDouble()) return;

    setActionButtonsDisabled(hitDeck, standBtn, doubleBtn, splitBtn, surrenderBtn, true);
    game.statusMessage = `${game.splitMode ? `Hand ${game.currentHandIndex + 1}` : game.username} doubles.`;
    showHands(game, playerCardsDiv, delayDealerReveal);
    await sleep(700);

    game.doubleCurrentHand();
    showHands(game, playerCardsDiv, delayDealerReveal);
    await sleep(900);

    if (game.isCurrentHandBust()) {
        if (game.moveToNextHand()) {
            game.statusMessage = "Current hand busts. Playing next hand.";
            showHands(game, playerCardsDiv, delayDealerReveal);
            await sleep(800);
            setActionButtonsDisabled(hitDeck, standBtn, doubleBtn, splitBtn, surrenderBtn, false);
            updateButtons(
                game,
                currentBet,
                hitDeck,
                standBtn,
                restartBtn,
                doubleBtn,
                splitBtn,
                surrenderBtn,
                betBtn,
                betInput
            );
            return;
        }

        delayDealerReveal = true;
        showHands(game, playerCardsDiv, delayDealerReveal);
        await sleep(900);
        delayDealerReveal = false;

        game.finishPlayerBustRound();
        showHands(game, playerCardsDiv, delayDealerReveal);
        applyRoundResult();
        updateButtons(
            game,
            currentBet,
            hitDeck,
            standBtn,
            restartBtn,
            doubleBtn,
            splitBtn,
            surrenderBtn,
            betBtn,
            betInput
        );
        return;
    }

    if (game.moveToNextHand()) {
        game.statusMessage = "Double complete. Playing hand 2.";
        showHands(game, playerCardsDiv, delayDealerReveal);
        await sleep(800);
        setActionButtonsDisabled(hitDeck, standBtn, doubleBtn, splitBtn, surrenderBtn, false);
        updateButtons(
            game,
            currentBet,
            hitDeck,
            standBtn,
            restartBtn,
            doubleBtn,
            splitBtn,
            surrenderBtn,
            betBtn,
            betInput
        );
        return;
    }

    await runDealerTurn();
    setActionButtonsDisabled(hitDeck, standBtn, doubleBtn, splitBtn, surrenderBtn, false);
    updateButtons(
        game,
        currentBet,
        hitDeck,
        standBtn,
        restartBtn,
        doubleBtn,
        splitBtn,
        surrenderBtn,
        betBtn,
        betInput
    );
});

splitBtn.addEventListener("click", async () => {
    if (game.isRoundOver || !game.canSplit()) {
        alert("You can only split when your first two cards have the same value.");
        return;
    }

    setActionButtonsDisabled(hitDeck, standBtn, doubleBtn, splitBtn, surrenderBtn, true);
    game.statusMessage = "Splitting hand...";
    showHands(game, playerCardsDiv, delayDealerReveal);
    await sleep(800);

    game.splitHand();
    showHands(game, playerCardsDiv, delayDealerReveal);
    await sleep(800);

    game.statusMessage = "Playing hand 1";
    showHands(game, playerCardsDiv, delayDealerReveal);
    await sleep(800);

    setActionButtonsDisabled(hitDeck, standBtn, doubleBtn, splitBtn, surrenderBtn, false);
    updateButtons(
        game,
        currentBet,
        hitDeck,
        standBtn,
        restartBtn,
        doubleBtn,
        splitBtn,
        surrenderBtn,
        betBtn,
        betInput
    );
});

restartBtn.addEventListener("click", async () => {
    setActionButtonsDisabled(hitDeck, standBtn, doubleBtn, splitBtn, surrenderBtn, true);
    await sleep(200);
    setWaitingForBetState("Round reset. Place a bet to deal again.");
});

surrenderBtn.addEventListener("click", async () => {
    if (game.isRoundOver || !game.canSurrender()) return;

    setActionButtonsDisabled(hitDeck, standBtn, doubleBtn, splitBtn, surrenderBtn, true);
    game.statusMessage = `${game.username} chooses to surrender...`;
    showHands(game, playerCardsDiv, delayDealerReveal);
    await sleep(800);

    game.surrender();
    showHands(game, playerCardsDiv, delayDealerReveal);
    applyRoundResult();
    updateButtons(
        game,
        currentBet,
        hitDeck,
        standBtn,
        restartBtn,
        doubleBtn,
        splitBtn,
        surrenderBtn,
        betBtn,
        betInput
    );
});

updateWinLossDisplay(winDisplay, lossDisplay, winCount, lossCount);
setWaitingForBetState();
loadInitialBalance((startingBalance) => {
    playerMoney = startingBalance;
    updateBettingDisplay(
        balanceDisplay,
        currentBetDisplay,
        lastResultDisplay,
        historyList,
        playerMoney,
        currentBet,
        lastResult,
        gameHistory
    );
});