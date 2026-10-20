# 00: spike, v9 error inventory

## Goal

Know every compile break before touching code, and prove the two structural decisions
(`tableFeatures` declaration, `Object.assign` instance) on a scratch copy.

## Steps

1. On the branch, `pnpm --filter shadcn-table add @tanstack/react-table@9.3.1`. `pnpm install`.
2. `pnpm --filter shadcn-table tsc:radix 2>&1 | tee` into a scratch file; group errors by file and by
   kind (rename, generic arity, removed API, prototype method). Record the table in "Findings".
3. In `utils/tanstack.features.ts` write the `tableFeatures({...})` call with all 15 features,
   `filteredRowModel`, `sortedRowModel`, `paginatedRowModel`, `expandedRowModel`,
   `groupedRowModel`, `facetedRowModel`, `facetedUniqueValues`, `facetedMinMaxValues`,
   `filterFns`, `sortFns`, `aggregationFns`. Confirm the type-checked slot order compiles.
4. In a scratch component, build `useTable({ features, columns, data })`, then
   `Object.assign(table, { refs: {}, setDensity() {} })` and confirm `table.getRowModel()`,
   `table.state`, `table.getAllLeafColumns()` still work on the assigned object; confirm a
   spread copy loses them (this is the proof for the instance decision).
5. Check the type exports the tree uses: `DeepKeys`, `DeepValue`, `Renderable`,
   `RowPinningPosition`, `ColumnPinningPosition`, `TableState`, `Updater`, `OnChangeFn`,
   `AccessorFn`, `ColumnSizingInfoState` (expected renamed to `ColumnResizingState`). Record the
   v9 name of each.
6. Check `@tanstack/match-sorter-utils` 8.19.4 still composes with v9 `filterFns` (it is
   independent of table-core) and `@tanstack/react-virtual` 3.11.2 is unaffected.

## Findings

Measured on branch `v9-radix` at 59a1369 with `@tanstack/react-table` 9.3.1 installed
(`@tanstack/table-core` 9.3.1, new transitive `@tanstack/react-store` 0.11.2 and `@tanstack/store`
0.11.2). `pnpm --filter shadcn-table tsc:radix`: 274 errors in 49 files. Stories are not in
`tsconfig.radix.json`, so they do not count here; they break at run time instead (see "Stories").

### Error inventory by kind

| Kind | Errors | Where |
| --- | --- | --- |
| Cascade: `ST_*` type lost its TanStack members (`Property 'getIsPinned' does not exist on type 'ST_Column'`, `'pagination' does not exist on type 'ST_TableState'`, ...) | 177 | 38 component, hook and util files. All follow from `types.ts`: once `Table<TData>`, `Row<TData>`, `Column<TData, TValue>`, `Cell`, `Header`, `HeaderGroup`, `ColumnDef`, `TableOptions` and `TableState` fail their generic arity, the `Omit<...> & {...}` wrappers collapse to the ST-only members. |
| Generic arity: `TFeatures` is now the first type parameter | 26 | `types.ts` 6, `fns/filterFns.ts` 14 (`Row<TData>` in every filter), `fns/sortingFns.ts` 4, `utils/column.utils.ts` 2 (`Row<TData>` in the aggregation array wrapper) |
| Removed or renamed export | 16 | `useReactTable` (useST_TableInstance), `getCoreRowModel`, `getExpandedRowModel`, `getFacetedMinMaxValues`, `getFacetedRowModel`, `getFacetedUniqueValues`, `getFilteredRowModel`, `getGroupedRowModel`, `getPaginationRowModel`, `getSortedRowModel` (useST_TableOptions), `sortingFns` (fns/sortingFns), `createRow` (tanstack.helpers), `SortingFn`, `AggregationFn`, `ColumnSizingInfoState` (types.ts) |
| Cascade: lost inference, implicit `any` in callbacks | 16 | ST_ColumnActionMenu, useST_ColumnVirtualizer, ST_ShowHideColumnsMenu(Items), ST_ToolbarAlertBanner, ST_TablePagination, ST_TableHeadCellResizeHandle, useST_TableOptions, getST_RowExpandColumnDef |
| Stale `@ts-expect-error` directives (the v8 mismatch they suppressed is gone or moved) | 13 | useST_TableInstance, useST_RowVirtualizer, useST_ColumnVirtualizer, column.utils, ST_TopToolbar, ST_BottomToolbar, ST_TableLayout, ST_TableContainer, ST_TableHead, ST_TableFooter, ST_TableBodyRow, ST_FilterRangeSlider, ST_EditCellTextField |
| Generic arity: `TValue` landed in the `TData` slot (`does not satisfy the constraint 'RowData'`) | 4 | `types.ts` (`Cell<TData, TValue>`, `Column<TData, TValue>`, `ColumnDef<TData, TValue>`, `Header<TData, unknown>`) |
| Other | 22 | `types.ts` 2 (`ST_ColumnDef` extends a non-object, `Pick<ST_TableState, 'pagination' ...>`), useST_TableInstance 6 (`initialState.columnOrder/columnSizingInfo/grouping/pagination`), displayColumn.utils 2, column.utils 2, getST_RowNumbersColumnDef 2, ST_TableHeadCellGrabHandle 2, ST_ShowHideColumnsMenuItems 2, getST_RowExpandColumnDef 1, ST_EditCellTextField 1, ShadcnTable 1, ST_ToolbarDropZone 1; all cascades of the same root |

