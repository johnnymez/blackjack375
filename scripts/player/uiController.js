export function updateWinLossDisplay(winDisplay, lossDisplay, winCount, lossCount) {
    winDisplay.textContent = winCount;
    lossDisplay.textContent = lossCount;
}

export function setGameplayActive(layout, gameArea, controls, isActive) {
    layout.classList.toggle("awaiting-bet", !isActive);
    gameArea.classList.toggle("gameplay-disabled", !isActive);
    controls.classList.toggle("gameplay-disabled", !isActive);
}

export function setActionButtonsDisabled(hitDeck, standBtn, doubleBtn, splitBtn, surrenderBtn, disabled) {
    hitDeck.draggable = !disabled;
    hitDeck.style.opacity = disabled ? "0.5" : "1";
    standBtn.disabled = disabled;
    doubleBtn.disabled = disabled;
    splitBtn.disabled = disabled;
    surrenderBtn.disabled = disabled;
}

export function updateButtons(
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
) {
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

export function showHands(game, playerCardsDiv, delayDealerReveal) {
    const dealerCardsDiv = document.getElementById("dealerCards");
    const playerScore = document.getElementById("playerScore");
    const dealerScore = document.getElementById("dealerScore");
    const gameStatus = document.getElementById("gameStatus");

    playerCardsDiv.innerHTML = "";
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

        hand.forEach((card) => {
            const cardImgElement = card.render();
            cardImgElement.alt = `${card.name} of ${card.suit}`;
            cardsRow.appendChild(cardImgElement);
        });

        handWrapper.appendChild(cardsRow);
        playerCardsDiv.appendChild(handWrapper);
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
        playerScore.textContent = `Score: ${game.getPlayerScore()}`;
    }

    if (game.isRoundOver) {
        dealerScore.textContent = `Score: ${game.getDealerScore()}`;
    } else {
        dealerScore.textContent = "Score: ?";
    }

    gameStatus.textContent = game.statusMessage;
}