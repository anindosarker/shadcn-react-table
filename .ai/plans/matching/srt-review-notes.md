# SRT ↔ MRT Review Notes

Spec: `packages/material-react-table/`. MUI behind MRT is also spec. Method and
rules: `.ai/plans/workflows/review-patterns.md`.

Boxes are the owner's: `[x]` reviewed, `[-]` skipped. Agents never mark them.
A recorded ruling is a line under Conventions or a ticked box. Bullets under an
unticked entry are agent claims, not rulings.

## Conventions

- Single folder: `components/ui/shadcn-react-table/` holds components, types,
  hooks, utils, fns, locales, icons. Relative imports like MRT. CLI package
  untouched. Stories deferred until the library is done.
- Styling: one `xxxVariants` cva at the top, applied through `cn()`; user
  `className` merges last. Runtime-measured values stay inline `style`; user
  `style` spreads last. No CSS variables added; theme tokens only; `data-slot`
  is the restyle hook.
- MUI default styles of raw elements (`table`, `tr`, `td`) count as spec. A
  shadcn component is used in its default variant; layout-only `className`;
  state-driven classes allowed when they map an MRT feature.
- shadcn-first: check the registry (radix, new-york) before porting MUI by
  hand. Raw table markup stays. Keep the SRT card look; polish later.
- `SRT_Tooltip` stays: one-element MUI shape over shadcn's three parts. Radix
  state children (Checkbox, Switch) get a `<span>` anchor under the trigger.
- Dropped MRT lines stay commented at their position with a one-line
  `// Note:`. `@ts-expect-error` carries a reason. No other scaffolding.
- `mrtTheme` dropped project-wide. No `Srt-*` class hooks.
- MRT deps arrays verbatim, held with `eslint-disable-next-line
  react-hooks/exhaustive-deps`. `type="button"` on every button (MUI
  ButtonBase emits it).
- Display columns MRT-exact: `Cell`/`Header` on the defs, ids `srt-row-*`.
- Registry forks to re-apply after a refresh: `ui/native-select` imports `cn`
  from `@/lib/utils` (CLI emitted `"cn"`).

## Your call

Open decisions. Agents leave the code as is and never cite these as rulings.

- [ ] Every cell carries MUI defaults `border-b text-sm` (1px separators, 14px text).
- [ ] `ui/checkbox` fork: indeterminate renders MUI's dash.
- [ ] Global filter width animation via keyframes in the app stylesheet.
- [ ] Filter toggle icons `Filter`/`FilterX` instead of MUI's FilterList pair.
- [ ] `onEditingCellSave`: SRT-only public option, no MRT counterpart.
- [ ] `index.ts` re-exports utils, style utils, `highlightWords`, locales and
      display-column defs publicly; MRT keeps them internal.
- [ ] Icon-button sizes: MRT `size="small"` is `icon-sm`, no size is `icon`.
- [ ] Focus-visible outline on cells uses `outline-ring`; MRT uses primary.
- [ ] MUI `usePagination` defaults live in `SRT_TablePagination`, not in
      `getPaginationItems`.
- [ ] eslint override block for the folded core paths in
      `apps/test-shadcn/eslint.config.js`.

## Entry

### [x] ShadcnReactTable.tsx : MaterialReactTable.tsx
- ok. almost same.
- Some import differences, will be handled later depending on shadcn registry implementation.

## table/

### [x] SRT_TableLayout.tsx : MRT_TablePaper.tsx
- hand-written, ok. trusted. (last good file top-down)

### [x] SRT_TableContainer.tsx : MRT_TableContainer.tsx

### [x] SRT_Table.tsx : MRT_Table.tsx

### [x] SRT_TableLoadingOverlay.tsx : MRT_TableLoadingOverlay.tsx

## toolbar/

### [x] SRT_TopToolbar.tsx : MRT_TopToolbar.tsx

### [x] SRT_BottomToolbar.tsx : MRT_BottomToolbar.tsx

### [x] SRT_ToolbarInternalButtons.tsx : MRT_ToolbarInternalButtons.tsx

### [x] SRT_ToolbarAlertBanner.tsx : MRT_ToolbarAlertBanner.tsx

### [x] SRT_ToolbarDropZone.tsx : MRT_ToolbarDropZone.tsx

### [x] SRT_LinearProgressBar.tsx : MRT_LinearProgressBar.tsx

### [-] SRT_TablePagination.tsx : MRT_TablePagination.tsx

## head/

### [-] SRT_TableHead.tsx : MRT_TableHead.tsx

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

### [-] SRT_TableBodyRow.tsx : MRT_TableBodyRow.tsx

### [-] SRT_TableBodyCell.tsx : MRT_TableBodyCell.tsx

### [-] SRT_TableBodyCellValue.tsx : MRT_TableBodyCellValue.tsx

### [-] SRT_TableBodyRowGrabHandle.tsx : MRT_TableBodyRowGrabHandle.tsx

### [-] SRT_TableBodyRowPinButton.tsx : MRT_TableBodyRowPinButton.tsx

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

## Core (types, fns, utils, hooks)

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

### [ ] hooks/useShadcnReactTable.ts : hooks/useMaterialReactTable.ts

### [ ] hooks/useSRT_TableInstance.ts : hooks/useMRT_TableInstance.ts

### [ ] hooks/useSRT_TableOptions.ts : hooks/useMRT_TableOptions.ts

### [ ] hooks/useSRT_Effects.ts : hooks/useMRT_Effects.ts

### [ ] hooks/useSRT_Rows.ts : hooks/useMRT_Rows.ts

### [ ] hooks/useSRT_ColumnVirtualizer.ts : hooks/useMRT_ColumnVirtualizer.ts

### [ ] hooks/useSRT_RowVirtualizer.ts : hooks/useMRT_RowVirtualizer.ts

## Core display-columns (`hooks/display-columns/`)

### [ ] getSRT_RowActionsColumnDef.tsx : getMRT_RowActionsColumnDef.tsx

### [ ] getSRT_RowDragColumnDef.tsx : getMRT_RowDragColumnDef.tsx

### [ ] getSRT_RowExpandColumnDef.tsx : getMRT_RowExpandColumnDef.tsx

### [ ] getSRT_RowNumbersColumnDef.tsx : getMRT_RowNumbersColumnDef.tsx

### [ ] getSRT_RowPinningColumnDef.tsx : getMRT_RowPinningColumnDef.tsx

### [ ] getSRT_RowSelectColumnDef.tsx : getMRT_RowSelectColumnDef.tsx

### [ ] getSRT_RowSpacerColumnDef.tsx : getMRT_RowSpacerColumnDef.tsx

### [ ] locales/ (38 files) : MRT locales
