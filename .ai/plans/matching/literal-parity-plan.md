# Literal Code Parity — Agent-Team Run

Make SRT component files read line-for-line like MRT, minus locked deviations.
Rules: `literal-parity-contract.md` (every teammate reads it first).

## Scope

59 SRT component files ↔ 58 MRT. Core (68 files) = headless, mostly aligned; a
light core pass last. CLI mirror out of scope.

## Team: `srt-literal-parity` — 8 teammates, run in parallel (clusters are independent)

| # | Teammate | Cluster | Files |
|---|----------|---------|-------|
| 1 | lp-buttons | buttons/ | 13 |
| 2 | lp-inputs  | inputs/ | 7 |
| 3 | lp-menus   | menus/ | 7 |
| 4 | lp-body    | body/ | 7 |
| 5 | lp-head    | head/ | 9 |
| 6 | lp-foot-tb | footer/ + toolbar/ | 10 |
| 7 | lp-table   | table/ + modals/ + SRT_Tooltip | 6 |
| 8 | lp-core    | core src parity-relevant .ts (strip stale comments only) | ~ |

Per file each teammate:
1. `diff` SRT vs MRT pair.
2. Strip stale comments (MRT has none).
3. Align ordering (destructure, JSX props, handlers, control flow) to MRT.
4. Preserve locked deviations verbatim.
5. `prettier --write` own files; `tsc` clean.
6. Report files touched + any unreachable-parity pair + reason.

## Lead (me)

- Write contract + plan (done).
- Spawn team, hand each teammate its cluster + contract path.
- On all-done: single authoritative `tsc -p tsconfig.app.json --noEmit`, `pnpm format`,
  `graphify update .`.
- Collect per-cluster reports → summary. No git commit.

## Gates

App `tsc` 0 real errors (ignore preexisting `baseUrl` TS5101). No behavior change.
