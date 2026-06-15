# Storybook Litmus Report — shadcn-react-table vs material-react-table

**Date:** 2026-06-15
**Setup:** Storybook 8.4.7 + @storybook/react-vite on rolldown-vite 7 + Tailwind v4 + React 19, in `apps/test-shadcn`. Run: `pnpm --filter test-shadcn storybook` (dev, :6006) or `build-storybook`.

## Result

- **54 story files ported** (features 32, styling 13, fixed-bugs 9) → **392 story exports**.
- `tsc -p tsconfig.stories.json --noEmit` = **0 errors**.
- `build-storybook` = **green (exit 0)**.
- Stories render correctly with Tailwind styling + full behavior (verified Sorting, Filtering, Editing in browser).

**Verdict:** the port is structurally sound — every MRT feature story compiles and renders against the SRT API. The litmus surfaced a clear, consistent set of API gaps, all tracing to ONE root cause.

## Root-cause finding (headline)

SRT exposes **no `mui*Props` / `*TextFieldProps` escape hatches** — every per-element props-passthrough option is commented out in `packages/shadcn-react-table-core/src/types.ts` (lines ~342, 396, 410, 870, 917, 1031–1097). There is also **no `className` wired through the public table options** (only individual app components accept `className` internally). The intended replacement (cva variants + className) is not reachable from the component's public props.

Consequence: any MRT example that customizes styling or wires behavior *through* a props-passthrough cannot be ported 1:1.

## Gaps by impact

### Functional (not just styling) — investigate
1. **Cell- & table-mode editing don't persist.** MRT commits edits via `muiEditTextFieldProps.onBlur → handleSaveCell`. SRT's `SRT_EditCellTextField` writes `row._valuesCache` but nothing commits it in `editDisplayMode: 'cell'` / `'table'`. Row-mode + modal-mode editing DO work (Save button). Affected: Editing::EditingEnabledEditModeCell/Table/CellManualOnChange. **Likely a real bug — needs a dedicated save path independent of the MUI prop.**
2. **`renderRowActions` lacks `staticRowIndex`** (MRT provides it). Worked around via `row.index`.
3. **`muiExpandButtonProps` absent** → single-expand-accordion pattern (DetailPanelSingleExpand) cannot be wired; expand-icon rotation / conditional per-row hide dropped.

### Styling passthrough (broad, intentional cva deviation — but no className alternative wired)
4. `muiTableBodyCellProps` / `muiTableHeadCellProps` / `muiTableFooterCellProps` — incl. `align` (no per-cell alignment), `sx` bg/border/padding. Affects all Alignment, TableBodyCellStyles, TableHeadCellStyles, gridLayout, sticky-footer stories.
5. `muiTableBodyRowProps` — `sx` (height/stripe), `hover` toggle, and `onClick` (row-click). Affects RowHeights, TableBodyRowStyles, Selection row-click, click-propogation.
6. `muiTableContainerProps` / `muiTablePaperProps` — maxHeight/minHeight/maxWidth/elevation. Affects TableDiminsions, StickyHeader sizing, RowPinning, Pagination, Virtualization, TablePaper.
7. `muiTableProps` (caption side), `muiTableBodyProps` (children passthrough / striped) — Caption, CustomTableBody, TableBodyRowStyles striped.
8. `muiTopToolbarProps`, `muiSearchTextFieldProps`, `muiFilterTextFieldProps`, `muiPaginationProps`, `muiLinearProgressProps`, `muiSelectCheckboxProps`/`muiSelectAllCheckboxProps`, `muiToolbarAlertBannerProps`, `muiRowDragHandleProps` — all absent. Affect ColumnGrouping dropzone, Search, Filtering, Pagination (numbered + rows-per-page customization), Loading top-bar, Selection checkbox colors, RowOrdering drop-commit.

### Theming
9. MUI `ThemeProvider`/`createTheme`/`mrtTheme` — N/A. SRT theming = Tailwind/shadcn CSS vars + cva. Theming stories render default; light/dark via the `.dark` class.

### Other (real, low-cost)
10. **Locales not exported from package entry** — `SRT_Localization_*` existed in `src/locales` but `index.ts` didn't re-export them (MRT ships them as subpath build targets). **FIXED this session**: added `export * from './locales/*'` to core `index.ts`, rebuilt green.
11. `paginationDisplayMode: 'pages'` (numbered) not implemented (only 'default' first/prev/next/last) — needs a shadcn pagination primitive.

## Dropped story exports (could not reproduce without the MUI API)
- `DetailPanel::DetailPanelSingleExpand` (needs muiExpandButtonProps)
- `Pagination::PaginationEnabledDefaultNoRowsPerPage`, `::PaginationEnabledCustomizeRowsPerPage` (need muiPaginationProps)

All other gapped exports are KEPT — rendered with the unsupported prop stripped and a `// API GAP:` comment in-file.

## Recommended follow-ups (priority order)
1. **Fix cell/table-mode edit persistence** (functional bug). Wire a save handler in `SRT_EditCellTextField` blur/Enter that commits `_valuesCache` (not dependent on a MUI prop).
2. **Decide the styling-customization API.** Either (a) wire a `className` / `classNames` slot prop set through table options (cell/row/head/container/paper), or (b) formally document that styling = fork-the-generated-component + cva, and accept the reduced runtime customization vs MRT.
3. Add `staticRowIndex` to `renderRowActions` callback args.
4. Implement numbered `paginationDisplayMode: 'pages'`.
5. (Optional) expand-button props / single-expand support.
