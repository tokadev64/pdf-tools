# Deploy ops（Segment B / HOTL）

エージェントの Segment A Success には含めない。
`Deploy-touch-policy: ask` — deploy 系シェルは承認後のみ。

## Prod-write-gate

- `main` push = live deploy（既存 `deploy.yml`）。エージェントは `main` に直 push しない
- プレビュー Worker / dry-run 用の別環境は持たない（現状）
- エージェントからの `wrangler deploy` / `bun run ensure-redirect` は hook が **ask**
- zone・account・`/pdf-tools` 外ルートは常に HITL（deny）

## Token-min-scope

GitHub Actions secret `CLOUDFLARE_API_TOKEN` に必要な権限（これ以外は付与しない）:

- Workers Scripts Edit
- Zone Workers Routes Edit
- Zone Read
- Dynamic URL Redirects Write

対象: `wrangler.toml` の account と `tokaga.me` zone のみ。

## Deploy-smoke

コマンド: `bun run hootl:deploy-smoke`

| 検査 | 合格 |
|---|---|
| `GET https://tokaga.me/pdf-tools/` | HTTP 200、本文にアプリの手がかり（`pdf-tools` または `#app`） |
| `GET https://tokaga.me/pdf-tools`（スラッシュなし） | 308 または 301。`Location` が `https://tokaga.me/pdf-tools/` 系 |
| 主要 asset（HTML が参照する JS/CSS のうち先頭1つ） | HTTP 200、サイズ > 0 |

ハッシュルート（`#/` / `#/split`）は静的ホスト側では同一 HTML のため、HTTP 層では 200 なら合格とする。

## Post-deploy-outcome

| 結果 | outcome |
|---|---|
| smoke 全合格 | success。追加の自動再試行なし |
| smoke 失敗 | **ジョブ失敗**（自動再試行しない）。通知は GitHub Actions の失敗表示に委ねる |
| CF API 5xx / ロック競合 | `Unknown-CF` — 最大1回だけ人手または `workflow_dispatch` で再実行。連続失敗なら止めて調査 |

## Deploy-fail-fallback

- 失敗した新版が部分適用されても、旧 Worker が残っているとは限らない
- 再試行は **1回まで**（concurrency group `cloudflare-deploy`）
- それでもだめなら Rollback へ

## Partial-fail

| 状態 | 復旧 |
|---|---|
| assets 成功・redirect 失敗 | `bun run ensure-redirect` を承認付きで再実行。smoke のスラッシュなし検査を再確認 |
| redirect 成功・assets 失敗 | 直前の成功デプロイへ Rollback。redirect はそのままでよい（同一 URL 契約） |
| 両方失敗 | Rollback を優先。redirect は `deploy-ops` の復元手順 |

## Rollback

1. 直近の成功した `main` commit を特定する
2. その commit を `main` に戻す PR、または GitHub の deploy workflow をその SHA で `workflow_dispatch`（可能な場合）
3. デプロイ後に `bun run hootl:deploy-smoke` を再実行
4. redirect が壊れているときだけ、承認付きで `bun run ensure-redirect`

Worker の「直前バージョン番号」UI 操作は人が行う（エージェントは CF ダッシュボードを操作しない）。

## Unknown-CF

- 5xx・レート制限・ルールセットロック: ログを保存し、15分空けて **1回** 再試行
- それでも失敗: stop。トークン権限と zone ロックを人が確認
