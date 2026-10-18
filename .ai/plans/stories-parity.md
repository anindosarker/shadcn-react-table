# Stories parity plan

Goal, the only one: every story in `packages/material-react-table/stories` exists in
`packages/shadcn-react-table/stories` with the exact same scenario, written with SRT code.
Status: done 2026-10-17 (54/54 files, 398 exports, verifier pass clean, storybook build and full smoke green; last story commit 78d495b). Ran after the monorepo restructure steps 1 and 2
(done: caf42f9, ac19434). The registry build and the docs app are deferred, not part of this.

## Starting point (measured 2026-10-17)

- MRT: 54 story files, 398 exports. SRT: the same 54 files already exist (ported 2026-06-15),
  393 exports, plus `Basic.stories.tsx` (owner-approved reference story).
- Missing exports: `ColumnHiding` 3 (`ColumnHidingColumnsNotVisibleInShowHide`,
  `ColumnHidingWithColumnsHiddenAndNotVisibleInShowHide`, `ColumnHidingWithHeaderGroups`),
  `DetailPanel` 1 (`DetailPanelSingleExpand`), `Pagination` 2
  (`PaginationEnabledCustomizeRowsPerPage`, `PaginationEnabledDefaultNoRowsPerPage`).
- Title drift: `styling/ColumnWidths` is `Styling/Column Width Examples`, MRT says
  `Styling/Custom Column Widths`.
- The June port predates the library review (Sep-Oct). Known break: `Editing.stories.tsx:391`
  uses the deleted `onEditingCellSave`. Others may use renamed options, props, or ids; the
  per-file diff finds them.
- faker: MRT uses it in 51 files, SRT in 24. Where SRT inlined static data instead, the
  scenario differs (row counts, value shapes) and goes back to faker like MRT.
- No `@mui` imports remain in SRT stories.

## Definition of "same scenario, SRT code"

Per story export, compared against the MRT twin:
- Same file path, same `title`, same export name, same export order.
- Same columns (accessorKeys, headers, option keys), same data source (faker with the same
  shape and row count, or the same literal data), same table options, same handlers.
- Same story shape: MRT's arrow-function exports (`export const X = () => (...)`), so the
  Code tab shows the file text. `args`-based stories only where MRT itself uses args.
  `Basic.stories.tsx` is the one owner-approved exception.
- SRT names everywhere: `SRT_*`, `srt-*` ids, `srt*Props`, `useShadcnReactTable`,
  `ShadcnReactTable`. Imports from `@/components/ui/shadcn-react-table` (barrel) and
  `@/components/ui/shadcn-react-table/ShadcnReactTable`. `Meta` from `@storybook/react-vite`.
- MUI parts in a story become the shadcn part with the same role, default variant:
  `Button` -> `@/components/ui/button`, `MenuItem` -> `DropdownMenuItem`, `Box`/`Stack`/
  `Typography` -> `div`/`span`/`p` with Tailwind classes, `IconButton` -> `Button`
  `size="icon"`, `TextField` -> `Input`, `Tooltip` -> `SRT_Tooltip`, icons -> lucide.
  Palette literals (`success.main`) -> theme tokens where one exists, else the nearest
  Tailwind colour. Nothing extra: no props, wrappers, or demos MRT's story lacks.
- A story MRT has that SRT cannot run because the library lacks the feature: keep the
  export, port it as written, and log the gap in the tracker. The library is not edited
  from this plan.

## Method per file

1. Read the MRT file and the SRT file fully. Diff export lists, titles, data, options.
2. Fix only differences that change the scenario or use stale SRT API. No comment-only or
   formatting-only edits (no-churn rule, `.ai/plans/workflows/review-patterns.md`).
3. Story-writing rules: with Storybook running, call the `srt-sb` MCP tool
   `get-storybook-story-instructions` once per run and follow it where it does not conflict
   with the MRT shape above (the MRT shape wins; this plan mirrors MRT).
4. Gates: `pnpm prettier --write <file>`, `pnpm --filter shadcn-react-table exec tsc -p
   tsconfig.stories.json --noEmit` clean, `pnpm --filter shadcn-react-table exec eslint
   stories/<path> --max-warnings=0`.
5. Browser check, Playwright from `apps/test-shadcn/.playwright` against an agent-owned
   Storybook on 6306 (never 6006, 5273, 5173): every export of the file renders
   (`iframe.html?id=<id>&viewMode=story`), no page error, a table with rows where MRT shows
   rows, and the feature's visible marker present (filter inputs, expand buttons, pagination,
   toolbar buttons, as the scenario dictates). Compare against MRT's live storybook
   (https://material-react-table.dev, same story id) for the marker when unsure.
6. One commit per file: `stories: <File>.stories.tsx : MRT`, body lists what changed.
   Push after each commit. No trailers, no attribution.

## Order

Clusters, each one agent, serial inside, clusters in parallel:
1. features A-C: Aggregation, CellActions, ClickToCopy, ColumnActions, ColumnDragging,
   ColumnGrouping, ColumnHiding (3 missing), ColumnOrdering, ColumnPinning, ColumnResizing,
   Creating
2. features D-L: DensePadding, DetailPanel (1 missing), Editing (stale API), Filtering,
   FullScreen, HeaderGroups, LayoutMode, Loading
3. features M-Z: MemoMode, Pagination (2 missing), RowActions, RowDragging, RowNumbers,
   RowOrdering, RowPinning, RowSelection, Searching, Sorting, StickyHeader, Virtualization
   (and the rest of `features/` alphabetically)
4. styling/ and fixed-bugs/ (ColumnWidths title fix)

Then one verifier pass: re-run the export-count and title diff script (must be zero
differences except `Basic.stories.tsx`), `pnpm storybook:build` from the root, full
Playwright smoke over all story ids from `index.json`.

## Tracker

`.ai/plans/matching/stories-parity-notes.md`: one `### [ ] <path>` per file, ticked by the
owner only. Under each entry at most 3 bullets: what changed, library gaps found, commit.
Equivalent files get `- same scenario as MRT, no change`.

## Out of scope

Library changes, new stories MRT does not have, registry, docs site, CI, autodocs, MDX.
