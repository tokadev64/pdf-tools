# Loop-runner（内側ループ）

Segment A の自己改善ループ。エージェント実行中に人が介在しない。

## 手順

1. `hootl/CONDITIONS.template.md` → `hootl/CONDITIONS.md` を作成し freeze
2. `bun run hootl:validate`
3. 作業ブランチを切る（`main` 直書き禁止）
4. 各 iteration:
   1. 最小差分を入れる（優先: 契約維持 → UT/PBT 補強 → 局所修正）
   2. `bun run check` / `bun test`
   3. 失敗なら fingerprint（失敗テスト名のソート結合）を `bun run hootl:loop-gate --record <fingerprint>` へ渡す
   4. loop-gate が非0なら stop-policy の safe-stop
5. Success を満たしたら PR 作成（`gh pr create` — 既存 pr-checks hook）
6. `hootl/CONDITIONS.md` を runs へ退避または削除

## 状態ファイル

`hootl/runs/<Run-ID>/loop-state.json`（gitignore）

```json
{
  "runId": "2026-11-03-1300",
  "iteration": 2,
  "sameFailureCount": 1,
  "lastFingerprint": "ocrConcurrency - ...",
  "outcome": "running"
}
```

## fail-closed

| 強制 | 手段 |
|---|---|
| PR 前 check+test | `.cursor/hooks/pr-checks.ts` |
| main push / force push deny | `.cursor/hooks/shell-guard.ts` |
| deploy ask | `.cursor/hooks/shell-guard.ts` |
| Allowed paths 外 Write deny | `.cursor/hooks/write-guard.ts`（CONDITIONS.md 存在時） |
| max-iter / same-failure | `hootl:loop-gate` |
