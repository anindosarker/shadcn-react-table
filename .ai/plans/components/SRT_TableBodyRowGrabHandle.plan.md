# Plan: SRT_TableBodyRowGrabHandle ← MRT_TableBodyRowGrabHandle

Pair: `apps/test-shadcn/src/components/ui/shadcn-react-table/body/SRT_TableBodyRowGrabHandle.tsx`
← `packages/material-react-table/src/components/body/MRT_TableBodyRowGrabHandle.tsx`.
Garbage-zone; author fresh. Logic-only.

## Resolved decisions

- Interface `extends ButtonProps { row, rowRef: RefObject<HTMLTableRowElement |
  null>, table }`.
- Merge: `{ ...parseFromValuesOrFunc(srtRowDragHandleProps, { row, table }),
  ...rest }` (slot converted by the body-types addendum — verify it's the
  value-or-func ButtonProps shape; STOP if still SRT_HTMLProps).
- Handlers verbatim: dragStart (compose user onDragStart, setDragImage from
  rowRef try/catch console.error, `table.setDraggingRow(row)`), dragEnd
  (compose, setDraggingRow(null), setHoveredRow(null)).
- MRT's `row as any` in setDraggingRow: try WITHOUT the cast first (SRT typings
  may line up — precedent: TableHead's dropped `as any`, lead-approved). If tsc
  fails without it, keep the cast + `// eslint-disable-next-line
  @typescript-eslint/no-explicit-any` and report which path you took.
- Renders `<SRT_GrabHandleButton {...iconButtonProps} location="row"
  onDragEnd onDragStart table />` — note MRT passes `location="row"` HERE
  (unlike the head grab handle). Garbage-zone import as-is; STOP if props
  reject.
- No cva (renders another component — authorized exception).

## Structure

Mirror MRT order. Comments: none expected.

## Gates

`pnpm prettier --write <file>`; `pnpm tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` clean;
`pnpm --filter test-shadcn exec eslint src/components/ui/shadcn-react-table/body/SRT_TableBodyRowGrabHandle.tsx --max-warnings=0`.
Touch ONLY this file. No core, no git.
