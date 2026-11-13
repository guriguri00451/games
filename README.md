# Game Portal

GitHub Pages で公開する、ブラウザゲームのポータルサイト（素の HTML/CSS/JS。プレイページだけ生成スクリプトで作る）。

## ゲームの追加

1. 自作ゲーム: `games/<id>/index.html` を置く（外部ファイルは相対パスで参照）
2. `games.json` に1件追記する
3. `npm run build` で `play/<id>/index.html` と `sitemap.xml` を再生成し、生成物ごとコミットする

| キー | 必須 | 内容 |
|---|---|---|
| `id` | ✔ | フォルダ名と一致させる（英小文字・数字・ハイフンのみ。URL `play/<id>/` になる） |
| `type` | ✔ | `local`（自作）/ `external`（外部リンク） |
| `title` | ✔ | 表示名 |
| `addedAt` | ✔ | `YYYY-MM-DD`（新着順と sitemap の lastmod に使用） |
| `url` | external のみ | 遷移先（http/https のみ） |
| `description` / `thumbnail` | | 説明文（meta description にも使用）とサムネイル画像のパス（OGP画像にも使用。未指定なら表示しない） |
| `instructions` | | 遊び方。文字列の配列で、1要素1行としてプレイ画面のゲーム上部に表示 |

`play/` と `sitemap.xml` は生成物なので手で編集しない。旧URL `play.html?id=<id>` は `play/<id>/` へ転送される。

## ローカル確認

`fetch` を使うので `file://` では動かない。`python3 -m http.server` で確認する。テストは `npm test`。

## 公開

Settings → Pages → Source を `main` ブランチ / root に設定。サイトの絶対URLは canonical/OGP/sitemap 用に `scripts/build.mjs` の `SITE_URL` に持っている。

Search Console は URL プレフィックス `https://guriguri00451.github.io/games/` でプロパティを作り、`sitemap.xml` を送信する（robots.txt はホスト直下＝ポートフォリオ側にしか置けない）。
