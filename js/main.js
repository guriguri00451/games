const grid = document.getElementById("game-grid");
const statusEl = document.getElementById("status");
const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");

const SORTERS = {
  newest: (a, b) => b.addedAt.localeCompare(a.addedAt),
  oldest: (a, b) => a.addedAt.localeCompare(b.addedAt),
  title: (a, b) => a.title.localeCompare(b.title, "ja"),
};

let games = [];

function isSafeHttpUrl(value) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function createCard(game) {
  const isExternal = game.type === "external";
  const li = document.createElement("li");

  const main = document.createElement("div");
  main.className = "game-main";
  const title = document.createElement("h3");
  const link = document.createElement("a");
  link.textContent = game.title;
  if (isExternal) {
    link.href = game.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent += " ↗";
  } else {
    link.href = `play.html?id=${encodeURIComponent(game.id)}`;
  }
  title.append(link);
  main.append(title);

  if (game.description) {
    const desc = document.createElement("p");
    desc.textContent = game.description;
    main.append(desc);
  }
  const meta = document.createElement("p");
  meta.className = "muted";
  meta.textContent = game.addedAt;
  main.append(meta);
  li.append(main);

  if (game.thumbnail) {
    const img = document.createElement("img");
    img.className = "game-thumb";
    img.src = game.thumbnail;
    img.alt = "";
    img.loading = "lazy";
    li.append(img);
  }
  return li;
}

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const visible = games
    .filter((game) => `${game.title} ${game.description || ""}`.toLowerCase().includes(query))
    .sort(SORTERS[sortSelect.value]);

  grid.replaceChildren(...visible.map(createCard));
  statusEl.textContent = visible.length === 0 ? "該当するゲームがありません" : `${visible.length}件`;
}

async function init() {
  try {
    const response = await fetch("games.json");
    if (!response.ok) throw new Error(`games.json の取得に失敗 (HTTP ${response.status})`);
    const entries = await response.json();
    // 外部リンクがjavascript:等にならないよう、登録時点でhttp(s)のみ通す
    games = entries.filter((entry) => entry.type !== "external" || isSafeHttpUrl(entry.url));
    render();
  } catch (error) {
    statusEl.textContent = `ゲーム一覧を読み込めませんでした: ${error.message}`;
  }
}

searchInput.addEventListener("input", render);
sortSelect.addEventListener("change", render);
init();
