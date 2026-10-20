# Handoff for the next session (written 2026-10-20)

For a fresh agent picking up shadcn-table after the 2026-10-19 run. Facts that live in plans,
commits or CI are referenced, not repeated.

## Where things stand

| Branch | Head | State | Source of detail |
| --- | --- | --- | --- |
| `claude/review` | `5cad6b3` | v0.2.0 candidate: PR #19 to `master`, CI green, **merge held for the owner's review** | https://github.com/anindosarker/shadcn-table/pull/19, `.ai/plans/v0.2-base-ui/anindosarker/` |
| `structure-cleanup` | `59a1369` | green (CI run 39206828507, review pass); forked from `claude/review` at `b1fd902`; **merge onto `claude/review` only after PR #19 is merged** | `.ai/plans/structure-cleanup/anindosarker/structure-cleanup-plan.md` |
| `feat/tanstack-v9` | `21d194e` | complete on top of `structure-cleanup`, version 0.3.0, CI run 39259626406 green, review pass; **never merge: the owner tests it locally** | `.ai/plans/tanstack-v9/anindosarker/`, docs page `getting-started/migrating-v1` on that branch |
| `master` | `1be829b` | v0.1.1 released | `.ai/plans/release-v0.1/anindosarker/` |
| `dev` | worktree `wt1` | owner's, do not touch | |

Only worktree `wt1` remains under `shadcn-react-table.worktrees/`. All side branches are
deleted locally and on origin.

Owner's merge order (decided 2026-10-19): PR #19, then R4 release steps in
`.ai/plans/v0.2-base-ui/anindosarker/04-release.md`, then `structure-cleanup` onto
`claude/review` and a new PR, then v9 after local testing (rebase onto `claude/review`
first). The owner said they will do these themselves; an agent only does them on an explicit
new instruction.

## Owner decisions not recorded elsewhere

- Separate editions per shadcn base, hand-written, no adapter layer, no invented APIs (the
  adapter attempt was reverted; see `v0.2-base-ui-plan.md` "Decision"). Later refined to one
  shared source with per-base override files (`structure-cleanup-plan.md` "Decision").
- Install target stays `components/ui/shadcn-table/` for both editions; no per-edition folder
  names. The base is a project property (`components.json` style), like shadcn's own parts.
- The docs app keeps two installed copies of the library (`components/ui`, `components/ui-base`)
  via `lib:install` / `lib:install:base`; do not replace them with path aliases.
- Labels: "Radix UI" and "Base UI" wherever a base is a choice; never bare "Radix" there.
- v9: no compatibility layer (no users yet); where TanStack has a native solution, use it
  (range selection); 0.x.y releases until v1.0.0, so the v9 branch bumps to 0.3.0.
- Roadmap order after v9: React Aria edition, then candidates in
  `.ai/plans/roadmap/roadmap-plan.md` (owner-owned file, never edit it).

## How this owner works with agents

- Rules in `CLAUDE.md` (repo) and the user's global CLAUDE.md apply. Non-obvious ones learned
  here: diagnose and propose before any edit, wait for "go"; decide trivial choices yourself;
  surface design decisions instead of picking silently (the owner objected once to a decision
  made for them); plans go to `.ai/plans/<feature>/anindosarker/<feature>-plan.md` with phase
  files `00-…`, `01-…` next to it; discuss scope before writing.
- Terse chat voice (`/caveman:ultracave` was active); full prose in anything persisted.
- Ports never to use: 3000, 5173, 5273, 5320 (owner's docs dev server from the main checkout),
  5404, 5406, 6006, 6007 (owner's `storybook:all`), 6306 (Vitest's Storybook). Never `pkill`;
  stop only processes you started, by PID. Never `git add -A`. No commit trailers or
  attribution. Push right after every commit. No comment-only or format-only commits.
- Parallel work: one Workflow per phase set, agents in `shadcn-react-table.worktrees/<name>`
  on their own branches, push only; a merge agent integrates on a branch with a temporary CI
  push trigger that it removes in a final commit; an adversarial review agent refutes the
  merge report; the lead fast-forwards or merges onto the target branch and deletes
  worktrees and branches. Workflow scripts from this session are saved under
  `~/.claude/projects/-Users-anindosarker-Work-Personal-React-table/998134b8-4375-4d9c-aa33-d8e988867d56/workflows/scripts/`
  (`r3-registry-docs-…`, `structure-cleanup-…`, `tanstack-v9-port-…`) and can be resumed
  with `Workflow({scriptPath, resumeFromRunId})`.
- Usage limits pause agents (seen twice at 5-hour boundaries); resume the workflow afterwards
  and send a push notification on pause and on finish (memory rule).
- `.next-*` noise in `apps/docs/tsconfig.json` (or `apps/shadcn-table-docs` on `claude/review`)
  and `app/global.css` rewrites by `lib:install` are reverted with `git checkout --` before
  committing. Inline `curl` is hook-blocked; use `node -e` fetch or the context-mode execute
  tool. Playwright resolves from `packages/shadcn-table/node_modules`.

## Verified this run (so you need not redo it)

- Storybook fix `9898a3d`: Storybook keys its Vite dep cache by config dir, so two editions
  shared one cache; `viteFinal` in `.storybook/main.ts` and a post plugin in
  `vitest.config.ts` suffix it with `ST_BASE`. Proof: both dev servers concurrently, 36/36
  story loads, 0 "Failed to fetch dynamically imported module"; `test` then `test:base`
  400/400 each.
- shadcn's own repo (checked 2026-10-19) duplicates identical files across
  `apps/v4/registry/bases/{radix,base,aria}`; its `CONTRIBUTING.md` structure tree is stale
  (`bases/` landed 2026-10-14). Our shared-plus-overrides layout is the deliberate deviation.

## Open, not started

- React Aria edition (roadmap item 3): no plan yet. With the shared layout it is a third
  override folder `bases/aria/` plus Aria parts; expect the same 20 to 25 override files.
- Docs leftovers listed in `handoff.md`'s previous version are now in the PR #19 body and in
  `04-release.md` "Known"; nothing else is pending.
