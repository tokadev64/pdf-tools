# pdf-tools — Agent 契約

## Oversight

| セグメント | モード | 人の位置 |
|---|---|---|
| A（狭い修正・テスト補強 → check/test → PR） | **HOOTL** | review / merge のみ |
| B（main マージ後の deploy + redirect） | **HOTL** | deploy 系シェルは承認（ask）。マージ判断は人 |
| 対象外（zone 全体・他ルート・秘密・account） | **HITL** | 常に人 |

実行中（Segment A）はユーザーへの質問・承認待ち・呼び出しを禁止する。
不明点は `hootl/CONDITIONS.md`・本ファイル・リポジトリ証拠から決める。
決められない／危険なら推測せず安全停止し、理由をログへ残す。

## Goal（既定）

指定欠陥の修正、または **UT / PBT の補強**に限定する。
許可パス内の差分だけを出し、`bun run check` と `bun test` を通し、PR を作成する。
merge / 本番 deploy はしない（B は人の merge 後 CI、または承認付きシェル）。

## Success（機械判定）

- `bun run check` exit 0
- `bun test` exit 0
- 許可パス外の `git diff --name-only` が空
- PR が作成され URL がログにある

## Priority

契約・既存テスト維持 > UT/PBT 補強 > 局所修正 > リファクタ > 新機能

## Forbidden

- `main` への直接 push / force push
- zone 全体・`/pdf-tools` 外ルートの変更
- 秘密・トークンのコミット
- 成功条件の緩和、CONDITIONS に無い依存の大規模更新
- OCR 品質閾値の黙った引き下げ（`OCR-quality-gate: off`）
- Segment A 実行中のユーザーへの質問・承認待ち

## Deploy-touch-policy

`wrangler deploy` / `ensure-redirect` は **承認付き（ask）**。
未承認なら実行しない。承認されても Segment A の Success には含めない。

## HOOTL 起動

1. `hootl/CONDITIONS.template.md` を `hootl/CONDITIONS.md` にコピーし、Run-ID / Deadline / Allowed paths を埋める
2. `bun run hootl:validate` で CONDITIONS を検証する
3. 内側ループは `hootl/loop-runner.md` と `bun run hootl:loop-gate` に従う
4. 停滞時は `hootl/auditor/checklist.md`
5. 終了は `hootl/stop-policy.md`
6. 外側 steering は `hootl/steering.md`（ハーネス更新は別 run・事後監査）

`hootl/CONDITIONS.md` がある間、Write hook は Allowed paths 外を deny する。
