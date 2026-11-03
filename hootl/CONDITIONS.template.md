# CONDITIONS — pdf-tools
Oversight: HOOTL（実行中の質問・承認待ち禁止）
Segment: A
Run-ID: <yyyy-mm-dd-hhmm>
Deadline: <ISO8601>
Max-iterations: 8
Max-wall-clock: 2h
Same-failure-limit: 3
OCR-quality-gate: off
Deploy-touch-policy: ask

## Goal
指定された欠陥の修正、または UT / PBT の補強のみを行う。
許可パス内の差分だけを出し、`bun run check` と `bun test` を通し、PR を作成する（merge / deploy しない）。

## Success（機械判定）
- `bun run check` exit 0
- `bun test` exit 0
- 許可パス外の `git diff --name-only` が空
- PR が作成され URL がログにある
- （任意）対象回帰テスト名: <list>

## Fail classes → action
| class | 例 | action |
|---|---|---|
| test_fail | bun test 非0 | 最小修正を Max-iterations 内で再試行。Same-failure-limit 超過で stop |
| check_fail | fmt/lint 非0 | `bun run fmt` を1回まで。だめなら stop |
| input_invalid | CLI 引数不正 | stop（仕様変更しない） |
| empty_pdf_text | 空テキスト | 既存メッセージ契約を維持。仕様変更は禁止 |
| ocr_fail | OCR 例外 | Fail-class をログし stop。品質閾値を下げない |
| scope_escape | wrangler/account/zone・許可外パス | 捨てて abort |
| deploy_unapproved | deploy 系が未承認 | ask。拒否なら stop（Success に含めない） |
| unknown | CF API / 依存解決不能 | stop |

## Allowed paths
- src/**
- cli/**
- scripts/**
- hootl/**
- .cursor/hooks/**
- .cursor/hooks.json
- .github/workflows/pr.yml
- package.json
- bun.lock
- AGENTS.md
- README.md

## Forbidden
- `main` 直 push / force push
- zone 全体・`/pdf-tools` 外ルート
- 秘密・トークンのコミット
- 成功条件の緩和、依存の大規模更新（本 CONDITIONS に列挙がない限り）
- ユーザーへの質問・承認待ち
- OCR-quality-gate を run 中に on へ変え、閾値を下げること

## Priority
契約・既存テスト維持 > UT/PBT 補強 > 局所修正 > リファクタ > 新機能

## Stop-policy
- success: Success 満たして終了
- safe-stop: Fail class の abort/stop
- deadline: 差分を branch に残すか draft PR にするかをここに freeze し終了。merge しない

## Notes
- Segment B（deploy smoke / rollback）は人の merge 後、または承認付きシェル。手順は `hootl/deploy-ops.md`
- 外側 steering（ハーネス自己改善）は `hootl/steering.md`