Root causes, in dependency order: `types.ts` (16), `hooks/useST_TableOptions.ts` (10), `hooks/useST_TableInstance.ts` (12), `fns/filterFns.ts` (14), `fns/sortingFns.ts` (5), `utils/column.utils.ts` (9), `utils/tanstack.helpers.ts` (1). Fixing these seven files removes the 177 + 16 cascades; what is left are the 13 stale directives and the real renames below.

### Error inventory by file

| File (under `shared/components/ui/shadcn-table/`) | Errors | Kinds |
| --- | --- | --- |
| `menus/ST_ColumnActionMenu.tsx` | 30 | cascade 28; implicit any 2 |
| `head/ST_TableHeadCell.tsx` | 17 | cascade 17 |
| `types.ts` | 16 | removed export 4; arity 6; TValue slot 4; other 2 |
| `inputs/ST_FilterTextField.tsx` | 15 | cascade 15 |
| `fns/filterFns.ts` | 14 | arity 14 |
| `hooks/useST_TableInstance.ts` | 12 | removed export 1; cascade 4; stale directive 1; other 6 |
| `hooks/useST_TableOptions.ts` | 10 | removed export 9; implicit any 1 |
| `menus/ST_FilterOptionMenu.tsx` | 10 | cascade 10 |
| `head/ST_TableHeadCellSortLabel.tsx` | 9 | cascade 9 |
| `menus/ST_ShowHideColumnsMenuItems.tsx` | 9 | cascade 7; other 2 |
| `utils/column.utils.ts` | 9 | arity 2; cascade 4; stale directive 1; other 2 |
| `hooks/useST_ColumnVirtualizer.ts` | 8 | cascade 2; implicit any 5; stale directive 1 |
| `utils/style.utils.ts` | 8 | cascade 8 |
| `body/ST_TableBodyCell.tsx` | 7 | cascade 7 |
| `body/ST_TableBodyCellValue.tsx` | 6 | cascade 6 |
| `head/ST_TableHeadCellResizeHandle.tsx` | 6 | cascade 5; implicit any 1 |
| `inputs/ST_FilterCheckbox.tsx` | 6 | cascade 6 |
| `inputs/ST_FilterRangeSlider.tsx` | 6 | cascade 5; stale directive 1 |
| `menus/ST_ShowHideColumnsMenu.tsx` | 6 | cascade 4; implicit any 2 |
| `fns/sortingFns.ts` | 5 | removed export 1; arity 4 |
| `hooks/useST_Rows.ts` | 5 | cascade 5 |
| `toolbar/ST_ToolbarAlertBanner.tsx` | 5 | cascade 3; implicit any 2 |
| `utils/row.utils.ts` | 5 | cascade 5 |
| `head/ST_TableHeadCellGrabHandle.tsx` | 4 | cascade 2; other 2 |
| `hooks/useST_Effects.ts` | 4 | cascade 4 |
| `table/ST_Table.tsx` | 4 | cascade 4 |
| `body/ST_TableBody.tsx` | 3 | cascade 3 |
| `toolbar/ST_TablePagination.tsx` | 3 | cascade 1; implicit any 2 |
| `toolbar/ST_ToolbarDropZone.tsx` | 3 | cascade 2; other 1 |
| `utils/cell.utils.ts` | 3 | cascade 3 |
| `body/ST_TableBodyRow.tsx` | 2 | cascade 1; stale directive 1 |
| `buttons/ST_ColumnPinningButtons.tsx` | 2 | cascade 2 |
| `hooks/display-columns/getST_RowExpandColumnDef.tsx` | 2 | implicit any 1; other 1 |
| `hooks/display-columns/getST_RowNumbersColumnDef.tsx` | 2 | other 2 |
| `hooks/useST_RowVirtualizer.ts` | 2 | cascade 1; stale directive 1 |
| `inputs/ST_EditCellTextField.tsx` | 2 | stale directive 1; other 1 |
| `utils/displayColumn.utils.ts` | 2 | other 2 |
| `buttons/ST_ToggleGlobalFilterButton.tsx`, `footer/ST_TableFooterCell.tsx`, `head/ST_TableHeadCellFilterLabel.tsx`, `inputs/ST_GlobalFilterTextField.tsx` | 1 each | cascade |
| `footer/ST_TableFooter.tsx`, `head/ST_TableHead.tsx`, `table/ST_TableContainer.tsx`, `table/ST_TableLayout.tsx`, `toolbar/ST_BottomToolbar.tsx`, `toolbar/ST_TopToolbar.tsx` | 1 each | stale directive |
| `ShadcnTable.tsx` | 1 | other (type predicate) |
| `utils/tanstack.helpers.ts` | 1 | removed export (`createRow`) |

