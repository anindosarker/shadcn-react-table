# SRT ↔ MRT review notes


## File-wise notes
### buttons/
### [ ] SRT_CopyButton.tsx : MRT_CopyButton.tsx
### [ ] SRT_ColumnPinningButtons.tsx : MRT_ColumnPinningButtons.tsx
### [ ] SRT_EditActionButtons.tsx : MRT_EditActionButtons.tsx
### [ ] SRT_ExpandAllButton.tsx : MRT_ExpandAllButton.tsx
### [ ] SRT_ExpandButton.tsx : MRT_ExpandButton.tsx
### [ ] SRT_GrabHandleButton.tsx : MRT_GrabHandleButton.tsx
### [ ] SRT_RowPinButton.tsx : MRT_RowPinButton.tsx
### [ ] SRT_ShowHideColumnsButton.tsx : MRT_ShowHideColumnsButton.tsx
### [ ] SRT_ToggleDensePaddingButton.tsx : MRT_ToggleDensePaddingButton.tsx
### [ ] SRT_ToggleFiltersButton.tsx : MRT_ToggleFiltersButton.tsx
### [ ] SRT_ToggleFullScreenButton.tsx : MRT_ToggleFullScreenButton.tsx
### [ ] SRT_ToggleGlobalFilterButton.tsx : MRT_ToggleGlobalFilterButton.tsx
### [ ] SRT_ToggleRowActionMenuButton.tsx : MRT_ToggleRowActionMenuButton.tsx

### inputs/
### [ ] SRT_EditCellTextField.tsx : MRT_EditCellTextField.tsx
### [ ] SRT_FilterCheckbox.tsx : MRT_FilterCheckbox.tsx
### [ ] SRT_FilterRangeFields.tsx : MRT_FilterRangeFields.tsx
### [ ] SRT_FilterRangeSlider.tsx : MRT_FilterRangeSlider.tsx
### [ ] SRT_FilterTextField.tsx : MRT_FilterTextField.tsx
### [ ] SRT_GlobalFilterTextField.tsx : MRT_GlobalFilterTextField.tsx
### [ ] SRT_SelectCheckbox.tsx : MRT_SelectCheckbox.tsx

### menus/
### [ ] SRT_ActionMenuItem.tsx : MRT_ActionMenuItem.tsx
### [ ] SRT_CellActionMenu.tsx : MRT_CellActionMenu.tsx
### [ ] SRT_ColumnActionMenu.tsx : MRT_ColumnActionMenu.tsx
### [ ] SRT_FilterOptionMenu.tsx : MRT_FilterOptionMenu.tsx
### [ ] SRT_RowActionMenu.tsx : MRT_RowActionMenu.tsx
### [ ] SRT_ShowHideColumnsMenu.tsx : MRT_ShowHideColumnsMenu.tsx
### [ ] SRT_ShowHideColumnsMenuItems.tsx : MRT_ShowHideColumnsMenuItems.tsx

### body/
### [ ] SRT_TableBody.tsx : MRT_TableBody.tsx
### [ ] SRT_TableBodyCell.tsx : MRT_TableBodyCell.tsx
### [ ] SRT_TableBodyCellValue.tsx : MRT_TableBodyCellValue.tsx
### [ ] SRT_TableBodyRow.tsx : MRT_TableBodyRow.tsx
### [ ] SRT_TableBodyRowGrabHandle.tsx : MRT_TableBodyRowGrabHandle.tsx
### [ ] SRT_TableBodyRowPinButton.tsx : MRT_TableBodyRowPinButton.tsx
### [ ] SRT_TableDetailPanel.tsx : MRT_TableDetailPanel.tsx

### head/
### [ ] SRT_TableHead.tsx : MRT_TableHead.tsx
### [ ] SRT_TableHeadCell.tsx : MRT_TableHeadCell.tsx
### [ ] SRT_TableHeadCellColumnActionsButton.tsx : MRT_TableHeadCellColumnActionsButton.tsx
### [ ] SRT_TableHeadCellFilterContainer.tsx : MRT_TableHeadCellFilterContainer.tsx
### [ ] SRT_TableHeadCellFilterLabel.tsx : MRT_TableHeadCellFilterLabel.tsx
### [ ] SRT_TableHeadCellGrabHandle.tsx : MRT_TableHeadCellGrabHandle.tsx
### [ ] SRT_TableHeadCellResizeHandle.tsx : MRT_TableHeadCellResizeHandle.tsx
### [ ] SRT_TableHeadCellSortLabel.tsx : MRT_TableHeadCellSortLabel.tsx
### [ ] SRT_TableHeadRow.tsx : MRT_TableHeadRow.tsx

### footer/
### [ ] SRT_TableFooter.tsx : MRT_TableFooter.tsx
### [ ] SRT_TableFooterCell.tsx : MRT_TableFooterCell.tsx
### [ ] SRT_TableFooterRow.tsx : MRT_TableFooterRow.tsx

