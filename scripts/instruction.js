const homeBtn = document.getElementById("home");
homeBtn.addEventListener("click", () => {
    window.location.href = "../../index.html";
});
// Pressing H for Homepage
window.addEventListener('keydown', event => {
    if (event.key === 'H' || event.key === 'h') {
        event.preventDefault();
        window.location.href = "../../index.html";
    }
});