### Real renames hidden behind the cascades

Found by grep, not by `tsc` (the cascade masks them):

- `getState()`: 41 files (`const { density } = getState()` pattern), plus `table.getState()` in
  `utils/style.utils.ts`, `utils/row.utils.ts`, `menus/ST_CellActionMenu.tsx`,
  `head/ST_TableHeadCellResizeHandle.tsx`.
- `columnSizingInfo` / `setColumnSizingInfo` / `onColumnSizingInfoChange`: `types.ts`,
  `hooks/useST_TableInstance.ts`, `head/ST_TableHeadCell.tsx`, `head/ST_TableHeadCellResizeHandle.tsx`,
  `body/ST_TableBodyCell.tsx`, `table/ST_Table.tsx`, `menus/ST_ColumnActionMenu.tsx`.
- Pinning `'left'` / `'right'` values: `utils/style.utils.ts` (`getIsPinned`, `getIsLastColumn`,
  `getIsFirstColumn`, `getStart('left')`, `getAfter('right')`), `menus/ST_ColumnActionMenu.tsx`,
  `buttons/ST_ColumnPinningButtons.tsx`; `getLeftLeafColumns` / `getRightLeafColumns`:
  `types.ts`, `menus/ST_ShowHideColumnsMenu.tsx`; `getLeftVisibleLeafColumns` /
  `getRightVisibleLeafColumns`: `hooks/useST_ColumnVirtualizer.ts`. The other `'left'`/`'right'`
  hits are `tableCellProps.align` and `positionGlobalFilter`, which are ours and stay.
- `getPaginationRowModel` / `getPrePaginationRowModel` (now `getPaginatedRowModel` /
  `getPrePaginatedRowModel`): `types.ts`, `utils/row.utils.ts`, `hooks/useST_Effects.ts`.
