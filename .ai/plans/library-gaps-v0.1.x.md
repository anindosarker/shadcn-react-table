# Library gaps, v0.1.x

Status: planned 2026-10-19. Two agents in worktrees, branches `lib-gaps` and `docs-gaps`, pushed
as branches; the lead fast-forwards `lib-gaps` first, then rebases and merges `docs-gaps`, then
one PR to `master`. Patch release `v0.1.1`, no breaking change.

Source of the list: `.ai/plans/handoff/ATTENTION-2026-10-17-claude-review.md` (library bug
notes) and `.ai/plans/matching/docs-parity-notes.md` "## Library gaps" (names there are
pre-rename: `SRT_` is now `ST_`, `srt*Props` is `st*Props`).

Rules for both agents: fix the narrowest layer; no new public surface unless an item below says
so; every library change gets or updates a story under `packages/shadcn-table/stories` that
fails before and passes after; `pnpm --filter shadcn-table tsc`, `lint`, `pnpm test`,
`storybook:build`; then `lib:install` in the docs app, `git checkout -- apps/shadcn-table-docs/app/global.css`,
`types:check`, `build`, page gate clusters `a` and `e` on an agent port.

## Agent `lib-gaps` (library, plus docs samples it changes)

1. **Cell action menu on right-click.** `ST_CellActionMenu` opens on `contextmenu`; Radix closes
   it on the right button's `pointerup`. Keep the menu open: ignore the opening gesture's
   `pointerup` (e.g. `onPointerUp` guard or open on the next frame), keep Escape and outside
   click closing. Story: right-click a cell, menu stays open; verify in the browser test.
2. **Tooltip accessible name.** `ST_Tooltip` triggers (icon buttons) carry no name. When the
   trigger child has no text content and no `aria-label`, set `aria-label` to the tooltip title
   string. Story asserts `getByRole('button', { name })` for a toolbar icon.
3. **Caption bottom.** `ST_Table` `<caption>` renders on top. Default to `caption-bottom` so
   the Caption story's `BottomCaption` matches MRT; `stTableProps.className` can override.
4. **TooltipProvider in headless use.** Sub-components used outside `<ShadcnTable />` throw.
   Wrap each exported composite root that renders tooltips (`ST_TopToolbar`,
   `ST_BottomToolbar`, `ST_TableContainer`, `ST_TableLayout`; audit the barrel for others) in
   `TooltipProvider` with the same `skipDelayDuration={0}`. Do not wrap every `ST_Tooltip`
   (loses hover grouping). Remove the `TooltipProvider` from `apps/shadcn-table-docs/app/layout.tsx`
   afterwards and prove the docs home page and `custom-headless` example still work. Nested
   providers are fine: a provider scopes only the tooltips inside it.
5. **`stTableBodyRowProps.hover`.** MRT's `hover` flag. Add `hover?: boolean` (default true);
   false removes the hover background. Replace the className workaround in the `minimal`
   example and its story.
6. **Docs samples with undeclared props.** Decide per prop, rule: MUI-only styling knobs are
   rewritten in the sample; small real features are added.
   - `stPaginationProps.rowsPerPageOptions` (pagination guide): check `ST_TablePagination.tsx`
     and `types.ts`; if the option already exists under that name, the sample is fine, else add
     it (it is a feature, not styling).
   - `stLinearProgressProps.color`, `stSearchTextFieldProps.variant` and `size`,
     `stPaginationProps.color`/`shape`/`variant`, `stCopyButtonProps.startIcon`,
     `stToolbarAlertBannerProps.color`: rewrite the samples with `className` or drop the prop.
   - `stEditTextFieldProps.error` and `helperText` (editing guide and editing-crud examples):
     validation text is a feature. Add `helperText?: ReactNode` and `error?: boolean` to
     `ST_EditTextField` (renders the text under the input, `aria-invalid` on error). Update the
     editing-crud examples to use them.
   - `stTheme.cellNavigationOutlineColor` (accessibility guide): no `stTheme` exists; rewrite
     the sample to the CSS variable the outline uses (find it in the styles).
   - `ST_Tooltip` and `useST_MediaQuery` not exported from the barrel: export them, switch the
     path imports in `custom-column-filtering-ui`, `dynamic-columns`, `editing-crud-*` to the
     barrel.
7. `pnpm.overrides` in `packages/shadcn-table/package.json` has no effect; move the override to
   the root `package.json` (already has one for `@types/react`, merge) and `pnpm install`.

## Agent `docs-gaps` (docs app only)

1. **Docs lint.** `pnpm --filter shadcn-table-docs lint` fails: react-hooks rules in
   `components/locale-example-tabs.tsx`, `components/prop-tables/*-table.tsx` ("setState
   synchronously within an effect"), and the docs copy `components/ui/shadcn-table/body/ST_TableBody.tsx`
   ("cannot access refs during render"). Fix the first two groups in the docs app (derive state
   during render or use the event, no effect-set-state). The `ST_TableBody` one is library code:
   report the line and the rule, do not edit the copy; the lead decides whether the library
   fixes it.
2. Make `lint` part of CI's `docs` job once it passes (`pnpm --filter shadcn-table-docs lint`
   after `types:check`).
3. `enableGrouping: true` dev warning "Can't perform a React state update on a component that
   hasn't mounted yet" on the aggregation and column-grouping pages, and the
   `ST_FilterTextField` controlled-to-uncontrolled warning on column-filtering: reproduce on
   the docs dev server, read the console, locate the cause. If it is in the library, report
   file and line with the fix you would make; do not edit library code.

## Verification before the PR

Both agents green on their gates; `docs:lint` green; page gate `a` and `e` green; registry
validate on the pushed branch; CI green on `claude/review`. Then PR to `master`, owner merges,
tag `v0.1.1`.
