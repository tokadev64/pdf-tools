# CLI-fail-classes

正本: `cli/main.ts` と `EMPTY_PDF_TEXT_MESSAGE`（`src/lib/markdown-writer.ts`）。
HOOTL 中に exit 契約やメッセージ文言を変えない。

| class | 条件 | 観測 | action（Segment A） |
|---|---|---|---|
| `input_invalid` | 引数なし、または入力が `.pdf` で終わらない | usage を stdout、`exit 1` | stop。CLI 仕様を広げない |
| `empty_pdf_text` | 全ページが空白のみ（`hasExtractedText` が false） | stderr に `EMPTY_PDF_TEXT_MESSAGE`、`exit 1` | メッセージ維持。OCR を勝手に足さない |
| `io_fail` | 読み書き例外（存在しないパス等） | 未捕捉例外で非0 | 再現手順をログし stop。握りつぶさない |
| `ocr_fail` | OCR ワーカー／言語データ例外 | 例外メッセージ | ログして stop。信頼度・空ページ率ゲートは **off**（下げない） |

## OCR-quality-gate

**off**（凍結）。

信頼度や空ページ率で Success / Fail を切らない。
ゲートを入れる変更は別 CONDITIONS（HITL）でだけ検討する。

## PR-success-def（観測）

必須:

- `bun run check`
- `bun test`（`*_test.ts` 全件。UT と PBT を含む）

任意（CONDITIONS に列挙したときだけ）:

- 列挙したテスト名の再実行

含めない:

- ブラウザ手動確認
- 本番 `https://tokaga.me/pdf-tools/` の目視（Segment B / `deploy-ops.md`）
