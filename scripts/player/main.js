import Game from "./game.js";
import { updateUsername } from '../utils.js';

const game = new Game(updateUsername());

const homeBtn = document.getElementById("home");
const hitDeck = document.getElementById("hitDeck");
const playerCardsDiv = document.getElementById("playerCards");
const balance = document.getElementById("balance");
const betBtn = document.getElementById("bet-btn");
const betInput = document.getElementById("bet-input");
const standBtn = document.getElementById("stand");
const restartBtn = document.getElementById("restart");
let delayDealerReveal = false;

homeBtn.addEventListener("click", () => {
    window.location.href = "../../index.html";
});
// Pressing H for instructions
window.addEventListener('keydown', event => {
    if (event.key === 'Esc' || event.key === 'Escape') {
        event.preventDefault();
        window.location.href = "../../index.html";
    }
});

// Load initial balance from JSON config
async function loadInitialBalance() {
    try {
        const response = await fetch('./scripts/config.json');
        if (!response.ok) throw new Error("Failed to load config.json");
        const data = await response.json();
        const balance = data.initialState.initialBalance || 1000;
        document.getElementById('balance').textContent = balance;
    } catch (error) {
        console.error("Error loading initial balance:", error);
        document.getElementById('balance').textContent = "Error";
    }
}

loadInitialBalance(); 

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

game.startGame().then(() => {
    if (hitDeck) {
        hitDeck.src = game.deck.cardBackPath;
    }
    showHands();
    updateButtons();
});

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
    game.statusMessage = `${game.username} draws a card...`;
    showHands();

    await sleep(800);

    game.hit();

    // if player busts still keep dealer hidden until reveal delay
    if (game.isRoundOver) {
        delayDealerReveal = true;
        showHands();          
        await sleep(1000);    
        delayDealerReveal = false;
        showHands();          
        updateButtons();
        return;
    }

    showHands();
    updateButtons();

    await sleep(400);

    setActionButtonsDisabled(false);
    updateButtons();
});

    standBtn.addEventListener("click", async () => {
    if (game.isRoundOver) return;

    setActionButtonsDisabled(true);
    game.statusMessage = `${game.username} chooses Stand...`;
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

    await game.startGame();
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
        const cardImgElement = card.render();
        cardImgElement.alt = `${card.name} of ${card.suit}`; 
        playerCardsDiv.appendChild(cardImgElement);
    });

    // show dealer cards
    game.dealerHand.forEach((card, index) => {
        let cardImgElement;

        if ((!game.isRoundOver || delayDealerReveal)&& index === 1) {
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

    playerScore.textContent = "Score: " + game.getPlayerScore();

    if (game.isRoundOver) {
        dealerScore.textContent = "Score: " + game.getDealerScore();
    } else {
        dealerScore.textContent = "Score: ?";
    }

    gameStatus.textContent = game.statusMessage;
}