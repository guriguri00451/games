const fullscreenButton = document.getElementById("fullscreen");
const frame = document.getElementById("game-frame");

fullscreenButton.hidden = !document.fullscreenEnabled;
fullscreenButton.addEventListener("click", () => frame.requestFullscreen());
