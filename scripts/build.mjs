// games.json から、ゲームごとの静的プレイページ(play/<id>/index.html)と sitemap.xml を生成する。
// JSで後からタイトル等を差し込むページは検索エンジンに個別ページとして扱われにくいため、
// メタ情報と本文をHTMLに焼き込んでおく。生成物はコミットする（Pagesはビルドしないため）。
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const SITE_URL = "https://guriguri00451.github.io/games/";
export const SITE_NAME = "t.そーまGames";
const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLAY_DIR = "play";

const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

// idはURLとファイルパスの両方に使うため、ディレクトリ脱出や記号を入れさせない
export function isValidId(id) {
  return typeof id === "string" && /^[a-z0-9][a-z0-9-]*$/.test(id);
}

export function playUrl(game) {
  return `${SITE_URL}${PLAY_DIR}/${game.id}/`;
}

function metaTags(game) {
  const description = escapeHtml(game.description || `${game.title}をブラウザで遊べます。`);
  const title = escapeHtml(`${game.title} | ${SITE_NAME}`);
  const tags = [
    `<meta name="description" content="${description}">`,
    `<link rel="canonical" href="${playUrl(game)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:url" content="${playUrl(game)}">`,
  ];
  if (game.thumbnail) {
    tags.push(
      `<meta property="og:image" content="${escapeHtml(SITE_URL + game.thumbnail)}">`,
      `<meta name="twitter:card" content="summary_large_image">`,
    );
  }
  return tags.map((tag) => `  ${tag}`).join("\n");
}

function instructionsHtml(lines) {
  if (!Array.isArray(lines) || lines.length === 0) return "";
  const items = lines.map((line) => `    <li>${escapeHtml(line)}</li>`).join("\n");
  return `  <ul class="play-instructions">\n${items}\n  </ul>\n`;
}

export function renderPlayPage(game) {
  const title = escapeHtml(game.title);
  const description = game.description ? `  <p class="play-description">${escapeHtml(game.description)}</p>\n` : "";
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} | ${escapeHtml(SITE_NAME)}</title>
${metaTags(game)}
  <link rel="stylesheet" href="../../css/style.css">
</head>
<body class="play-page">
  <header class="play-header">
    <a href="../../">← 一覧へ</a>
    <h1>${title}</h1>
    <button id="fullscreen" type="button" hidden>全画面</button>
  </header>
${description}${instructionsHtml(game.instructions)}  <iframe id="game-frame" title="${title}" src="../../games/${game.id}/index.html" allow="fullscreen; gamepad"></iframe>
  <script src="../../js/fullscreen.js"></script>
</body>
</html>
`;
}

export function renderSitemap(games) {
  const urls = [{ loc: SITE_URL }, ...games.map((game) => ({ loc: playUrl(game), lastmod: game.addedAt }))];
  const entries = urls
    .map(({ loc, lastmod }) => `  <url><loc>${escapeHtml(loc)}</loc>${lastmod ? `<lastmod>${escapeHtml(lastmod)}</lastmod>` : ""}</url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

export function selectLocalGames(entries) {
  const localGames = entries.filter((entry) => entry.type === "local");
  const invalid = localGames.filter((game) => !isValidId(game.id));
  if (invalid.length > 0) {
    throw new Error(`games.json に不正なidがある（英小文字・数字・ハイフンのみ可）: ${invalid.map((g) => g.id).join(", ")}`);
  }
  return localGames;
}

async function build() {
  const entries = JSON.parse(await readFile(path.join(ROOT_DIR, "games.json"), "utf8"));
  const games = selectLocalGames(entries);

  // 削除したゲームのページが残らないよう毎回作り直す
  await rm(path.join(ROOT_DIR, PLAY_DIR), { recursive: true, force: true });
  for (const game of games) {
    const dir = path.join(ROOT_DIR, PLAY_DIR, game.id);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, "index.html"), renderPlayPage(game));
  }
  await writeFile(path.join(ROOT_DIR, "sitemap.xml"), renderSitemap(games));
  console.log(`生成: ${games.length}ページ + sitemap.xml`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  build().catch((error) => {
    console.error(`ビルド失敗: ${error.message}`);
    process.exit(1);
  });
}
