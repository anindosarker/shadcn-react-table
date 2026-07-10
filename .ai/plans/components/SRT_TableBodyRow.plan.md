# Plan: SRT_TableBodyRow ← MRT_TableBodyRow

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/body/SRT_TableBodyRow.tsx`
← `packages/material-react-table/src/components/body/MRT_TableBodyRow.tsx`.
Garbage-zone; author fresh. + `Memo_SRT_TableBodyRow` export verbatim
(`prev.row === next.row && prev.staticRowIndex === next.staticRowIndex`).

## Resolved decisions

- Interface `extends TableRowProps { columnVirtualizer?, numRows?,
  pinnedRowIds?, row, rowVirtualizer?, staticRowIndex: number, table,
  virtualRow?: SRT_VirtualItem }`.
- `useTheme` + mrtTheme colors dropped (commented + Notes).
- **Row highlight system (locked June deviation — replaces MRT's td:after
  overlay machinery):** MRT paints selection/pin/hover tints via
  `td:after` overlays with alpha'd theme colors
  (cellHighlightColor/cellHighlightColorHover/commonCellBeforeAfterStyles/
  row-level getCommonPinnedCellStyles). SRT uses solid row classes instead
  (cells inherit via their `bg-inherit`):
  - base `bg-background` (maps `baseBackgroundColor !important`; !important
    dropped + Note)
  - selected → `data-[state=selected]:bg-muted` (set `data-selected` AND
    `data-state={isRowSelected ? 'selected' : undefined}`... choose ONE: use
    `data-selected={isRowSelected || undefined}` + conditional `bg-muted`
    class — simplest, keep data attr for hooks)
  - hover → `hover:bg-muted/50` unconditional; MUI's `tableRowProps?.hover`
    prop has no native-tr analogue → dropped-construct comment + Note
  - pinned → `opacity-[0.97]`; dragging/hovered row → `opacity-50`
  - the whole td:after/cellHighlightColor block becomes ONE commented
    construct + Note pointing at this plan.
- MUI `selected` prop on TableRow → dropped (data-selected carries state).
- customRowHeight: keep MRT's read minus sx: `parseInt(tableRowProps?.style?.
  height, 10) || undefined` with MRT's `//@ts-expect-error` + reason (the sx
  fallback line is commented as a dropped construct).
- defaultRowHeight 37/53/69, tableHeadHeight/tableFooterHeight reads,
  bottomPinnedIndex/topPinnedIndex useMemo — verbatim (authorized
  eslint-disable on deps if flagged).
- Sticky-pinned offsets stay INLINE style (runtime px), verbatim expressions:
  top (virtualRow ? 0 : topPinnedIndex math incl. tableHeadHeight - 1),
  bottom (bottomPinnedIndex math incl. tableFooterHeight - 1), transform
  translateY(virtualRow.start), then `...tableRowProps?.style` last.
- Position: conditional classes `absolute` (virtualRow) / `sticky`
  (sticky-pinned) / `relative`; z: sticky-pinned → `z-[2]` else `z-0`;
  `box-border w-full`; grid → `flex`; transition: virtualRow → none, else
  `transition-all duration-150 ease-in-out`.
- handleDragEnter/handleDragOver verbatim (drop `_e` if lint complains,
  precedent). rowRef useRef. data-index ternary, data-pinned, ref callback
  (rowRef + rowVirtualizer?.measureElement), `{...tableRowProps}`, then
  style, then className (cn: base+conditionals+user className last).
- Cells map VERBATIM: virtual padding td left/right (inline flex+width),
  virtualizer index reassignment, `props` object, key
  `${cell.id}-${staticRowIndex}`, memoMode==='cells' condition (columnDefType
  'data', no dragging, not editing) → Memo_SRT_TableBodyCell else
  SRT_TableBodyCell, null guard.
- DetailPanel sibling verbatim: `renderDetailPanel && !row.getIsGrouped() &&
  <SRT_TableDetailPanel parentRowRef={rowRef} row rowVirtualizer
  staticRowIndex table virtualRow />` inside the fragment.

## Gates

`pnpm prettier --write <file>`; `pnpm tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` clean;
`pnpm --filter test-shadcn exec eslint src/components/ui/shadcn-react-table/body/SRT_TableBodyRow.tsx --max-warnings=0`.
Touch ONLY this file. No core, no git.
