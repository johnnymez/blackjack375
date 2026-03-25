// Function to load and render roles
async function loadRoles() {
    try {
        // 1. FETCH: Load the JSON file
        const response = await fetch('./config.json');
        if (!response.ok) throw new Error("Failed to load config.json");
        
        const data = await response.json();
        
        // 2. DOM REFERENCE: Where the buttons will go
        const container = document.getElementById('roleButtonContainer');
        container.innerHTML = ''; // Clear "Loading..." or old buttons

        // 3. DATA OPERATION: Iterate (forEach) through the roles array
        data.roles.forEach(role => {
            // Create the button element
            const btn = document.createElement('button');
            btn.textContent = role.name;
            btn.className = "rolebtn";
            
            // 4. PERSISTENCE: Save selection to localStorage on click
            btn.onclick = () => {
                // Visual feedback: remove 'selected' from others, add to this one
                document.querySelectorAll('.rolebtn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                
                // Save the path so the "Join Game" button knows where to go
                localStorage.setItem('selectedRolePath', role.path);
                console.log(`Role selected: ${role.name}`);
            };

            container.appendChild(btn);
        });

    } catch (error) {
        console.error("Error initializing roles:", error);
        document.getElementById('roleButtonContainer').innerHTML = 
            `<p style="color:red">Error loading roles. Check console.</p>`;
    }
}

// Initialize when the page is ready
window.addEventListener('DOMContentLoaded', loadRoles);