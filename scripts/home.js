// async function loadRoles() {
//     try {
//         // Load JSON file
//         const response = await fetch('./scripts/config.json');
//         if (!response.ok) throw new Error("Failed to load config.json");
        
//         const data = await response.json();
        
//         // Buttons container
//         const container = document.getElementById('roleButtonContainer');
//         container.innerHTML = ''; // Clear "Loading..." or old button

//         // Get roles from JSON and create buttons
//         data.roles.forEach(role => {
//             const btn = document.createElement('button');
//             btn.textContent = role.name;
//             btn.className = "rolebtn";
            
//             // Save selection to localStorage on click
//             btn.onclick = () => {
//                 document.querySelectorAll('.rolebtn').forEach(b => b.classList.remove('selected'));
//                 btn.classList.add('selected');
                
//                 // Save the path to "Join Game" button
//                 localStorage.setItem('selectedRolePath', role.path);
//                 console.log(`Role selected: ${role.name}`);

//                 // Change color of selected button
//                 document.querySelectorAll('.rolebtn').forEach(b => b.style.backgroundColor = '');
//                 btn.style.backgroundColor = '#A9A9A9'; // Green
//             };

//             container.appendChild(btn);
//         });

//     } catch (error) {
//         console.error("Error initializing roles:", error);
//         document.getElementById('roleButtonContainer').innerHTML = 
//             `<p style="color:red">Error loading roles. Check console.</p>`;
//     }
// }

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

// Initialize when the page is ready
// window.addEventListener('DOMContentLoaded', loadRoles);