# Plan: SRT_TableBodyCell ← MRT_TableBodyCell

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/body/SRT_TableBodyCell.tsx`
← `packages/material-react-table/src/components/body/MRT_TableBodyCell.tsx`.
Garbage-zone; author fresh. Second-biggest file. Includes the DISPLAY-COLUMN
BODY DISPATCH (General notes: display-column boundary) — read that note first.

## Resolved decisions

- Interface `extends TdProps { cell, numRows?, rowRef:
  RefObject<HTMLTableRowElement | null>, staticColumnIndex?, staticRowIndex:
  number, table }` + `Memo_SRT_TableBodyCell = memo(..., (prev, next) =>
  next.cell === prev.cell) as typeof SRT_TableBodyCell` export verbatim.
- `useTheme` dropped (commented + Note): `align` → `text-start` logical class
  (rtl-safe); `theme.palette.grey[500]` → `var(--color-muted-foreground)`;
  `draggingBorderColor` → `var(--color-primary)` (mrtTheme commented + Note).
- Double slot merge verbatim (`args = { cell, column, row, table }`; table
  srtTableBodyCellProps → columnDef.srtTableBodyCellProps → rest).
- `skeletonProps = parseFromValuesOrFunc(srtSkeletonProps, { cell, column,
  row, table })` (DivProps-typed slot).
- skeletonWidth state + effect verbatim (Math.random allowed — runtime code).
  MUI Skeleton → `<div className={cn('animate-pulse rounded-md bg-muted',
  skeletonProps?.className)} style={{ height: 20, width: skeletonWidth,
  ...skeletonProps?.style }} {...skeletonProps-without-className/style}` —
  simplest faithful mapping: spread skeletonProps then set className/style
  composed AFTER the spread (animation="wave" has no Tailwind analogue —
  animate-pulse is the accepted stand-in; dropped-construct comment).
- `draggingBorders` useMemo VERBATIM (all branches: resize border ltr/rtl,
  dashed dragging/hovered, first/last column, last-row logic) with the color
  substitutions above; `!important` dropped + Note (React style limitation);
  authorized eslint-disable on the deps array if flagged.
- isColumnPinned / isEditable (`isCellEditable` from core) / isEditing /
  isCreating / showClickToCopyButton (keep MRT's `@ts-expect-error` + reason)
  / isRightClickable / cellValueProps — all verbatim.
- Handlers verbatim: handleDoubleClick (compose + `openEditingCell` from
  core), handleDragEnter, handleDragOver, handleContextMenu (setActionCell +
  actionCellRef), handleKeyDown (compose + cellKeyboardShortcuts).
- td attrs: `text-start` class (align swap), data-index, data-pinned,
  tabIndex, `{...tableCellProps}`, then the FIVE composed handlers AFTER the
  spread (MRT order: onKeyDown, onContextMenu, onDoubleClick, onDragEnter,
  onDragOver), then style, then className.
- Inline style order: `{ ...getSRTCellWidthStyles({ column, table }) /* no
  header */, ...(isColumnPinned ? getSRTPinnedCellStyles({ column, table }) :
  {}), ...tableCellProps?.style, ...draggingBorders }`.
- sx → classes via cva `bodyCellVariants` (static base) + cn conditionals
  (HeadCell precedent — runtime combos in cn(), authorized):
  base: `overflow-hidden` + hover text-clip `hover:[text-overflow:clip]`...
  use `hover:text-clip`; grid → `items-center flex` (alignItems center only in
  grid — pair with the display flex that getCommonMRTCellStyles supplies:
  add `flex` class when grid, matching HeadCell); pinned → `bg-background
  opacity-[0.97]` + zIndex classes (z-[2] resizing/dragging this column,
  z-[1] pinned, z-0 — HeadCell precedent); `relative bg-inherit`;
  transition `transition-[padding] duration-150 ease-in-out` unless
  enableColumnVirtualization; dragging/hovered-column-or-row opacity →
  MRT body doesn't set cell opacity (that's head) — SKIP unless in
  getCommonMRTCellStyles (it IS: dragging/hovered column → opacity-50; apply).
  cursor: context-menu / pointer / inherit → conditional classes
  `cursor-context-menu` / `cursor-pointer` (inherit = no class).
  outline actionCell → `outline outline-1 outline-muted-foreground
  -outline-offset-1` conditional; hover outline condition (actionCell or
  cell-edit or table-edit modes) → conditional `hover:outline hover:outline-1
  hover:outline-muted-foreground`.
  Density padding map verbatim: compact display `px-2 py-0` else `p-2`;
  comfortable display `px-3 py-2` else `p-4`; spacious display `px-5 py-4`
  else `p-6`. textOverflow ellipsis when not display → `text-ellipsis`.
  whiteSpace: pinned-row or compact → `whitespace-nowrap` else
  `whitespace-normal`.
- **Children — display-column dispatch (replaces MRT's bare columnDef.Cell
  branch):** keep MRT's structure verbatim EXCEPT the `columnDefType ===
  'display'` branch becomes: user `columnDef.Cell?.(...)` if defined, ELSE
  dispatch on `column.id`:
  - `mrt-row-select` → `<SRT_SelectCheckbox row={row} table={table}
    staticRowIndex={staticRowIndex} />` (check the garbage/June call shape in
    the OLD SRT_TableBodyCell before overwriting and in SRT_SelectCheckbox's
    interface — mirror what compiles)
  - `mrt-row-expand` → `<SRT_ExpandButton row table staticRowIndex />`
  - `mrt-row-numbers` → mirror MRT's getMRT_RowNumbersColumnDef Cell logic
    (read `packages/material-react-table/src/hooks/display-columns/
    getMRT_RowNumbersColumnDef.tsx`; render the number per
    rowNumberDisplayMode)
  - `mrt-row-actions` → `<SRT_ToggleRowActionMenuButton cell row table
    staticRowIndex />` (check interface)
  - `mrt-row-drag` → `<SRT_TableBodyRowGrabHandle row rowRef table />`
  - `mrt-row-pin` → `<SRT_TableBodyRowPinButton row table />`
  - `mrt-row-spacer` → null
  READ the garbage file's dispatch block BEFORE overwriting the file and
  mirror its component call signatures (it was browser-verified in June);
  keep MRT's grouped-row guard (`['mrt-row-expand','mrt-row-numbers',
  'mrt-row-select'].includes(column.id) || !row.getIsGrouped()`).
- Other children branches verbatim: PlaceholderCell, skeleton, isCreating||
  isEditing → SRT_EditCellTextField, click-to-copy → SRT_CopyButton wrapping
  SRT_TableBodyCellValue, plain SRT_TableBodyCellValue, grouped subRows count.

## Gates

`pnpm prettier --write <file>`; `pnpm tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` clean;
`pnpm --filter test-shadcn exec eslint src/components/ui/shadcn-react-table/body/SRT_TableBodyCell.tsx --max-warnings=0`.
Touch ONLY this file. No core, no git. STOP if any dispatched component's
interface rejects the props both the garbage file and MRT semantics suggest.
