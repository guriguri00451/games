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

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function createPlayLink(game) {
  const link = createElement("a");
  if (game.type === "external") {
    link.href = game.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Play ↗";
  } else {
    link.href = `play/${encodeURIComponent(game.id)}/`;
    link.textContent = "Play";
  }
  return link;
}

// ポートフォリオの components/WorkList.tsx と同じDOM構造。
// サムネは align-self:stretch でカード高さに伸びるため、構造や余白を変えると比率も変わる
function createCard(game) {
  const main = createElement("div", "work-main");
  main.append(createElement("h3", null, game.title), createElement("p", "work-tech", game.addedAt));
  if (game.description) main.append(createElement("p", null, game.description));

  const links = createElement("ul", "work-links");
  const linkItem = createElement("li");
  linkItem.append(createPlayLink(game));
  links.append(linkItem);
  main.append(links);

  const li = createElement("li");
  li.append(main);
  if (game.thumbnail) {
    const img = createElement("img", "work-thumb");
    img.src = game.thumbnail;
    img.alt = game.title;
    img.width = 640;
    img.height = 360;
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
