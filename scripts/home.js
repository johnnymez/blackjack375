//Join Game button logic
const joinGameBtn = document.getElementById('join');
joinGameBtn.addEventListener('click', () => {
    window.location.href = "../../player.html";
});
joinGameBtn.addEventListener('click', async () => {
    const response = await fetch('./scripts/config.json');
    const data = await response.json();
    
    const nameInput = document.getElementById('nameInput').value.trim();
    let finalUsername = nameInput || data.initialState.defaultUsername;

    if (finalUsername != null) {
        localStorage.setItem('username', finalUsername);
    }
});

// Instructions button logic
const instructionBtn = document.getElementById('instruction');
instructionBtn.addEventListener('click', () => {
    window.location.href = "../../instruction.html";
});
// Leaderboard button logic
const leaderboardBtn = document.getElementById('leaderboard');
leaderboardBtn.addEventListener('click', () => {
    window.location.href = "../../leaderboard.html";
});

