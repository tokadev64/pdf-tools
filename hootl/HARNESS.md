# Harness（最小）

CODEX_HARNESS 相当の権限・文書マップ。

| 部品 | パス | 役割 |
|---|---|---|
| プロジェクト契約 | `AGENTS.md` | 監督モード、禁止、Success |
| run 入力 | `hootl/CONDITIONS.md`（template から生成） | 期限・許可パス・Fail class |
| 停止 | `hootl/stop-policy.md` | success / safe-stop / deadline |
| 監査役 | `hootl/auditor/checklist.md` | 停滞時の代替手順 |
| 内側ループ | `hootl/loop-runner.md` + `scripts/hootl/*` | max-iter / fingerprint |
| 外側ループ | `hootl/steering.md` | ハーネス自己改善 |
| CLI 観測 | `hootl/cli-fail-classes.md` | exit 契約 |
| Deploy | `hootl/deploy-ops.md` | smoke / rollback / token |
| Hooks | `.cursor/hooks.json` | fail-closed 強制 |
| PR CI | `.github/workflows/pr.yml` | check + test |
| Deploy CI | `.github/workflows/deploy.yml` | main のみ（人の merge 後） |

## 権限プロファイル

| 操作 | Segment A | Segment B |
|---|---|---|
| 許可パスへの編集 | 可 | — |
| `bun run check` / `bun test` | 可 | 可 |
| PR 作成 | check+test 成功後 | — |
| `wrangler deploy` / ensure-redirect | ask（Success 外） | ask または GHA |
| `main` push | deny | 人のみ |
| zone / 秘密 | deny | HITL |

## Skills

- 設計正本: Cursor skill `hootl-conditions-pdf-tools`
- 監督モデル: `hootl-hotl-hitl-agent-oversight`
- 公開: `pdf-tools-cloudflare-publish`（deploy 手順の実装側）
