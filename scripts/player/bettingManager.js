export function formatCurrency(amount) {
    return amount.toString();
}

export function updateHistoryList(historyList, gameHistory) {
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

export function updateBettingDisplay(
    balanceDisplay,
    currentBetDisplay,
    lastResultDisplay,
    historyList,
    playerMoney,
    currentBet,
    lastResult,
    gameHistory
) {
    balanceDisplay.textContent = formatCurrency(playerMoney);
    currentBetDisplay.textContent = formatCurrency(currentBet);
    lastResultDisplay.textContent = lastResult;
    updateHistoryList(historyList, gameHistory);
}

export async function loadInitialBalance(balanceUpdater) {
    try {
        const response = await fetch("./scripts/config.json");
        if (!response.ok) throw new Error("Failed to load config.json");

        const data = await response.json();
        balanceUpdater(data.initialState.defaultBankroll || 1000);
    } catch (error) {
        console.error("Error loading initial balance:", error);
        balanceUpdater(1000);
    }
}

export function finalizeRound(game, currentBet, playerMoney, winCount, lossCount, lastResult, gameHistory) {
    if (!game.isRoundOver || currentBet <= 0) {
        return { currentBet, playerMoney, winCount, lossCount, lastResult, gameHistory };
    }

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

    return { currentBet, playerMoney, winCount, lossCount, lastResult, gameHistory };
}