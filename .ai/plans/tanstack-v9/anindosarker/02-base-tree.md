# 02: Base UI overrides on v9

## Goal

The 23 override files in `packages/shadcn-table/bases/base/components/ui/shadcn-table/**` carry
the same v9 renames as their shared counterparts; `tsc:baseui` and `test:base` are green.

## Steps

1. For each override, read the phase 01 diff of the shared file with the same path
   (`git diff <branch-point>..HEAD -- packages/shadcn-table/shared/components/ui/shadcn-table/<path>`)
   and apply the same hunks to the override by hand, keeping the Base UI props (menu
   `onClick`/`closeOnClick`, `render` instead of `asChild`, Base UI checkbox `indeterminate`
   prop, select `alignItemWithTrigger`, tooltip `delay`). Expected touch points:
   `inputs/ST_SelectCheckbox.tsx` (indeterminate gate, native range selection handler),
   `menus/*` (pin `'start'`/`'end'` values), `toolbar/ST_TablePagination.tsx` (`table.state`),
   `ShadcnTable.tsx` (`table.state` if read), `utils/style.utils.ts` (pinning values).
2. No override may end up byte-identical to its shared file (then delete it; the shared copy
   takes over). Check with `cmp` over the override folder.
3. Gates: `pnpm --filter shadcn-table tsc:baseui` 0, eslint on changed files 0,
   `test:base` 400/400 (foreground, long timeout), `storybook:build:base` exit 0.
4. Commit `feat(table-base): tanstack v9 overrides`, push.
