const statusEl = document.getElementById("status");
const frame = document.getElementById("game-frame");
const titleEl = document.getElementById("game-title");
const fullscreenButton = document.getElementById("fullscreen");
const instructionsEl = document.getElementById("instructions");

function renderInstructions(lines) {
  if (!Array.isArray(lines) || lines.length === 0) return;
  instructionsEl.replaceChildren(...lines.map((line) => {
    const item = document.createElement("li");
    item.textContent = line;
    return item;
  }));
  instructionsEl.hidden = false;
}

async function init() {
  const requestedId = new URLSearchParams(location.search).get("id");
  try {
    const response = await fetch("games.json");
    if (!response.ok) throw new Error(`games.json の取得に失敗 (HTTP ${response.status})`);
    const games = await response.json();
    // iframeのsrcはURLパラメータからではなく、games.jsonに存在するidから組み立てる
    const game = games.find((entry) => entry.type === "local" && entry.id === requestedId);
    if (!game) {
      statusEl.textContent = "ゲームが見つかりませんでした";
      return;
    }
    document.title = `${game.title} | t.そーまGames`;
    titleEl.textContent = game.title;
    frame.title = game.title;
    renderInstructions(game.instructions);
    frame.src = `games/${encodeURIComponent(game.id)}/index.html`;
    frame.hidden = false;
    statusEl.hidden = true;
    fullscreenButton.hidden = !document.fullscreenEnabled;
  } catch (error) {
    statusEl.textContent = `読み込みに失敗しました: ${error.message}`;
  }
}

fullscreenButton.addEventListener("click", () => frame.requestFullscreen());
init();
