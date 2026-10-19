# 02: Base UI tree on v9

## Goal

`bases/base` carries the same v9 port; `diff-bases` reports zero unexpected differences.

## Steps

1. From the branch after phase 01: `git diff <branch-point>..HEAD -- packages/shadcn-table/bases/radix/components/ui/shadcn-table packages/shadcn-table/bases/radix/package.json packages/shadcn-table/bases/radix/registry.ts` into a patch; rewrite the paths `bases/radix/` to `bases/base/` (`sed`); `git apply --3way`. Expect clean application for every file outside the 22 Base UI deltas (see `.ai/plans/v0.2-base-ui/anindosarker/02-base-tree.md` step 3); resolve the 22 by hand where hunks touch them (expected: `ST_SelectCheckbox.tsx` indeterminate gate, `menus/*` pin labels, `toolbar/ST_TablePagination.tsx` if it reads `table.state`).
2. `bases/base/package.json` and `registry.ts`: `@tanstack/react-table` 9.3.1.
3. Gates: `pnpm --filter shadcn-table tsc:base`, `test:base` 400/400, `storybook:build:base`,
   `node packages/shadcn-table/scripts/diff-bases.mjs` (if R3 has landed on the branch base;
   otherwise `diff -rq bases/radix/components/ui/shadcn-table bases/base/components/ui/shadcn-table`
   and compare against the 22-file allowlist).
4. Commit `feat(table-base): tanstack v9 port`, push.
