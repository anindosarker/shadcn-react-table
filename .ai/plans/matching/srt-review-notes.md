# SRT ↔ MRT Review Notes

Top-down review (render-tree order). Source of truth: `packages/material-react-table/`.


**Trust map:** Every unchecked item is garbage from bad prior runs → rebuild from
the MRT spec, do NOT trust existing SRT code there. `types.ts` is only partial.

## General notes (established conventions — apply project-wide)

- **cva throughout.** EVERY component defines a `xxxVariants` cva at the top
  (shadcn anatomy), even with no variants yet. Styling via cva + `cn()`
  (twMerge); user `className` merges last (wins).
- **Runtime-measured values stay inline `style`** (e.g. maxHeight from toolbar
  px). No CSS vars, no dynamic classes — the package must install with zero
  CSS config. User `style` passthrough spreads after lib values (user wins).
- **Keep SRT default designs** (card look: `rounded-md border bg-background
  shadow`, base `p-2`, `relative`) even where MRT differs visually. Target =
  finish the library first with default shadcn themed look; UI polish later.
- **Dropped MRT constructs stay visible as comments.** Keep the dropped MRT
  line(s) commented out at their original position + a short `// Note:` saying
  why (example: `mrtTheme` / `useTheme` in `SRT_TableLayout`). No other
  scaffolding comments. `//@ts-expect-error` gets a brief reason suffix.
- **`mrtTheme` registry dropped project-wide** — tailwind/shadcn CSS vars handle
  theming (`bg-background` etc.).

## Entry

### [x] ShadcnReactTable.tsx : MaterialReactTable.tsx
- ok. almost same.
- Some import differences, will be handled later depending on shadcn registry implementation.

## table/

### [x] SRT_TableLayout.tsx : MRT_TablePaper.tsx
- hand-written, ok. trusted. (last good file top-down)
- Created `DivProps` (`ComponentPropsWithRef<'div'>`, SRT-only; renamed from LayoutDivProps) — the single SRT analogue for EVERY MUI div-backed prop type (`PaperProps`, `TableContainerProps`, `BoxProps`, ...). shadcn has no Paper/Box layer; MUI extras (sx/component/classes) are locked deviations.
- `mrtTheme` / `useTheme` dropped project-wide, handled by shadcn CSS vars.

### [ ] SRT_TableContainer.tsx : MRT_TableContainer.tsx  ← REBUILD from here down
- `srtTableContainerProps` converted to value-or-func `DivProps` in core
  types.ts — same conversion applies to every remaining `SRT_HTMLProps` slot.
- Deferred gap: `aria-describedby='srt-progress'` won't resolve until the
  SRT_TableLoadingOverlay pair un-suffixes its progress id.
### [ ] SRT_Table.tsx : MRT_Table.tsx
### [ ] SRT_TableLoadingOverlay.tsx : MRT_TableLoadingOverlay.tsx

## toolbar/

### [ ] SRT_TopToolbar.tsx : MRT_TopToolbar.tsx
### [ ] SRT_BottomToolbar.tsx : MRT_BottomToolbar.tsx
### [ ] SRT_ToolbarInternalButtons.tsx : MRT_ToolbarInternalButtons.tsx
### [ ] SRT_ToolbarAlertBanner.tsx : MRT_ToolbarAlertBanner.tsx
### [ ] SRT_ToolbarDropZone.tsx : MRT_ToolbarDropZone.tsx
### [ ] SRT_LinearProgressBar.tsx : MRT_LinearProgressBar.tsx
### [ ] SRT_TablePagination.tsx : MRT_TablePagination.tsx

## head/

### [ ] SRT_TableHead.tsx : MRT_TableHead.tsx
### [ ] SRT_TableHeadRow.tsx : MRT_TableHeadRow.tsx
### [ ] SRT_TableHeadCell.tsx : MRT_TableHeadCell.tsx
### [ ] SRT_TableHeadCellColumnActionsButton.tsx : MRT_TableHeadCellColumnActionsButton.tsx
### [ ] SRT_TableHeadCellFilterContainer.tsx : MRT_TableHeadCellFilterContainer.tsx
### [ ] SRT_TableHeadCellFilterLabel.tsx : MRT_TableHeadCellFilterLabel.tsx
### [ ] SRT_TableHeadCellGrabHandle.tsx : MRT_TableHeadCellGrabHandle.tsx
### [ ] SRT_TableHeadCellResizeHandle.tsx : MRT_TableHeadCellResizeHandle.tsx
### [ ] SRT_TableHeadCellSortLabel.tsx : MRT_TableHeadCellSortLabel.tsx

## body/

### [ ] SRT_TableBody.tsx : MRT_TableBody.tsx
### [ ] SRT_TableBodyRow.tsx : MRT_TableBodyRow.tsx
### [ ] SRT_TableBodyCell.tsx : MRT_TableBodyCell.tsx
### [ ] SRT_TableBodyCellValue.tsx : MRT_TableBodyCellValue.tsx
### [ ] SRT_TableBodyRowGrabHandle.tsx : MRT_TableBodyRowGrabHandle.tsx
### [ ] SRT_TableBodyRowPinButton.tsx : MRT_TableBodyRowPinButton.tsx
### [ ] SRT_TableDetailPanel.tsx : MRT_TableDetailPanel.tsx

## footer/

### [ ] SRT_TableFooter.tsx : MRT_TableFooter.tsx
### [ ] SRT_TableFooterRow.tsx : MRT_TableFooterRow.tsx
### [ ] SRT_TableFooterCell.tsx : MRT_TableFooterCell.tsx

## inputs/