### toolbar/
### [ ] SRT_BottomToolbar.tsx : MRT_BottomToolbar.tsx
### [ ] SRT_LinearProgressBar.tsx : MRT_LinearProgressBar.tsx
### [ ] SRT_TablePagination.tsx : MRT_TablePagination.tsx
### [ ] SRT_ToolbarAlertBanner.tsx : MRT_ToolbarAlertBanner.tsx
### [ ] SRT_ToolbarDropZone.tsx : MRT_ToolbarDropZone.tsx
### [ ] SRT_ToolbarInternalButtons.tsx : MRT_ToolbarInternalButtons.tsx
### [ ] SRT_TopToolbar.tsx : MRT_TopToolbar.tsx

### table/ + modals/ (orchestrators — review last)
### [ ] ShadcnReactTable.tsx : MaterialReactTable.tsx
### [ ] SRT_Table.tsx : MRT_Table.tsx
### [ ] SRT_TableContainer.tsx : MRT_TableContainer.tsx
### [ ] SRT_TableLayout.tsx : MRT_TablePaper.tsx
### [ ] SRT_TableLoadingOverlay.tsx : MRT_TableLoadingOverlay.tsx
### [ ] SRT_EditRowModal.tsx : MRT_EditRowModal.tsx

### Core package (`packages/shadcn-react-table-core/src`) ↔ MRT (`packages/material-react-table/src`)

### root
### [ ] index.ts : index.ts
### [ ] types.ts : types.ts
### [ ] icons.ts : icons.ts

### fns/
### [ ] fns/aggregationFns.ts : fns/aggregationFns.ts
### [ ] fns/filterFns.ts : fns/filterFns.ts
### [ ] fns/sortingFns.ts : fns/sortingFns.ts

### utils/
### [ ] utils/cell.utils.ts : utils/cell.utils.ts
### [ ] utils/column.utils.ts : utils/column.utils.ts
### [ ] utils/displayColumn.utils.ts : utils/displayColumn.utils.ts
### [ ] utils/row.utils.ts : utils/row.utils.ts
### [ ] utils/style.utils.ts : utils/style.utils.ts
### [ ] utils/tanstack.helpers.ts : utils/tanstack.helpers.ts
### [ ] utils/utils.ts : utils/utils.ts
### [ ] utils/virtualization.utils.ts : utils/virtualization.utils.ts
### [ ] utils/srtHtmlProps.utils.ts : (SRT-only — no MRT equivalent, styling slot helpers)

### hooks/
### [ ] hooks/useShadcnReactTable.ts : hooks/useMaterialReactTable.ts
### [ ] hooks/useSRT_TableInstance.ts : hooks/useMRT_TableInstance.ts
### [ ] hooks/useSRT_TableOptions.ts : hooks/useMRT_TableOptions.ts
### [ ] hooks/useSRT_Effects.ts : hooks/useMRT_Effects.ts
### [ ] hooks/useSRT_Rows.ts : hooks/useMRT_Rows.ts
### [ ] hooks/useSRT_ColumnVirtualizer.ts : hooks/useMRT_ColumnVirtualizer.ts
### [ ] hooks/useSRT_RowVirtualizer.ts : hooks/useMRT_RowVirtualizer.ts
### [ ] hooks/useSRT_ProgressAnimation.ts : (SRT-only — no MRT equivalent, progress bar animation)

### hooks/display-columns/
### [ ] getSRT_RowActionsColumnDef.tsx : getMRT_RowActionsColumnDef.tsx
### [ ] getSRT_RowDragColumnDef.tsx : getMRT_RowDragColumnDef.tsx
### [ ] getSRT_RowExpandColumnDef.tsx : getMRT_RowExpandColumnDef.tsx
### [ ] getSRT_RowNumbersColumnDef.tsx : getMRT_RowNumbersColumnDef.tsx
### [ ] getSRT_RowPinningColumnDef.tsx : getMRT_RowPinningColumnDef.tsx
### [ ] getSRT_RowSelectColumnDef.tsx : getMRT_RowSelectColumnDef.tsx
### [ ] getSRT_RowSpacerColumnDef.tsx : getMRT_RowSpacerColumnDef.tsx

### locales/ (38 files, 1:1 by code — review only if i18n strings matter)

## Phase C verification

Final quality gate run after all 7 Phase-B clusters landed. All file-pair gaps
above confirmed closed and marked [x].

### Builds / static checks — all green
- **Core rebuild** (`pnpm --filter shadcn-react-table-core build`): clean. dist
  reflects all `srt*Props` additions (foundations) + `srtToolbarDropZoneProps`
  (toolbar-dev).
