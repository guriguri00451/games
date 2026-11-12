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
  const link = document.createElement("a");
  link.className = "card";
  if (isExternal) {
    link.href = game.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  } else {
    // idはgames.json由来のみを使い、URLパラメータの値をそのまま信用しない設計の入口
    link.href = `play.html?id=${encodeURIComponent(game.id)}`;
  }

  const thumb = document.createElement("div");
  thumb.className = "card-thumb";
  if (game.thumbnail) {
    thumb.style.backgroundImage = `url("${encodeURI(game.thumbnail)}")`;
  } else {
    thumb.style.background = `linear-gradient(135deg, ${game.color || "#4f46e5"}, #0f1117)`;
    thumb.textContent = game.emoji || "🎮";
  }

  const body = document.createElement("div");
  body.className = "card-body";
  const title = document.createElement("h2");
  title.className = "card-title";
  title.textContent = game.title;
  if (isExternal) {
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = "外部";
    title.append(badge);
  }
  const desc = document.createElement("p");
  desc.className = "card-desc";
  desc.textContent = game.description || "";

  body.append(title, desc);
  link.append(thumb, body);
  li.append(link);
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
