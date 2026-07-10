# Plan: SRT_TableHeadCellGrabHandle ← MRT_TableHeadCellGrabHandle

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/head/SRT_TableHeadCellGrabHandle.tsx`
← `packages/material-react-table/src/components/head/MRT_TableHeadCellGrabHandle.tsx`.
Garbage-zone; author fresh. Logic-only component (no styling of its own).

## Resolved decisions

- Interface `extends ButtonProps { column, table, tableHeadCellRef }` (MRT
  extends IconButtonProps; ButtonProps from core, added by the head-cluster
  types task). `tableHeadCellRef: RefObject<HTMLTableCellElement | null>`.
- Slot merge mirrors MRT's DOUBLE merge exactly:
  ```ts
  const iconButtonProps = {
    ...parseFromValuesOrFunc(srtColumnDragHandleProps, { column, table }),
    ...parseFromValuesOrFunc(columnDef.srtColumnDragHandleProps, { column, table }),
    ...rest,
  };
  ```
  (columnDef-level wins over table-level; rest wins over both.)
- `handleDragStart` / `handleDragEnd` copied verbatim: compose user
  onDragStart/onDragEnd first, `setDragImage` try/catch with `console.error`,
  drop-zone grouping branch, `reorderColumn` from core
  (`shadcn-react-table-core` exports it — verify import), setColumnOrder +
  setColumnPinning filter logic, null resets.
- Renders `<SRT_GrabHandleButton {...iconButtonProps} onDragEnd onDragStart
  table />` (garbage-zone import from `../buttons/SRT_GrabHandleButton` —
  import as-is, its pair comes in buttons/ cluster). If its props interface
  rejects these props, STOP and report — do not modify it.
- No cva (no element of its own — renders the button component). This is the
  authorized exception to cva-per-component: note it in the report, not a
  scaffold comment.

## Structure

Mirror MRT order: destructure (`enableColumnOrdering,
srtColumnDragHandleProps`, `setColumnOrder, setColumnPinning,
setDraggingColumn, setHoveredColumn`), `columnDef`, state (`columnOrder,
draggingColumn, hoveredColumn`), merge, handlers, JSX. Comments: none.

## Gates

`pnpm prettier --write <file>`; `pnpm tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` clean;
`pnpm --filter test-shadcn exec eslint src/components/ui/shadcn-react-table/head/SRT_TableHeadCellGrabHandle.tsx --max-warnings=0`.
Touch ONLY this file. No core, no git.
