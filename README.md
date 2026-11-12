# Game Portal

GitHub Pages で公開する、ブラウザゲームのポータルサイト（ビルド不要の素の HTML/CSS/JS）。

## ゲームの追加

1. 自作ゲーム: `games/<id>/index.html` を置く（外部ファイルは相対パスで参照）
2. `games.json` に1件追記する

| キー | 必須 | 内容 |
|---|---|---|
| `id` | ✔ | フォルダ名と一致させる |
| `type` | ✔ | `local`（自作）/ `external`（外部リンク） |
| `title` | ✔ | 表示名 |
| `addedAt` | ✔ | `YYYY-MM-DD`（新着順に使用） |
| `url` | external のみ | 遷移先（http/https のみ） |
| `description` / `thumbnail` | | 説明文とサムネイル画像のパス（thumbnail は未指定なら表示しない） |

## ローカル確認

`fetch` を使うので `file://` では動かない。`python3 -m http.server` で確認する。

## 公開

Settings → Pages → Source を `main` ブランチ / root に設定。パスは全て相対なのでリポジトリ名に依存しない。
