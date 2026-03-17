// home.js

let selectedRole = "";

// input name text
const nameInput = document.getElementById("nameInput");

// button
const roleBtn = document.querySelectorAll(".rolebtn");
const joinBtn = document.getElementById("join");


roleBtn.forEach(btn => {
    btn.addEventListener("click", function() {
        selectedRole = this.getAttribute("data-role");
        roleBtn.forEach(b => b.style.backgroundColor = ""); // reset all buttons
        this.style.backgroundColor = "lightblue"; // highlight selected button
    });
});
joinBtn.addEventListener("click", function() {
    window.location.href = selectedRole;
});