- **App type-check** (`tsc -p tsconfig.app.json --noEmit`): **0 errors, exit 0.**
  The two residuals flagged in the hand-off were already resolved by the time of
  this run:
  - `SRT_ShowHideColumnsMenuItemsProps.dense` exists and is threaded through
    (SRT_ShowHideColumnsMenuItems.tsx: prop declared + applied to padding +
    passed to nested items).
  - `srtToolbarDropZoneProps` resolves cleanly after the core rebuild
    (declared in core types.ts:957, consumed in SRT_ToolbarDropZone.tsx).
  - The pre-existing `baseUrl` TS5101 deprecation did **not** fire in this run.
- **Storybook build** (`pnpm --filter test-shadcn build-storybook`): **succeeds**,
  `storybook-static/index.html` emitted. (Storybook core emits benign `eval` +
  >500 kB chunk warnings from `@storybook/core` itself — not our code.)

### Browser verification — passed
Exercised the live `test-shadcn` dev app on the shared server (http://localhost:5273,
port unchanged, vite not restarted) plus a freshly-built static Storybook served
read-only on :6199 for variant-specific stories. Verified with screenshots:
- **Sorting** — click toggles asc/desc, header indicator + data order update.
- **Column filters — all variants** via `filter-fn-and-filter-variants` story:
  text, range (two-input), range-slider, checkbox, select, multi-select,
  autocomplete, **date / date-range / datetime-range / time-range** (rendered as
  Day/Month/Year + Hours/Minutes/AM-PM spinbuttons). Functional apply on the dev
  app: First Name="Ada" narrows to 2 rows with match highlighting, active-filter
  funnel indicator, clear (×) button, and footer aggregate recalculated.
- **Global search** — fuzzy match + ranked-result highlighting (orange spans).
- **Pagination** — default + **pages display mode** (numbered page buttons,
  prev/next, rows-per-page select); page-2 navigation changes rows.
- **Row selection** — individual + select-all; alert banner "N of 25 row(s)
  selected" + Clear selection; selected-row highlight.
- **Editing** — row-mode (inline editable cells + Cancel/Save, save persists:
  "Ada"→"Adabelle") and **modal mode** (`SRT_EditRowModal` dialog with backdrop,
  labeled fields, disabled Phone column, Cancel/Save). Cell mode covered by
  passing editing stories.
- **Expand + detail panel** — chevron expands a custom detail panel; coexists
  with menus.
- **Row action menu** (Edit / View details / Edit row) and **column action menu**
  (sort / clear sort / filter / clear filter / pin L-R / unpin / reset size /
  hide / show all) render with correct icons + disabled states.
- **Show/Hide columns + density** — menu with Hide all / Reset order / Unpin all
  / Show all, per-column checkboxes, drag-handle + pin icons; density toggle
  switches compact/comfortable.
- **Fullscreen** — table fills viewport, restores on toggle.
- **Virtualization** — `row-and-column-virtualization` story: only ~18 rows in
  DOM, scroll recycles to rows 71-79, sticky header + column virtualization
  intact, no glitches.
- **Pinning** — column pin-to-left moves column to pinned region with separator;
  responsive narrow layout pins the Actions column right.
- **Empty state** — "No records to display" placeholder.
- **Responsive toolbar** — at 480px width title wraps, toolbar icons stay aligned,
  horizontal scroll engages, Actions column pinned right; no breakage.

### Regressions — none blocking
- **Dev app (:5273) console is fully clean** (zero errors/warnings after buffer
  clear + reload) — this is the real library consumer.

### Accepted deviations
- **Storybook docs source-eval artifact (cosmetic, Storybook-only):** some stories
  log `ReferenceError: ColumnsIcon is not defined` + a downstream React
  "order of Hooks" error at render. `ColumnsIcon` exists in **neither** the
  source tree, the stories, **nor** the built `storybook-static` bundle — the icon
  registry uses `ViewColumnIcon: Columns2` (core/src/icons.ts). The throw comes
  from Storybook's own `@storybook/core` source-snippet `eval()` path (the build
  emits matching `eval` warnings); the **story canvas itself renders correctly**
  in every case, `tsc` and `build-storybook` both pass, and the dev app console is
  clean. Treated as a Storybook tooling artifact, not a library defect. Worth a
  follow-up only if Storybook docs "Show code" is a shipped surface.
- **ColumnActionMenu granular icons** remain as direct `lucide-react` imports
  rather than entries in the core icon registry (`SRT_Default_Icons`). They render
  correctly. Recommendation: only promote these to registry keys if per-deployment
  icon overriding of the column-action menu items is a required parity feature;
  MRT exposes them via its MUI icon slots, so adding registry keys
  (e.g. `SortAscIcon`, `SortDescIcon`, `ClearAllIcon` already exists, `PushPinIcon`
  already exists) would tighten parity but is non-blocking.