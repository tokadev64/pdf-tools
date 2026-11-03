# stop-policy — pdf-tools Segment A

## success

次をすべて満たしたら終了する（人の「もういいよ」は待たない）。

1. `bun run check` exit 0
2. `bun test` exit 0
3. 許可パス外 diff が空
4. PR URL が run ログにある

## safe-stop

次のいずれかで即終了。推測継続は禁止。

| 条件 | 記録 |
|---|---|
| `scope_escape` | 許可外パスを捨てた／戻したこと |
| deploy ask が拒否された | `deploy_unapproved` |
| `Max-iterations` 超過 | 最終失敗 fingerprint |
| `Same-failure-limit` 超過 | 同一 fingerprint と回数 |
| `input_invalid` / `empty_pdf_text` 契約を変えたくなった | 仕様変更禁止で stop |
| `ocr_fail` | 例外メッセージ。閾値は触らない |
| `unknown` | 証拠パスと止めた理由 |

## deadline

`Deadline` または `Max-wall-clock` 超過時:

1. 進行中の変更を commit するか破棄するかを CONDITIONS の Stop-policy 行に従う（未記入なら **branch に残し PR は作らない**）
2. merge しない
3. run ログに `outcome: deadline` を書く

## 終了後

- `hootl/CONDITIONS.md` を削除するか `hootl/runs/<Run-ID>/CONDITIONS.md` へ退避する
- 外側 steering が必要なら `hootl/steering.md` のチェックリストへ回す
