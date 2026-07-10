# Plan: SRT_TableBody ← MRT_TableBody

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/body/SRT_TableBody.tsx`
← `packages/material-react-table/src/components/body/MRT_TableBody.tsx`.
Garbage-zone; author fresh. + `Memo_SRT_TableBody = memo(..., (prev, next) =>
prev.table.options.data === next.table.options.data)` export verbatim.

## Resolved decisions

- Interface `extends TableBodyProps { columnVirtualizer?, table }` (core
  TableBodyProps = ComponentPropsWithRef<'tbody'>).
- Core hooks: `useSRT_Rows(table)`, `useSRT_RowVirtualizer(table, rows)` —
  both exist in core (trusted hand-written); verify imports, STOP if signature
  mismatch.
- `refs`: MRT reads `tablePaperRef` — SRT analogue is `tableLayoutRef`
  (rename per pair naming). Verify it exists in refs type (it does —
  types.ts refs block).
- Slot merge `{ ...parseFromValuesOrFunc(srtTableBodyProps, { table }),
  ...rest }` — SAME tableBodyProps spread onto all three tbodies (MRT-exact).
- Three tbodies verbatim (sticky-top pinned, main, sticky-bottom pinned) with
  conditions `!rowPinningDisplayMode?.includes('sticky') &&
  getIsSomeRowsPinned('top'|'bottom')`.
- Styles: cva `tableBodyVariants` base `relative` is WRONG for the sticky
  tbodies — instead: shared cva base `''` + variant `layout: { grid: 'grid',
  semantic: '' }`; per-tbody conditional classes: sticky tbodies get
  `sticky z-[1]` + inline style `top: tableHeadHeight - 1` / `bottom:
  tableFooterHeight - 1` (runtime px); main tbody gets `relative` class +
  inline `height: rowVirtualizer.getTotalSize()px` when virtualized +
  `min-h-[100px]` class when `!rows.length`.
- pinnedRowIds useMemo verbatim (authorized eslint-disable on deps
  `[rowPinning, getRowModel().rows]` if flagged).
- Empty-rows fallback verbatim: tr/td with MRT's literal inline grid displays,
  colSpan; `renderEmptyRowsFallback?.({table}) ??` MUI Typography → `<p>` with
  classes `text-muted-foreground italic py-8 text-center w-full` + inline
  style `maxWidth: min(100vw, ${tableLayoutRef.current?.clientWidth ?? 360}px)`
  (runtime); text ternary globalFilter||columnFilters.length →
  noResultsFound : noRecordsToDisplay verbatim.
- Rows map VERBATIM incl. the virtualizer detail-panel index dance
  (`index % 2 === 1 → null`, `/2`), props object (pinnedRowIds, rowVirtualizer,
  virtualRow cast), key `${row.id}-${row.index}`, memoMode==='rows' dispatch
  to Memo_SRT_TableBodyRow. Top/bottom pinned maps use `key={row.id}` (MRT
  difference — keep).
- `tableBodyProps?.children ??` wrapper verbatim.

## Gates

`pnpm prettier --write <file>`; `pnpm tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` clean;
`pnpm --filter test-shadcn exec eslint src/components/ui/shadcn-react-table/body/SRT_TableBody.tsx --max-warnings=0`.
Touch ONLY this file. No core, no git. Concurrent siblings (BodyRow/BodyCell)
may be mid-rebuild — scope gate claims to your file if their errors appear.
