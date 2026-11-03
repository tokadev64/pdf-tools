# auditor checklist — 停滞時

Segment A で `test_fail` / `check_fail` が続き、または同一 fingerprint が近いときに実行する。
質問はしない。このリスト以外の「別案」は CONDITIONS の許可範囲内だけ。

1. 失敗しているテスト名と期待値・実測値を読む
2. `git diff --name-only` で許可パス外があれば捨てる／戻す（`scope_escape`）
3. 最小修正を **1つだけ** 試し、`bun test`（必要なら対象ファイルだけ）を再実行する
4. UT 不足が原因なら、本番仕様を変えずに回帰 UT または PBT を1本足してから再実行する
5. 同一失敗が `Same-failure-limit` に達したら、依存更新・仕様変更・OCR 閾値変更をせず safe-stop
6. deploy / `wrangler` / zone / account に手を出していないことを確認する
7. 止めるときは Fail class と fingerprint を run ログへ書く