### [ ] SRT_FilterTextField.tsx : MRT_FilterTextField.tsx
### [ ] SRT_FilterRangeFields.tsx : MRT_FilterRangeFields.tsx
### [ ] SRT_FilterRangeSlider.tsx : MRT_FilterRangeSlider.tsx
### [ ] SRT_FilterCheckbox.tsx : MRT_FilterCheckbox.tsx
### [ ] SRT_GlobalFilterTextField.tsx : MRT_GlobalFilterTextField.tsx
### [ ] SRT_EditCellTextField.tsx : MRT_EditCellTextField.tsx
### [ ] SRT_SelectCheckbox.tsx : MRT_SelectCheckbox.tsx

## menus/

### [ ] SRT_ColumnActionMenu.tsx : MRT_ColumnActionMenu.tsx
### [ ] SRT_FilterOptionMenu.tsx : MRT_FilterOptionMenu.tsx
### [ ] SRT_RowActionMenu.tsx : MRT_RowActionMenu.tsx
### [ ] SRT_CellActionMenu.tsx : MRT_CellActionMenu.tsx
### [ ] SRT_ShowHideColumnsMenu.tsx : MRT_ShowHideColumnsMenu.tsx
### [ ] SRT_ShowHideColumnsMenuItems.tsx : MRT_ShowHideColumnsMenuItems.tsx
### [ ] SRT_ActionMenuItem.tsx : MRT_ActionMenuItem.tsx

## buttons/

### [ ] SRT_ToggleRowActionMenuButton.tsx : MRT_ToggleRowActionMenuButton.tsx
### [ ] SRT_EditActionButtons.tsx : MRT_EditActionButtons.tsx
### [ ] SRT_CopyButton.tsx : MRT_CopyButton.tsx
### [ ] SRT_ExpandButton.tsx : MRT_ExpandButton.tsx
### [ ] SRT_ExpandAllButton.tsx : MRT_ExpandAllButton.tsx
### [ ] SRT_GrabHandleButton.tsx : MRT_GrabHandleButton.tsx
### [ ] SRT_RowPinButton.tsx : MRT_RowPinButton.tsx
### [ ] SRT_ColumnPinningButtons.tsx : MRT_ColumnPinningButtons.tsx
### [ ] SRT_ShowHideColumnsButton.tsx : MRT_ShowHideColumnsButton.tsx
### [ ] SRT_ToggleDensePaddingButton.tsx : MRT_ToggleDensePaddingButton.tsx
### [ ] SRT_ToggleFiltersButton.tsx : MRT_ToggleFiltersButton.tsx
### [ ] SRT_ToggleFullScreenButton.tsx : MRT_ToggleFullScreenButton.tsx
### [ ] SRT_ToggleGlobalFilterButton.tsx : MRT_ToggleGlobalFilterButton.tsx

## modals/

### [ ] SRT_EditRowModal.tsx : MRT_EditRowModal.tsx

## Deviation-only (no MRT counterpart)

### [ ] SRT_Tooltip.tsx

## Core (`packages/shadcn-react-table-core/src`)

### [ ] index.ts : index.ts
### [ ] types.ts : types.ts  (partial — not fully done)
### [ ] icons.ts : icons.ts
### [ ] fns/aggregationFns.ts : fns/aggregationFns.ts
### [ ] fns/filterFns.ts : fns/filterFns.ts
### [ ] fns/sortingFns.ts : fns/sortingFns.ts
### [ ] utils/cell.utils.ts : utils/cell.utils.ts
### [ ] utils/column.utils.ts : utils/column.utils.ts
### [ ] utils/displayColumn.utils.ts : utils/displayColumn.utils.ts
### [ ] utils/row.utils.ts : utils/row.utils.ts
### [ ] utils/style.utils.ts : utils/style.utils.ts
### [ ] utils/tanstack.helpers.ts : utils/tanstack.helpers.ts
### [ ] utils/utils.ts : utils/utils.ts
### [ ] utils/virtualization.utils.ts : utils/virtualization.utils.ts
### [ ] utils/srtHtmlProps.utils.ts : (SRT-only)
### [ ] hooks/useShadcnReactTable.ts : hooks/useMaterialReactTable.ts
### [ ] hooks/useSRT_TableInstance.ts : hooks/useMRT_TableInstance.ts
### [ ] hooks/useSRT_TableOptions.ts : hooks/useMRT_TableOptions.ts
### [ ] hooks/useSRT_Effects.ts : hooks/useMRT_Effects.ts
### [ ] hooks/useSRT_Rows.ts : hooks/useMRT_Rows.ts
### [ ] hooks/useSRT_ColumnVirtualizer.ts : hooks/useMRT_ColumnVirtualizer.ts
### [ ] hooks/useSRT_RowVirtualizer.ts : hooks/useMRT_RowVirtualizer.ts
### [ ] hooks/useSRT_ProgressAnimation.ts : (SRT-only)

## Core display-columns (`hooks/display-columns/`)

### [ ] getSRT_RowActionsColumnDef.tsx : getMRT_RowActionsColumnDef.tsx
### [ ] getSRT_RowDragColumnDef.tsx : getMRT_RowDragColumnDef.tsx
### [ ] getSRT_RowExpandColumnDef.tsx : getMRT_RowExpandColumnDef.tsx
### [ ] getSRT_RowNumbersColumnDef.tsx : getMRT_RowNumbersColumnDef.tsx
### [ ] getSRT_RowPinningColumnDef.tsx : getMRT_RowPinningColumnDef.tsx
### [ ] getSRT_RowSelectColumnDef.tsx : getMRT_RowSelectColumnDef.tsx
### [ ] getSRT_RowSpacerColumnDef.tsx : getMRT_RowSpacerColumnDef.tsx

### [ ] locales/ (38 files) : MRT locales
