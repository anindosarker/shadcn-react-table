# Plan: head/ cluster slot-type conversions (core types.ts only)

Single dedicated task so only ONE agent ever writes types.ts per cluster.
Reference: MRT `packages/material-react-table/src/types.ts` (mirror each slot's
EXACT shape — value-or-func union and the fn's context params — replacing MUI
component prop types with SRT element types).

## 1. New element prop types (next to DivProps/TableProps, ~line 1167)

```ts
export type TableSectionProps = React.ComponentPropsWithRef<'thead'>;
export type TableRowProps = React.ComponentPropsWithRef<'tr'>;
export type TableCellProps = React.ComponentPropsWithRef<'th'>;
export type ButtonProps = React.ComponentPropsWithRef<'button'>;
```

(`'thead'`/`'tbody'`/`'tfoot'` share HTMLTableSectionElement — one type named
TableSectionProps serves all three later. `'th'`/`'td'` share
HTMLTableCellElement — TableCellProps serves both.)

## 2. Convert these slots (and ONLY these) from `SRT_HTMLProps<...>` to MRT shape

Table-level (SRT_TableOptions):
- `srtTableHeadProps` — mirror MRT `muiTableHeadProps`: `((props: { table }) => TableSectionProps) | TableSectionProps`
- `srtTableHeadRowProps` — mirror `muiTableHeadRowProps` (context includes `headerGroup`): `((props: { headerGroup: SRT_HeaderGroup<TData>; table }) => TableRowProps) | TableRowProps`
- `srtTableHeadCellProps` — mirror `muiTableHeadCellProps` (context `{ column, table }`): returns TableCellProps
- `srtColumnActionsButtonProps` — mirror `muiColumnActionsButtonProps` (context `{ column, table }`): returns ButtonProps
- `srtColumnDragHandleProps` — mirror `muiColumnDragHandleProps` (context `{ column, table }`): returns ButtonProps

ColumnDef-level (SRT_ColumnDef) — same five where they exist there:
`srtTableHeadCellProps`, `srtColumnActionsButtonProps`, `srtColumnDragHandleProps`
— mirror MRT's columnDef-level context shapes exactly.

READ MRT types.ts for every one of these before writing — do not guess context
shapes. `table` params are `SRT_TableInstance<TData>`, columns
`SRT_Column<TData>`, headerGroups `SRT_HeaderGroup<TData>`.

## 3. Consumers

Old `SRT_HTMLProps` consumers of these slots are garbage-zone head components
about to be rebuilt. If tsc breaks in THOSE files after conversion, do NOT fix
them properly — they're being replaced. If (and only if) tsc cannot pass
otherwise, apply the minimal local cast/`parseSRT_HtmlProps→parseFromValuesOrFunc`
swap in the garbage file with no other changes, and list every such touch in
your report.

## Gates

- `pnpm prettier --write packages/shadcn-react-table-core/src/types.ts` (+ any touched garbage files)
- `pnpm tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` clean
- No git. Nothing else in types.ts changes.
