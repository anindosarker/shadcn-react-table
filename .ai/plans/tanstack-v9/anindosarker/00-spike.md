# 00: spike, v9 error inventory

## Goal

Know every compile break before touching code, and prove the two structural decisions
(`tableFeatures` declaration, `Object.assign` instance) on a scratch copy.

## Steps

1. On the branch, `pnpm --filter shadcn-table add @tanstack/react-table@9.3.1` (both
   `bases/*/package.json` and the package root if it lists it). `pnpm install`.
2. `pnpm --filter shadcn-table tsc 2>&1 | tee` into a scratch file; group errors by file and by
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

(filled by the spike agent: error table, type export map, proof of step 4)
