# 01: Radix tree on v9

## Goal

`bases/radix` compiles, lints and passes 400/400 stories on `@tanstack/react-table` 9.3.1 with
v9 names end to end. Public `ST_*` types keep their signatures.

## Steps

1. `types.ts`: import v9 types; add `ST_Features` from `utils/tanstack.features.ts`; every
   `Table<TData>`, `Row<TData>`, `Cell<TData, TValue>`, `Column<TData, TValue>`,
   `Header<TData>`, `HeaderGroup<TData>`, `ColumnDef<TData, TValue>`, `TableOptions<TData>`,
   `FilterFn<TData>`, `SortingFn<TData>` (now `SortFn`), `AggregationFn<TData>` gains
   `ST_Features` as the first parameter inside the `Omit<...>` wrappers. `ST_TableState`
   extends v9 `TableState<ST_Features>`; `ST_ColumnSizingInfoState` becomes
   `ST_ColumnResizingState` (no deprecated alias: rename it and list it in the migration
   notes). `ST_SortingFn` becomes
   `ST_SortFn`, option `sortingFn` becomes `sortFn` on `ST_ColumnDef`, `sortingFns` table
   option becomes `sortFns`. `columnPinning` state is `{ start, end }`. `ColumnMeta` and
   `TableMeta` declaration merging, if present, takes `TFeatures` first.
2. `utils/tanstack.helpers.ts`: `createRow` becomes `constructRow`; check its v9 signature
   (`constructRow(table, id, original, rowIndex, depth, subRows?, parentId?)`) and adapt.
3. `hooks/useST_TableInstance.ts`: `useReactTable` becomes `useTable({ features: stFeatures,
   ... })`; remove the `get*RowModel()` options (they live on `features`); build the instance
   with `Object.assign` (see 00 step 4); `onStateChange` is gone, replace the one use with the
   per-slice handlers already passed; `columnSizingInfo` becomes `columnResizing`
   (`onColumnResizingChange`, `setColumnResizing`); `table.getState()` becomes `table.state`
   inside components and `table.store.state` in callbacks outside render (4 sites).
   `enableRowRangeSelection: false`. `getIsSomeRowsSelected()` and `getIsSomeSelected()` now
   mean "at least one": gate indeterminate checkboxes with `&& !getIsAll...Selected()`.
4. Pinning: `'left'` becomes `'start'`, `'right'` becomes `'end'` in state defaults, display
   column defs, `column.pin(...)`, `getIsPinned()` comparisons, `getLeftLeafColumns` to
   `getStartLeafColumns`, `getRight*` to `getEnd*`, `getLeftVisibleLeafColumns` to
   `getStartVisibleLeafColumns`, `getStart(` and `getAfter(` take `'start' | 'end'`. CSS
   logical properties already in use stay. Menu labels ("Pin to left") are locale strings and
   stay as text; only the API values change.
5. `fns/sortingFns.ts` becomes `fns/sortFns.ts` (`ST_SortFns`, built from v9 `sortFns`);
   `fns/aggregationFns.ts`: the 13 custom functions become `constructAggregationFn({
   aggregate: ({ rows, getValue }) => ... })`; `column.getAggregationValue(...)` call sites take
   the options object. `fns/filterFns.ts` keeps composing v9 `filterFns`.
6. Sweep remaining errors from the spike inventory file by file; no behaviour changes beyond
   the renames. Keep existing comments.
7. Gates: `pnpm --filter shadcn-table tsc`, `lint` (eslint `--max-warnings=0` on changed files),
   `pnpm --filter shadcn-table test` 400/400, `storybook:build`. Stories that fail only because
   they use v8 names are fixed in this phase too when they block the gate (phase 03 owns the
   rest).
8. Commits (each pushed): `feat(table): tanstack v9 features and instance`,
   `feat(table): v9 names (sortFn, columnResizing, start/end pinning)`,
   `feat(table): v9 aggregation functions`, `test: stories on v9 names` (if needed).

## Public API changes to list in the migration notes

`sortingFn` to `sortFn`; `sortingFns` to `sortFns`; `ST_SortingFn` to `ST_SortFn`;
`columnSizingInfo` to `columnResizing` (`onColumnResizingChange`, `ST_ColumnResizingState`);
`columnPinning: { left, right }` to `{ start, end }`, `column.pin('start' | 'end')`;
`table.getState()` to `table.state`; `getIsSomeRowsSelected()` semantics; custom
`aggregationFn` definitions through `constructAggregationFn`; `@tanstack/react-table` 9.3.1
required.