- `sortingFn` / `sortingFns` / `ST_SortingFn(s)`: `types.ts`, `fns/sortingFns.ts`,
  `hooks/useST_TableOptions.ts`, `utils/column.utils.ts`.
- `aggregationFn` as a callable `(columnId, leafRows, childRows)`: only the array wrapper in
  `utils/column.utils.ts`; `fns/aggregationFns.ts` is `{ ...aggregationFns }` with no custom
  functions (the plan's 13 custom functions count was MRT's, not ours).
- `getIsSomeRowsSelected()` and `getIsSomeSelected()` as "some but not all":
  `inputs/ST_SelectCheckbox.tsx` (shared and the Base UI override).
- `table.getColumn(id)` is now `Column | undefined` in TanStack; `ST_TableInstance` already
  redeclares it non-optional, so `toolbar/ST_ToolbarAlertBanner.tsx` and
  `hooks/display-columns/getST_RowExpandColumnDef.tsx` compile once the types are back.
- Own Shift-click range selection (`enableBatchRowSelection`, `refs.lastSelectedRowId`,
  `getST_RowSelectionHandler` in `utils/row.utils.ts`): v9 has `enableRowRangeSelection`
  (default `true`), `isRowRangeSelectionEvent` (default: `shiftKey` on the event or its
  `nativeEvent`) and `row.getToggleSelectedHandler()`, which reads `event.target.checked`, keeps
  the anchor in `table._lastSelectedRowId`, ranges over `table.getRowsInDisplayOrder()` and
  falls back to a plain toggle when the anchor is gone.

### Stories

`tsconfig.radix.json` excludes `stories/`, so the 400 stories only fail at run time in
`pnpm test`. Grep: `table.getState()` 7 (Aggregation, ColumnGrouping, Editing, Selection,
RowOrdering x3: `TypeError`), `columnPinning: { left, right }` in `initialState` 4
(ColumnPinning, ColumnResizing, RowPinning, sticky-footer: `state.columnPinning.start` is
`undefined`, crash), callable `aggregationFn` 1 (Aggregation: v9 expects an
`AggregationFnDef` object), `sortingFn: 'fuzzy'` 1 (Sorting: ignored, no crash),
`enableBatchRowSelection` 1 (Selection: unknown option, no crash), column `enablePinning:
false` 2 (still a column option in v9, no change).

### v9 names of the types the tree uses

