# Steering（外側ループ）— ハーネス自己改善

内側ループ（製品コード / UT / PBT）が止まったあと、または成功 run の事後監査で、**ハーネス自体**を改善する。
実行中の Segment A エージェントは、自分の CONDITIONS 成功条件を書き換えない。

## いつ回すか

- safe-stop が `Same-failure-limit` / `Max-iterations` / `unknown` で終わった
- PR レビューで「テスト不足」「hook が漏れた」「Fail class が足りない」と分かった
- deploy-ops の手順と実測が食い違った

## 入力（run 成果）

`hootl/runs/<Run-ID>/` に残すもの:

- 退避した `CONDITIONS.md`
- `loop-state.json`
- 失敗ログ抜粋（テスト名、Fail class）
- PR URL または stop 理由

## 改善候補（許可する変更）

| 対象 | 例 |
|---|---|
| UT / PBT | 再現した欠陥の回帰を `src/**/*_test.ts` 等へ追加 |
| Fail class | `cli-fail-classes.md` / CONDITIONS 表へ行を足す |
| auditor | checklist の手順を具体化 |
| hooks | 漏れた危険コマンドの matcher |
| deploy-ops | smoke 閾値・Rollback 手順の修正 |
| template | 既定 Max-iterations 等（緩和は禁止、厳格化は可） |

## 禁止

- 成功条件の緩和（テスト削除、check スキップ、OCR 閾値下げ）
- 内側 run のログを捏造して success 扱いにすること
- 承認なしの本番 deploy

## 手順

1. 新しい Run-ID で CONDITIONS を切り、Goal を「ハーネス更新」に限定する
2. Allowed paths に `hootl/**` と必要なテストパスだけを残す
3. 内側と同じく check + test + PR
4. マージ後、次の製品 run で回帰を見る

## 評価の物差し

- 同じ fingerprint で止まった率が下がったか
- scope_escape / deploy 未承認の誤発火が減ったか
- PR-CI とローカル `bun run check` / `bun test` が一致しているか
