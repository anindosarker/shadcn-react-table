# Handoff, 2026-10-20

State of every branch after the unattended run of 2026-10-19, what is waiting on the owner, and
how to check each piece. Written by the lead session; the owner merges.

## Branches

| Branch | Head | What it holds | Status |
| --- | --- | --- | --- |
| `claude/review` | `9898a3d` | v0.2.0 Base UI edition (R1 to R3), master merged in, base controls (command-bar dropdown, "Radix UI" label, Storybook edition button, `storybook:all`), Storybook per-edition dep cache fix | PR #19 to `master`, CI 19 pass / 2 skipped (install and registry jobs run on push only). **Merge held for the owner's review.** |
| `structure-cleanup` | `59a1369` | shared library source (`shared/`, 23 Base UI overrides), one `registry/` folder, `apps/docs`, `tsconfig.radix.json` / `tsconfig.baseui.json`, no `bases/*/package.json` stubs, no `diff-bases` | CI run 39206828507 10/10 green, review pass, installed output identical to v0.2.0 (92 files per item). Forked from `claude/review` at `b1fd902`; **merge onto `claude/review` after PR #19**, then the next PR to `master`. |
| `feat/tanstack-v9` | `21d194e` | TanStack Table 9.3.1 port on top of `structure-cleanup`, version 0.3.0, migration page, CI run 39259626406 10/10 green, review pass after one fix | **Not merged, by owner decision.** Owner tests locally. Rebase onto `claude/review` once `structure-cleanup` lands there. |
| `master` | `1be829b` | v0.1.1 plus Discord link | Released `v0.1.1`. |
| `dev` (worktree `wt1`) | `1be829b` | owner's branch | Untouched. |

Worktrees other than `wt1` are removed; every side branch (`r3-*`, `sc-*`, `v9-*`,
`base-controls`, `v02-registry`) is deleted locally and on origin.

## Owner steps, in order

1. Review PR #19 (https://github.com/anindosarker/shadcn-table/pull/19). Known leftovers listed
   in the PR body and in `.ai/plans/v0.2-base-ui/anindosarker/04-release.md`. Merge with a merge
   commit when satisfied; Vercel deploys `master`.
2. Finish R4 from `04-release.md`: verify production (`/r/radix/shadcn-table.json`,
   `/r/base/shadcn-table.json`, Storybook `/` and `/base/`, the base selector, `/SKILL.md`),
   tag `v0.2.0` on the merge commit, publish the release with the notes template there. Tick
   the State list in `.ai/plans/v0.2-base-ui/anindosarker/v0.2-base-ui-plan.md`.
3. `git checkout claude/review && git merge --no-ff structure-cleanup`, push, open the next PR
   to `master` (no release needed, or `v0.2.1`). Tick the last State item in
   `.ai/plans/structure-cleanup/anindosarker/structure-cleanup-plan.md`.
4. Test `feat/tanstack-v9` locally (below). When accepted: rebase onto `claude/review`, merge,
   PR to `master`, release `v0.3.0`.

## Local checks

Docs with the base switch (header pill, command-bar dropdown):

```sh
pnpm --filter shadcn-table-docs dev          # http://localhost:5320
```

Both Storybooks at once, with the toolbar button that opens the same story in the other
edition:

```sh
pnpm storybook:all                           # Radix UI 6006, Base UI 6007
```

Library gates on `claude/review` (pre-cleanup names):

```sh
pnpm --filter shadcn-table tsc && pnpm --filter shadcn-table tsc:base
pnpm --filter shadcn-table test && pnpm --filter shadcn-table test:base   # 400/400 each
```

On `structure-cleanup` and `feat/tanstack-v9` the type-check scripts are `tsc:radix` and
`tsc:baseui`; `test` / `test:base` unchanged. The v9 branch also has
`pnpm --filter shadcn-table-docs dev` with the "Migrating to v1" page under getting-started
and the hosted registry pinning `@tanstack/react-table@9.3.1`.

Scratch install from a local registry:

```sh
pnpm registry:dev                            # http://localhost:5310/r
pnpm dlx shadcn@latest add http://localhost:5310/r/shadcn-table.json        # Radix UI
pnpm dlx shadcn@latest add http://localhost:5310/r/shadcn-table-base.json   # Base UI
```

## What to look at on the v9 branch

- Public changes (17) are listed on the docs page `getting-started/migrating-v1` and in
  `.ai/plans/tanstack-v9/anindosarker/01-radix-tree.md`: `sortFn`, `sortFns`,
  `columnResizing`, `columnPinning: { start, end }`, `table.state` instead of
  `table.getState()`, `constructAggregationFn` definitions, native Shift-click range
  selection (`enableRowRangeSelection`), `getIsSomeRowsSelected` semantics, new exports
  `stFeatures` / `ST_Features`.
- One behaviour fix beyond renames: v9 refuses `row.toggleExpanded()` when a row cannot expand,
  so detail-panel rows (no `subRows`) get a `getRowCanExpand` default in
  `hooks/useST_TableOptions.ts`; story `DetailPanelEnabledSemantic` has a play test for it.
- Shift-click range selection is now TanStack's own (anchor on any ordinary click). Try it in
  the Selection stories and decide whether it feels right.

## Plans and notes

- `.ai/plans/v0.2-base-ui/anindosarker/` (R1 to R4), `.ai/plans/structure-cleanup/anindosarker/`,
  `.ai/plans/tanstack-v9/anindosarker/` (State lists ticked as far as the branches go),
  `.ai/plans/base-controls/anindosarker/` (shipped on `claude/review`).
- Roadmap after v9: React Aria edition, then the optional candidates in
  `.ai/plans/roadmap/roadmap-plan.md`.
- Known docs leftovers (not blocking): sidebar "Extra Storybook Examples" and dev-home footer
  link the Radix Storybook regardless of the selector; home page tiles render Radix only; the
  docs header pill is desktop-only (the command-bar dropdown covers mobile on the home page);
  Base UI tooltips have no skip-delay grouping.
