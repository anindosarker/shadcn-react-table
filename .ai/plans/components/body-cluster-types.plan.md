# Plan: body/ cluster slot-type conversions (core types.ts only)

Single-writer task on `packages/shadcn-react-table-core/src/types.ts`.
Reference: MRT `packages/material-react-table/src/types.ts` — mirror each
slot's EXACT value-or-func shape and fn context params, swapping MUI prop
types for SRT element types.

## 1. New element prop types (next to the existing DivProps/TableProps/... block)

```ts
export type TableBodyProps = React.ComponentPropsWithRef<'tbody'>;
export type TdProps = React.ComponentPropsWithRef<'td'>;
```
(TableSectionProps already exists for thead; MRT types TableBody separately —
if you judge reusing TableSectionProps cleaner, DON'T: tbody/thead share the
DOM interface but keep the name explicit. Add exactly the two above.)

## 2. Convert these slots (and ONLY these) from `SRT_HTMLProps<...>` to MRT shape

Read MRT types.ts for each before writing — mirror context params exactly:
- `srtTableBodyProps` — mirror `muiTableBodyProps` → TableBodyProps
- `srtTableBodyRowProps` — mirror `muiTableBodyRowProps` (context includes
  `isDetailPanel?`, `row`, `staticRowIndex`, `table` — verify against MRT) → TableRowProps
- `srtTableBodyCellProps` (table-level AND columnDef-level) — mirror
  `muiTableBodyCellProps` contexts exactly → TdProps
- `srtDetailPanelProps` — mirror `muiDetailPanelProps` → TdProps
- `srtSkeletonProps` — mirror `muiSkeletonProps`; MUI SkeletonProps → DivProps
  (the SRT skeleton is a div; keep the context MRT uses)

SRT types: table=SRT_TableInstance<TData>, row=SRT_Row<TData>,
cell=SRT_Cell<TData>, column=SRT_Column<TData>.

## 3. Consumers

Garbage-zone body components will break-or-not; same rule as before: touch
NOTHING unless tsc cannot pass; if forced, minimal local swap
(parseSRT_HtmlProps→parseFromValuesOrFunc) only, list every touch.

## Gates

`pnpm prettier --write` types.ts (+ any touched files);
`pnpm tsc -p apps/test-shadcn/tsconfig.app.json --noEmit` clean. No git.
Nothing else in types.ts changes.
