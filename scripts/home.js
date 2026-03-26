//Join Game button logic
async function joinGame () {
    try {
        const response = await fetch('./scripts/config.json');
        const data = await response.json();
    
        const nameInput = document.getElementById('nameInput').value.trim();
        let finalUsername = nameInput || data.initialState.defaultUsername;

        if (finalUsername) {
            localStorage.setItem('username', finalUsername);
        }

        window.location.href = "player.html";
    } catch (error) {
        console.error('Error saving username to localStorage:', error);
    }
}
const joinGameBtn = document.getElementById('join');
joinGameBtn.addEventListener('click', joinGame);
// Allow pressing Enter to join game
window.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        event.preventDefault();
        joinGame();
    }
});
// Pressing I for instructions
window.addEventListener('keydown', event => {
    if (event.key === 'I' || event.key === 'i') {
        event.preventDefault();
        window.location.href = "instruction.html";
    }
});
//Pressing L for leaderboard
window.addEventListener('keydown', event => {
    if (event.key === 'L' || event.key === 'l') {
        event.preventDefault();
        window.location.href = "leaderboard.html";
    }
});

// Instructions button logic
const instructionBtn = document.getElementById('instruction');
instructionBtn.addEventListener('click', () => {
    window.location.href = "instruction.html";
});
// Leaderboard button logic
const leaderboardBtn = document.getElementById('leaderboard');
leaderboardBtn.addEventListener('click', () => {
    window.location.href = "leaderboard.html";
});

