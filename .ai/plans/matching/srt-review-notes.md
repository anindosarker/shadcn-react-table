# SRT ↔ MRT Review Notes

Top-down review (render-tree order). Source of truth: `packages/material-react-table/`.
`[ ]` = pending · `[x]` = reviewed.

## Entry

### [x] ShadcnReactTable.tsx : MaterialReactTable.tsx
- ok. almost same.
- Some import differences, will be handled later depending on shadcn registry implementation.

## table/

### [ ] SRT_TableLayout.tsx : MRT_TablePaper.tsx
### [ ] SRT_TableContainer.tsx : MRT_TableContainer.tsx
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
### [ ] types.ts : types.ts
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