| v8 import | v9 | Note |
| --- | --- | --- |
| `Table<TData>` | `Table<TFeatures, TData>` | `ReactTable<TFeatures, TData, TSelected>` from `@tanstack/react-table` adds `state`, `Subscribe`, `FlexRender` and a deprecated `store` |
| `Row<TData>` | `Row<TFeatures, TData>` | `subRows: Row[]` required, `getParentRow(): Row \| undefined`, new `getDisplayIndex()` |
| `Cell<TData, TValue>` | `Cell<TFeatures, TData, TValue>` | |
| `Column<TData, TValue>` | `Column<TFeatures, TData, TValue>` | |
| `Header<TData, TValue>` | `Header<TFeatures, TData, TValue>` | |
| `HeaderGroup<TData>` | `HeaderGroup<TFeatures, TData>` | |
| `ColumnDef<TData, TValue>` | `ColumnDef<TFeatures, TData, TValue>` | still `Display \| Group \| Accessor` union |
| `TableOptions<TData>` | `TableOptions<TFeatures, TData>` | `features` required; `columns`/`data` are `ReadonlyArray`; no `getCoreRowModel`/`get*RowModel`, `onStateChange`, `sortingFns`, `filterFns`, `aggregationFns`, `enablePinning` |
| `TableState` | `TableState<TFeatures>` | slices present only for registered features |
| `SortingFn<TData>` | `SortFn<TFeatures, TData>` | registries `SortFns`, `sortFns`; column option `sortFn`; `column.getSortFn()`, `getAutoSortFn()` |
| `AggregationFn<TData>` | `AggregationFnDef<TFeatures, TData, TValue, TResult>` | object `{ aggregate(context), merge? }`, built with `constructAggregationFn`; `column.getAggregationValue(options?)`, `getAggregationFns()` |
| `FilterFn<TData>` | `FilterFn<TFeatures, TData>` | `addMeta` typed by the `filterMeta` slot (default `FilterMeta` = `{}`) |
| `ColumnSizingInfoState` | `columnResizingState` (lower-case `c`, the exported name) | state slice `columnResizing`, `setColumnResizing`, `onColumnResizingChange`, `resetHeaderSizeInfo`; needs `columnSizingFeature` + `columnResizingFeature` |
| `ColumnPinningPosition` | `ColumnPinningPosition` | now `false \| 'start' \| 'end'`; `ColumnPinningState` is `{ start, end }` |
| `RowPinningPosition` | `RowPinningPosition` | unchanged, `false \| 'top' \| 'bottom'` |
| `DeepKeys`, `DeepValue`, `Updater`, `OnChangeFn`, `AccessorFn` | same names | `AccessorFn<TData, TValue>` is `(originalRow, index) => TValue`; `RowData` is `Record<string, any> \| Array<any>` |
| `Renderable` | `Renderable<TProps>` from `@tanstack/react-table` | `flexRender<TProps extends object>(Comp, props)` unchanged; `FlexRender` component and `table.FlexRender` are new |
| `createRow` | `constructRow(table, id, original, rowIndex, depth, subRows?, parentId?)` | same positional order as v8's `createRow` |
| `useReactTable(options)` | `useTable(options, selector?)` | returns `{ ...table, options, state }` (a spread copy, memoised on `state`) |
| `ColumnFiltersState`, `ColumnOrderState`, `ColumnPinningState`, `ColumnSizingState`, `ExpandedState`, `GroupingState`, `PaginationState`, `RowSelectionState`, `SortingState`, `VisibilityState` | same names except `VisibilityState` is `ColumnVisibilityState` | |

Table methods renamed: `getLeftLeafColumns` to `getStartLeafColumns`, `getRightLeafColumns` to
`getEndLeafColumns`, `getLeftVisibleLeafColumns` to `getStartVisibleLeafColumns`,
`getRightVisibleLeafColumns` to `getEndVisibleLeafColumns`, `getPaginationRowModel` to
`getPaginatedRowModel`, `getPrePaginationRowModel` to `getPrePaginatedRowModel`,
`getLeftTotalSize`/`getRightTotalSize` to `getStartTotalSize`/`getEndTotalSize`;
`column.getStart()`/`getAfter()`/`getIsFirstColumn()`/`getIsLastColumn()`/`getIndex()` take
`'start' \| 'end' \| 'center'`.

### `tableFeatures` declaration (step 3)

`tableFeatures({...})` validates slot prerequisites at the type level (`ValidateFeatureSlots`):
`columnResizingFeature` needs `columnSizingFeature`, `globalFilteringFeature` and `filterFns`
and `filteredRowModel` need `columnFilteringFeature`, `aggregationFns` needs
`rowAggregationFeature`, each `*RowModel` slot needs its feature. The order of keys inside the
object does not matter to the type check or the runtime (features run in `Object.values`
order after the core features; prerequisites are checked by key presence), but the plan's
"prerequisite before dependent" order is kept for readability. The 15 features (stock minus
`cellSelectionFeature` and `cellSpanningFeature`, which v8 did not have), eight row-model
factories and the three registries compile in one call; checked by the scratch run below and
again by `tsc:radix` once `utils/tanstack.features.ts` exists.

Row models can be registered unconditionally: `table.getFilteredRowModel()`,
`getGroupedRowModel()`, `getSortedRowModel()` and `getPaginatedRowModel()` each return the
previous model when the matching `manual*` option is set (checked in
`core/row-models/coreRowModelsFeature.utils.js`), and the expanded/grouped models are no-ops on
empty state. Faceting is the exception: with `facetedUniqueValues`/`facetedMinMaxValues`
registered, `column.getFacetedUniqueValues()` always computes (v8 returned `new Map()` when the
option was absent), so the library keeps its `enableFacetedValues` gate at the call sites.

### Instance proof (step 4)

Scratch run (`node`, `constructTable` from `@tanstack/table-core` 9.3.1 with
`renderPhaseReactivity`, two rows, two columns, all 15 features):

- `Object.keys(table)` holds 138 own function properties: table APIs are assigned on the
  instance by `constructTableAPIs`, not on a prototype. `{ ...table }.getRowModel` and
  `.getAllLeafColumns` are functions. `useTable` itself returns `{ ...table, options, state }`,
  so a spread copy of the table does not lose table methods.
- `Object.assign(table, { refs: {}, setDensity() {} })` returns the same object;
  `getRowModel().rows.length === 2`, `getAllLeafColumns()` is `['name', 'age']`,
  `setDensity` is a function. This is the shape the instance hook uses.
- Rows, columns, cells and headers are the ones on prototypes: `Object.keys(row)` is
  `_displayIndexCache, _uniqueValuesCache, _valuesCache, depth, id, index, original, parentId,
  subRows, columnFilters, columnFiltersMeta, _groupingValuesCache`; `{ ...row }.getValue` and
  `{ ...row }.getIsSelected` are `undefined`, `{ ...column }.getIsPinned` is `undefined`.
  The library never spreads rows, columns, cells or headers (checked in the plan facts); the
  `Partial<ST_Column>` values stored in `hoveredColumn`/`draggingColumn` state are the live
  objects, not copies.
- `constructRow(table, 'st-row-create', original, -1, 0)` returns a row with `getValue` and
  `getAllCells()` (2 cells), so `createRow` in `tanstack.helpers.ts` ports 1:1.
- `table.store.state` keys after construction: `sorting, rowSelection, expanded,
  columnVisibility, columnPinning, columnOrder, grouping, columnResizing, columnSizing,
  globalFilter, columnFilters, pagination, rowPinning` plus every key present in
  `options.initialState` (a `density` key passed there became an atom). `getInitialTableState`
  clones whatever `initialState` holds, so the ST-only slices (`density`, `isFullScreen`,
  `creatingRow`, ...) appear on `table.state` only when they were in `initialState`, not
  because they are in `options.state`. The instance hook therefore builds its own `table.state`
  through the `useTable` selector, `(state) => ({ ...state, ...stState })`, so `table.state`
  always carries the TanStack slices plus the library's slices, replacing `getState()` 1:1.
- `getIsSomeRowsSelected()` is `false` with nothing selected and `true` with everything
  selected (`getIsAllRowsSelected()` also `true`): "at least one", as the migration guide says.
- `column.pin('end')` on a `start`-pinned column moves it: `columnPinning` becomes
  `{ start: [], end: ['name'] }`; `'left'`/`'right'` are not accepted.
- `aggregationFn: 'sum'` on `age` gives `getAggregationValue() === 70`; registry keys:
  `sortFns` 6 (`alphanumeric, alphanumericCaseSensitive, basic, datetime, text,
  textCaseSensitive`), `filterFns` 18, `aggregationFns` 11.

### Companion packages (step 6)

`@tanstack/match-sorter-utils` 8.19.4 depends only on `remove-accents` 0.5.0, no table-core;
`rankItem`/`compareItems` still take plain values, so `fns/filterFns.ts` and `fns/sortFns.ts`
keep composing them with the v9 `filterFns`/`sortFns`. `@tanstack/react-virtual` 3.11.2 depends
on `@tanstack/virtual-core` only; nothing in the virtualizer hooks touches table-core types
beyond `ST_TableInstance`. The lockfile now holds both `@tanstack/table-core` 8.20.5 (the docs
app and the CI `existing` scenario, phase 04) and 9.3.1.
